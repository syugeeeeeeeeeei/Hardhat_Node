// scripts/deployHtmlStorage.viem.ts
import hre from "hardhat";

async function main() {
	console.log("🚀 Deploying HtmlStorage contract using viem...");

	const html =
		'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Proxy Test</title></head><body><h1>Proxy Pattern</h1><p>This HTML is split into multiple chunks and stored across different contracts.</p><p>The proxy contract can reassemble them upon request.</p><footer>End of document.</footer></body></html>';

	// 1. コントラクトをデプロイ（コンストラクタ引数を配列で渡す）
	const htmlStorage = await hre.viem.deployContract("HtmlStorage", [html]);

	console.log(`✅ HtmlStorage deployed successfully to: ${htmlStorage.address}`);

	// 2. デプロイしたコントラクトから値を読み取る
	const storedHtml = await htmlStorage.read.getHtml();
	console.log("\n📄 Stored HTML Content:");
	console.log(storedHtml);
}

// Hardhatの推奨パターンでmain関数を実行
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});