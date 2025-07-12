import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { image_url } = await request.json()
    
    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }
    
    const moderationServiceUrl = process.env.MODERATION_SERVICE_URL || 'http://localhost:8080'
    
    try {
      // Forward the request to the backend moderation service
      const response = await fetch(`${moderationServiceUrl}/api/moderation/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url }),
        signal: AbortSignal.timeout(15000) // 15 second timeout for image processing
      })
      
      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      } else {
        throw new Error(`Backend returned status ${response.status}`)
      }
      
    } catch (error) {
      console.error('Image moderation service error:', error)
      
      // Fallback: Basic image validation
      const result = await fallbackImageModeration(image_url)
      return NextResponse.json(result)
    }
    
  } catch (error) {
    console.error('Image moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate image' },
      { status: 500 }
    )
  }
}

// Fallback moderation logic when backend is unavailable
async function fallbackImageModeration(imageUrl) {
  try {
    // Basic URL validation
    const url = new URL(imageUrl)
    const allowedDomains = ['cloudinary.com', 'imgur.com', 'example.com']
    const isDomainAllowed = allowedDomains.some(domain => url.hostname.includes(domain))
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const hasValidExtension = allowedExtensions.some(ext => 
      url.pathname.toLowerCase().endsWith(ext)
    )
    
    const isAppropriate = isDomainAllowed && hasValidExtension
    const confidence = isAppropriate ? 0.80 : 0.60
    
    const flaggedReasons = []
    if (!isDomainAllowed) flaggedReasons.push('Untrusted domain')
    if (!hasValidExtension) flaggedReasons.push('Invalid file type')
    
    return {
      is_appropriate: isAppropriate,
      confidence: confidence,
      categories: isAppropriate 
        ? { normal: 0.80, safe: 0.85 }
        : { suspicious: 0.60 },
      flagged_reasons: flaggedReasons,
      moderation_action: isAppropriate ? "allow" : "flag",
      fallback_used: true
    }
    
  } catch (error) {
    // Invalid URL
    return {
      is_appropriate: false,
      confidence: 0.95,
      categories: { invalid: 0.95 },
      flagged_reasons: ['Invalid URL format'],
      moderation_action: "block",
      fallback_used: true
    }
  }
}
