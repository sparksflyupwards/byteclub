import { json, type ActionFunction } from "@remix-run/node";

interface ConversationRequest {
  prompt: string;
}

interface ConversationResponse {
  response: string;
  error?: string;
}

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});


export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json<ConversationResponse>(
      { response: "", error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await request.json() as ConversationRequest;
    
    if (!body.prompt) {
      return json<ConversationResponse>(
        { response: "", error: "Prompt is required" },
        { status: 400 }
      );
    }

    // TODO: Add your conversation logic here

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
       {"role": "user", "content": body.prompt},
      ],
    });

    console.log(completion);

    const response = completion.choices[0].message.content ?? "";

    return json<ConversationResponse>({ response });
  } catch (error) {
    console.error("Error processing conversation:", error);
    return json<ConversationResponse>(
      { response: "", error: "Internal server error" },
      { status: 500 }
    );
  }
}; 