// scripts/deploy.ts

import { formatEther } from "ethers";
import hre from "hardhat";
import { generateByteStr } from "../modules/generateByteStr"; // 仮定: generateByteStrは既存のモジュールにある

/**
 * テキストをUTF-8のバイト数に基づいて分割するヘルパー関数
 */
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

async function main() {
	// --- 1. 初期設定 ---
	// 1回のトランザクションでコントラクトに追加するHTMLチャンクの最大バイトサイズ
	// この値はEVMのガス制限内に収まるように調整する必要があります。
	// 一般的な推奨値は24KBですが、文字列の内容によってガス消費は変動します。
	const MAX_CHUNK_SIZE_IN_BYTES = 12 * 1024; // 24KB

	// デプロイするHTMLコンテンツの全長 (例: 10MB)
	const fullTextHtml = generateByteStr(1 * 1024 * 1024); // 10MBのダミーテキストを生成

	// --- 2. テキストの分割 ---
	console.log(`📝 Original text UTF-8 size: ${Buffer.from(fullTextHtml, 'utf8').length} bytes`);
	console.log(`✂️ Splitting text into chunks of max ${MAX_CHUNK_SIZE_IN_BYTES} bytes...`);

	const textChunks = splitTextByBytes(fullTextHtml, MAX_CHUNK_SIZE_IN_BYTES);
	console.log(`   Created ${textChunks.length} chunks.`);

	// --- 3. ガス代計算の準備 ---
	let totalGasCost = 0n;
	const [deployer] = await hre.ethers.getSigners();
	console.log(`\nDeploying contracts with the account: ${deployer.address}`);

	// --- 4. HtmlStorage コントラクトのデプロイ ---
	console.log("\n🚀 Deploying HtmlStorage contract...");
	const HtmlStorageFactory = await hre.ethers.getContractFactory("HtmlStorage");
	const htmlStorage = await HtmlStorageFactory.deploy();
	await htmlStorage.waitForDeployment();
	const contractAddress = await htmlStorage.getAddress();
	console.log(`✅ HtmlStorage deployed to: ${contractAddress}`);
	const deployTx = htmlStorage.deploymentTransaction();
	if (!deployTx) throw new Error("HtmlStorage deployment transaction not found.");
	const deployReceipt = await deployTx.wait();
	if (!deployReceipt) throw new Error("HtmlStorage deployment receipt not found.");
	const deployGasCost = deployReceipt.fee;
	totalGasCost += deployGasCost;
	console.log(`   Gas cost for deployment: ${formatEther(deployGasCost)} ETH`);

	// --- 5. HTMLチャンクの追加 ---
	console.log(`\n🔗 Adding ${textChunks.length} HTML chunks to HtmlStorage...`);

	for (let i = 0; i < textChunks.length; i++) {
		const chunkData = textChunks[i];

		// addChunk関数を呼び出してチャンクを追加
		const addChunkTx = await htmlStorage.addChunk(chunkData);
		const addChunkReceipt = await addChunkTx.wait();
		if (!addChunkReceipt) throw new Error(`Chunk ${i} add transaction receipt not found.`);
		const addChunkGasCost = addChunkReceipt.fee;
		totalGasCost += addChunkGasCost;
		console.log(`   Adding chunk ${(i + 1).toString().padStart(3,"0")}/${textChunks.length}...(${formatEther(addChunkGasCost)} ETH)`); // ログが多い場合はコメントアウト
	}
	console.log(`✅ All ${textChunks.length} chunks added.`);

	// --- 6. 検証 (オフチェーンでのデータ再結合) ---
	console.log("\n🔍 Verifying the stored text by reassembling off-chain...");

	let retrievedText = "";
	const chunkCount = await htmlStorage.getChunkCount();
	console.log(`   Retrieved chunk count from contract: ${chunkCount}`);

	for (let i = 0; i < chunkCount; i++) {
		// getChunk関数を呼び出して個々のチャンクを取得
		const textPart = await htmlStorage.getChunk(i);
		retrievedText += textPart;
	}

	console.log(`   Retrieved text length: ${retrievedText.length}`);

	if (retrievedText === fullTextHtml) {
		console.log("\n🎉 Verification successful! Retrieved text matches the original.");
	} else {
		console.error("\n❌ Verification failed! Texts do not match.");
		// デバッグ用に、差異を表示することも可能
		// console.error("Original (first 100 chars):", fullTextHtml.substring(0, 100));
		// console.error("Retrieved (first 100 chars):", retrievedText.substring(0, 100));
	}

	console.log("--------------------------------------------------------------------------");
	console.log(`💰 Total Gas Cost for all transactions: ${formatEther(totalGasCost)} ETH (${totalGasCost} GWei)`);
	console.log("--------------------------------------------------------------------------");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});