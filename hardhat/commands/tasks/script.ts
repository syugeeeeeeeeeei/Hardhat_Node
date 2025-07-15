import chalk from "chalk";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as path from "path";
import { selectFileInProject, selectProject } from "../../commands/cli_utils";

task("run-script", "特定のプロジェクトのスクリプトを実行します")
	.addOptionalParam("project", "スクリプトを実行するプロジェクト名")
	.addOptionalParam("script", "実行するスクリプトファイルへのパス")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { project: projectNameCLI, script: scriptPathCLI } = taskArgs;
		try {
			const projectName = await selectProject(projectNameCLI, "スクリプトを実行するプロジェクトを選択してください:");
			const projectPath = path.resolve(__dirname, '../../projects', projectName);
			const relativeScriptPath = await selectFileInProject(
				projectPath, 'scripts', 'スクリプト', '.ts', scriptPathCLI
			);
			const fullScriptPath = path.join(projectPath, relativeScriptPath);

			console.log(chalk.blue(`\n--- プロジェクトのスクリプトを実行: ${projectName} ---`));
			console.log(`📄 スクリプト: ${chalk.cyan(fullScriptPath)}`);
			console.log(`\nスクリプトを実行中 (ネットワーク: ${chalk.yellow(hre.network.name)})...`);

			const scriptModule = await import(fullScriptPath);
			if (typeof scriptModule.main !== 'function') {
				throw new Error(`スクリプト '${fullScriptPath}' に main関数がエクスポートされていません。`);
			}
			await scriptModule.main();

			console.log(chalk.green('\n✨ Hardhat スクリプトが正常に完了しました！'));

		} catch (error: any) {
			console.error(chalk.red(`\n🔴 スクリプトの実行中にエラーが発生しました: ${error.message}`));
			if (error.stack) {
				console.error(error.stack);
			}
			process.exit(1);
		}
	});