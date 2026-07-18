import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { AIDocumentContext } from "@/types";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

type Action =
    | "improve"
    | "rewrite"
    | "summarize"
    | "title"
    | "custom";

const prompts: Record<Action, (text: string, context?: AIDocumentContext, command?: string) => string> = {
    improve: (text, context) => {
        const docContent = context ? (context.selectedText || context.content) : text;
        return `
You are an expert document editor.

Improve the following document by:
- Fixing grammar
- Improving readability
- Improving formatting
- Keeping original meaning

Return ONLY the improved document in Markdown.

Document:
${docContent}
`;
    },

    rewrite: (text, context) => {
        const docContent = context ? (context.selectedText || context.content) : text;
        return `
Rewrite the following document in a professional and business-friendly tone.

Return only the rewritten document.

${docContent}
`;
    },

    summarize: (text, context) => {
        const docContent = context ? (context.selectedText || context.content) : text;
        return `
Summarize the following document.

Return:
- Executive Summary
- Key Points
- Estimated Reading Time

Document:
${docContent}
`;
    },

    title: (text, context) => {
        const ctx = context || {
            template: null,
            title: "",
            content: text,
            wordCount: text ? text.split(/\s+/).length : 0
        };

        const targetContent = ctx.selectedText && ctx.selectedText.trim() ? ctx.selectedText : ctx.content;
        
        let templateGuideline = "Generate concise and professional document titles.";
        if (ctx.template === "professional_resume") {
            templateGuideline = "Generate ATS-friendly job titles suitable for a professional resume header.";
        } else if (ctx.template === "business_letter") {
            templateGuideline = "Generate professional subject lines or titles suitable for a formal business letter.";
        } else if (ctx.template === "project_report") {
            templateGuideline = "Generate concise, descriptive report titles suitable for a formal project document.";
        } else if (ctx.template === "cover_letter") {
            templateGuideline = "Generate recruiter-friendly titles or subject headers suitable for a cover letter.";
        }

        return `
You are an expert document editor. 
${templateGuideline}

Context details:
- Current Title: ${ctx.title || "None"}
- Template Type: ${ctx.template || "Standard"}
- Word Count: ${ctx.wordCount || 0}
${ctx.selectedText ? "- Generated based on this selected text snippet:" : "- Generated based on the full document content:"}

Document Content:
"""
${targetContent}
"""

Instructions:
1. Generate exactly 5 ranked title suggestions.
2. Each suggestion must be under 10 words.
3. Output the titles separated by newlines (one title per line).
4. Do NOT include numbers (e.g., do NOT start lines with "1." or "1)").
5. Do NOT include markdown styling (no bold, no italics, no quotes).
6. Do NOT write any explanations, introductory text, or conclusion. Output ONLY the raw titles.
`;
    },

    custom: (text, context, command) => {
        const docContent = context ? (context.selectedText || context.content) : text;
        return `
Instruction:

${command}

Document:

${docContent}
`;
    },
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            action,
            text,
            context,
            command,
        }: {
            action: Action;
            text?: string;
            context?: AIDocumentContext;
            command?: string;
        } = body;

        const docText = context?.content || text || "";
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
            contents: promptBuilder(docText, context, command),
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
