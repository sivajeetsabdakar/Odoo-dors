"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionCard from "@/components/QuestionCard"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { Search } from "lucide-react"

// Mock data - replace with real API calls
const mockQuestions = [
  {
    id: "1",
    title: "How to implement authentication in Next.js 14?",
    tags: ["nextjs", "authentication", "react"],
    votes: 15,
    answerCount: 3,
    createdAt: "2024-01-15T10:30:00Z",
    author: { username: "developer123" },
  },
  {
    id: "2",
    title: "Best practices for state management in React applications",
    tags: ["react", "state-management", "redux"],
    votes: 8,
    answerCount: 2,
    createdAt: "2024-01-14T15:45:00Z",
    author: { username: "reactpro" },
  },
  {
    id: "3",
    title: "How to optimize database queries in PostgreSQL?",
    tags: ["postgresql", "database", "performance"],
    votes: 12,
    answerCount: 5,
    createdAt: "2024-01-13T09:20:00Z",
    author: { username: "dbexpert" },
  },
]

export default function HomePage() {
  const [questions, setQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestions(mockQuestions)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt)
      case "votes":
        return b.votes - a.votes
      case "unanswered":
        return a.answerCount - b.answerCount
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <GradientCircleBackground />
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card/30 p-6 rounded-lg border border-border/50 backdrop-blur-sm">
                <div className="h-4 bg-muted/60 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted/40 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-20">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            All Questions
          </h1>
          <p className="text-muted-foreground text-lg">Find answers to your programming questions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 border-border focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-input/50 border-border focus:ring-primary">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {sortedQuestions.length > 0 ? (
            sortedQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-border/30 backdrop-blur-sm">
              <p className="text-muted-foreground text-lg mb-2">No questions found</p>
              <p className="text-muted-foreground/70">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2 bg-card/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
            <Button variant="outline" disabled className="border-border hover:bg-accent/20">
              Previous
            </Button>
            <Button variant="default" className="bg-primary text-primary-foreground shadow-md">
              1
            </Button>
            <Button variant="outline" className="border-border hover:bg-accent/20">2</Button>
            <Button variant="outline" className="border-border hover:bg-accent/20">3</Button>
            <Button variant="outline" className="border-border hover:bg-accent/20">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
