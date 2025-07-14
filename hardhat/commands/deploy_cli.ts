// commands/deploy_cli.ts
import { spawn } from 'child_process';
import * as path from 'path';
import { getProjectName, selectFileInProject } from './project_cli_utils';

async function runDeploy() {
	const projectNameCLI = process.argv[2];
	const modulePathCLI = process.argv[3];

	try {
		const projectName = await getProjectName(projectNameCLI);
		const projectPath = path.resolve(__dirname, '../projects', projectName);

		const relativeModulePath = await selectFileInProject(
			projectPath,
			'ignition/modules',
			'Ignitionモジュール',
			'.ts',
			modulePathCLI ? path.join('ignition/modules', modulePathCLI) : undefined
		);

		const fullModulePath = path.join(projectPath, relativeModulePath);

		console.log(`\n✅ プロジェクト: ${projectName}`);
		console.log(`🚀 Ignitionモジュール: ${fullModulePath}`);
		console.log(`\nデプロイを実行中 (Network: anvil)...`);

		// 'npx' を 'yarn' に変更
		const hardhatProcess = spawn('yarn', ['hardhat', 'ignition', 'deploy', fullModulePath, '--network', 'anvil'], {
			stdio: 'inherit',
		});

		hardhatProcess.on('close', (code) => {
			if (code !== 0) {
				console.error(`\n🔴 Hardhat Ignition デプロイがコード ${code} で終了しました。`);
				process.exit(code || 1);
			} else {
				console.log('\n✨ Hardhat Ignition デプロイが正常に完了しました！');
			}
		});

		hardhatProcess.on('error', (err) => {
			console.error(`\n🔴 Hardhat Ignition デプロイ実行中にエラーが発生しました: ${err.message}`);
			process.exit(1);
		});

	} catch (error: any) {
		console.error(`\n🔴 エラー: ${error.message}`);
		process.exit(1);
	}
}

runDeploy();