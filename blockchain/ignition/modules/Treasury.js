const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TreasuryModule", (m) => {
  const initialOwner = m.getAccount(0);

  const treasury = m.contract("Treasury", [initialOwner]);

  return { treasury };
});
