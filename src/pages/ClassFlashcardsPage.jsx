"use client"

import ClassFlashcards from "../components/classes/ClassFlashcards"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function ClassFlashcardsPage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <ClassFlashcards />
    </div>
  )
}
