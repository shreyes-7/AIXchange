const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase8Module = require("./Phase8");
const ProvenanceRegistryModule = require("./ProvenanceRegistry");

module.exports = buildModule("Phase9Module", (m) => {
  const { aixToken, treasury, datasetRegistry, licenseRegistry, purchaseEngine, modelRegistry } =
    m.useModule(Phase8Module);
  const { provenanceRegistry } = m.useModule(ProvenanceRegistryModule);

  return {
    aixToken,
    treasury,
    datasetRegistry,
    licenseRegistry,
    purchaseEngine,
    modelRegistry,
    provenanceRegistry,
  };
});
