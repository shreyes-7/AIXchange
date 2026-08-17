const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DatasetRegistryModule", (m) => {
  const datasetRegistry = m.contract("DatasetRegistry", []);

  return { datasetRegistry };
});
