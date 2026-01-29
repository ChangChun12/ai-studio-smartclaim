import { GoogleGenAI } from "@google/genai";

export const config = {
    runtime: 'edge', // Use Edge Runtime for faster cold starts
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { prompt, systemInstruction } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Combine system instruction and user prompt for the model
        const combinedPrompt = systemInstruction
            ? `${systemInstruction}\n\nUser Query: ${prompt}`
            : prompt;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: combinedPrompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text || "{}";

        // Parse to ensure it is valid JSON before sending back
        // (Though we are sending it as string to client to parse, doing a check here is good practice)
        JSON.parse(text);

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to process request',
            details: error.message
        }), { status: 500 });
    }
}
