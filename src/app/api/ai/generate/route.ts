import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, level, context } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const zai = await ZAI.create()

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
      why something is correct or incorrect, and how to improve. Be supportive and educational.`
    }

    const systemPrompt = systemPrompts[type as keyof typeof systemPrompts] || 
      `You are an expert English teacher for software developers. Create high-quality educational content for ${level} level students.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt + (context ? `\n\nAdditional context: ${context}` : '')
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response generated')
    }

    return NextResponse.json({ 
      success: true, 
      content: response,
      usage: completion.usage
    })

  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate content', 
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}