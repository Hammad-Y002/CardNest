"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"


export default function FlashcardForm({ folders = [] }) {
  const [question, setQuestion] = useState("")
  const [title, setTitle] = useState("")
  const [answer, setAnswer] = useState("")
  const [folderId, setFolderId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!question.trim() || !answer.trim()) {
      return setError("Question and answer cannot be empty")
    }

    try {
      setError("")
      setLoading(true)

      const flashcardData = {
        title,
        question,
        answer,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      }

      if (folderId !== null) {
        flashcardData.folderId = folderId
      }

      await addDoc(collection(db, "flashcards"), flashcardData)

      toast.success("Success",{
        description: "Flashcard created successfully",
      })

      // Reset form
      setTitle("")
      setQuestion("")
      setAnswer("")
      setFolderId(null)

      // Navigate to flashcards page
      navigate("/flashcards")
    } catch (error) {
      setError("Failed to create flashcard: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Flashcard</CardTitle>
        <CardDescription>Add a new flashcard to your collection</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title, like “Biology - Chapter 22: Evolution”"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              // className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Enter the question or front side of your flashcard"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer or back side of your flashcard"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          {folders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/flashcards")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Flashcard"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
