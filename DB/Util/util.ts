import fs from "fs";
import path from "path";
import { eError, tError, rError, sError, rfError } from "../../handlers/throw";
export { getModel };

async function getModel(model: string) {
    if (typeof model !== "string") return tError("The model must be string.");

    const folder = fs.readdirSync(path.join(__dirname, "../models"));

    let modelsDir: any = [];

    for (const file of folder) {
        let fileread = fs.readdirSync(path.join(__dirname, "../models/" + file))[0];
        modelsDir.push("../models/" + file + "/" + fileread);
    }

    for (let i = 0; i < modelsDir.length; i++) {
        let Model = `${modelsDir[i]}`;
        let modelName = Model.split("/")[2].split(".")[0];
        if (modelName === model) {
            let model = await require(`${Model}`);
            let interfaceName = `I${modelName}`;
            let interfaceModel = await require(`../Builders/Interfaces/${interfaceName}`);
            let interfaceDataDir = await require(`../Builders/Data/${modelName}`).default;
            let interfaceDataModel = interfaceDataDir.interfaceData;
            let obj = {
                model: model,
                interface: interfaceModel,
                interfaceData: interfaceDataModel,
            };
            return obj;
        }
    }
}
