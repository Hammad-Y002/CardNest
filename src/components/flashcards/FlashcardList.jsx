"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, FolderPlus, Edit } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FlashcardItem from "./FlashcardItem"
import { Spinner } from "../ui/spinner"

export default function FlashcardList() {
  const [flashcards, setFlashcards] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [editingFlashcard, setEditingFlashcard] = useState(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [editFolderId, setEditFolderId] = useState(null)
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true)
        let flashcardsQuery

        if (userRole === "admin") {
          // Admins can see all flashcards
          flashcardsQuery = collection(db, "flashcards")
        } else {
          // Regular users can only see their own flashcards
          flashcardsQuery = query(collection(db, "flashcards"), where("createdBy", "==", currentUser.uid))
        }

        const querySnapshot = await getDocs(flashcardsQuery)
        const flashcardsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFlashcards(flashcardsData)
      } catch (error) {
        console.error("Error fetching flashcards:", error)
        toast.error("Error", {
          description: "Failed to load flashcards",
        })
      } finally {
        setLoading(false)
      }
    }

    async function fetchFolders() {
      try {
        let foldersQuery

        if (userRole === "admin") {
          // Admins can see all folders
          foldersQuery = collection(db, "folders")
        } else {
          // Regular users can only see their own folders
          foldersQuery = query(collection(db, "folders"), where("createdBy", "==", currentUser.uid))
        }

        const querySnapshot = await getDocs(foldersQuery)
        const foldersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFolders(foldersData)
      } catch (error) {
        console.error("Error fetching folders:", error)
      }
    }

    if (currentUser) {
      fetchFlashcards()
      fetchFolders()
    }
  }, [currentUser, userRole, toast])

  const handleDeleteFlashcard = async (id) => {
    try {
      await deleteDoc(doc(db, "flashcards", id))
      setFlashcards(flashcards.filter((flashcard) => flashcard.id !== id))
      toast.success("Success", {
        description: "Flashcard deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting flashcard:", error)
      toast.error("Error", {
        description: "Failed to delete flashcard",
      })
    }
  }

  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcard(flashcard)
    setEditTitle(flashcard.title)
    setEditQuestion(flashcard.question)
    setEditAnswer(flashcard.answer)
    setEditFolderId(flashcard.folderId || null)
  }

  const handleSaveEdit = async () => {
    if (!editQuestion.trim() || !editAnswer.trim() || !editTitle.trim()) {
      toast.error("Error", {
        description: "Question, answer, and title cannot be empty",
      })
      return
    }

    try {
      await updateDoc(doc(db, "flashcards", editingFlashcard.id), {
        title: editTitle,
        question: editQuestion,
        answer: editAnswer,
        folderId: editFolderId, // Update the folder ID
      })

      // Update the flashcard in the state
      setFlashcards(
        flashcards.map((flashcard) =>
          flashcard.id === editingFlashcard.id
            ? { ...flashcard, question: editQuestion, answer: editAnswer, title: editTitle, folderId: editFolderId }
            : flashcard,
        ),
      )

      toast.success("Success", {
        description: "Flashcard updated successfully",
      })

      // Reset the editing state
      setEditingFlashcard(null)
      setEditTitle("")
      setEditQuestion("")
      setEditAnswer("")
      setEditFolderId(null)
    } catch (error) {
      console.error("Error updating flashcard:", error)
      toast.error("Error", {
        description: "Failed to update flashcard",
      })
    }
  }

  const filteredFlashcards =
    selectedFolder === "all"
      ? flashcards
      : selectedFolder === "unorganized"
        ? flashcards.filter((flashcard) => !flashcard.folderId)
        : flashcards.filter((flashcard) => flashcard.folderId === selectedFolder)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/folders/new")}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={() => navigate("/flashcards/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Flashcard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedFolder} onValueChange={setSelectedFolder}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Flashcards</TabsTrigger>
          <TabsTrigger value="unorganized">Unorganized</TabsTrigger>
          {folders.map((folder) => (
            <TabsTrigger key={folder.id} value={folder.id}>
              {folder.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedFolder}>
          {loading ? (
            <div className="text-center py-8 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading flashcards...</div>
          ) : filteredFlashcards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No flashcards found</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/flashcards/new")}>
                Create your first flashcard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map((flashcard) => (
                <Card key={flashcard.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <FlashcardItem flashcard={flashcard} />
                    <div className="p-4 flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditFlashcard(flashcard)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this flashcard? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteFlashcard(flashcard.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Flashcard Dialog */}
      <Dialog open={!!editingFlashcard} onOpenChange={(open) => !open && setEditingFlashcard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>Update the details for this flashcard.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter a title, like “Biology - Chapter 22: Evolution”"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question</Label>
              <Textarea
                id="edit-question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-folder">Folder</Label>
              <Select value={editFolderId} onValueChange={setEditFolderId}>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFlashcard(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
