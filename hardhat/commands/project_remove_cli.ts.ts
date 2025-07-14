// commands/project_remove_cli.ts
import chalk from 'chalk';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';
import { selectProjects } from './cli_utils';

async function main() {
	const projectNameCLI = process.argv[2];

	try {
		const selectedProjects = await selectProjects(projectNameCLI, "削除するプロジェクトをスペースキーで選択してください:");

		console.log(chalk.bold.yellow(`\n🗑️ 以下のプロジェクトを削除します: [${selectedProjects.join(', ')}]`));

		for (const projectName of selectedProjects) {
			const projectPath = path.resolve(__dirname, '../projects', projectName);

			// プロジェクトごとに削除確認
			const { confirm } = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'confirm',
					message: `本当にプロジェクト '${chalk.cyan(projectName)}' を削除しますか？この操作は取り消せません。`,
					default: false,
				},
			]);

			if (confirm) {
				fs.rmSync(projectPath, { recursive: true, force: true });
				console.log(chalk.green(`  ✅ プロジェクト '${projectName}' を削除しました。`));
			} else {
				console.log(chalk.gray(`  ❌ プロジェクト '${projectName}' の削除をキャンセルしました。`));
			}
		}
		console.log(chalk.bold.green('\n✨ 全ての削除処理が完了しました。'));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 エラーが発生しました: ${error.message}`));
		process.exit(1);
	}
}

main();