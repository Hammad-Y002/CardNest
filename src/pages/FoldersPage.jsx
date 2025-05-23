"use client"

import FolderList from "../components/folders/FolderList"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function FoldersPage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <FolderList />
    </div>
  )
}
