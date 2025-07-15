import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import 'esbuild-register/dist/node';
import { HardhatUserConfig } from "hardhat/config";

// タスクファイルをインポート
import "./commands/tasks/compile";
import "./commands/tasks/deploy";
import "./commands/tasks/script";

const config: HardhatUserConfig = {
  defaultNetwork: "anvil",
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
    anvil: {
      url: "http://anvil:8545",
      chainId: 31337,
    },
  },
};

export default config;