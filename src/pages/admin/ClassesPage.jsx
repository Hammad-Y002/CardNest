"use client"

import ClassManagement from "../../components/admin/ClassManagement"
import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function ClassesPage() {
  const { currentUser, userRole } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  if (userRole !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <ClassManagement />
    </div>
  )
}
