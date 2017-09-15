'use strict';
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
				options.speechText = "Hello " + name + ". ";
				options.speechText += getWish();
				options.endSession = true;
				context.succeed(buildResponse(options));
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
				type: "PlainText",
				text: options.speechText
			},
			shouldEndSession: options.endSession
		}
	};
	if (options.repromptText) {
		response.response.repromt = {
			outputSpeech: {
				type: "PlainText",
				text: options.repromptText
			}
		}
	}
	return response;
}