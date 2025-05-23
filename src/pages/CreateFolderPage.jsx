"use client"

import FolderForm from "../components/folders/FolderForm"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function CreateFolderPage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FolderForm />
    </div>
  )
}
