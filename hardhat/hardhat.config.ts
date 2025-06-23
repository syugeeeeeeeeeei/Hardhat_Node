import "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
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
