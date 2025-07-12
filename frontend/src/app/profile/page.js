"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import QuestionCard from "@/components/QuestionCard"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { MessageSquare, HelpCircle, Award, Edit, Upload, Save, X } from "lucide-react"
import { uploadAvatarImage } from "@/lib/imageUpload"
import { usersApi } from "@/lib/api"

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth()
  const { getQuestionsByUser, error: dataError } = useData()
  const router = useRouter()
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    username: "",
    bio: "",
    avatarUrl: ""
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setEditedProfile({
        username: user.username || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || ""
      })
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setLoadingData(true)
    setError("")
    
    try {
      // Load user's questions
      const questions = await getQuestionsByUser(user.id)
      setUserQuestions(questions)
      
      // Note: Loading user answers would require a separate API endpoint
      // For now, we'll leave it empty as it's not implemented in the backend
      setUserAnswers([])
      
    } catch (error) {
      console.error("Error loading user data:", error)
      setError(error.message || "Failed to load user data")
    } finally {
      setLoadingData(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    
    try {
      let avatarUrl = editedProfile.avatarUrl
      
      // Upload avatar if a new file was selected
      if (avatarFile) {
        const uploadResponse = await uploadAvatarImage(avatarFile)
        avatarUrl = uploadResponse.url
      }
      
      // Update profile
      const profileData = {
        username: editedProfile.username,
        bio: editedProfile.bio,
        avatarUrl: avatarUrl
      }
      
      await usersApi.updateProfile(user.id, profileData)
      
      // Update local user state
      updateUser({ ...user, ...profileData })
      
      setEditing(false)
      setAvatarFile(null)
      
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return fileUploadApi.getFileUrl(avatarUrl)
  }

  if (loading || loadingData) {
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
        {/* Error Alert */}
        {(error || dataError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || dataError}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card className="mb-6 bg-card/95 border-border shadow-xl backdrop-blur-sm">
          <CardContent className="pt-6">
            {editing ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : getAvatarUrl(editedProfile.avatarUrl)} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                        {editedProfile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                      <Upload className="h-3 w-3" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-foreground">Username</Label>
                      <Input
                        id="username"
                        value={editedProfile.username}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-input/80 border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-foreground">Bio</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-input/80 border-border"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="border-border hover:bg-accent/20">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={getAvatarUrl(user.avatarUrl)} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{user.username}</h1>
                    <p className="text-muted-foreground text-lg mb-1">{user.email}</p>
                    {user.bio && <p className="text-muted-foreground mb-3">{user.bio}</p>}
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-primary/10 text-primary border border-primary/20">
                        <HelpCircle className="h-3 w-3" />
                        <span>{userQuestions.length} Questions</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-accent/10 text-accent border border-accent/20">
                        <MessageSquare className="h-3 w-3" />
                        <span>{userAnswers.length} Answers</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-700 border border-green-200">
                        <Award className="h-3 w-3" />
                        <span>Rep: {user.reputation || 0}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setEditing(true)} variant="outline" className="border-border hover:bg-accent/20">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Questions</TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {userQuestions.length > 0 ? (
              userQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
            ) : (
              <Card className="bg-card/95 border-border backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't asked any questions yet. Start by asking your first question!
                  </p>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <a href="/ask">Ask a Question</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            {userAnswers.length > 0 ? (
              userAnswers.map((answer, index) => (
                <Card key={index} className="bg-card/95 border-border backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-foreground">
                        <a href={`/question/${answer.questionId}`} className="hover:text-primary transition-colors">
                          {answer.questionTitle}
                        </a>
                      </CardTitle>
                      {answer.isAccepted && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">{answer.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{answer.voteCount || 0} votes</span>
                      <span>Answered {new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/95 border-border backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No answers yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't answered any questions yet. Help others by sharing your knowledge!
                  </p>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <a href="/">Browse Questions</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
