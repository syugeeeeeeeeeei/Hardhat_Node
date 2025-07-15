// scripts/performance_test.ts
import { Buffer } from "buffer";
import { TransactionResponse } from "ethers";
import fs from "fs/promises";
import { ethers } from "hardhat";
import path from "path";
import { performance } from "perf_hooks";
// ✨ プログレスバーライブラリをインポート
import * as cliProgress from "cli-progress";

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

// ✨ 結果を出力するディレクトリと単一のファイル名を定義
const OUTPUT_DIR = path.resolve(__dirname, "./contract_benchmark");
const CSV_FILENAME = "benchmark_results.csv";
const CSV_FILEPATH = path.join(OUTPUT_DIR, CSV_FILENAME);


// =============================================================================
// 🛠️ ヘルパー関数
// =============================================================================

/**
 * 指定したバイト数のダミー文字列を生成する
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

/**
 * ✨ 指定した時間(ms)だけ処理を待機するsleep関数
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// =============================================================================
// 📊 メインのテスト実行ロジック
// =============================================================================

export async function main() {
	console.log("🚀 Starting HtmlStorage contract performance benchmark...");

	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	// ✨ CSVヘッダーを定義 (IDと平均ガス代を追加)
	const csvHeaders = [
		"ID",
		"Test Case",
		"Total Size (Bytes)",
		"Chunk Size (Bytes)",
		"Number of Chunks",
		"Preprocessing Time (s)",
		"Upload Time (s)",
		"Download Time (s)",
		"Total Execution Time (s)",
		"Total Gas Used",
		"Total Fee (ETH)",
		"Average Gas Per Tx",
	];

	// ✨ ファイルが存在しない場合のみヘッダーを書き込む
	try {
		await fs.access(CSV_FILEPATH);
	} catch (error) {
		await fs.writeFile(CSV_FILEPATH, csvHeaders.join(',') + '\n');
	}

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
			const preprocessingTime = (performance.now() - t0_prep) / 1000;
			console.log(`[1/5] 📝 Preprocessing...`);
			console.log(`      - Text generated: ${totalSizeLabel}, Split into ${chunks.length} chunks`);

			let totalGasUsed = 0n;
			let totalFeeInEth = 0n;

			// ----- 2. アップロード処理 (デプロイ + データ保存) -----
			console.log(`[2/5] 📤 Uploading data...`);
			const t0_upload = performance.now();

			const HtmlStorageFactory = await ethers.getContractFactory("HtmlStorage");
			const htmlStorage = await HtmlStorageFactory.deploy();
			await htmlStorage.waitForDeployment();
			await sleep(100); // ✨ デプロイトランザクション後にsleep

			const deployReceipt = await htmlStorage.deploymentTransaction()?.wait();
			if (deployReceipt) {
				totalGasUsed += deployReceipt.gasUsed;
				totalFeeInEth += deployReceipt.gasUsed * deployReceipt.gasPrice;
			}
			console.log(`      - Contract deployed. Gas used: ${deployReceipt?.gasUsed.toString() ?? 'N/A'}`);

			const progressBar = new cliProgress.SingleBar({
				format: '      - Uploading chunks |{bar}| {percentage}% || {value}/{total} Chunks',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
				hideCursor: true
			});
			progressBar.start(chunks.length, 0);

			for (let i = 0; i < chunks.length; i++) {
				const tx: TransactionResponse = await htmlStorage.addChunk(chunks[i]);
				const receipt = await tx.wait();
				if (receipt) {
					totalGasUsed += receipt.gasUsed;
					totalFeeInEth += receipt.gasUsed * receipt.gasPrice;
				}
				progressBar.increment();
				await sleep(100); // ✨ 各チャンクのアップロード後にsleep
			}
			progressBar.stop();

			const uploadTime = (performance.now() - t0_upload) / 1000;
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
			const downloadTime = (performance.now() - t0_download) / 1000;
			console.log(`      - All ${chunkCount} chunks downloaded.`);

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
			const totalExecutionTime = (performance.now() - t0_prep) / 1000;

			// ✨ IDと平均ガス代を計算
			const id = `${totalSizeLabel}_${chunkSizeLabel}`;
			const totalTransactions = 1 + chunks.length; // 1はデプロイトランザクション分
			const averageGasPerTx = totalTransactions > 0 ? totalGasUsed / BigInt(totalTransactions) : 0n;

			const results = {
				"ID": id,
				"Test Case": testCaseName,
				"Total Size (Bytes)": totalSize,
				"Chunk Size (Bytes)": chunkSize,
				"Number of Chunks": chunks.length,
				"Preprocessing Time (s)": preprocessingTime.toFixed(4),
				"Upload Time (s)": uploadTime.toFixed(4),
				"Download Time (s)": downloadTime.toFixed(4),
				"Total Execution Time (s)": totalExecutionTime.toFixed(4),
				"Total Gas Used": totalGasUsed.toString(),
				"Total Fee (ETH)": ethers.formatEther(totalFeeInEth),
				"Average Gas Per Tx": averageGasPerTx.toString(),
			};

			// ✨ ヘッダーの順序に合わせて値の配列を作成し、CSV行に変換
			const csvRow = csvHeaders.map(header => results[header as keyof typeof results]).join(',');

			// ✨ ファイルに追記
			await fs.appendFile(CSV_FILEPATH, csvRow + '\n');
			console.log(`      - Results appended to: ${CSV_FILEPATH}`);
		}
	}
	console.log("\n\n🎉 All benchmark tests completed!");
}
