import Link from "next/link"
import { Button } from "@/components/ui/button"
import GradientCircleBackground from "@/components/GradientCircleBackground"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <GradientCircleBackground />
      <div className="text-center relative z-10">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild className="border-border text-foreground hover:bg-accent/20 hover:border-accent transition-all">
            <Link href="/ask">Ask a Question</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
