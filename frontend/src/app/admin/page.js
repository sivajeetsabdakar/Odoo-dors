"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { HelpCircle, MessageSquare, Users, Flag } from "lucide-react"

// Mock data
const mockStats = {
  totalQuestions: 156,
  totalAnswers: 342,
  totalUsers: 89,
  flaggedContent: 3,
}

const mockQuestions = [
  {
    id: "1",
    title: "How to implement authentication in Next.js 14?",
    author: "developer123",
    createdAt: "2024-01-15T10:30:00Z",
    votes: 15,
    answers: 3,
    status: "active",
  },
  {
    id: "2",
    title: "Best practices for state management",
    author: "reactpro",
    createdAt: "2024-01-14T15:45:00Z",
    votes: 8,
    answers: 2,
    status: "flagged",
  },
]

const mockAnswers = [
  {
    id: "1",
    questionTitle: "How to implement authentication in Next.js 14?",
    author: "nextjspro",
    createdAt: "2024-01-15T11:00:00Z",
    votes: 8,
    status: "active",
  },
  {
    id: "2",
    questionTitle: "Best practices for state management",
    author: "supabasefan",
    createdAt: "2024-01-15T12:30:00Z",
    votes: 3,
    status: "active",
  },
]

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      // Simulate API calls
      setTimeout(() => {
        setStats(mockStats)
        setQuestions(mockQuestions)
        setAnswers(mockAnswers)
      }, 1000)
    }
  }, [user])

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const handleDeleteAnswer = (answerId) => {
    setAnswers(answers.filter((a) => a.id !== answerId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-lg relative z-10"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-20">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage questions, answers, and users</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/95 border-border shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Questions</CardTitle>
                <HelpCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border-border shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Answers</CardTitle>
                <MessageSquare className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalAnswers}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border-border shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border-border shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Flagged Content</CardTitle>
                <Flag className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.flaggedContent}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="bg-muted/80 border border-border backdrop-blur-sm">
            <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Questions
            </TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card className="bg-card/95 border-border shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Question Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Answers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          <a href={`/question/${question.id}`} className="hover:text-blue-600">
                            {question.title}
                          </a>
                        </TableCell>
                        <TableCell>{question.author}</TableCell>
                        <TableCell>{new Date(question.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{question.votes}</TableCell>
                        <TableCell>{question.answers}</TableCell>
                        <TableCell>
                          <Badge variant={question.status === "flagged" ? "destructive" : "secondary"}>
                            {question.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle>Answer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {answers.map((answer) => (
                      <TableRow key={answer.id}>
                        <TableCell className="font-medium">{answer.questionTitle}</TableCell>
                        <TableCell>{answer.author}</TableCell>
                        <TableCell>{new Date(answer.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{answer.votes}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{answer.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnswer(answer.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
