import { Request, Response } from 'express';
import { eError, tError, rError, sError, rfError } from "../handlers/throw";
import { Add, Clear, Remove, Update, Replace, Find } from "../DB/Util/methods";
import settings from '../handlers/settings';
const pdfjs = require('pdfjs-dist');
const chalk = require("chalk")
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const log = console.log;
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const config = {
  headers: {
    "x-api-key": process.env.PDF_API_KEY,
    "Content-Type": "application/json",
  },
};

const pdfs = [
  {
    title: "Strength Design and Verification Criteria for Glass, Ceramics, and Windows in Human Space Flight Applications",
    path: 'nasa-std-5018_revalidated.pdf',
    sourceID: 'src_8HPSVX7LnzmysW61cl41S'
  },
  {
    title: "NASA Software Safety Guidebook",
    path: 'nasa-gb-871913.pdf',
    sourceID: 'src_uD6F78PToH7qCzkafUPBA'
  },
  {
    title: "NASA DIGITAL ENGINEERING ACQUISITION FRAMEWORK HANDBOOK",
    path: '2020_04_01_nasa_hdbk_1004_approved.pdf',
    sourceID: 'src_zi4I0fcf4RkYgJM6AOEKr'
  },
];

function filterHyphens(strings) {
  // Filtrar y eliminar cadenas que solo contienen "-"
  const filteredStrings = strings.filter(str => !/^-+$/.test(str));

  // Eliminar rayitas rodeadas por espacios de cada cadena y luego eliminar elementos vacíos
  const cleanedStrings = filteredStrings.map(str => str.replace(/(^|\s+)-(\s+|$)/g, ' ').trim())
    .filter(str => str !== ''); // Eliminar elementos vacíos

  return cleanedStrings;
}

class apiController {

