"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import RichTextEditor from "@/components/RichTextEditor"
import GradientCircleBackground from "@/components/GradientCircleBackground"
import { X, Plus } from "lucide-react"

export default function AskQuestionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock question ID
      const questionId = Date.now().toString()

      // Redirect to the new question
      router.push(`/question/${questionId}`)
    } catch (error) {
      console.error("Error submitting question:", error)
    } finally {
      setSubmitting(false)
    }
  }

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
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
        <Card className="bg-card/95 border-border shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center md:text-left">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ask a Question
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Be specific and imagine you're asking a question to another person
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-medium text-base">Title</Label>
                <Input
                  id="title"
                  placeholder="What's your programming question? Be specific."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-input/80 border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary transition-all text-base h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Be specific and imagine you're asking a question to another person
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-foreground">Description</Label>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Provide more details about your question. Include what you've tried and what you expected to happen."
                />
                <p className="text-sm text-muted-foreground">
                  Include all the information someone would need to answer your question
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-base">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition-all hover:scale-105"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)} 
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag (e.g., javascript, react, nodejs)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className="bg-input/80 border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary transition-all"
                  />
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    variant="outline" 
                    size="icon" 
                    className="border-border hover:bg-accent/20 hover:border-accent transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Add up to 5 tags to describe what your question is about</p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting || !title.trim() || !description.trim()} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all font-medium px-8"
                >
                  {submitting ? "Publishing..." : "Publish Question"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()} 
                  className="border-border text-foreground hover:bg-muted/80 transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
