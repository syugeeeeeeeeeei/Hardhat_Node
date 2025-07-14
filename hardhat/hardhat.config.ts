import "@nomicfoundation/hardhat-ethers";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version : "0.8.20",
    settings:{
      optimizer:{
        enabled: true,
      }
    }
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
