// commands/init.ts
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';

// (getSolidityVersion, toPascalCase, toCamelCase, getProjectNameFromUser は変更なし)
const projectRoot = path.resolve(__dirname, '../projects');
const templatesRoot = path.resolve(__dirname, './templates');

function getSolidityVersion(): string {
	try {
		const configPath = path.resolve(__dirname, '../../hardhat.config.ts');
		const configContent = fs.readFileSync(configPath, 'utf8');
		const match = configContent.match(/solidity:\s*\{\s*version:\s*"([^"]+)"/);
		if (match && match[1]) {
			console.log(`✅ Found Solidity version in hardhat.config.ts: ${match[1]}`);
			return match[1];
		}
		throw new Error("Version not found in regex match.");
	} catch (error) {
		console.warn("\n⚠️ Solidityバージョンを hardhat.config.ts から取得できませんでした。デフォルト値 '0.8.24' を使用します。");
		return "0.8.24";
	}
}
function toPascalCase(str: string): string {
	const spaced = str.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
	return spaced.split(' ').filter(word => !!word).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}
function toCamelCase(str: string): string {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
async function getProjectNameFromUser(): Promise<string> {
	const { projectName } = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: '作成するプロジェクト名を入力してください:',
			validate: (input: string) => {
				if (!input) return 'プロジェクト名は空にできません。';
				if (fs.existsSync(path.join(projectRoot, input))) return `エラー: プロジェクト '${input}' は既に存在します。`;
				return true;
			},
		},
	]);
	return projectName;
}

/**
 * テンプレート処理関数を修正
 */
function processTemplates(dir: string, projectName: string, solidityVersion: string) {
	const pascalCaseName = toPascalCase(projectName);
	const camelCaseName = toCamelCase(projectName);

	fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
		const fullPath = path.join(dir, dirent.name);
		if (dirent.isDirectory()) {
			processTemplates(fullPath, projectName, solidityVersion);
		} else if (dirent.isFile() && dirent.name.endsWith('.tpl')) {
			let newFileName = '';
			if (dirent.name === 'Contract.sol.tpl') {
				newFileName = `${pascalCaseName}.sol`;
			} else if (dirent.name === 'Module.ts.tpl') {
				newFileName = `${pascalCaseName}Module.ts`;
			} else if (dirent.name === 'Script.ts.tpl') {
				// 💡 ここを camelCase から PascalCase に変更
				newFileName = `${pascalCaseName}Script.ts`;
			}

			if (!newFileName) return;

			const newPath = path.join(dir, newFileName);
			fs.renameSync(fullPath, newPath);

			let content = fs.readFileSync(newPath, 'utf8');
			content = content
				.replace(/__PascalCaseName__/g, pascalCaseName)
				.replace(/__camelCaseName__/g, camelCaseName)
				.replace(/__ModulePath__/g, `../ignition/modules/${pascalCaseName}Module`)
				.replace(/__SolidityVersion__/g, solidityVersion);

			fs.writeFileSync(newPath, content, 'utf8');
		}
	});
}


async function createProject(projectNameFromArg?: string) {
	try {
		const solidityVersion = getSolidityVersion();
		let projectName: string;
		if (projectNameFromArg) {
			if (!projectNameFromArg) { console.error("エラー: プロジェクト名が指定されていません。"); process.exit(1); }
			if (fs.existsSync(path.join(projectRoot, projectNameFromArg))) { console.error(`エラー: プロジェクト '${projectNameFromArg}' は既に存在します。`); process.exit(1); }
			projectName = projectNameFromArg;
		} else {
			projectName = await getProjectNameFromUser();
		}
		console.log(`\n🚀 プロジェクト '${projectName}' を作成中...`);
		const projectPath = path.join(projectRoot, projectName);
		fs.mkdirSync(projectPath, { recursive: true });
		fs.cpSync(templatesRoot, projectPath, { recursive: true });
		processTemplates(projectPath, projectName, solidityVersion);
		console.log(`\n✅ プロジェクト '${projectName}' が正常に作成されました: ${projectPath}`);
		console.log("\n次のコマンドでデプロイやスクリプト実行が可能です:");
		console.log(`  make pde P="${projectName}"`);
		console.log(`  make psc P="${projectName}"`);
	} catch (error) {
		console.error(`\n🔴 プロジェクト作成中にエラーが発生しました: ${error}`);
		process.exit(1);
	}
}

const projectNameArg = process.argv[2];
createProject(projectNameArg);