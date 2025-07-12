import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real implementation, you'd check your backend moderation service
    // For now, we'll simulate the health check
    
    const moderationServiceUrl = process.env.MODERATION_SERVICE_URL || 'http://localhost:8080'
    
    try {
      // Try to reach the backend moderation service
      const response = await fetch(`${moderationServiceUrl}/api/moderation/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        return NextResponse.json({
          status: "healthy",
          service: "content_moderation",
          backend_connected: true
        })
      } else {
        return NextResponse.json({
          status: "unhealthy",
          service: "content_moderation",
          backend_connected: false
        })
      }
      
    } catch (error) {
      // Backend is not reachable
      return NextResponse.json({
        status: "unhealthy",
        service: "content_moderation",
        backend_connected: false,
        error: error.message
      })
    }
    
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: "error",
      service: "content_moderation",
      backend_connected: false,
      error: error.message
    }, { status: 500 })
  }
}
