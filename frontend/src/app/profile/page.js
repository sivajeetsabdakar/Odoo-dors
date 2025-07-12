"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import QuestionCard from "@/components/QuestionCard"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { MessageSquare, HelpCircle, Award } from "lucide-react"

// Mock data
const mockUserData = {
  questionsAsked: [
    {
      id: "1",
      title: "How to implement authentication in Next.js 14?",
      tags: ["nextjs", "authentication", "react"],
      votes: 15,
      answerCount: 3,
      createdAt: "2024-01-15T10:30:00Z",
      author: { username: "developer123" },
    },
  ],
  answersGiven: [
    {
      questionId: "2",
      questionTitle: "Best practices for state management in React",
      content: "I recommend using Context API for simple state and Redux Toolkit for complex applications...",
      votes: 5,
      createdAt: "2024-01-14T15:45:00Z",
      isAccepted: true,
    },
  ],
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setUserData(mockUserData)
      }, 1000)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-lg relative z-10"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-20">
        {/* Profile Header */}
        <Card className="mb-6 bg-card/95 border-border shadow-xl backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{user.username}</h1>
                <p className="text-muted-foreground text-lg mb-3">{user.email}</p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-primary/10 text-primary border border-primary/20">
                    <HelpCircle className="h-3 w-3" />
                    <span>{userData?.questionsAsked?.length || 0} Questions</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-accent/10 text-accent border border-accent/20">
                    <MessageSquare className="h-3 w-3" />
                    <span>{userData?.answersGiven?.length || 0} Answers</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1 bg-accent/20 text-accent border border-accent/30">
                    <Award className="h-3 w-3" />
                    <span>{userData?.answersGiven?.filter((a) => a.isAccepted).length || 0} Accepted</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">My Questions</TabsTrigger>
            <TabsTrigger value="answers">My Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {userData?.questionsAsked?.length > 0 ? (
              userData.questionsAsked.map((question) => <QuestionCard key={question.id} question={question} />)
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600">
                    You haven't asked any questions yet. Start by asking your first question!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            {userData?.answersGiven?.length > 0 ? (
              userData.answersGiven.map((answer, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <a href={`/question/${answer.questionId}`} className="hover:text-blue-600">
                          {answer.questionTitle}
                        </a>
                      </CardTitle>
                      {answer.isAccepted && (
                        <Badge variant="default" className="bg-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{answer.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{answer.votes} votes</span>
                      <span>Answered {new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
                  <p className="text-gray-600">
                    You haven't answered any questions yet. Help others by sharing your knowledge!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
