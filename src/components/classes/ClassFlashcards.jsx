"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"

export default function ClassFlashcards() {
  const { classId } = useParams()
  const [classData, setClassData] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [folderFlashcards, setFolderFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchClassData() {
      try {
        setLoading(true)

        // Fetch class data
        const classDocRef = doc(db, "classes", classId)
        const classDoc = await getDoc(classDocRef)

        if (!classDoc.exists()) {
          toast.error("Error", {
            description: "Class not found",
          })
          navigate("/my-classes")
          return
        }

        const classData = { id: classDoc.id, ...classDoc.data() }
        setClassData(classData)

        // Check if user has access to this class
        const isMember = classData.members && classData.members.includes(currentUser.uid)
        const isManualMember =
          classData.manualMembers && classData.manualMembers.some((member) => member.email === currentUser.email)

        if (!isMember && !isManualMember) {
          toast.error("Access Denied",{
            description: "You do not have access to this class",
          })
          navigate("/my-classes")
          return
        }

        // Fetch flashcards directly assigned to the class
        const flashcardIds = classData.flashcards || []
        const fetchedFlashcards = []

        for (const flashcardId of flashcardIds) {
          const flashcardDoc = await getDoc(doc(db, "flashcards", flashcardId))
          if (flashcardDoc.exists()) {
            fetchedFlashcards.push({ id: flashcardDoc.id, ...flashcardDoc.data() })
          }
        }

        setFlashcards(fetchedFlashcards)

        // Fetch flashcards from folders assigned to the class
        const folderIds = classData.folders || []
        const fetchedFolderFlashcards = []

        for (const folderId of folderIds) {
          const folderFlashcardsQuery = query(collection(db, "flashcards"), where("folderId", "==", folderId))
          const folderFlashcardsSnapshot = await getDocs(folderFlashcardsQuery)

          folderFlashcardsSnapshot.forEach((doc) => {
            fetchedFolderFlashcards.push({ id: doc.id, ...doc.data() })
          })
        }

        setFolderFlashcards(fetchedFolderFlashcards)
      } catch (error) {
        console.error("Error fetching class data:", error)
        toast.error("Error", {
          description: "Failed to load class materials",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && classId) {
      fetchClassData()
    }
  }, [classId, currentUser, navigate, toast])

  // Combine flashcards from direct assignments and folders
  const allFlashcards = [...flashcards, ...folderFlashcards]

  // const handleFlip = () => {
  //   setFlipped(!flipped)
  // }

  const handleNext = () => {
    // setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allFlashcards.length)
  }

  const handlePrevious = () => {
    // setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allFlashcards.length) % allFlashcards.length)
  }

  if (loading) {
    return <div className="text-center py-8 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading class materials...</div>
  }

  if (allFlashcards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/my-classes")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <h2 className="text-2xl font-bold">{classData?.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Flashcards Available</CardTitle>
            <CardDescription>There are no flashcards shared in this class yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentFlashcard = allFlashcards[currentIndex]

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/my-classes")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
        <h2 className="text-2xl font-bold">{classData?.name}</h2>
      </div>

      <div className="text-center mb-4">
        <p>
          Flashcard {currentIndex + 1} of {allFlashcards.length}
        </p>
      </div>

      <Card className="h-64">
        <CardContent className="p-0 h-full flex flex-col items-center justify-center">
          <div className="p-6 text-center w-full">
            <div className="mb-4 flex gap-2 items-center justify-center">
              <p className="text-lg text-muted-foreground">Title:</p>
              <p className="text-lg font-bold">{currentFlashcard.title}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Question</p>
              <p className="text-lg font-bold">{currentFlashcard.question}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Answer</p>
              <p className="text-lg">{currentFlashcard.answer}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
