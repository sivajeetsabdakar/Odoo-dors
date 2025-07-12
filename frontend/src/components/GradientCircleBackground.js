"use client"

import { useEffect, useState } from "react"

export default function GradientCircleBackground() {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // Start the opacity transition after component mounts
    const timer = setTimeout(() => {
      setOpacity(0.35)
    }, 100) // Small delay to ensure smooth transition start

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {/* Large gradient circle background */}
      <div 
        className="absolute inset-0 transition-opacity duration-[5000ms] ease-in-out"
        style={{
          opacity: opacity,
          background: `radial-gradient(circle at 50% 50%, 
            oklch(0.6 0.2 240), 
            oklch(0.55 0.15 150), 
            transparent 70%)`
        }}
      />
      
      {/* Additional blur overlay for better effect */}
      <div 
        className="absolute inset-0 blur-4xl transition-opacity duration-[5000ms] ease-in-out"
        style={{
          opacity: opacity * 0.8, // Slightly less opacity for the blur layer
          background: `radial-gradient(circle at 30% 70%, 
            oklch(0.6 0.2 240), 
            transparent 60%),
            radial-gradient(circle at 70% 30%, 
            oklch(0.55 0.15 150), 
            transparent 60%)`
        }}
      />
    </div>
  )
}
