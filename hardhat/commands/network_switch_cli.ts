// hardhat/commands/network_switch_cli.ts
import chalk from 'chalk';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';

/**
 * hardhat.config.ts を読み込み、ブレースカウントで networks ブロックを正確に抽出する
 */
function getNetworksFromConfig(): string[] {
	const configPath = path.resolve(__dirname, '../hardhat.config.ts');
	try {
		const configContent = fs.readFileSync(configPath, 'utf8');

		const startIndexString = 'networks: {';
		const startIndex = configContent.indexOf(startIndexString);
		if (startIndex === -1) {
			return [];
		}

		const searchStart = startIndex + startIndexString.length;
		let braceCount = 1; // 最初の'{'をカウント済み
		let endIndex = -1;

		for (let i = searchStart; i < configContent.length; i++) {
			if (configContent[i] === '{') {
				braceCount++;
			} else if (configContent[i] === '}') {
				braceCount--;
				if (braceCount === 0) {
					endIndex = i;
					break;
				}
			}
		}

		if (endIndex === -1) {
			return [];
		}

		const networkBlockContent = configContent.substring(searchStart, endIndex);

		const networkKeys: string[] = [];
		const keyRegex = /^\s*(\w+):\s*{/gm; // 行頭から評価するように変更
		let match;
		while ((match = keyRegex.exec(networkBlockContent)) !== null) {
			networkKeys.push(match[1]);
		}
		return networkKeys;

	} catch (error) {
		return [];
	}
}

// .envファイルを更新または作成する関数
function updateEnvFile(network: string) {
	const envPath = path.resolve(__dirname, '../.env');
	let content = '';

	if (fs.existsSync(envPath)) {
		content = fs.readFileSync(envPath, 'utf8');
		if (content.match(/^DEFAULT_NETWORK=.*$/m)) {
			content = content.replace(/^DEFAULT_NETWORK=.*$/m, `DEFAULT_NETWORK=${network}`);
		} else {
			content = `${content.trim()}\nDEFAULT_NETWORK=${network}`;
		}
	} else {
		content = `DEFAULT_NETWORK=${network}`;
	}
	fs.writeFileSync(envPath, content.trim() + '\n');
}

async function switchNetwork(networkNameCLI?: string) {
	try {
		const availableNetworks = getNetworksFromConfig();

		if (!availableNetworks.length) {
			throw new Error("hardhat.config.ts にネットワークが見つかりません。");
		}

		let selectedNetwork: string;

		if (networkNameCLI) {
			if (!availableNetworks.includes(networkNameCLI)) {
				throw new Error(`ネットワーク '${networkNameCLI}' は hardhat.config.ts で定義されていません。`);
			}
			selectedNetwork = networkNameCLI;
		} else {
			const { selected } = await inquirer.prompt([
				{
					type: 'list',
					name: 'selected',
					message: 'デフォルトとして使用するネットワークを選択してください:',
					choices: availableNetworks,
				}
			]);
			selectedNetwork = selected;
		}

		updateEnvFile(selectedNetwork);

		console.log(chalk.green(`\n✅ デフォルトネットワークが ${chalk.bold.cyan(selectedNetwork)} に切り替わりました。`));
		console.log(chalk.yellow(`   今後の 'make pde' や 'make psc' はこのネットワークを使用します。`));

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 ネットワークの切り替え中にエラーが発生しました: ${error.message}`));
		process.exit(1);
	}
}

const networkArg = process.argv[2];
switchNetwork(networkArg);