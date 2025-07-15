import chalk from "chalk";
import { task } from "hardhat/config";

task("compile-project", "プロジェクト内のすべてのコントラクトをコンパイルします")
	.setAction(async (taskArgs, hre) => {
		console.log(chalk.yellow("\n🔍 プロジェクトのコントラクトをコンパイルしています..."));
		try {
			// Hardhat の標準コンパイルタスクを実行
			await hre.run('compile');
			console.log(chalk.green("✅ コンパイルが成功しました！"));
		} catch (error) {
			console.error(chalk.red("🔴 コンパイルに失敗しました。"));
			// エラーを再スローして、makeなどの後続プロセスに失敗を伝える
			throw error;
		}
	});