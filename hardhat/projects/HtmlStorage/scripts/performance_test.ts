// scripts/performance_test.ts
import { Buffer } from "buffer";
import { TransactionResponse } from "ethers";
import fs from "fs/promises";
import { ethers } from "hardhat";
import path from "path";
import { performance } from "perf_hooks";

// =============================================================================
// 📝 テスト設定 (ここを編集してテスト内容を変更できます)
// =============================================================================

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;

// テストする合計テキストサイズ (バイト単位)
const TOTAL_SIZES_TO_TEST = [
	100 * KILOBYTE,
	500 * KILOBYTE,
	1 * MEGABYTE,
	5 * MEGABYTE,
	10 * MEGABYTE,
];

// テストするチャンクサイズ (バイト単位)
const CHUNK_SIZES_TO_TEST = [
	// 6 * KILOBYTE,
	// 12 * KILOBYTE,
	24 * KILOBYTE,
];

// 結果を出力するディレクトリ
const OUTPUT_DIR = "./contract_benchmark";


// =============================================================================
// 🛠️ ヘルパー関数
// =============================================================================

/**
 * 指定されたバイト数のダミー文字列を生成する
 */
function generateByteStr(sizeInBytes: number): string {
	return 'a'.repeat(sizeInBytes);
}

/**
 * テキストをUTF-8のバイト数に基づいて安全に分割する
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

/**
 * バイト数を人間が読みやすい形式 (KB, MB) に変換する
 */
function formatBytes(bytes: number): string {
	if (bytes < KILOBYTE) return `${bytes} B`;
	if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(0)}KB`;
	return `${(bytes / MEGABYTE).toFixed(0)}MB`;
}

// =============================================================================
// 📊 メインのテスト実行ロジック
// =============================================================================

export async function main() {
	console.log("🚀 Starting HtmlStorage contract performance benchmark...");

	// 出力ディレクトリが存在しない場合は作成
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	for (const totalSize of TOTAL_SIZES_TO_TEST) {
		for (const chunkSize of CHUNK_SIZES_TO_TEST) {
			const totalSizeLabel = formatBytes(totalSize);
			const chunkSizeLabel = formatBytes(chunkSize);
			const testCaseName = `Total: ${totalSizeLabel}, Chunk: ${chunkSizeLabel}`;
			console.log(`\n\n======================================================`);
			console.log(`▶️  Running test case: ${testCaseName}`);
			console.log(`======================================================`);

			// ----- 1. 前処理 (テキスト生成と分割) -----
			const t0_prep = performance.now();
			const originalText = generateByteStr(totalSize);
			const chunks = splitTextByBytes(originalText, chunkSize);
			const t1_prep = performance.now();
			const preprocessingTime = (t1_prep - t0_prep) / 1000;
			console.log(`[1/5] 📝 Preprocessing...`);
			console.log(`      - Text generated: ${totalSizeLabel}`);
			console.log(`      - Split into ${chunks.length} chunks of max ${chunkSizeLabel}`);
			console.log(`      - Time taken: ${preprocessingTime.toFixed(3)} seconds`);

			let totalGasUsed = 0n;
			let totalFeeInEth = 0n;

			// ----- 2. アップロード処理 (デプロイ + データ保存) -----
			console.log(`[2/5] 📤 Uploading data...`);
			const t0_upload = performance.now();

			// コントラクトをデプロイ
			const HtmlStorageFactory = await ethers.getContractFactory("HtmlStorage");
			const htmlStorage = await HtmlStorageFactory.deploy();
			await htmlStorage.waitForDeployment();
			const deployReceipt = await htmlStorage.deploymentTransaction()?.wait();
			if (deployReceipt) {
				totalGasUsed += deployReceipt.gasUsed;
				totalFeeInEth += deployReceipt.gasUsed * deployReceipt.gasPrice;
			}
			console.log(`      - Contract deployed. Gas used: ${deployReceipt?.gasUsed.toString() ?? 'N/A'}`);

			// チャンクをアップロード
			const uploadPromises = [];
			for (let i = 0; i < chunks.length; i++) {
				const tx:TransactionResponse = await htmlStorage.addChunk(chunks[i]);
				uploadPromises.push(tx.wait());
				// Note: 1つずつ実行してガス代を確実に計測
				const receipt = await tx.wait();
				if (receipt) {
					totalGasUsed += receipt.gasUsed;
					totalFeeInEth += receipt.gasUsed * receipt.gasPrice;
				}
			}
			await Promise.all(uploadPromises);

			const t1_upload = performance.now();
			const uploadTime = (t1_upload - t0_upload) / 1000;
			console.log(`      - All ${chunks.length} chunks uploaded.`);
			console.log(`      - Time taken: ${uploadTime.toFixed(3)} seconds`);

			// ----- 3. ダウンロード処理 -----
			console.log(`[3/5] 📥 Downloading data...`);
			const t0_download = performance.now();

			const chunkCount = await htmlStorage.getChunkCount();
			const downloadPromises = [];
			for (let i = 0; i < chunkCount; i++) {
				downloadPromises.push(htmlStorage.getChunk(i));
			}
			const retrievedChunks = await Promise.all(downloadPromises);

			const t1_download = performance.now();
			const downloadTime = (t1_download - t0_download) / 1000;
			console.log(`      - All ${chunkCount} chunks downloaded.`);
			console.log(`      - Time taken: ${downloadTime.toFixed(3)} seconds`);


			// ----- 4. 検証 -----
			console.log(`[4/5] 🔍 Verifying data...`);
			const retrievedText = retrievedChunks.join('');
			if (retrievedText === originalText) {
				console.log("      - ✅ Verification successful! Data matches.");
			} else {
				console.error("      - ❌ Verification FAILED! Data does not match.");
			}

			// ----- 5. 結果の記録とCSV出力 -----
			console.log(`[5/5] 🧾 Recording results...`);
			const totalExecutionTime = (t1_download - t0_prep) / 1000;
			const feeInEthString = ethers.formatEther(totalFeeInEth);

			const results = {
				"Test Case": testCaseName,
				"Total Size (Bytes)": totalSize,
				"Chunk Size (Bytes)": chunkSize,
				"Number of Chunks": chunks.length,
				"Preprocessing Time (s)": preprocessingTime.toFixed(4),
				"Upload Time (s)": uploadTime.toFixed(4),
				"Download Time (s)": downloadTime.toFixed(4),
				"Total Execution Time (s)": totalExecutionTime.toFixed(4),
				"Total Gas Used": totalGasUsed.toString(),
				"Total Fee (ETH)": feeInEthString,
			};

			const csvHeader = Object.keys(results).join(',');
			const csvRow = Object.values(results).join(',');
			const csvContent = `${csvHeader}\n${csvRow}`;

			const fileName = `benchmark_${totalSizeLabel}_${chunkSizeLabel}.csv`;
			const filePath = path.join(OUTPUT_DIR, fileName);

			await fs.writeFile(filePath, csvContent);
			console.log(`      - Results saved to: ${filePath}`);
		}
	}
	console.log("\n\n🎉 All benchmark tests completed!");
}