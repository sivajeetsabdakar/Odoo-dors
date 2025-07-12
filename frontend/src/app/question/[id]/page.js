"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import RichTextEditor from "@/components/RichTextEditor"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { ArrowUp, ArrowDown, Check, Clock } from "lucide-react"

// Mock data
const mockQuestion = {
  id: "1",
  title: "How to implement authentication in Next.js 14?",
  description:
    "<p>I'm trying to implement authentication in my Next.js 14 application using the App Router. I've looked at several tutorials but I'm confused about the best approach.</p><p>What I've tried:</p><ul><li>NextAuth.js</li><li>Custom JWT implementation</li><li>Firebase Auth</li></ul><p>What would be the recommended approach for a production application?</p>",
  tags: ["nextjs", "authentication", "react"],
  votes: 15,
  createdAt: "2024-01-15T10:30:00Z",
  author: { username: "developer123" },
  answers: [
    {
      id: "1",
      content:
        "<p>For Next.js 14 with App Router, I'd recommend using NextAuth.js v5 (Auth.js). Here's why:</p><ul><li>Built specifically for Next.js</li><li>Supports multiple providers</li><li>Great TypeScript support</li><li>Active maintenance</li></ul><p>Here's a basic setup:</p><pre><code>npm install next-auth@beta</code></pre>",
      votes: 8,
      createdAt: "2024-01-15T11:00:00Z",
      author: { username: "nextjspro" },
      isAccepted: true,
    },
    {
      id: "2",
      content:
        "<p>Another good option is Supabase Auth if you're already using Supabase for your database. It provides:</p><ul><li>Built-in user management</li><li>Social login providers</li><li>Row Level Security</li></ul>",
      votes: 3,
      createdAt: "2024-01-15T12:30:00Z",
      author: { username: "supabasefan" },
      isAccepted: false,
    },
  ],
}

export default function QuestionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [newAnswer, setNewAnswer] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestion(mockQuestion)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handleVote = (type, targetType, targetId) => {
    // Implement voting logic
    console.log(`${type} vote for ${targetType} ${targetId}`)
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!newAnswer.trim() || !user) return

    setSubmittingAnswer(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const answer = {
        id: Date.now().toString(),
        content: newAnswer,
        votes: 0,
        createdAt: new Date().toISOString(),
        author: { username: user.username },
        isAccepted: false,
      }

      setQuestion((prev) => ({
        ...prev,
        answers: [...prev.answers, answer],
      }))

      setNewAnswer("")
    } catch (error) {
      console.error("Error submitting answer:", error)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question not found</h1>
          <p className="text-gray-600">The question you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <a href="/" className="hover:text-primary transition-colors">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a href="/" className="hover:text-primary transition-colors">
                Questions
              </a>
            </li>
            <li>/</li>
            <li className="text-foreground">Question #{question.id}</li>
          </ol>
        </nav>

        {/* Question */}
        <Card className="mb-6 bg-card/95 border-border shadow-xl backdrop-blur-sm">
          <CardHeader>
            <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">{question.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Asked {formatDate(question.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {question.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{question.author.username}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("up", "question", question.id)}
                  disabled={!user}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-lg font-semibold">{question.votes}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("down", "question", question.id)}
                  disabled={!user}
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.description }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {question.answers.length} Answer{question.answers.length !== 1 ? "s" : ""}
          </h2>

          <div className="space-y-4">
            {question.answers.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("up", "answer", answer.id)}
                        disabled={!user}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-lg font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("down", "answer", answer.id)}
                        disabled={!user}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                      {answer.isAccepted && (
                        <div className="text-green-600">
                          <Check className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Answered {formatDate(answer.createdAt)}</span>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {answer.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{answer.author.username}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Answer Form */}
        {user ? (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Your Answer</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <RichTextEditor content={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
                <Button type="submit" disabled={submittingAnswer || !newAnswer.trim()}>
                  {submittingAnswer ? "Submitting..." : "Post Your Answer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">You must be logged in to post an answer.</p>
              <div className="space-x-2">
                <Button asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
