"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionCard from "@/components/QuestionCard"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { Search } from "lucide-react"
import { useData } from "@/contexts/DataContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const { questions, loading, error, fetchQuestions, searchQuestions } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [currentPage])

  const loadQuestions = async () => {
    try {
      const response = await fetchQuestions(currentPage, pageSize)
      if (response.totalPages) {
        setTotalPages(response.totalPages)
      }
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      try {
        await searchQuestions(searchTerm, 0, pageSize)
        setCurrentPage(0)
      } catch (error) {
        console.error('Error searching questions:', error)
      } finally {
        setIsSearching(false)
      }
    } else {
      loadQuestions()
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (e.target.value === '') {
      loadQuestions()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.tags && question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt)
      case "votes":
        return (b.voteCount || 0) - (a.voteCount || 0)
      case "unanswered":
        return (a.answerCount || 0) - (b.answerCount || 0)
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-input/50 border-border focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
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
              <p className="text-muted-foreground/70">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to ask a question!"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2 bg-card/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
              <Button 
                variant="outline" 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-border hover:bg-accent/20"
              >
                Previous
              </Button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = currentPage <= 2 ? i : currentPage - 2 + i;
                if (pageNum >= totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "border-border hover:bg-accent/20"
                    }
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              <Button 
                variant="outline" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-border hover:bg-accent/20"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
