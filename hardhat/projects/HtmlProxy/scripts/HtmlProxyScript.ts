// projects/[your_project]/scripts/verifyHtmlProxyDeployment.ts
import hre from "hardhat";
import HtmlProxyModule from "../ignition/modules/HtmlProxyModule";

// --- 検証用のデータ準備 (モジュールファイルからロジックを再利用) ---
function generateByteStr(sizeInBytes: number): string {
  return 'a'.repeat(sizeInBytes);
}
const fullTextHtml = generateByteStr(1 * 1024 * 1024); // 1MB

async function main() {
  console.log("\n🚀 Deploying HtmlProxy and its chunks using Ignition...");

  // --- 1. Ignitionモジュールをデプロイ ---
  // .deploy() は、モジュールで定義された全ての操作が完了するのを待つ
  const { htmlProxy } = await hre.ignition.deploy(HtmlProxyModule, {
    parameters: {}, // モジュールに渡すパラメータがあればここに記述
  });

  const proxyAddress = await htmlProxy.getAddress();
  console.log(`\n✅ Deployment complete. HtmlProxy is at: ${proxyAddress}`);

  // --- 2. 検証 (オフチェーンでのデータ再結合) ---
  console.log("\n🔍 Verifying the stored text by reassembling off-chain...");
  const startTime = Date.now();
  let retrievedText = "";

  const chunkCount = await htmlProxy.getChunkCount();
  console.log(`   Found ${chunkCount} chunk contracts linked to the proxy.`);

  // 取得は並列化して高速化
  const chunkPromises = [];
  for (let i = 0; i < Number(chunkCount); i++) {
    const chunkAddress = await htmlProxy.chunkContracts(i);
    const chunkContract = await hre.ethers.getContractAt("HtmlChunk", chunkAddress);
    chunkPromises.push(chunkContract.textChunk());
  }

  const retrievedChunks = await Promise.all(chunkPromises);
  retrievedText = retrievedChunks.join('');

  const endTime = Date.now();
  console.log(`   Verification took ${(endTime - startTime) / 1000} seconds.`);
  console.log(`   Original text length: ${fullTextHtml.length}`);
  console.log(`   Retrieved text length: ${retrievedText.length}`);

  // --- 3. 結果の確認 ---
  if (retrievedText === fullTextHtml) {
    console.log("\n🎉 Verification successful! The retrieved text matches the original.");
  } else {
    console.error("\n❌ Verification failed! The texts do not match.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});