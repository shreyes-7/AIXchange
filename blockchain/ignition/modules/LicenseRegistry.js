const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const DatasetRegistryModule = require("./DatasetRegistry");

module.exports = buildModule("LicenseRegistryModule", (m) => {
  const { datasetRegistry } = m.useModule(DatasetRegistryModule);

  const licenseRegistry = m.contract("LicenseRegistry", [datasetRegistry]);

  return { licenseRegistry };
});
