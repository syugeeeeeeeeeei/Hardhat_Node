// hardhat/hardhat.config.ts
import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // dotenvをインポート
import "esbuild-register/dist/node";
import { HardhatUserConfig } from "hardhat/config";

// タスクファイルをインポート
import "./commands/tasks/compile";
import "./commands/tasks/deploy";
import "./commands/tasks/script";

// 環境変数からデプロイヤーのプライベートキーを取得。なければデフォルトのテストキーを使用。
// このキーはAnvil/Hardhatのデフォルトアカウントのものです。
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";


const config: HardhatUserConfig = {
  // .envのDEFAULT_NETWORKを優先し、なければgethをデフォルトにする
  defaultNetwork: process.env.DEFAULT_NETWORK || "geth",
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  paths: {
    sources: "./projects",
    tests: "./test",
    cache: "./dist/cache",
    artifacts: "./dist/artifacts",
    ignition: "./dist/ignition",
  },
  networks: {
    // Gethへの接続設定を追加
    geth: {
      url: "http://geth:8545", // docker-composeのサービス名を指定
      chainId: 1337, // genesis.jsonで指定したChain ID
      // accounts: [DEPLOYER_PRIVATE_KEY],
    },
    // Anvilへの接続設定を修正
    anvil: {
      url: "http://anvil:8545", // docker-compose.ymlのポート変更に合わせて修正
      chainId: 31337,
      accounts: [DEPLOYER_PRIVATE_KEY],
      timeout: 30 * 60 * 1000
    },
    // hardhat networkはローカルテスト用に常時存在
    hardhat: {},
  },
};

export default config;