import { execSync } from "child_process";
import * as utils from "./utils";

(function () {
  const args: Set<string> = new Set();
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    console.log(`${i}: ${arg}`);
    args.add(arg);
  }

  const projectConfig = utils.fetchProjectConfig();

  if (args.has("-minify"))
    projectConfig.minifyScripts = true;

  if (args.has("-archive"))
    projectConfig.buildArchive = true;

  console.info('Bundling mod...')
  const modBundled = utils.bundleMod(projectConfig);
  if (!modBundled) {
    console.error(`Failed to bundle mod.`);
    return;
  }

  console.info('Installing mod...')
  const modInstalled = utils.installMod(projectConfig);
  if (!modInstalled) {
    console.error(`Failed to install mod.`)
    return;
  }
})();