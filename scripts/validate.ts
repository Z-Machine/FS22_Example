import * as path from "path";
import * as fs from "fs-extra";
import {XMLValidator} from "fast-xml-parser";
import * as utils from "./utils";

// Validate all the xml files in the assets folder.

(async () => {
  const label = "XML"
  console.time(label);
  
  const basePath = path.resolve(__dirname, "../");
  const assetsPath = path.join(basePath, "./assets/");

  let allValid = true;

  utils.allFilesInDirectory(assetsPath).filter(filepath => {
    return path.extname(filepath) === ".xml"; 
  }).forEach(async filepath => {
    try {
      console.timeLog(label, filepath);
      const content = await fs.promises.readFile(filepath, {
        "encoding": "utf-8"
      });
  
      const result = XMLValidator.validate(content);
      if (result !== true) {
        allValid = false;
        console.error(filepath);
        console.error(result.err);
      }
    }
    catch(err) {
      allValid = false;
      console.error(filepath);
      console.error(err);
    }
  });

  console.timeEnd(label);

  return allValid;
})()