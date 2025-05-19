import { json, type ActionFunction } from "@remix-run/node";

// Load environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

interface ConversationRequest {
  prompt: string;
}

interface ConversationResponse {
  response: string;
  error?: string;
}

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

    // Use the API key from environment variables
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: body.prompt }]
      })
    });

    const data = await response.json();
    return json<ConversationResponse>({ 
      response: data.choices[0].message.content 
    });
  } catch (error) {
    console.error("Error processing conversation:", error);
    return json<ConversationResponse>(
      { response: "", error: "Internal server error" },
      { status: 500 }
    );
  }
}; 