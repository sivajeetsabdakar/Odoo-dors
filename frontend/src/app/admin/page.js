"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { moderationApi } from "@/lib/moderation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare, 
  Image as ImageIcon,
  Activity,
  Search,
  Filter,
  Loader2
} from "lucide-react"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { fetchQuestions, fetchAnswersByQuestion } = useData()
  
  // State for moderation service
  const [moderationHealth, setModerationHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // State for content
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [flaggedContent, setFlaggedContent] = useState([])
  
  // State for moderation testing
  const [testContent, setTestContent] = useState("")
  const [testImageUrl, setTestImageUrl] = useState("")
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'ADMIN') {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Check moderation service health
      await checkModerationHealth()
      
      // Load content for review
      await loadContentForReview()
      
    } catch (error) {
      console.error("Error loading admin dashboard:", error)
      setError(error.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const checkModerationHealth = async () => {
    try {
      const data = await moderationApi.checkHealth()
      setModerationHealth(data)
    } catch (error) {
      setModerationHealth({ status: "error", message: error.message })
    }
  }

  const loadContentForReview = async () => {
    try {
      let questionsData = []
      let allAnswers = []
      
      // Use regular API (admin API endpoints don't exist yet)
      const questions = await fetchQuestions(0, 100)
      questionsData = questions?.content || questions || []
      
      // Fetch answers for each question (this might be slow for many questions)
      for (const question of questionsData.slice(0, 20)) { // Limit to first 20 questions for performance
        try {
          const answers = await fetchAnswersByQuestion(question.id)
          allAnswers = [...allAnswers, ...answers]
        } catch (error) {
          console.warn(`Failed to fetch answers for question ${question.id}:`, error)
        }
      }
      
      setQuestions(questionsData)
      setAnswers(allAnswers)
      
      // Filter flagged content (content that needs review)
      const flagged = [
        ...questionsData.filter(q => q.moderationStatus === 'flagged'),
        ...allAnswers.filter(a => a.moderationStatus === 'flagged')
      ]
      setFlaggedContent(flagged)
      
    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const moderateTextContent = async (content, contentType = "text") => {
    try {
      setTesting(true)
      const result = await moderationApi.moderateText(content, contentType)
      setTestResults({ type: 'text', result })
      return result
      
    } catch (error) {
      setError("Failed to moderate text content")
      throw error
    } finally {
      setTesting(false)
    }
  }

  const moderateImageContent = async (imageUrl) => {
    try {
      setTesting(true)
      const result = await moderationApi.moderateImage(imageUrl)
      setTestResults({ type: 'image', result })
      return result
      
    } catch (error) {
      setError("Failed to moderate image content")
      throw error
    } finally {
      setTesting(false)
    }
  }

  const moderateBatchContent = async (textContent, imageUrl) => {
    try {
      setTesting(true)
      const result = await moderationApi.moderateBatch(textContent, imageUrl)
      setTestResults({ type: 'batch', result })
      return result
      
    } catch (error) {
      setError("Failed to moderate batch content")
      throw error
    } finally {
      setTesting(false)
    }
  }

  // Content management functions
  const approveContent = async (contentId, contentType) => {
    setError("Content approval functionality is not yet implemented in the backend.")
  }

  const flagContent = async (contentId, contentType, reason) => {
    setError("Content flagging functionality is not yet implemented in the backend.")
  }

  const blockContent = async (contentId, contentType, reason) => {
    setError("Content blocking functionality is not yet implemented in the backend.")
  }

  const handleTestTextModeration = async () => {
    if (!testContent.trim()) return
    await moderateTextContent(testContent)
  }

  const handleTestImageModeration = async () => {
    if (!testImageUrl.trim()) return
    await moderateImageContent(testImageUrl)
  }

  const handleTestBatchModeration = async () => {
    if (!testContent.trim() || !testImageUrl.trim()) return
    await moderateBatchContent(testContent, testImageUrl)
  }

  const getModerationBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'flagged':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>
      case 'blocked':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Blocked</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getActionButton = (action) => {
    const baseClass = "text-xs px-2 py-1 rounded"
    switch (action) {
      case 'allow':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>Allow</span>
      case 'flag':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Flag</span>
      case 'block':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>Block</span>
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Unknown</span>
    }
  }

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <Card className="w-96 relative z-10">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this page.
            </p>
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <GradientCircleBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-lg relative z-10"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <GradientCircleBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Content moderation and platform management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Moderation Service Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Moderation Service Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  moderationHealth?.status === 'healthy' ? 'bg-green-500' :
                  moderationHealth?.status === 'unhealthy' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">
                  {moderationHealth?.status === 'healthy' ? 'Healthy' :
                   moderationHealth?.status === 'unhealthy' ? 'Unhealthy' : 'Error'}
                </span>
              </div>
              <span className="text-muted-foreground">
                Backend Connected: {moderationHealth?.backend_connected ? 'Yes' : 'No'}
              </span>
              <Button variant="outline" size="sm" onClick={checkModerationHealth}>
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
            <TabsTrigger value="moderation">Test Moderation</TabsTrigger>
            <TabsTrigger value="content">All Content</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{questions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {questions.filter(q => q.moderationStatus === 'flagged').length} flagged
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{answers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {answers.filter(a => a.moderationStatus === 'flagged').length} flagged
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{flaggedContent.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires review
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flagged Content Tab */}
          <TabsContent value="flagged" className="space-y-6">
            {/* Notice about missing functionality */}
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Note: Content approval, flagging, and blocking functionality is not yet implemented in the backend. 
                These features will be available once the moderation endpoints are added to the API.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content Review</CardTitle>
              </CardHeader>
              <CardContent>
                {flaggedContent.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">No Flagged Content</h3>
                    <p className="text-muted-foreground">All content has been reviewed and approved.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flaggedContent.map((item) => (
                        <TableRow key={`${item.type}-${item.id}`}>
                          <TableCell>
                            <Badge variant="outline">
                              {item.title ? 'Question' : 'Answer'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {item.title || item.description}
                            </div>
                          </TableCell>
                          <TableCell>{item.user?.username}</TableCell>
                          <TableCell>{getModerationBadge(item.moderationStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700"
                                onClick={() => approveContent(item.id, item.type || 'question')}
                                disabled
                                title="Feature not yet implemented"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => blockContent(item.id, item.type || 'question', 'Blocked by admin')}
                                disabled
                                title="Feature not yet implemented"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Block
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Text Moderation Testing */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Text Moderation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Content to Test</Label>
                    <textarea
                      className="w-full mt-1 p-2 border rounded-md"
                      rows="4"
                      placeholder="Enter text content to test moderation..."
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleTestTextModeration} 
                    disabled={testing || !testContent.trim()}
                    className="w-full"
                  >
                    {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Test Text Moderation
                  </Button>
                </CardContent>
              </Card>

              {/* Image Moderation Testing */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Image Moderation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      placeholder="Enter image URL to test moderation..."
                      value={testImageUrl}
                      onChange={(e) => setTestImageUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleTestImageModeration} 
                    disabled={testing || !testImageUrl.trim()}
                    className="w-full"
                  >
                    {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Test Image Moderation
                  </Button>
                </CardContent>
              </Card>

              {/* Batch Moderation Testing */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Test Batch Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleTestBatchModeration} 
                    disabled={testing || !testContent.trim() || !testImageUrl.trim()}
                    className="w-full"
                  >
                    {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Test Batch Moderation (Text + Image)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Test Results */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm">{JSON.stringify(testResults.result, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Notice about missing functionality */}
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Note: Content moderation actions (approve/block) are not yet implemented in the backend API.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>All Content</CardTitle>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="flagged">Flagged</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Display filtered questions and answers */}
                    {[...questions, ...answers]
                      .filter(item => {
                        const matchesSearch = searchQuery === "" || 
                          (item.title || item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                        const matchesStatus = filterStatus === "all" || item.moderationStatus === filterStatus
                        return matchesSearch && matchesStatus
                      })
                      .slice(0, 50) // Limit for performance
                      .map((item) => (
                        <TableRow key={`${item.title ? 'question' : 'answer'}-${item.id}`}>
                          <TableCell>
                            <Badge variant="outline">
                              {item.title ? 'Question' : 'Answer'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {item.title || item.description}
                            </div>
                          </TableCell>
                          <TableCell>{item.user?.username}</TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getModerationBadge(item.moderationStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => approveContent(item.id, item.title ? 'question' : 'answer')}
                                disabled
                                title="Feature not yet implemented"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => blockContent(item.id, item.title ? 'question' : 'answer', 'Blocked by admin')}
                                disabled
                                title="Feature not yet implemented"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
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