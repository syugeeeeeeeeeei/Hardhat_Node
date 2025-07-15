import { IgnitionModule } from '@nomicfoundation/ignition-core';
import chalk from 'chalk';
import hre from 'hardhat'; // 💡 Hardhat Runtime Environment を直接インポート
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

		// 💡 モジュールファイルを動的にインポートしてオブジェクトを取得
		const { default: ignitionModule }: { default: IgnitionModule } = await import(fullModulePath);

		// 💡 Ignitionのデプロイ関数をプログラムとして直接呼び出す
		await hre.ignition.deploy(ignitionModule, {});

		console.log(chalk.green(`\n✨ [${projectName}] Hardhat Ignition デプロイが正常に完了しました！`));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 [${projectName}] デプロイプロセスでエラーが発生しました: ${error.message}`));
		if (error.stack) {
			console.error(error.stack);
		}
		throw error;
	}
}

async function main() {
	const projectNameCLI = process.argv[2];
	const modulePathCLI = process.argv[3];
	try {
		const selectedProjects = await selectProjects(projectNameCLI, "デプロイするプロジェクトを選択してください:");
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