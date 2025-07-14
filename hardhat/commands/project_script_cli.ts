// commands/script_cli.ts
import { spawn } from 'child_process';
import * as path from 'path';
import { getProjectName, selectFileInProject } from './project_cli_utils';

async function runScript() {
	const projectNameCLI = process.argv[2];
	const scriptPathCLI = process.argv[3];

	try {
		const projectName = await getProjectName(projectNameCLI);
		const projectPath = path.resolve(__dirname, '../projects', projectName);

		const relativeScriptPath = await selectFileInProject(
			projectPath,
			'scripts',
			'スクリプト',
			'.ts',
			scriptPathCLI ? path.join('scripts', scriptPathCLI) : undefined
		);

		const fullScriptPath = path.join(projectPath, relativeScriptPath);

		console.log(`\n✅ プロジェクト: ${projectName}`);
		console.log(`📄 スクリプト: ${fullScriptPath}`);
		console.log(`\nスクリプトを実行中 (Network: anvil)...`);

		// 'npx' を 'yarn' に変更
		const hardhatProcess = spawn('yarn', ['hardhat', 'run', fullScriptPath, '--network', 'anvil'], {
			stdio: 'inherit',
		});

		hardhatProcess.on('close', (code) => {
			if (code !== 0) {
				console.error(`\n🔴 Hardhat スクリプト実行がコード ${code} で終了しました。`);
				process.exit(code || 1);
			} else {
				console.log('\n✨ Hardhat スクリプトが正常に完了しました！');
			}
		});

		hardhatProcess.on('error', (err) => {
			console.error(`\n🔴 Hardhat スクリプト実行中にエラーが発生しました: ${err.message}`);
			process.exit(1);
		});

	} catch (error: any) {
		console.error(`\n🔴 エラー: ${error.message}`);
		process.exit(1);
	}
}

runScript();