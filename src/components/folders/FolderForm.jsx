"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"


export default function FolderForm() {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      return setError("Folder name cannot be empty")
    }

    if (name.length > 50) {
      return setError("Folder name cannot exceed 50 characters")
    }

    try {
      setError("")
      setLoading(true)

      await addDoc(collection(db, "folders"), {
        name,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      })

      toast.success("Success",{
        description: "Folder created successfully",
      })

      navigate("/folders")
    } catch (error) {
      setError("Failed to create folder: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Folder</CardTitle>
        <CardDescription>Create a new folder to organize your flashcards</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Maximum 50 characters</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate("/folders")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
