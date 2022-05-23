const msRest = require("@azure/ms-rest-js");
const LUIS_Prediction = require("@azure/cognitiveservices-luis-runtime");
const { LUIS } = require("./config.js");

const predictionEndpoint = `https://${LUIS.predictionResourceName}.cognitiveservices.azure.com/`;


const luisAuthoringCredentials = new msRest.ApiKeyCredentials({
    inHeader: { "Ocp-Apim-Subscription-Key": LUIS.authoringKey }
});

const luisPredictionClient = new LUIS_Prediction.LUISRuntimeClient(
    luisAuthoringCredentials,
    predictionEndpoint
);


exports.languageUnderStanding = async (query/*: string*/) => {

    const request = { query: query };
    const response = await luisPredictionClient.prediction.getSlotPrediction(LUIS.appId, "Production", request);
    // console.log(JSON.stringify(response.prediction, null, 4));
    return response

}