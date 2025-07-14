// commands/project_delete_cli.ts
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';
import { getProjectName } from './project_cli_utils'; // 既存のユーティリティを再利用

async function deleteProject() {
	// コマンドラインから渡されたプロジェクト名を取得
	const projectNameCLI = process.argv[2];

	try {
		// 既存の関数を使い、引数がなければインタラクティブにプロジェクトを選択
		const projectName = await getProjectName(projectNameCLI);
		const projectPath = path.resolve(__dirname, '../projects', projectName);

		// 削除確認のプロンプト
		const { confirm } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirm',
				message: `本当にプロジェクト '${projectName}' を削除しますか？この操作は取り消せません。`,
				default: false, // デフォルトは 'No'
			},
		]);

		if (confirm) {
			console.log(`\n🗑️ プロジェクト '${projectName}' を削除しています...`);
			fs.rmSync(projectPath, { recursive: true, force: true });
			console.log(`✅ プロジェクト '${projectName}' は正常に削除されました。`);
		} else {
			console.log('\n❌ 削除をキャンセルしました。');
		}

	} catch (error: any) {
		// プロジェクトが存在しない場合のエラーをハンドリング
		if (error.message.includes("プロジェクトが見つかりません")) {
			console.error(`\n🔴 削除対象のプロジェクトがありません。`);
		} else {
			console.error(`\n🔴 エラーが発生しました: ${error.message}`);
		}
		process.exit(1);
	}
}

deleteProject();