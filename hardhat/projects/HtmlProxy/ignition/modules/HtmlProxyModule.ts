// projects/[your_project]/ignition/modules/HtmlProxyModule.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { Buffer } from "buffer";

// --- データ生成＆分割ロジック (既存のスクリプトから流用) ---
function generateByteStr(sizeInBytes: number): string {
  return 'a'.repeat(sizeInBytes);
}

function splitTextByBytes(text: string, maxChunkSizeInBytes: number): string[] {
  const chunks: string[] = [];
  const buffer = Buffer.from(text, 'utf8');

  let i = 0;
  while (i < buffer.length) {
    const end = Math.min(i + maxChunkSizeInBytes, buffer.length);
    const chunkBuffer = buffer.subarray(i, end);
    chunks.push(chunkBuffer.toString('utf8'));
    i = end;
  }
  return chunks;
}

// チャンクサイズと生成するテキストの定義
const MAX_CHUNK_SIZE_IN_BYTES = 12 * 1024; // 12KB
const fullTextHtml = generateByteStr(1 * 1024 * 1024); // 1MB
const textChunks = splitTextByBytes(fullTextHtml, MAX_CHUNK_SIZE_IN_BYTES);

console.log(`📝 Splitting 1MB of text into ${textChunks.length} chunks...`);

// --- Ignitionモジュールの定義 ---
const HtmlProxyModule = buildModule("HtmlProxyModule", (m) => {
  // 1. 親コントラクト (HtmlProxy) をデプロイする
  const htmlProxy = m.contract("HtmlProxy");

  // 2. 子コントラクト (HtmlChunk) をチャンクの数だけデプロイする
  const chunkContracts = [];
  for (let i = 0; i < textChunks.length; i++) {
    const chunkData = textChunks[i];
    // m.contract はデプロイ操作を定義するだけで、すぐには実行されない
    const htmlChunk = m.contract("HtmlChunk", [i, chunkData], {
      id: `HtmlChunk_${i}`, // 各デプロイに一意のIDを付与
    });
    chunkContracts.push(htmlChunk);
  }

  // 3. 親コントラクトに、デプロイされた子コントラクトのアドレス配列をセットする
  // m.call は、htmlProxy と全ての htmlChunk のデプロイが完了した後に実行される
  m.call(htmlProxy, "setChunkContracts", [chunkContracts]);

  // モジュールの実行結果として、親コントラクトのインスタンスを返す
  return { htmlProxy };
});

export default HtmlProxyModule;