// commands/project_deploy_cli.ts
import chalk from 'chalk';
import { spawn } from 'child_process';
import * as path from 'path';
import { selectFileInProject, selectProjects } from './cli_utils';

const projectsDir = path.resolve(__dirname, '../projects');

/**
 * 単一プロジェクトのデプロイを実行する内部関数
 */
async function deploySingleProject(projectName: string, modulePathCLI?: string) {
	console.log(chalk.blue(`\n--- Deploying Project: ${projectName} ---`));
	try {
		const projectPath = path.resolve(projectsDir, projectName);
		const relativeModulePath = await selectFileInProject(
			projectPath,
			'ignition/modules',
			'Ignitionモジュール',
			'.ts',
			modulePathCLI
		);
		const fullModulePath = path.join(projectPath, relativeModulePath);

		console.log(`✅ プロジェクト: ${projectName}`);
		console.log(`🚀 Ignitionモジュール: ${fullModulePath}`);
		console.log(`\nデプロイを実行中 (Network: anvil)...`);

		// 同期的にHardhatプロセスを実行して完了を待つ
		await new Promise<void>((resolve, reject) => {
			const hardhatProcess = spawn('yarn', ['hardhat', 'ignition', 'deploy', fullModulePath, '--network', 'anvil'], {
				stdio: 'inherit',
			});
			hardhatProcess.on('close', (code) => {
				if (code !== 0) {
					console.error(chalk.red(`\n🔴 [${projectName}] Hardhat Ignition デプロイがコード ${code} で終了しました。`));
					reject(new Error(`Deployment failed for ${projectName}`));
				} else {
					console.log(chalk.green(`\n✨ [${projectName}] Hardhat Ignition デプロイが正常に完了しました！`));
					resolve();
				}
			});
			hardhatProcess.on('error', (err) => {
				console.error(chalk.red(`\n🔴 [${projectName}] Hardhat Ignition デプロイ実行中にエラーが発生しました: ${err.message}`));
				reject(err);
			});
		});

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 [${projectName}] デプロイプロセスでエラーが発生しました: ${error.message}`));
		// 全体デプロイを中断するためにエラーを再スロー
		throw error;
	}
}


/**
 * メイン関数
 */
async function main() {
	const projectNameCLI = process.argv[2];
	const modulePathCLI = process.argv[3];

	try {
		// 複数選択関数を呼び出す
		const selectedProjects = await selectProjects(projectNameCLI, "デプロイするプロジェクトをスペースキーで選択してください:");

		console.log(chalk.bold.yellow(`\n🚀 以下のプロジェクトのデプロイを開始します: [${selectedProjects.join(', ')}]`));

		for (const projectName of selectedProjects) {
			// 複数選択時はモジュール名の直接指定は最初のプロジェクトにのみ適用される
			// (CLIで単一プロジェクト指定時のみ有効)
			await deploySingleProject(projectName, selectedProjects.length === 1 ? modulePathCLI : undefined);
		}
		console.log(chalk.bold.green('\n🎉🎉🎉 選択された全てのプロジェクトのデプロイが完了しました！ 🎉🎉🎉'));

	} catch (error: any) {
		console.error(chalk.red(`\n❌ デプロイメントが途中で失敗したため、処理を中断しました。`));
		process.exit(1);
	}
}

main();