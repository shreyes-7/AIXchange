const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase9Module = require("./Phase9");
const RoyaltyEngineModule = require("./RoyaltyEngine");

module.exports = buildModule("Phase10Module", (m) => {
  const {
    aixToken,
    treasury,
    datasetRegistry,
    licenseRegistry,
    purchaseEngine,
    modelRegistry,
    provenanceRegistry,
  } = m.useModule(Phase9Module);

  const { royaltyEngine } = m.useModule(RoyaltyEngineModule);

  return {
    aixToken,
    treasury,
    datasetRegistry,
    licenseRegistry,
    purchaseEngine,
    modelRegistry,
    provenanceRegistry,
    royaltyEngine,
  };
});