  public async conversation(req: Request, res: Response) {
    try {
      const input = req.body.input;
      if (!req.body || !req.body.input) {
        return res.status(400).json({ error: 'Bad Request', message: 'The request body is incorrect or incomplete.' });
      }

      log(chalk.blue("[AI]: API request completed successfully."));

      const completion1_ = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          "role": "user",
          "content": `Your mission: I will give you a list of PDFs, then a question, if the question is not found in the PDFs answer with "FALSE:ERROR_NOT_FOUND" but if it is found in the list of PDFs answer with "TRUE:PDF_EXAMPLE".
          Format Example: FALSE:ERROR_NOT_FOUND, TRUE:NASA DIGITAL ENGINEERING ACQUISITION FRAMEWORK HANDBOOK, TRUE:NASA Software Engineering Handbook
          List of PDFs: Strength Design and Verification Criteria for Glass, Ceramics, and Windows in Human Space Flight Applications | NASA Software Safety Guidebook | NASA DIGITAL ENGINEERING ACQUISITION FRAMEWORK HANDBOOK
          Please format them as follows:
          - Question1: [First User question here]
          - Answer1: [First answer here]
          - Question2: [Second User question here]
          - Answer2: [Second answer here]
          - Question3: [Third User question here]
          - Answer3: [Third answer here]
          The question: ${input}`
        }],
        temperature: 0,
        max_tokens: 1024,
      });

      const completion1 = completion1_?.["choices"]?.[0]?.["message"]?.["content"];
      if (!completion1) {
        console.error("No se pudo obtener la respuesta del modelo.");
        return;
      }

      const pairs = completion1.split(/(?:Question\d+:|Answer\d+:)/);
      const filteredPairs = filterHyphens(pairs);
      const cleanedPairs = filteredPairs.filter(pair => pair.trim() !== '');

      const questions = [];
      const answers = [];

      for (let i = 0; i < cleanedPairs.length; i += 2) {
        const question = cleanedPairs[i].trim();
        const answer = cleanedPairs[i + 1].trim().replace(/\n/g, "");
        questions.push(question);
        answers.push(answer);
      }

      var responseData = [];

      for (let i = 0; i < answers.length; i++) {
        const question = questions[i];
        let answer = answers[i];
        const completion1_split = answer?.split(":");
        const completion1_boolean = completion1_split[0].toLowerCase();
        const completion1_value = completion1_split[1].toLowerCase();

        if (completion1_boolean === "true") {
          const matchedPDF = pdfs.find(pdf => pdf.title.toLowerCase() === completion1_value);

          if (matchedPDF) {
            const pdfPath = path.join(__dirname, '..', '..', 'pdfs', matchedPDF.path);
            const sourceID = matchedPDF.sourceID;

            let references = [];

            const data = {
              referenceSources: true,
              sourceId: sourceID,
              messages: [
                {
                  role: "user",
                  content: question,
                },
              ],
            };

            const response = await axios.post("https://api.chatpdf.com/v1/chats/message", data, config);
            references = response.data.references;

            const pageNumbers = references.map(reference => reference.pageNumber);

            const data_pdf = new Uint8Array(fs.readFileSync(pdfPath));
            const pdfDocument = await pdfjs.getDocument(data_pdf).promise;

            let allText = "";

            for (const pageNumber of pageNumbers) {
              if (pageNumber < 1 || pageNumber > pdfDocument.numPages) {
                throw new Error(`Invalid page number: ${pageNumber}`);
              }

              const pdfPage = await pdfDocument.getPage(pageNumber);
              const pageTextContent = await pdfPage.getTextContent();
              const pageText = pageTextContent.items.map(item => item.str).join(' ');
              allText += pageText + '\n';
            }

            const completion3_ = await openai.chat.completions.create({
              model: "gpt-3.5-turbo-16k-0613",
              messages: [{
                "role": "user",
                "content": `ASTRAI is a highly intelligent and helpful voice assistant designed to assist astronauts in their space missions. ASTRAI should always maintain a helpful and informative tone, similar to Siri, and should never identify itself as 'ChatGPT.'
                PDF INFORMATION: ${allText}
                QUESTION: ${question}
                RESPONSE:
                - Technical Response: Provide a detailed technical response to the question, including any specific requirements, standards, or guidelines related to the topic.
                - Non-Technical Response: Offer a simplified, non-technical explanation of the topic for non-experts, such as astronauts or personnel who may not have specialized knowledge.
                - Recommendation: Suggest best practices or recommendations based on the technical response to guide decision-making.
                - Suggestion: Provide additional advice or suggestions that may be helpful in the context of space missions without going into technical details.`

              }],
              temperature: 0,
              max_tokens: 4096,
            });

            const completion3 = completion3_["choices"][0]["message"]["content"];
            responseData.push({ informationSource: "pdf", question: question, response: completion3 })

          } else {
            console.error(`PDF not found for title: ${completion1_value}`);
            res.status(500).send("Internal Server Error");
          }
        } else if (completion1_boolean === "false") {
          const completion2_ = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
              "role": "user",
              "content": `ASTRAI is a highly intelligent and helpful voice assistant designed to assist astronauts in their space missions. ASTRAI should always maintain a helpful and informative tone, similar to Siri, and should never identify itself as 'ChatGPT.'
              When an astronaut says 'Hello,' ASTRAI should respond with a warm greeting: "Hello! This is ASTRAI, your helpful space assistant."
              Please ensure that responses generated by ASTRAI are tailored to astronaut-specific needs, such as space-related questions, mission assistance, or space-related information. Keep in mind that astronauts may not always have technical expertise, so explanations should be clear and concise.
              Remember to maintain a positive and supportive tone in all responses and avoid excessive use of punctuation marks. ASTRAI should provide accurate and coherent information based on the astronaut's queries.
              The user input: ${question}`
            }],
            temperature: 0,
            max_tokens: 1024,
          });

          const completion2 = completion2_["choices"][0]["message"]["content"];
          responseData.push({ informationSource: "general", question: question, response: completion2 })
        } else {
          console.error("Invalid completion boolean value");
          res.status(500).send("Internal Server Error");
        }
      }

      res.status(200).json(responseData);

      log(chalk.blue("[AI]: API request completed successfully."));

    } catch (error) {
      console.error("An error occurred:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }


  public async account(req: Request, res: Response) {
    if (req.headers.authorization === undefined) return res.send("Invalid Account.")
    const authorizationData = req.headers.authorization.split(" ")
    const db = await Find("Account", [])
    const allData = db["all"]
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].authorization == authorizationData[1]) {
        res.json({ User: allData[i].login, Password: allData[i].password })
      }
    }
  }

  public async registerGet(req: Request, res: Response) {
    res.sendFile(path.join(__dirname, "../../views/index.html"));
  }

  public async registerPost(req: Request, res: Response) {
    const login: string = req.body.login;
    if (login === "" || login === undefined) return res.send("Register cancelled.")
    const loginCheck = await Find("Account", [login])
    if (!(loginCheck.one === null)) return res.send("This user already exist.")
    const password: string = req.body.password;
    if (password === "" || password === undefined) return res.send("Register cancelled.")
    const token = btoa(`${login}:${password}`);
    await Add("Account", false, [login, password, token]);
    res.send("Successful Registration.")
  }

}

export const apicontroller = new apiController();









