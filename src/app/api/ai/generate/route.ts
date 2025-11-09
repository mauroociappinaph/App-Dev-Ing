import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

function validateInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid request body" };
  }

  const { prompt, type, level, context } = data;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return {
      isValid: false,
      error: "Prompt is required and must be a non-empty string",
    };
  }

  if (prompt.length > 2000) {
    return { isValid: false, error: "Prompt too long (max 2000 characters)" };
  }

  // Basic content filtering
  const forbiddenWords = ["hack", "exploit", "malware", "virus", "attack"];
  const lowerPrompt = prompt.toLowerCase();
  if (forbiddenWords.some((word) => lowerPrompt.includes(word))) {
    return { isValid: false, error: "Prompt contains forbidden content" };
  }

  const validTypes = [
    "vocabulary",
    "grammar",
    "reading",
    "listening",
    "speaking",
    "writing",
    "feedback",
  ];
  if (type && !validTypes.includes(type)) {
    return { isValid: false, error: "Invalid content type" };
  }

  const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  if (level && !validLevels.includes(level)) {
    return { isValid: false, error: "Invalid level" };
  }

  if (context && typeof context !== "string") {
    return { isValid: false, error: "Context must be a string" };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateInput(body);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { prompt, type, level, context } = body;

    const zai = await ZAI.create();

    // System prompts based on content type
    const systemPrompts = {
      vocabulary: `You are an expert English teacher specializing in technical vocabulary for software developers.
      Generate vocabulary exercises suitable for ${level} level students.
      Focus on terms commonly used in software development, code reviews, meetings, and technical documentation.
      Always provide clear explanations and examples from real programming scenarios.`,

      grammar: `You are an expert English grammar teacher for software developers.
      Create grammar exercises that are relevant to technical communication, code comments, documentation, and professional emails.
      Target level: ${level}. Use programming-related examples and contexts.`,

      reading: `You are an expert in creating reading comprehension exercises for developers.
      Generate technical reading passages (code documentation, technical articles, meeting transcripts)
      and comprehension questions suitable for ${level} level English learners in IT.`,

      listening: `You are an expert in creating listening comprehension exercises for developers.
      Generate scripts for technical conversations, code reviews, or technical explanations
      suitable for ${level} level English learners in software development.`,

      speaking: `You are an expert in teaching spoken English for technical professionals.
      Create speaking practice exercises, role-plays, and conversation prompts
      that simulate real workplace scenarios for ${level} level developers.`,

      writing: `You are an expert in technical writing and business communication for developers.
      Create writing exercises that teach professional email writing, documentation,
      and technical communication skills suitable for ${level} level learners.`,

      feedback: `You are an expert English teacher providing constructive feedback to developers.
      Analyze the student's response and provide helpful, encouraging feedback that explains
      why something is correct or incorrect, and how to improve. Be supportive and educational.`,
    };

    const systemPrompt =
      systemPrompts[type as keyof typeof systemPrompts] ||
      `You are an expert English teacher for software developers. Create high-quality educational content for ${level} level students.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            prompt + (context ? `\n\nAdditional context: ${context}` : ""),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response generated");
    }

    return NextResponse.json({
      success: true,
      content: response,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
