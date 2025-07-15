// commands/project_list_cli.ts
import chalk from 'chalk'; // 文字色を変更するためのライブラリ
import * as fs from 'fs';
import * as path from 'path';

async function listProjects() {
	const projectsDir = path.resolve(__dirname, '../projects');
	// example.ts	
	try {
		const availableProjects = fs.readdirSync(projectsDir, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		// 'yellow' でヘッダーを表示
		console.log(chalk.yellow("📂 Available projects:"));

		if (!availableProjects.length) {
			// 'gray' で注釈を表示
			console.log(chalk.gray("  (No projects found. Use 'make init' to create one.)"));
			return;
		}

		availableProjects.forEach(project => {
			// 'cyan' でプロジェクト名を表示
			console.log(`  - ${chalk.cyan(project)}`);
		});

	} catch (error: any) {
		// 'projects' ディレクトリが存在しない場合のエラーハンドリング
		if (error.code === 'ENOENT') {
			console.log(chalk.yellow("📂 Available projects:"));
			console.log(chalk.gray("  (The 'projects' directory does not exist yet.)"));
		} else {
			console.error(chalk.red(`\n🔴 An error occurred: ${error.message}`));
			process.exit(1);
		}
	}
}

listProjects();