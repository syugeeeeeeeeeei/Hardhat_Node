// projects/[your_project_name]/ignition/modules/HtmlStorageModule.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { Buffer } from "buffer";

// --- データ生成＆分割ロジック (元々のdeploy.tsから移植) ---

/**
 * 指定されたバイト数のダミー文字列を生成する関数
 */
function generateByteStr(sizeInBytes: number): string {
  return 'a'.repeat(sizeInBytes);
}

/**
 * テキストをUTF-8のバイト数に基づいて安全に分割するヘルパー関数
 */
function splitTextByBytes(text: string, maxChunkSizeInBytes: number): string[] {
  const chunks: string[] = [];
  const buffer = Buffer.from(text, 'utf8');

  let i = 0;
  while (i < buffer.length) {
    // buffer.subarray は安全にバイト境界を扱える
    const end = Math.min(i + maxChunkSizeInBytes, buffer.length);
    const chunkBuffer = buffer.subarray(i, end);
    chunks.push(chunkBuffer.toString('utf8'));
    i = end;
  }
  return chunks;
}

// 1回のトランザクションで追加するチャンクの最大バイトサイズ (24KB未満が安全圏)
const MAX_CHUNK_SIZE_IN_BYTES = 23 * 1024; // 23KB

// デプロイするHTMLコンテンツの全長 (1MB)
const fullTextHtml = generateByteStr(1 * 1024 * 1024); // 1MBのダミーテキスト

// テキストをチャンクに分割
const textChunks = splitTextByBytes(fullTextHtml, MAX_CHUNK_SIZE_IN_BYTES);

console.log(`📝 Original text size: ${Buffer.from(fullTextHtml, 'utf8').length} bytes`);
console.log(`✂️ Splitting text into ${textChunks.length} chunks of max ${MAX_CHUNK_SIZE_IN_BYTES} bytes...`);


// --- Ignitionモジュールの定義 ---

const HtmlStorageModule = buildModule("HtmlStorageModule", (m) => {
  // 1. HtmlStorageコントラクトをデプロイする
  const htmlStorage = m.contract("HtmlStorage");

  // 2. デプロイしたコントラクトに対して、チャンクを順番に追加する
  // Ignitionは依存関係を自動で解決するため、`addChunk`の呼び出しは
  // `htmlStorage`のデプロイが完了した後に実行される。
  let lastChunkTx: any = htmlStorage; // 依存関係の起点

  for (let i = 0; i < textChunks.length; i++) {
    const chunkData = textChunks[i];

    // m.call を使って addChunk 関数を呼び出す
    const currentChunkTx = m.call(htmlStorage, "addChunk", [chunkData], {
      id: `addChunk_${i}`,
      // 直前の addChunk 呼び出しが完了した後に実行するように依存関係を明示
      after: [lastChunkTx],
    });

    lastChunkTx = currentChunkTx;
  }

  // デプロイされたコントラクトのインスタンスを返す
  return { htmlStorage };
});

export default HtmlStorageModule;