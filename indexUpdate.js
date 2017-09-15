'use strict';
var http = require('http');

exports.handler = function (event, context) {
    try {
        var request = event.request;

        //request
        /*
        3 types of requests
        i)   LaunchRequest       Ex: "Open greeter"
        ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
        iii) SessionEndedRequest Ex: "exit" or error or timeout
        */

        if (request.type === "LaunchRequest") {
            let options = {};
            options.speechText = "Welcome to Greegins skill. Using our skill u can greet your guests. Whom you want to greet?";
            options.repromptText = "you can say for example, say hello to John.";
            options.endSession = false;
            context.succeed(buildResponse(options));
        } else if (request.type === "IntentRequest") {
            let options = {};
            if (request.intent.name === "HelloIntent") {
                let name = request.intent.slots.FirstName.value;
                options.speechText = `Hello <say-as interpret-as="spell-out">${name}</say-as> ${name}. `;
                options.speechText += getWish();
                getQuete(function (quete, err) {
                    if (err) {
                        context.fail(err);
                    } else {
                        options.speechText += quete;
                        options.endSession = true;
                        context.succeed(buildResponse(options));
                    }
                });
            } else {
                context.fail("unknow intent");
            }
        } else if (request.type === "SessionEndedRequest") {
            context.fail("Unknown intent type");
        }
    } catch (e) {
        context.fail("expection: " + e);
    }
}

function getQuete(callback) {
    var url = "http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json#";
    var req = http.get(url, function (res) {
        var body = "";

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            body = body.replace(/\\/g, '');
            var quote = JSON.parse(body);
            callback(quote.quoteText);
        });

    });

    req.on('error', function (err) {
        callback('', err);
    });

}

function getWish() {

    var myDate = new Date();
    var hours = myDate.getUTCHours() - 8;
    if (hours < 0) {
        hours = hours + 24;
    }
    if (hours < 12) {
        return "Good Morning. ";
    } else if (hours < 18) {
        return "Good Afternoon. ";
    } else {
        return "Good Evening. ";
    }
}

function buildResponse(options) {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + options.speechText + "</speak>"
            },
            shouldEndSession: options.endSession
        }
    };
    if (options.repromptText) {
        response.response.repromt = {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + options.repromptText + "</speak>"
            }
        }
    }
    return response;
}
