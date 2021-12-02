import { fork, spawn } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as utils from "./utils";

function escape(s: string): string {
  return s.replace(/[\\$'"]/g, "\\$&");
}

(async () => {
  const projectConfig = utils.fetchProjectConfig();

  if (projectConfig.fsGameDir === undefined) {
    console.error(`"fsGameDir" is missing from config.json`)
    return;
  }

  if (projectConfig.fsGameBin === undefined) {
    console.error(`"fsGameBin" is missing from config.json`)
    return;
  }

  if (projectConfig.launchOptions === undefined) {
    projectConfig.launchOptions = new Array<string>();
  }

  const baseDir = path.resolve(__dirname, "..");
  const gamePath = path.resolve(projectConfig.fsGameDir, projectConfig.fsGameBin);
  const gameParams = projectConfig.launchOptions.join(" ");

  console.log("Launching game...");
  const game = spawn(
    `Start '${escape(gamePath)}' -ArgumentList '${escape(gameParams)}' -Verb RunAs`,
    {
      "shell": "powershell.exe",
    }
  );

  game.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  game.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  })

  game.on('close', (code) => {
    console.log(`Game exited with code: ${code}`);
  });
})();