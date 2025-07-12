import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { content, content_type = "text" } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    const moderationServiceUrl = process.env.MODERATION_SERVICE_URL || 'http://localhost:8080'
    
    try {
      // Forward the request to the backend moderation service
      const response = await fetch(`${moderationServiceUrl}/api/moderation/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, content_type }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      } else {
        throw new Error(`Backend returned status ${response.status}`)
      }
      
    } catch (error) {
      console.error('Moderation service error:', error)
      
      // Fallback: Simple content moderation
      const result = await fallbackTextModeration(content, content_type)
      return NextResponse.json(result)
    }
    
  } catch (error) {
    console.error('Text moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate content' },
      { status: 500 }
    )
  }
}

// Fallback moderation logic when backend is unavailable
async function fallbackTextModeration(content, contentType) {
  const lowerContent = content.toLowerCase()
  
  // Simple profanity and inappropriate content detection
  const profanityWords = ['spam', 'scam', 'fake', 'inappropriate']
  const flaggedWords = []
  
  profanityWords.forEach(word => {
    if (lowerContent.includes(word)) {
      flaggedWords.push(word)
    }
  })
  
  const isAppropriate = flaggedWords.length === 0
  const confidence = isAppropriate ? 0.85 : 0.75
  
  return {
    is_appropriate: isAppropriate,
    confidence: confidence,
    categories: isAppropriate 
      ? { normal: 0.85, safe: 0.90 }
      : { inappropriate: 0.75 },
    flagged_reasons: flaggedWords.length > 0 ? [`Contains flagged words: ${flaggedWords.join(', ')}`] : [],
    moderation_action: isAppropriate ? "allow" : "flag",
    fallback_used: true
  }
}
