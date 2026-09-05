const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ModelRegistryModule", (m) => {
  const modelRegistry = m.contract("ModelRegistry", []);

  return { modelRegistry };
});
