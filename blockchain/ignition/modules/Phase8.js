const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase6Module = require("./Phase6");
const ModelRegistryModule = require("./ModelRegistry");

module.exports = buildModule("Phase8Module", (m) => {
  const { aixToken, treasury, datasetRegistry, licenseRegistry, purchaseEngine } = m.useModule(Phase6Module);
  const { modelRegistry } = m.useModule(ModelRegistryModule);

  return { aixToken, treasury, datasetRegistry, licenseRegistry, purchaseEngine, modelRegistry };
});
