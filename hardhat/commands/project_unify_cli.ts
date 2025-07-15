// commands/project_unify_cli.ts
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { selectProject } from './cli_utils';

/**
 * 指定されたディレクトリ内のすべてのファイルパスを再帰的に取得する
 * @param dirPath 探索を開始するディレクトリのパス
 * @param basePath プロジェクトのルートパス（相対パス計算用）
 * @param fileList ファイルパスを格納する配列
 * @returns ファイルパスの配列
 */
function getAllFilePaths(dirPath: string, basePath: string, fileList: string[] = []): string[] {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			getAllFilePaths(fullPath, basePath, fileList);
		} else {
			// プロジェクトルートからの相対パスを格納
			fileList.push(path.relative(basePath, fullPath));
		}
	}
	return fileList;
}


async function main() {
	const projectNameCLI = process.argv[2];

	try {
		// 既存のユーティリティ関数を使い、単一のプロジェクトを選択
		const selectedProject = await selectProject(projectNameCLI, "統合するプロジェクトを選択してください:");

		console.log(chalk.bold.yellow(`\n📄 以下のプロジェクトのファイルを統合します: [${selectedProject}]`));

		const projectPath = path.resolve(__dirname, '../projects', selectedProject);
		const outputDir = path.resolve(__dirname, '../dist/unified_txt', selectedProject);
		const outputPath = path.join(outputDir, 'project_uni.txt');

		// 出力先ディレクトリが存在しない場合は作成
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// プロジェクト内の全ファイルパスを相対パスで取得
		const allFiles = getAllFilePaths(projectPath, projectPath);

		if (allFiles.length === 0) {
			console.log(chalk.yellow(`  🟡 プロジェクト '${selectedProject}' にはファイルが見つかりませんでした。`));
			return;
		}

		console.log(chalk.blue(`  ... ${allFiles.length}個のファイルを処理中`));

		// ファイル内容を一つの文字列に結合
		let unifiedContent = `Project: ${selectedProject}\n`;
		unifiedContent += `Generated At: ${new Date().toISOString()}\n`;
		unifiedContent += '========================================\n\n';

		for (const relativePath of allFiles) {
			const absolutePath = path.join(projectPath, relativePath);
			const content = fs.readFileSync(absolutePath, 'utf-8');

			unifiedContent += `--- START: ${relativePath.replace(/\\/g, '/')} ---\n`;
			unifiedContent += content;
			unifiedContent += `\n--- END: ${relativePath.replace(/\\/g, '/')} ---\n\n`;
		}

		// 結合した内容をファイルに書き込む
		fs.writeFileSync(outputPath, unifiedContent.trimEnd());

		console.log(chalk.green(`\n  ✅ ファイルを統合し、以下に出力しました:`));
		console.log(chalk.cyan(`     ${path.relative(process.cwd(), outputPath)}`));
		console.log(chalk.bold.green('\n✨ 処理が完了しました。'));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 エラーが発生しました: ${error.message}`));
		process.exit(1);
	}
}

main();