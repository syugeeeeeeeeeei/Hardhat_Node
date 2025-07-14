// projects/[your_project_name]/scripts/run_html_storage_deploy.ts

import hre from "hardhat";
import HtmlStorageModule from "../ignition/modules/HtmlStorageModule"; // 🎨 作成したモジュールをインポート

// --- 検証用のデータ準備 (モジュールファイルからロジックを再利用) ---
function generateByteStr(sizeInBytes: number): string {
  return 'a'.repeat(sizeInBytes);
}
const fullTextHtml = generateByteStr(1 * 1024 * 1024); // 1MB

async function main() {
  console.log("\n🚀 Starting deployment with Hardhat Ignition...");

  // --- 1. Ignitionモジュールをデプロイ ---
  // deploy関数は、モジュールで定義されたすべてのデプロイとトランザクションが完了するのを待つ
  const { htmlStorage } = await hre.ignition.deploy(HtmlStorageModule, {
    // デプロイパラメータや設定をここに追加できる
  });

  const contractAddress = await htmlStorage.getAddress();
  console.log(`\n✅ HtmlStorage contract deployed and all chunks added.`);
  console.log(`   Contract address: ${contractAddress}`);

  // --- 2. 検証 (オフチェーンでのデータ再結合) ---
  console.log("\n🔍 Verifying the stored text by reassembling off-chain...");

  const startTime = Date.now();
  let retrievedText = "";
  const chunkCount = await htmlStorage.getChunkCount();
  console.log(`   Retrieved chunk count from contract: ${chunkCount}`);

  // 取得は並列化して高速化が可能
  const promises = [];
  for (let i = 0; i < chunkCount; i++) {
    promises.push(htmlStorage.getChunk(i));
  }
  const retrievedChunks = await Promise.all(promises);
  retrievedText = retrievedChunks.join('');


  const endTime = Date.now();
  console.log(`   Verification process took ${(endTime - startTime) / 1000} seconds.`);
  console.log(`   Retrieved text length: ${retrievedText.length}`);


  if (retrievedText.length === fullTextHtml.length && retrievedText === fullTextHtml) {
    console.log("\n🎉 Verification successful! Retrieved text matches the original.");
  } else {
    console.error("\n❌ Verification failed! Texts do not match.");
    console.error(`   Original length: ${fullTextHtml.length}, Retrieved length: ${retrievedText.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});