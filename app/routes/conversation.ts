import { LoaderFunction, type ActionFunction } from "@remix-run/node";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {ResponseInput} from "openai/resources/responses/responses";

interface Message {
  origin: string,
  content: string
}
interface ConversationRequest {
  messages: Message[],
  userCode: string,
  questionDescription: string
}

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const INTRODUCTION_PROMPT = "You are an interviewer that is given a question and a user's code. You will then provide a helpful brief introduction to the user. Begin by asking the user if they would like your help introducing the question or if they would like to read through it themselves. If the user asks clarifying quesions, please respond addressing their concerns without giving up extra information. Be helpful, kind, and welcoming. Please do not give the answer to the question to the user. ";

export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json() as ConversationRequest;
    console.log(body);
    if (!body.messages) {
      return Response.json(
        { response: "", error: "Messages are required" },
        { status: 400 }
      );
    }
    // TODO: Add your conversation logic here
    const currentMessages = body.messages;
    currentMessages.unshift({"origin": "system", "content": INTRODUCTION_PROMPT + " You are given the following question description " + body.questionDescription + " You are given the following code: " + body.userCode});
    const messages = body.messages.map((message: Message) => ({"role": message.origin, "content": message.content})) as ResponseInput
    console.log(messages);
    const completion = await openai.responses.create({
      model: "gpt-4o-mini",
      store: true,
      input: messages,
    });

    console.log(completion);

    const response = completion.output_text ?? "";

    return Response.json({ response });
  } catch (error) {
    console.error("Error processing conversation:", error);
    return Response.json(
      { response: "", error: "Internal server error" },
      { status: 500 }
    );
  }
}; 