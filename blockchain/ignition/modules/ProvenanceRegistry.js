const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const DatasetRegistryModule = require("./DatasetRegistry");
const ModelRegistryModule = require("./ModelRegistry");

module.exports = buildModule("ProvenanceRegistryModule", (m) => {
  const { datasetRegistry } = m.useModule(DatasetRegistryModule);
  const { modelRegistry } = m.useModule(ModelRegistryModule);

  const provenanceRegistry = m.contract("ProvenanceRegistry", [
    datasetRegistry,
    modelRegistry,
  ]);

  return { provenanceRegistry };
});
