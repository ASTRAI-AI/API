import "dotenv/config";
import settings from "./handlers/settings"
import chalk from "chalk";
const log = console.log;

import db from "./DB/db";
(async () => {
  await db();
})()

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
app.set('port', process.env.PORT || 3000);
const api = require('./routes/api')
const routeIndex = require('./routes/index')
import { Add, Clear, Remove, Update, Replace, Find } from "./DB/Util/methods";
import { validateIP } from "./handlers/functions";


//Here we are configuring express to use body-parser as middle-ware.
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/*
//Here the Security
app.use(async (req, res, next) => {
  const checkIP = validateIP(req.ip)
  if (checkIP === true) if (req.url === `/api/${process.env.VERSION}/account/register`) return next();
  if (req.url === `/api/${process.env.VERSION}/account/register`) return next()
  const db = await Find("Account", [])
  const data = db["all"]
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password) {
    for (let i = 0; i < data.length; i++) {
      let lastPass = data.length - 1;
      if (login === data[i].login) {
        if (!(password === data[i].password)) return res.status(401).send('Invalid Password.');

        return next()
      }

      if (i == lastPass) {
        console.log(data[i])
        if (!(login === data[i].login)) return res.status(401).send('Invalid User.')

        if (!(password === data[i].password)) return res.status(401).send('Invalid Password.')
      }
    }
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message


});
*/

//both index.js and things.js should be in same directory
app.use(routeIndex);
app.use("/", api);

app.listen(app.get('port'), () => {
  log(chalk.green(`${settings.line}`));
  log(chalk.blue(`[INFO]: Server on port`, app.get('port')));
  log(chalk.green(`${settings.line}`));
});



// await Add("Test", true, ["data"]);

//await Clear('Test');

//await Remove('Test', ['data'])

//await Update('Test', ['data', ['data2'])

//await Replace('Test', ['data'], ['data3'])

//let result = await Find('Test', ['data'])
