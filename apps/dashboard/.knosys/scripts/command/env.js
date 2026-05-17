const path = require('path');
const semver = require('semver');
const { resolveRootPath, readData } = require('../helper');

const rootPath = resolveRootPath();

function checkNodeVersion(packageJson) {
  const requiredNodeVersion = packageJson?.engines?.node;
  const currentNodeVersion = process.version;

  if (!requiredNodeVersion) {
    console.error('No engines.node configuration found in package.json');
    process.exit(1);
  }

  if (!semver.satisfies(currentNodeVersion, requiredNodeVersion)) {
    console.error(`\nCurrent Node.js version ${currentNodeVersion} does not meet requirements!`);
    console.error(`Please use Node.js version ${requiredNodeVersion}\n`);
    process.exit(1);
  }
}

function checkCodeValidators(packageJson) {
  const detectionList = ['eslint', 'husky', 'lint-staged'];
  const { dependencies, devDependencies } = packageJson;
  const allDeps = { ...dependencies, ...devDependencies };

  const packagesToCheck = Object.entries(allDeps).reduce((acc, [pkg, versionSpec]) => {
    if (detectionList.some(item => pkg.includes(item))) {
      acc[pkg] = versionSpec;
    }
    return acc;
  }, {});

  let allPassed = true;

  Object.entries(packagesToCheck).forEach(([pkg, expectedVersion]) => {
    const pkgJsonPath = path.join(rootPath, 'node_modules', pkg, 'package.json');

    let installedVersion;

    try {
      const pkgJson = readData(pkgJsonPath);
      installedVersion = pkgJson.version;
    } catch (error) {
      console.error(`Package ${pkg} is not installed.`);
      allPassed = false;
      return;
    }

    if (!semver.satisfies(installedVersion, expectedVersion)) {
      console.error(
        `Package ${pkg} version ${installedVersion} does not meet the expected version ${expectedVersion}.`,
      );
      allPassed = false;
    }
  });

  if (!allPassed) {
    process.exit(1);
  }
}

module.exports = {
  execute: () => {
    const packageJson = readData(path.join(rootPath, 'package.json'));

    checkNodeVersion(packageJson);
    checkCodeValidators(packageJson);
  },
};
