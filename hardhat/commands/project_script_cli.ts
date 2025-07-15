import chalk from 'chalk';
import hre from 'hardhat'; // 💡 Hardhat Runtime Environment を直接インポート
import * as path from 'path';
import { selectFileInProject, selectProject } from './cli_utils';

async function main() {
	const projectNameCLI = process.argv[2];
	const scriptPathCLI = process.argv[3];

	try {
		const projectName = await selectProject(projectNameCLI, "スクリプトを実行するプロジェクトを選択してください:");
		const projectPath = path.resolve(__dirname, '../projects', projectName);

		const relativeScriptPath = await selectFileInProject(
			projectPath,
			'scripts',
			'スクリプト',
			'.ts',
			scriptPathCLI
		);

		const fullScriptPath = path.join(projectPath, relativeScriptPath);

		console.log(chalk.blue(`\n--- Running Script for Project: ${projectName} ---`));
		console.log(`📄 スクリプト: ${fullScriptPath}`);
		console.log(`\nスクリプトを実行中 (Network: anvil)...`);

		// 💡 hre.run を使ってプログラム的にタスクを実行
		await hre.run('run', {
			script: fullScriptPath,
			network: 'anvil'
		});

		console.log(chalk.green('\n✨ Hardhat スクリプトが正常に完了しました！'));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 エラー: ${error.message}`));
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

main();