import { connect } from "mongoose";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { eError, tError, rError, sError, rfError } from "../handlers/throw";
import settings from "../handlers/settings"
const uri = process.env.uridb!;
const log = console.log;

export default async () => {
    console.log("\n");

    log(chalk.green(`${settings.line}`));
    log(chalk.blue("[INFO]: Loading Mondodb...."));
    log(chalk.green(`${settings.line}`));

    try {
        await connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        log(chalk.green(`${settings.line}`));
        log(chalk.blue("[INFO]: Ready MongoDB ✅"));
        log(chalk.green(`${settings.line}`));
    } catch (e) {
        console.log(e);
    }

    console.log("\n");

    log(chalk.blue("[INFO]: Loading models...."));


    let modelsDir: any = [];

    function loadDirModels(dir: string = "./models/") {

        let last = dir.charAt(dir.length - 1);

        if (!(last == "/" || last == "\\")) {
            dir = dir + "/";
        }

        let folder;
        try { folder = fs.readdirSync(path.resolve(__dirname, dir)); } catch (e) { return tError("Models folder/files not found"); }

        for (let i = 0; i < folder.length; i++) {
            let file = folder[i];
            let fileread = fs.readdirSync(path.resolve(__dirname, dir + file))[0];
            modelsDir.push(dir + file + "/" + fileread);
        }
    }

    loadDirModels("./models/");

    (async function () {
        for (let i = 0; i < modelsDir.length; i++) {
            let Model = modelsDir[i];
            let modelName = Model.split("/")[2].split(".")[0];
            log(chalk.blue("[DB]: Listen to Model: ", modelName));
            let model = await require(Model);
            await model.watch().on("change", (data: any) => {
                let operationtype = data.operationType;
                if (operationtype === "insert") {
                    log(chalk.blue("[DB]: Data Added"));
                } else if (operationtype === "update") {
                    log(chalk.blue("[DB]: Data Updated"));
                } else if (operationtype === "delete") {
                    log(chalk.blue("[DB]: Data Deleted"));
                } else if (operationtype === "replace") {
                    log(chalk.blue("[DB]: Data Replaced"));
                } else if (operationtype === "invalidate") {
                    log(chalk.blue("[DB]: Data Invalidated"));
                }
            });
        }
    })();
};
