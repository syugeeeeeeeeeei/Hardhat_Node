import hre from "hardhat";
// __ModulePath__ は init.ts で置換されます
import __PascalCaseName__Module from "__ModulePath__";

async function main() {
  console.log(`🚀 Running script for __PascalCaseName__...`);

  // 1. Ignitionモジュールを使ってコントラクトをデプロイします
  // __camelCaseName__ は init.ts で置換されます
  const { __camelCaseName__ } = await hre.ignition.deploy(__PascalCaseName__Module);
  const address = await __camelCaseName__.getAddress();
  console.log(`✅ Contract __PascalCaseName__ deployed to: ${address}`);

  // 2. デプロイしたコントラクトを操作します
  const currentGreeting = await __camelCaseName__.greet();
  console.log(`💬 Current greeting: "${currentGreeting}"`);

  const newGreeting = "Hello from script!";
  console.log(`🖋️ Setting new greeting to: "${newGreeting}"`);
  const tx = await __camelCaseName__.setGreeting(newGreeting);
  await tx.wait(); // トランザクションが承認されるのを待つ

  const updatedGreeting = await __camelCaseName__.greet();
  console.log(`💬 Updated greeting: "${updatedGreeting}"`);
  console.log("\n✨ Script finished successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});