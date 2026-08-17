const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase5Module = require("./Phase5");

module.exports = buildModule("PurchaseEngineModule", (m) => {
  const { aixToken, treasury, datasetRegistry, licenseRegistry } = m.useModule(Phase5Module);

  const initialFeeBps = m.getParameter("initialFeeBps", 250); // 2.50%
  const initialOwner = m.getAccount(0);

  const purchaseEngine = m.contract("PurchaseEngine", [
    aixToken,
    datasetRegistry,
    licenseRegistry,
    treasury,
    initialFeeBps,
    initialOwner,
  ]);

  return { purchaseEngine };
});
