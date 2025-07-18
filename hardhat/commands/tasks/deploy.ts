// hardhat/commands/tasks/deploy.ts
import { IgnitionModule } from "@nomicfoundation/ignition-core";
import chalk from "chalk";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as path from "path";
import { selectFileInProject, selectProjects } from "../../commands/cli_utils";

async function deploySingleProject(hre: HardhatRuntimeEnvironment, projectName: string, modulePathCLI?: string) {
	console.log(chalk.blue(`\n--- プロジェクトのデプロイ: ${projectName} ---`));
	try {
		const projectPath = path.resolve(__dirname, '../../projects', projectName);
		const relativeModulePath = await selectFileInProject(
			projectPath, 'ignition/modules', 'Ignitionモジュール', '.ts', modulePathCLI
		);
		const fullModulePath = path.join(projectPath, relativeModulePath);

		console.log(`✅ プロジェクト: ${chalk.cyan(projectName)}`);
		console.log(`🚀 Ignitionモジュール: ${chalk.cyan(fullModulePath)}`);
		console.log(`\nデプロイを実行中 (ネットワーク: ${chalk.yellow(hre.network.name)})...`);

		const { default: ignitionModule }: { default: IgnitionModule } = await import(fullModulePath);
		await hre.ignition.deploy(ignitionModule, {});

		console.log(chalk.green(`\n✨ [${projectName}] のデプロイが正常に完了しました！`));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 [${projectName}] のデプロイプロセスでエラーが発生しました。`));
		console.error(chalk.red('エラー内容:'), error.message);
		if (error.stack) {
			console.error(chalk.gray(error.stack));
		}
		// 後続の処理を停止させるためにエラーを再スロー
		throw error;
	}
}

task("deploy-project", "対話形式でプロジェクトをデプロイします")
	.addOptionalParam("project", "デプロイするプロジェクト名")
	.addOptionalParam("module", "使用するIgnitionモジュールファイルへのパス")
	.setAction(async (taskArgs, hre) => {
		const { project: projectNameCLI, module: modulePathCLI } = taskArgs;
		try {
			const selectedProjects = await selectProjects(projectNameCLI, "デプロイするプロジェクトを選択してください:");
			if (selectedProjects.length === 0) {
				console.log(chalk.yellow("デプロイするプロジェクトが選択されなかったため、処理を中断しました。"));
				return;
			}
			console.log(chalk.bold.yellow(`\n🚀 以下のプロジェクトのデプロイを開始します: [${selectedProjects.join(', ')}]`));

			for (const projectName of selectedProjects) {
				await deploySingleProject(hre, projectName, selectedProjects.length === 1 ? modulePathCLI : undefined);
			}
			console.log(chalk.bold.green('\n🎉🎉🎉 選択された全てのプロジェクトのデプロイが完了しました！ 🎉🎉🎉'));

		} catch (error: any) {
			if (error instanceof Error) {
				// プロジェクト選択など、前段で起きたエラーの場合
				if (!error.message.includes("デプロイプロセスでエラー")) {
					console.error(chalk.red(`\n❌ 処理が失敗したため、中断しました。`));
					console.error(chalk.red('エラー内容:'), error.message);
				} else {
					// deploySingleProjectからスローされたエラーの場合（メッセージは既に出力済み）
					console.error(chalk.red(`\n❌ デプロイメントが途中で失敗したため、処理を中断しました。`));
				}
			}
			process.exit(1);
		}
	});