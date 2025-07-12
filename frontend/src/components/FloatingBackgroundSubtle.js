"use client"

import { useEffect, useState } from "react"

export default function FloatingBackgroundSubtle() {
  const [floatingDivs, setFloatingDivs] = useState([])

  useEffect(() => {
    // Create floating divs with random positions and colors
    const colors = [
      'oklch(0.6 0.2 240)', // Blue (chart-1)
      'oklch(0.55 0.15 150)', // Green (chart-2) 
      'oklch(0.65 0.2 60)', // Yellow (chart-3)
      'oklch(0.6 0.2 300)', // Purple (chart-4)
      'oklch(0.6 0.2 15)', // Orange (chart-5)
      'oklch(0.6 0.2 240)', // Primary blue
      'oklch(0.55 0.15 150)', // Accent green
    ]

    const newFloatingDivs = []
    
    // More divs but smaller for homepage
    for (let i = 0; i < 25; i++) {
      newFloatingDivs.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 30 + 10, // 10-40px (smaller than login)
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 25 + 15, // 15-40s (slower)
        delay: Math.random() * 8,
        direction: Math.random() > 0.5 ? 1 : -1,
      })
    }
    
    setFloatingDivs(newFloatingDivs)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {/* More blurred background overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      
      {/* Floating divs - smaller and more blurred */}
      {floatingDivs.map((div) => (
        <div
          key={div.id}
          className="absolute rounded-full opacity-15 blur-sm animate-float"
          style={{
            backgroundColor: div.color,
            width: `${div.size}px`,
            height: `${div.size}px`,
            left: `${div.left}%`,
            top: `${div.top}%`,
            animationDuration: `${div.duration}s`,
            animationDelay: `${div.delay}s`,
            '--float-direction': div.direction,
          }}
        />
      ))}
      
      {/* Very subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          background: `radial-gradient(circle at 25% 75%, oklch(0.6 0.2 240), transparent 60%),
                      radial-gradient(circle at 75% 25%, oklch(0.55 0.15 150), transparent 60%),
                      radial-gradient(circle at 50% 50%, oklch(0.6 0.2 300), transparent 60%)`
        }}
      />
    </div>
  )
}
