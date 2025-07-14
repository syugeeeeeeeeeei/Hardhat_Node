import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
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
    sources: "./projects/**/contracts", // projects以下の全てのcontractsディレクトリを対象
    tests: "./test",
    cache: "./dist/cache",
    artifacts: "./dist/artifacts",
  },

  networks: {
    // "anvil" という名前でネットワーク設定を追加
    anvil: {
      // localhostではなく、docker-composeのサービス名 "anvil" を指定
      url: "http://anvil:8545",
      // Chain IDはAnvilのデフォルトである31337
      chainId: 31337,
    },
  },
};

export default config;