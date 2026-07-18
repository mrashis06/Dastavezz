import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

type Action =
    | "improve"
    | "rewrite"
    | "summarize"
    | "title"
    | "custom";

const prompts: Record<Action, (text: string, command?: string) => string> = {
    improve: (text) => `
You are an expert document editor.

Improve the following document by:
- Fixing grammar
- Improving readability
- Improving formatting
- Keeping original meaning

Return ONLY the improved document in Markdown.

Document:
${text}
`,

    rewrite: (text) => `
Rewrite the following document in a professional and business-friendly tone.

Return only the rewritten document.

${text}
`,

    summarize: (text) => `
Summarize the following document.

Return:
- Executive Summary
- Key Points
- Estimated Reading Time

Document:
${text}
`,

    title: (text) => `
Generate one short professional title.

Return ONLY the title.

${text}
`,

    custom: (text, command) => `
Instruction:

${command}

Document:

${text}
`,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            action,
            text,
            command,
        }: {
            action: Action;
            text: string;
            command?: string;
        } = body;

        if (!text) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Document text is required.",
                },
                { status: 400 }
            );
        }

        const promptBuilder = prompts[action];

        if (!promptBuilder) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid action.",
                },
                { status: 400 }
            );
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: promptBuilder(text, command),
        });

        return NextResponse.json({
            success: true,
            content: response.text,
        });
    } catch (err) {
        console.error("Gemini Error:", err);

        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            },
            {
                status: 500,
            }
        );
    }
}
