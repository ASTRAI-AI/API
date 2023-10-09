/* eslint-disable @typescript-eslint/no-explicit-any */
import { getModel } from "./util";
import { makeStr } from "../../handlers/functions";
import { eError, tError, rError, sError, rfError } from "../../handlers/throw";
export { Add, Clear, Remove, Update, Replace, Find };

async function Add(model: string, required: boolean, data: any[]) {
  if (typeof model !== "string") return tError("Model must be a string");
  if (typeof required !== "boolean")
    return tError(`Required must be a boolean`);
  if (!Array.isArray(data)) return tError("Data must be an array");

  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");
  const _model = gettingModel.model;

  const _interfaceData = gettingModel.interfaceData;

  const _data: Record<string, any> = {};

  for (let i = 0; i < data.length; i++) {
    _data[_interfaceData[i]] = data[i];
  }

  const detect = await _model.findOne(_data);
  if (detect) {
    if (!required) return tError("Data already exist");

    const dataUpdating = detect[`_id`];

    try {
      await _model.findByIdAndRemove(dataUpdating);
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }

    let saving;
    try {
      saving = new _model(_data);
      await saving.save();
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }
    return saving;
  } else {
    let saving;
    try {
      saving = new _model(_data);
      await saving.save();
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }
    return saving;
  }
}

async function Remove(model: string, data: any[]) {
  if (typeof model !== "string") return tError("Model must be a string");
  if (!Array.isArray(data)) return tError("Data must be an array");

  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");

  const _model = gettingModel.model;

  const _interfaceData = gettingModel.interfaceData;

  //make a loop to save array strings to a object
  const _data: any = {};

  for (let i = 0; i < data.length; i++) {
    _data[_interfaceData[i]] = data[i];
  }

  const detect = await _model.findOne(_data);

  if (!detect) {
    return tError("Data already not exist");
  } else {
    const deleting = detect[`_id`];
    try {
      await _model.findByIdAndRemove(deleting);
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }
    return deleting;
  }
}

async function Update(model: string, data: any[], dataNew: any[]) {
  if (typeof model !== "string") return tError("Model must be a string");
  if (!Array.isArray(data)) return tError("Data must be an array");
  if (!Array.isArray(dataNew)) return tError("DataNew must be an array");

  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");

  const _model = gettingModel.model;

  const _interfaceData = gettingModel.interfaceData;

  const _data: Record<string, any> = {};

  for (let i = 0; i < data.length; i++) {
    _data[_interfaceData[i]] = data[i];
  }

  const detectToChange = await _model.findOne(_data);

  const _dataNew: Record<string, any> = {};

  for (let i = 0; i < data.length; i++) {
    _dataNew[_interfaceData[i]] = dataNew[i];
  }

  const detect = await _model.findOne(_dataNew);

  if (detect) {
    return tError("Data already exist");
  } else {
    let updating;
    try {
      const dataUpdating = detectToChange[`_id`];

      await _model.findByIdAndUpdate(dataUpdating, _dataNew);
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }
    return updating;
  }
}

async function Clear(model: string) {
  if (typeof model !== "string") return tError("Model must be a string");
  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");
  const _model = gettingModel.model;

  let deletemany;

  try {
    deletemany = await _model.deleteMany({});
  } catch (e) {
    const error = makeStr(e);
    return tError(`${error}`);
  }

  const total_cleared = deletemany["n"];
  return total_cleared;
}

async function Replace(model: string, data: any[], dataNew: any[]) {
  if (typeof model !== "string") return tError("Model must be a string");
  if (!Array.isArray(data)) return tError("Data must be an array");
  if (!Array.isArray(dataNew)) return tError("DataNew must be an array");

  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");
  const _model = gettingModel.model;

  const _interfaceData = gettingModel.interfaceData;

  //make a loop to save array strings to a object
  const _data: Record<string, any> = {};

  for (let i = 0; i < data.length; i++) {
    _data[_interfaceData[i]] = data[i];
  }

  const detectToChange = await _model.findOne(_data);

  const _dataNew: Record<string, any> = {};

  for (let i = 0; i < data.length; i++) {
    _dataNew[_interfaceData[i]] = dataNew[i];
  }

  const detect = await _model.findOne(_dataNew);

  if (detect) {
    return tError("Data already exist");
  } else {
    let updating;
    try {
      const dataUpdating = detectToChange[`_id`];

      await _model.findOneAndReplace({ _id: dataUpdating }, _dataNew);
    } catch (e) {
      const error = makeStr(e);
      return tError(`${error}`);
    }
    return updating;
  }
}

async function Find(model: string, data: any[]): Promise<any> {
  if (typeof model !== "string") return tError("Model must be a string");
  if (!Array.isArray(data)) return tError("Data must be an array");

  let resultone, resultall;

  const gettingModel = await getModel(model);
  if (!gettingModel) return tError("Model not found");
  const _model = gettingModel.model;

  const _interfaceData = gettingModel.interfaceData;

  //make a loop to save array strings to a object
  const _data: any = {};

  for (let i = 0; i < data.length; i++) {
    _data[_interfaceData[i]] = data[i];
  }

  const detectOne = await _model.findOne(_data);

  if (detectOne === null || typeof detectOne == "undefined") {
    resultone = null;
  } else {
    resultone = detectOne;
  }

  const detectAll = await _model.find(_data);

  if (
    detectAll === null ||
    typeof detectAll == "undefined" ||
    detectAll.length === 0
  ) {
    resultall = null;
  } else {
    resultall = detectAll;
  }
  
  const obj = {
    one: resultone,
    all: resultall,
  };

  return obj;
}
