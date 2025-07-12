"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ArrowUp, Clock, CheckCircle } from "lucide-react"
import { fileUploadApi } from "@/lib/api"

export default function QuestionCard({ question }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return fileUploadApi.getFileUrl(avatarUrl)
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 bg-card/40 backdrop-blur-sm hover:bg-card/60">
      <CardHeader className="pb-3">
        <Link 
          href={`/question/${question.id}`} 
          className="group-hover:text-primary transition-colors duration-200"
        >
          <h3 className="text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary">
            {question.title}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-2 mt-3">
          {question.tags && question.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition-all duration-200 hover:scale-105"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 hover:text-accent transition-colors cursor-pointer">
              <ArrowUp className="h-4 w-4" />
              <span className="font-medium">{question.voteCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{question.answerCount || 0}</span>
              {question.hasAcceptedAnswer && (
                <CheckCircle className="h-3 w-3 text-green-500 ml-1" />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(question.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span>Views: {question.viewCount || 0}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 border border-border">
              <AvatarImage src={getAvatarUrl(question.user?.avatarUrl)} />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {(question.user?.username || question.author?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {question.user?.username || question.author?.username || 'Unknown'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
