import GradientCircleBackground from "@/components/GradientCircleBackground"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <GradientCircleBackground />
      <div className="text-center relative z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4 shadow-lg"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
