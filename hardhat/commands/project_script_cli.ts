// commands/project_script_cli.ts
import chalk from 'chalk';
import { spawn } from 'child_process';
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

		// 💡 spawnのオプションに { shell: true } を追加
		const hardhatProcess = spawn('yarn', ['hardhat', 'run', fullScriptPath, '--network', 'anvil'], {
			stdio: 'inherit',
			shell: true
		});

		hardhatProcess.on('close', (code) => {
			if (code !== 0) {
				console.error(chalk.red(`\n🔴 Hardhat スクリプト実行がコード ${code} で終了しました。`));
				process.exit(code || 1);
			} else {
				console.log(chalk.green('\n✨ Hardhat スクリプトが正常に完了しました！'));
			}
		});

		hardhatProcess.on('error', (err) => {
			console.error(chalk.red(`\n🔴 Hardhat スクリプト実行中にエラーが発生しました: ${err.message}`));
			process.exit(1);
		});

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 エラー: ${error.message}`));
		process.exit(1);
	}
}

main();