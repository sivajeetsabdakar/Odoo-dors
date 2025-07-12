"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/RichTextEditor"
import ImageUpload from "@/components/ImageUpload"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { ArrowUp, ArrowDown, Check, Clock } from "lucide-react"
import { fileUploadApi } from "@/lib/api"

export default function QuestionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { 
    fetchQuestionById, 
    fetchAnswersByQuestion, 
    createAnswer, 
    voteOnQuestion, 
    voteOnAnswer,
    error: dataError 
  } = useData()
  
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [newAnswer, setNewAnswer] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploadedImages, setUploadedImages] = useState([])
  const [votingStates, setVotingStates] = useState({})

  useEffect(() => {
    if (params.id) {
      loadQuestionAndAnswers()
    }
  }, [params.id])

  const loadQuestionAndAnswers = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch question details
      const questionData = await fetchQuestionById(params.id)
      setQuestion(questionData)
      
      // Fetch answers for this question
      const answersData = await fetchAnswersByQuestion(params.id)
      setAnswers(answersData)
      
    } catch (error) {
      console.error("Error loading question:", error)
      setError(error.message || "Failed to load question")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type, targetType, targetId) => {
    if (!user) return
    
    const voteValue = type === "up" ? 1 : -1
    const voteKey = `${targetType}-${targetId}`
    
    setVotingStates(prev => ({ ...prev, [voteKey]: true }))
    
    try {
      if (targetType === "question") {
        await voteOnQuestion(targetId, voteValue, user.id)
        // Reload question to get updated vote count
        const updatedQuestion = await fetchQuestionById(params.id)
        setQuestion(updatedQuestion)
      } else if (targetType === "answer") {
        await voteOnAnswer(targetId, voteValue, user.id)
        // Reload answers to get updated vote count
        const updatedAnswers = await fetchAnswersByQuestion(params.id)
        setAnswers(updatedAnswers)
      }
    } catch (error) {
      console.error("Error voting:", error)
      setError(error.message || "Failed to vote")
    } finally {
      setVotingStates(prev => ({ ...prev, [voteKey]: false }))
    }
  }

  const handleImagesUploaded = (images) => {
    setUploadedImages(images)
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!newAnswer.trim() || !user) return

    setSubmittingAnswer(true)
    setError("")
    
    try {
      const answerData = {
        description: newAnswer,
        imageUrls: uploadedImages.map(img => img.url) // Send only URLs to backend
      }

      // Create the answer
      const newAnswerResponse = await createAnswer(params.id, answerData, user.id)

      // Reload answers to show the new one
      const updatedAnswers = await fetchAnswersByQuestion(params.id)
      setAnswers(updatedAnswers)

      // Clear form
      setNewAnswer("")
      setUploadedImages([])
      
    } catch (error) {
      console.error("Error submitting answer:", error)
      setError(error.message || "Failed to submit answer")
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return fileUploadApi.getFileUrl(avatarUrl)
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    return fileUploadApi.getFileUrl(imageUrl)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-lg relative z-10"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">Question not found</h1>
          <p className="text-muted-foreground">The question you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
        {/* Error Alert */}
        {(error || dataError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || dataError}</AlertDescription>
          </Alert>
        )}

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
              {question.tags && question.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Asked {formatDate(question.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Views: {question.viewCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={getAvatarUrl(question.user?.avatarUrl)} />
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {(question.user?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground">{question.user?.username || 'Unknown'}</span>
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
                  disabled={!user || votingStates[`question-${question.id}`]}
                  className="hover:bg-accent/20 hover:text-accent"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-lg font-semibold text-foreground">{question.voteCount || 0}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("down", "question", question.id)}
                  disabled={!user || votingStates[`question-${question.id}`]}
                  className="hover:bg-accent/20 hover:text-accent"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div 
                  className="prose prose-slate max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: question.description }} 
                />
                
                {/* Question Images */}
                {question.imageUrls && question.imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.imageUrls.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={getImageUrl(imageUrl)}
                        alt={`Question image ${index + 1}`}
                        className="rounded-lg border border-border max-w-full h-auto"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {answers.length} Answer{answers.length !== 1 ? "s" : ""}
          </h2>

          <div className="space-y-4">
            {answers.map((answer) => (
              <Card 
                key={answer.id} 
                className={`${answer.isAccepted 
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
                  : "bg-card/95 border-border"
                } backdrop-blur-sm`}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("up", "answer", answer.id)}
                        disabled={!user || votingStates[`answer-${answer.id}`]}
                        className="hover:bg-accent/20 hover:text-accent"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-lg font-semibold text-foreground">{answer.voteCount || 0}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("down", "answer", answer.id)}
                        disabled={!user || votingStates[`answer-${answer.id}`]}
                        className="hover:bg-accent/20 hover:text-accent"
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
                      <div 
                        className="prose prose-slate max-w-none mb-4 text-foreground" 
                        dangerouslySetInnerHTML={{ __html: answer.description }} 
                      />

                      {/* Answer Images */}
                      {answer.imageUrls && answer.imageUrls.length > 0 && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {answer.imageUrls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={getImageUrl(imageUrl)}
                              alt={`Answer image ${index + 1}`}
                              className="rounded-lg border border-border max-w-full h-auto"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Answered {formatDate(answer.createdAt)}</span>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6 border border-border">
                            <AvatarImage src={getAvatarUrl(answer.user?.avatarUrl)} />
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                              {(answer.user?.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground">{answer.user?.username || 'Unknown'}</span>
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
          <Card className="bg-card/95 border-border backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Your Answer</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <RichTextEditor 
                  content={newAnswer} 
                  onChange={setNewAnswer} 
                  placeholder="Write your answer here..." 
                />
                
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium">Images (Optional)</Label>
                  <ImageUpload
                    onImagesUploaded={handleImagesUploaded}
                    maxFiles={5}
                    folder="stack-it/answers"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingAnswer || !newAnswer.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submittingAnswer ? "Submitting..." : "Post Your Answer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/95 border-border backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You must be logged in to post an answer.</p>
              <div className="space-x-2">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="/login">Login</a>
                </Button>
                <Button variant="outline" asChild className="border-border hover:bg-accent/20">
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
