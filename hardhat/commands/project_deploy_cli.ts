// commands/project_deploy_cli.ts
import chalk from 'chalk';
import { spawn } from 'child_process';
import * as path from 'path';
import { selectFileInProject, selectProjects } from './cli_utils';

const projectsDir = path.resolve(__dirname, '../projects');

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

		await new Promise<void>((resolve, reject) => {
			// 💡 spawnのオプションに { shell: true } を追加
			const hardhatProcess = spawn('yarn', ['hardhat', 'ignition', 'deploy', fullModulePath, '--network', 'anvil'], {
				stdio: 'inherit',
				shell: true
			});
			hardhatProcess.on('close', (code) => {
				if (code !== 0) {
					console.error(chalk.red(`\n🔴 [${projectName}] デプロイが失敗しました。`));
					reject(new Error(`Deployment failed for ${projectName}`));
				} else {
					console.log(chalk.green(`\n✨ [${projectName}] デプロイが正常に完了しました！`));
					resolve();
				}
			});
			hardhatProcess.on('error', (err) => {
				console.error(chalk.red(`\n🔴 [${projectName}] エラー: ${err.message}`));
				reject(err);
			});
		});

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 [${projectName}] デプロイプロセスでエラーが発生しました: ${error.message}`));
		throw error;
	}
}

async function main() {
	const projectNameCLI = process.argv[2];
	const modulePathCLI = process.argv[3];
	try {
		const selectedProjects = await selectProjects(projectNameCLI, "デプロイするプロジェクトをスペースキーで選択してください:");
		console.log(chalk.bold.yellow(`\n🚀 以下のプロジェクトのデプロイを開始します: [${selectedProjects.join(', ')}]`));
		for (const projectName of selectedProjects) {
			await deploySingleProject(projectName, selectedProjects.length === 1 ? modulePathCLI : undefined);
		}
		console.log(chalk.bold.green('\n🎉🎉🎉 選択された全てのプロジェクトのデプロイが完了しました！ 🎉🎉🎉'));
	} catch (error: any) {
		console.error(chalk.red(`\n❌ デプロイメントが途中で失敗したため、処理を中断しました。`));
		process.exit(1);
	}
}

main();