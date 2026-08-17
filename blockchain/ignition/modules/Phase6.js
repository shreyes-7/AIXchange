const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase5Module = require("./Phase5");
const PurchaseEngineModule = require("./PurchaseEngine");

module.exports = buildModule("Phase6Module", (m) => {
  const { aixToken, treasury, datasetRegistry, licenseRegistry } = m.useModule(Phase5Module);
  const { purchaseEngine } = m.useModule(PurchaseEngineModule);

  return { aixToken, treasury, datasetRegistry, licenseRegistry, purchaseEngine };
});
