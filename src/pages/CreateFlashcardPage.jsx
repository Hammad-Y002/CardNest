"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import FlashcardForm from "../components/flashcards/FlashcardForm"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function CreateFlashcardPage() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    async function fetchFolders() {
      try {
        setLoading(true)
        const foldersQuery = query(collection(db, "folders"), where("createdBy", "==", currentUser.uid))
        const querySnapshot = await getDocs(foldersQuery)
        const foldersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFolders(foldersData)
      } catch (error) {
        console.error("Error fetching folders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchFolders()
    }
  }, [currentUser])

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FlashcardForm folders={folders} />
    </div>
  )
}
