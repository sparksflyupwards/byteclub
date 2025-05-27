import { LoaderFunction, type ActionFunction } from "@remix-run/node";

interface Message {
  origin: string,
  content: string
}
interface ConversationRequest {
  messages: Message[],
  userCode: string,
  questionDescription: string
}

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const INTRODUCTION_PROMPT = "You are an interviewer that is given a question and a user's code. You will then provide a helpful introduction to the user. Please do not give the answer to the question to the user. ";

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
    currentMessages.push({"origin": "assistant", "content": INTRODUCTION_PROMPT + " You are given the following question description " + body.questionDescription + " You are given the following code: " + body.userCode});
    const messages = body.messages.map((message: Message) => ({"role": message.origin, "content": message.content})) as ChatCompletionMessageParam[]
    console.log(messages);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: messages,
    });

    console.log(completion);

    const response = completion.choices[0].message.content ?? "";

    return Response.json({ response });
  } catch (error) {
    console.error("Error processing conversation:", error);
    return Response.json(
      { response: "", error: "Internal server error" },
      { status: 500 }
    );
  }
}; 