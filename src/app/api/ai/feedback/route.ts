import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { userAnswer, correctAnswer, exerciseType, context } = await request.json()

    if (!userAnswer || !correctAnswer) {
      return NextResponse.json({ error: 'User answer and correct answer are required' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

    const prompt = `Please analyze this English learning exercise response and provide constructive feedback:

Exercise Type: ${exerciseType}
User's Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"
Context: ${context || 'General English learning exercise'}

Please provide:
1. Whether the answer is correct or incorrect
2. A clear explanation of why
3. Specific suggestions for improvement if incorrect
4. Encouragement and positive reinforcement
5. Key learning points from this exercise

Format your response as a helpful, encouraging teacher would. Keep it concise but thorough.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert English teacher providing constructive feedback to developers learning technical English. 
          Be supportive, educational, and specific in your feedback. Explain concepts clearly and provide actionable advice.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const feedback = completion.choices[0]?.message?.content

    if (!feedback) {
      throw new Error('No feedback generated')
    }

    return NextResponse.json({ 
      success: true, 
      isCorrect,
      feedback,
      usage: completion.usage
    })

  } catch (error: any) {
    console.error('Feedback generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback', 
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}