// scripts/deploy.ts

import { formatEther } from "ethers";
import hre from "hardhat";
import { generateByteStr } from "../modules/generateByteStr";

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
	const MAX_CHUNK_SIZE_IN_BYTES = 12 * 1024;

	const fullTextHtml = generateByteStr(1 * 1024 * 1024);

	// --- 2. テキストの分割 ---
	console.log(`📝 Original text UTF-8 size: ${Buffer.from(fullTextHtml, 'utf8').length} bytes`);
	console.log(`✂️ Splitting text into chunks of max ${MAX_CHUNK_SIZE_IN_BYTES} bytes...`);

	const textChunks = splitTextByBytes(fullTextHtml, MAX_CHUNK_SIZE_IN_BYTES);
	console.log(`   Created ${textChunks.length} chunks.`);

	// --- 3. ガス代計算の準備 ---
	let totalGasCost = 0n;
	const [deployer] = await hre.ethers.getSigners();
	console.log(`\nDeploying contracts with the account: ${deployer.address}`);

	// --- 4. 親コントラクトのデプロイ ---
	console.log("\n🚀 Deploying HtmlProxy (Parent)...");
	const HtmlProxyFactory = await hre.ethers.getContractFactory("HtmlProxy");
	const htmlProxy = await HtmlProxyFactory.deploy();
	await htmlProxy.waitForDeployment();
	const proxyAddress = await htmlProxy.getAddress();
	console.log(`✅ Proxy deployed to: ${proxyAddress}`);
	const proxyDeployTx = htmlProxy.deploymentTransaction();
	if (!proxyDeployTx) throw new Error("Proxy deployment transaction not found.");
	const proxyReceipt = await proxyDeployTx.wait();
	if (!proxyReceipt) throw new Error("Proxy deployment receipt not found.");
	const proxyGasCost = proxyReceipt.fee;
	totalGasCost += proxyGasCost;
	console.log(`   Gas cost for proxy: ${formatEther(proxyGasCost)} ETH`);

	// --- 5. 子コントラクトのデプロイ ---
	const chunkAddresses: string[] = [];
	console.log(`\n🚀 Deploying ${textChunks.length} HtmlChunk (Child) contracts...`);
	const HtmlChunkFactory = await hre.ethers.getContractFactory("HtmlChunk");

	for (let i = 0; i < textChunks.length; i++) {
		const chunkData = textChunks[i];
		const chunkContract = await HtmlChunkFactory.deploy(i, chunkData);
		await chunkContract.waitForDeployment();
		const chunkAddress = await chunkContract.getAddress();
		chunkAddresses.push(chunkAddress);

		const chunkDeployTx = chunkContract.deploymentTransaction();
		if (!chunkDeployTx) throw new Error(`Chunk ${i} deployment transaction not found.`);
		const chunkReceipt = await chunkDeployTx.wait();
		if (!chunkReceipt) throw new Error(`Chunk ${i} deployment receipt not found.`);
		const chunkGasCost = chunkReceipt.fee;
		totalGasCost += chunkGasCost;
		// ログを簡潔にするため、個々のチャンクのデプロイログはコメントアウトしても良い
		console.log(`   Adding chunk ${(i + 1).toString().padStart(3, "0")}/${textChunks.length}...(${formatEther(chunkGasCost)} ETH)`); // ログが多い場合はコメントアウト;
	}
	console.log(`✅ All ${textChunks.length} chunks deployed.`);

	// --- 6. 親コントラクトに子コントラクトを登録 ---
	console.log("\n🔗 Linking child contracts to proxy...");
	const linkTx = await htmlProxy.setChunkContracts(chunkAddresses);
	const linkReceipt = await linkTx.wait();
	if (!linkReceipt) throw new Error("Linking transaction receipt not found.");
	const linkGasCost = await linkReceipt.fee;
	totalGasCost += linkGasCost;
	console.log("✅ Child contracts linked successfully.");

	// --- 7. 検証 (オフチェーンでのデータ再結合) ---
	console.log("\n🔍 Verifying the stored text by reassembling off-chain...");

	let retrievedText = "";
	const chunkCount = await htmlProxy.getChunkCount();

	for (let i = 0; i < chunkCount; i++) {
		// i番目のチャンクコントラクトのアドレスを取得
		const chunkAddress = await htmlProxy.chunkContracts(i);
		// そのアドレスからコントラクトのインスタンスを取得
		const chunkContract = await hre.ethers.getContractAt("HtmlChunk", chunkAddress);
		// テキストの断片を取得
		const textPart = await chunkContract.textChunk();
		// スクリプト内の変数に結合
		retrievedText += textPart;
	}

	console.log(`   Retrieved text length: ${retrievedText.length}`);

	if (retrievedText === fullTextHtml) {
		console.log("\n🎉 Verification successful! Retrieved text matches the original.");
	} else {
		console.error("\n❌ Verification failed! Texts do not match.");
	}

	console.log("--------------------------------------------------------------------------");
	console.log(`💰 Total Gas Cost for all transactions: ${formatEther(totalGasCost)} ETH (${totalGasCost} GWei)`);
	console.log("--------------------------------------------------------------------------");
}


main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});