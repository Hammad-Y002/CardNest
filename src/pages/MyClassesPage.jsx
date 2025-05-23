"use client"

import MyClasses from "../components/classes/MyClasses"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function MyClassesPage() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <MyClasses />
    </div>
  )
}
