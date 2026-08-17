const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase3Module = require("./Phase3");
const DatasetRegistryModule = require("./DatasetRegistry");

module.exports = buildModule("Phase4Module", (m) => {
  const { aixToken, treasury } = m.useModule(Phase3Module);
  const { datasetRegistry } = m.useModule(DatasetRegistryModule);

  return { aixToken, treasury, datasetRegistry };
});
