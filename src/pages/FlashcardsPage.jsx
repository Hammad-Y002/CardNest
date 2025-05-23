"use client"

import FlashcardList from "../components/flashcards/FlashcardList"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function FlashcardsPage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <FlashcardList />
    </div>
  )
}
