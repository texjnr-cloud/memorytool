import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateMnemonic(input: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate a memorable mnemonic for: ${input}`,
        },
      ],
    });

    if (message.content[0].type === "text") {
      return message.content[0].text;
    }

    return "Could not generate mnemonic";
  } catch (error) {
    console.error("Mnemonic generation failed:", error);
    throw error;
  }
}