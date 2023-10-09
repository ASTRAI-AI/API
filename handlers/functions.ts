import { eError, tError, rError, sError, rfError } from "./throw";
import { Add, Clear, Remove, Update, Replace, Find } from "../DB/Util/methods";
import axios from "axios";
import fs from "fs";
const log = console.log;


function wait(given: number) {
  //convert seconds to milliseconds
  const time = given * 1000;
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFiles(dir: string): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commands: any[] = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) getFiles(dir + "/" + file.name);
    else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      let commandFile = require(dir + "/" + file.name);
      if (commandFile.default) commandFile = commandFile.default;
      commands.push(commandFile);
    }
  }

  return commands;
}

function makeStr(str: unknown) {
  return new String(str);
}

function validateIP(ip: string) {
  var ips = process.env.ADMIN;
  var validate = "n";
  if (!ips) return eError("No Admin IP found");
  if (ips.includes(",")) ips.split(",").forEach(function (x) { if (x === ip) validate = "y"; });
  if (validate === "n") return false;
  if (validate === "y") return true;
}

export { wait, getFiles, makeStr, validateIP };
