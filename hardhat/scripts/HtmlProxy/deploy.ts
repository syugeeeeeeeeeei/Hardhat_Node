// scripts/deployHtmlProxy.viem.ts
import hre from "hardhat";

async function main() {
	console.log("🚀 Deploying HtmlProxy contract using viem...");

	const longHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Proxy Test</title></head><body><h1>Proxy Pattern</h1><p>This HTML is split into multiple chunks and stored across different contracts.</p><p>The proxy contract can reassemble them upon request.</p><footer>End of document.</footer></body></html>`;
	const splitCount = 4; // 4つに分割

	console.log(`\nHTML length: ${longHtml.length}, Split count: ${splitCount}`);

	// 1. プロキシコントラクトをデプロイ
	// uint256型の引数にはBigIntを使用します
	const htmlProxy = await hre.viem.deployContract("HtmlProxy", [
		longHtml,
		BigInt(splitCount),
	]);
	console.log(`✅ HtmlProxy deployed successfully to: ${htmlProxy.address}`);

	// 2. 子コントラクトのアドレスリストを取得
	const chunkAddresses = await htmlProxy.read.getChunkAddresses();
	console.log("\n📦 Deployed chunk contract addresses:", chunkAddresses);

	// 3. オンチェーンでのHTML復元を試行
	console.log("\n🔗 Attempting to fetch and combine HTML on-chain...");
	try {
		const combinedHtmlOnChain = await htmlProxy.read.getFullHtml();
		console.log("✅ Successfully combined HTML on-chain.");
		if (combinedHtmlOnChain === longHtml) {
			console.log("👍 Verification successful: On-chain HTML matches original.");
		} else {
			console.error("👎 Verification failed: On-chain HTML does not match.");
		}
	} catch (error) {
		console.error(
			"❌ Failed to get full HTML on-chain, likely due to gas limits."
		);

		// 4. オフチェーンでのHTML復元（推奨方法）
		console.log(
			"\n💻 Attempting to fetch and combine HTML off-chain (recommended way)..."
		);

		const chunks: { id: number; chunk: string }[] = [];
		for (const address of chunkAddresses) {
			// 既存のコントラクトのインスタンスを取得
			const chunkContract = await hre.viem.getContractAt("HtmlChunk", address);

			const id = await chunkContract.read.id();
			const chunk = await chunkContract.read.chunk();

			// idはBigIntで返ってくるので、ソート用にNumberへ変換
			chunks.push({ id: Number(id), chunk });
		}

		// IDでソートして結合
		const combinedHtmlOffChain = chunks
			.sort((a, b) => a.id - b.id)
			.map((c) => c.chunk)
			.join("");

		console.log("✅ Successfully combined HTML off-chain.");
		if (combinedHtmlOffChain === longHtml) {
			console.log("👍 Verification successful: Off-chain HTML matches original.");
		} else {
			console.error("👎 Verification failed: Off-chain HTML does not match.");
		}
	}
}

// Hardhatの推奨パターンでmain関数を実行
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});