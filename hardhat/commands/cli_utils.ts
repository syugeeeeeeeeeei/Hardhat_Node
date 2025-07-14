// commands/cli_utils.ts
import chalk from 'chalk';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';

const projectsDir = path.resolve(__dirname, '../projects');

/**
 * 単一のプロジェクトを選択するための共通関数
 * @param projectNameCLI コマンドラインからプロジェクトが指定された場合
 * @param message プロンプトに表示するメッセージ
 * @returns 選択されたプロジェクト名
 */
export async function selectProject(projectNameCLI: string | undefined, message: string): Promise<string> {
	const availableProjects = fs.readdirSync(projectsDir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	if (!availableProjects.length) {
		throw new Error("プロジェクトが見つかりません。'make init'で作成してください。");
	}

	if (projectNameCLI) {
		if (!availableProjects.includes(projectNameCLI)) {
			throw new Error(`指定されたプロジェクト '${projectNameCLI}' は見つかりませんでした。`);
		}
		return projectNameCLI;
	}

	const { selected } = await inquirer.prompt([
		{
			type: 'list', // list for single selection
			name: 'selected',
			message: message,
			choices: availableProjects,
		}
	]);
	return selected;
}

/**
 * 複数のプロジェクトを複数選択するための共通関数
 * @param projectNameCLI コマンドラインから単一のプロジェクトが指定された場合
 * @param message プロンプトに表示するメッセージ
 * @returns 選択されたプロジェクト名の配列
 */
export async function selectProjects(projectNameCLI: string | undefined, message: string): Promise<string[]> {
	const availableProjects = fs.readdirSync(projectsDir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	if (!availableProjects.length) {
		throw new Error("プロジェクトが見つかりません。'make init'で作成してください。");
	}

	if (projectNameCLI) {
		if (!availableProjects.includes(projectNameCLI)) {
			throw new Error(`指定されたプロジェクト '${projectNameCLI}' は見つかりませんでした。`);
		}
		return [projectNameCLI];
	}

	const { selected } = await inquirer.prompt([
		{
			type: 'checkbox', // checkbox for multiple selections
			name: 'selected',
			message: message,
			choices: availableProjects,
			validate: (answer) => answer.length > 0 || '少なくとも1つのプロジェクトを選択してください。',
			instructions: chalk.gray('\n  (スペースキーで選択、Enterキーで決定)'),
		}
	]);
	return selected;
}


/**
 * 指定されたプロジェクト内のファイルを選択する関数（変更なし）
 */
export async function selectFileInProject(
	projectPath: string,
	subdir: string,
	fileTypeLabel: string,
	fileExt: string,
	filePathCLI?: string
): Promise<string> {
	const targetDir = path.join(projectPath, subdir);
	if (!fs.existsSync(targetDir)) throw new Error(`ディレクトリが見つかりません: ${targetDir}`);
	const availableFiles = fs.readdirSync(targetDir, { withFileTypes: true })
		.filter(dirent => dirent.isFile() && dirent.name.endsWith(fileExt))
		.map(dirent => dirent.name);
	if (!availableFiles.length) throw new Error(`プロジェクト '${path.basename(projectPath)}' の ${subdir} ディレクトリに ${fileTypeLabel} が見つかりませんでした。`);
	if (filePathCLI) {
		const fileBaseName = path.basename(filePathCLI);
		if (!availableFiles.includes(fileBaseName)) throw new Error(`指定された ${fileTypeLabel} '${filePathCLI}' は '${targetDir}' 内に見つかりませんでした。`);
		return path.join(subdir, fileBaseName);
	}
	if (availableFiles.length === 1) {
		console.log(`💡 ${fileTypeLabel} が1つのみのため、自動選択しました: ${availableFiles[0]}`);
		return path.join(subdir, availableFiles[0]);
	}
	const { selectedFile } = await inquirer.prompt([
		{ type: 'list', name: 'selectedFile', message: `実行する ${fileTypeLabel} を選択してください:`, choices: availableFiles, },
	]);
	return path.join(subdir, selectedFile);
}