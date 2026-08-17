const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const Phase4Module = require("./Phase4");
const LicenseRegistryModule = require("./LicenseRegistry");

module.exports = buildModule("Phase5Module", (m) => {
  const { aixToken, treasury, datasetRegistry } = m.useModule(Phase4Module);
  const { licenseRegistry } = m.useModule(LicenseRegistryModule);

  return { aixToken, treasury, datasetRegistry, licenseRegistry };
});
