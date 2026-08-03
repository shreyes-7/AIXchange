const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const AIXTokenModule = require("./AIXToken");
const TreasuryModule = require("./Treasury");

module.exports = buildModule("Phase3Module", (m) => {
  const { aixToken } = m.useModule(AIXTokenModule);
  const { treasury } = m.useModule(TreasuryModule);

  return { aixToken, treasury };
});
