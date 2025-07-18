// hardhat/commands/network_list_cli.ts
import chalk from 'chalk';
import 'dotenv/config'; // .envファイルを読み込む
import * as fs from 'fs';
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
		console.error(chalk.red("hardhat.config.ts の読み込みエラー:"), error);
		return [];
	}
}

async function listNetworks() {
	try {
		const availableNetworks = getNetworksFromConfig();
		const currentNetwork = process.env.DEFAULT_NETWORK || 'geth';

		console.log(chalk.yellow("🔗 利用可能なネットワーク:"));
		if (!availableNetworks.length) {
			console.log(chalk.gray("  (hardhat.config.ts にネットワークが見つかりません)"));
			return;
		}

		availableNetworks.forEach(network => {
			const isCurrent = network === currentNetwork;
			const displayName = isCurrent ? chalk.cyan.bold(network) : chalk.cyan(network);
			const tag = isCurrent ? chalk.green(' (current)') : '';
			console.log(`  - ${displayName}${tag}`);
		});

	} catch (error: any) {
		console.error(chalk.red(`\n🔴 ネットワーク一覧の表示中にエラーが発生しました: ${error.message}`));
		process.exit(1);
	}
}

listNetworks();