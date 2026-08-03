const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const INITIAL_SUPPLY = 1_000_000_000n * 10n ** 18n; // 1 Billion AIX

module.exports = buildModule("AIXTokenModule", (m) => {
  const initialOwner = m.getAccount(0);
  const initialSupply = m.getParameter("initialSupply", INITIAL_SUPPLY);

  const aixToken = m.contract("AIXToken", [initialSupply, initialOwner]);

  return { aixToken };
});
