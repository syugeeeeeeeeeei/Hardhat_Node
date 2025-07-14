// commands/cli_utils.ts
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';

// プロジェクトのルートディレクトリ
const projectsDir = path.resolve(__dirname, '../projects');

/**
 * 指定されたプロジェクト名またはインタラクティブにプロジェクトを選択
 * @param projectNameCLI コマンドラインで指定されたプロジェクト名
 * @returns 選択されたプロジェクト名
 */
export async function getProjectName(projectNameCLI?: string): Promise<string> {
	const availableProjects = fs.readdirSync(projectsDir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	if (!availableProjects.length) {
		throw new Error("プロジェクトが見つかりません。まず 'make init NAME=<project-name>' でプロジェクトを作成してください。");
	}

	if (projectNameCLI) {
		if (!availableProjects.includes(projectNameCLI)) {
			throw new Error(`プロジェクト '${projectNameCLI}' は見つかりませんでした。`);
		}
		return projectNameCLI;
	} else {
		const answers = await inquirer.prompt([
			{
				type: 'list',
				name: 'projectName',
				message: '実行するプロジェクトを選択してください:',
				choices: availableProjects,
			},
		]);
		return answers.projectName;
	}
}

/**
 * 指定されたプロジェクト内のファイルを選択
 * @param projectPath プロジェクトのフルパス
 * @param subdir 検索するサブディレクトリ名 (e.g., 'ignition/modules', 'scripts')
 * @param fileTypeLabel 選択UIに表示するファイルの種類 (e.g., 'Ignitionモジュール', 'スクリプト')
 * @param fileExt 検索するファイルの拡張子 (e.g., '.ts')
 * @param filePathCLI コマンドラインで指定されたファイルパス (プロジェクトルートからの相対パス)
 * @returns 選択されたファイルの相対パス
 */
export async function selectFileInProject(
	projectPath: string,
	subdir: string,
	fileTypeLabel: string,
	fileExt: string,
	filePathCLI?: string
): Promise<string> {
	const targetDir = path.join(projectPath, subdir);

	if (!fs.existsSync(targetDir)) {
		throw new Error(`ディレクトリが見つかりません: ${targetDir}`);
	}

	const availableFiles = fs.readdirSync(targetDir, { withFileTypes: true })
		.filter(dirent => dirent.isFile() && dirent.name.endsWith(fileExt))
		.map(dirent => dirent.name);

	if (!availableFiles.length) {
		throw new Error(`プロジェクト '${path.basename(projectPath)}' の ${subdir} ディレクトリに ${fileTypeLabel} が見つかりませんでした。`);
	}

	if (filePathCLI) {
		const fileBaseName = path.basename(filePathCLI);
		if (!availableFiles.includes(fileBaseName)) {
			throw new Error(`指定された ${fileTypeLabel} '${filePathCLI}' は '${targetDir}' 内に見つかりませんでした。`);
		}
		// 引数がフルパスでもファイル名でも対応できるようにbasenameを結合して返す
		return path.join(subdir, fileBaseName);
	}

	if (availableFiles.length === 1) {
		console.log(`💡 ${fileTypeLabel} が1つのみのため、自動選択しました: ${availableFiles[0]}`);
		return path.join(subdir, availableFiles[0]);
	}

	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'selectedFile',
			message: `実行する ${fileTypeLabel} を選択してください:`,
			choices: availableFiles,
		},
	]);
	return path.join(subdir, answers.selectedFile);
}