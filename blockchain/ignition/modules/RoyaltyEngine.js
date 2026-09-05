const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const AIXTokenModule = require("./AIXToken");
const TreasuryModule = require("./Treasury");
const PurchaseEngineModule = require("./PurchaseEngine");

module.exports = buildModule("RoyaltyEngineModule", (m) => {
  const { aixToken } = m.useModule(AIXTokenModule);
  const { treasury } = m.useModule(TreasuryModule);
  const { purchaseEngine } = m.useModule(PurchaseEngineModule);

  const initialTreasuryFeeBps = m.getParameter("initialTreasuryFeeBps", 250); // 2.50%
  const initialOwner = m.getAccount(0);

  const royaltyEngine = m.contract("RoyaltyEngine", [
    aixToken,
    treasury,
    purchaseEngine,
    initialTreasuryFeeBps,
    initialOwner,
  ]);

  return { royaltyEngine };
});
