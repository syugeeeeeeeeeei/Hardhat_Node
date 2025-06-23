import hre from "hardhat";

async function main() {
	// 1. コントラクトをデプロイ
	// "Storage" という名前のコントラクトをデプロイします。
	const storage = await hre.viem.deployContract("Storage");

	console.log(`✅ Storage コントラクトがデプロイされました: ${storage.address}`);

	// 2. デプロイしたコントラクトの状態を読み取る
	// デプロイ直後の値はデフォルト値（0）のはずです。
	const initialValue = await storage.read.retrieve();
	console.log(`📄 デプロイ直後の値: ${initialValue}`);

	// 3. コントラクトに書き込みトランザクションを送信
	// store関数を呼び出して、値を `123` に設定します。
	console.log("🔄 値を `123` に更新中...");
	const hash = await storage.write.store([123n]);
	console.log(`🔗 トランザクションハッシュ: ${hash}`);

	// トランザクションがブロックに取り込まれるのを待つ
	const publicClient = await hre.viem.getPublicClient();
	await publicClient.waitForTransactionReceipt({ hash });
	console.log("🎉 更新が完了しました！");


	// 4. 再度、状態を読み取って値が更新されたことを確認
	const updatedValue = await storage.read.retrieve();
	console.log(`📄 更新後の値: ${updatedValue}`);
}

// Hardhatの推奨パターンでmain関数を実行
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});