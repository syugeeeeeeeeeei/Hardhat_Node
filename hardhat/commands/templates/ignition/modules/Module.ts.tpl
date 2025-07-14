import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// __PascalCaseName__ は init.ts で置換されます
const __PascalCaseName__Module = buildModule("__PascalCaseName__Module", (m) => {
  // デプロイ時に渡すパラメータを定義できます
  const initialGreeting = m.getParameter("initialGreeting", "Hello, __PascalCaseName__!");

  // __camelCaseName__ は init.ts で置換されます
  const __camelCaseName__ = m.contract("__PascalCaseName__", [initialGreeting]);

  return { __camelCaseName__ };
});

export default __PascalCaseName__Module;