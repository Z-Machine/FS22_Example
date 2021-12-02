import { execSync } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as xml from "fast-xml-parser";
import * as admZip from "adm-zip";
const luamin: {
  version: string;
  minify: (luaCode: string) => string;
} = require("luamin");

const basePath = path.resolve(__dirname, "../");
const distPath = path.join(basePath, "dist/");
const luaPath = path.join(distPath, "lua/");
const configPath = path.join(basePath, "./config.json");

const assetsPath = path.join(basePath, "./assets/");
const modDescPath = path.join(assetsPath, "./modDesc.xml");

interface IProjectConfig {
  "buildArchive": boolean,
  "minifyScripts": boolean,

  "fsUserDir": string,
  "log": string,

  "fsModDir": string,
  "modName": string,

  "fsGameDir": string,
  "fsGameBin": string,

  "launchOptions": Array<string>
}

export function fetchProjectConfig() {
  if (fs.existsSync(configPath) === false)
    throw `config.json missing`;

  return require(configPath) as IProjectConfig;
}

export function allFilesInDirectory(dirPath: string, currFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      currFiles = allFilesInDirectory(filePath, currFiles);
    } else {
      currFiles.push(filePath);
    }
  });

  return currFiles;
}

export function installMod(config: IProjectConfig): boolean {
  if (!config.fsModDir) {
    console.error(`Could not find key "fsModDir" in config.json`);
    return false;
  }

  fs.ensureDirSync(config.fsModDir);

  if (!config.buildArchive) {
    const outPath = path.join(config.fsModDir, config.modName);
    fs.emptyDirSync(outPath);
    fs.copySync(assetsPath, outPath);
    fs.copySync(luaPath, outPath);
  } else {
    const zipName = `${config.modName}.zip`;
    const zipPath = path.join(distPath, zipName);
    const outPath = path.join(config.fsModDir, zipName);
    fs.copySync(zipPath, outPath);
  }

  return true;
}

export function bundleMod(config: IProjectConfig): boolean {
  if (!config.fsModDir) {
    console.error(`Could not find key "fsModDir" in config.json`);
    return false;
  }

  fs.ensureDir(assetsPath);
  if (!fs.existsSync(modDescPath)) {
    console.error(`Could not find "modDesc.xml" in assets folder.`);
    return false;
  } else {
    const parser = new xml.XMLParser();
    try {
      const content = fs.readFileSync(modDescPath, {
        encoding: "utf-8"
      });
      parser.parse(content);
    }
    catch (err) {
      console.error(err);
    }
  }

  // Clean the dist folder
  fs.emptyDirSync(distPath);

  // Transpile
  console.info("Transpiling TypeScript to Lua...");
  execSync('tstl -p tsconfig.json', { stdio: 'inherit' });

  // Get all the lua files
  const luaFiles = allFilesInDirectory(luaPath).filter(filePath => {
    return path.extname(filePath) === ".lua";
  });

  if (config.minifyScripts) {
    console.info("Minifiying scripts...");

    let rawSize = 0;
    let finalSize = 0;

    luaFiles.forEach(filePath => {
      try {
        rawSize += fs.statSync(filePath).size;
        let contents = fs.readFileSync(filePath, {
          encoding: "utf-8"
        });
        
        contents = luamin.minify(contents.toString());
  
        fs.writeFileSync(filePath, contents);
        finalSize += fs.statSync(filePath).size;
      }
      catch(err) {
        console.error(err);
        return false;
      }
    });

    console.info(`Saved: ${rawSize-finalSize} bytes`);
  }

  if (config.buildArchive) {
    console.info("Building archive...");
    const zipName = `${config.modName}.zip`;
    const zipPath = path.join(distPath, zipName);

    fs.removeSync(zipPath);

    try {
      const zip = new admZip();
      zip.addLocalFolder(luaPath);
      zip.addLocalFolder(assetsPath);
      zip.addZipComment(`Built with TypeScript`);
      zip.writeZip(zipPath);
    }
    catch (err) {
      console.error(err);
    }
  }

  return true;
}