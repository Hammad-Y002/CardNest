"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FolderPlus, Plus, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import DashboardCharts from "../components/dashboard/DashboardCharts"
import { Spinner } from "../components/ui/spinner"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    flashcards: 0,
    folders: 0,
    classes: 0,
  })
  const [loading, setLoading] = useState(true)
  const { currentUser, userRole } = useAuth()

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        // Fetch flashcard count
        let flashcardsQuery
        if (userRole === "admin") {
          // Admins can see all flashcards
          flashcardsQuery = collection(db, "flashcards")
        } else {
          // Regular users can only see their own flashcards
          flashcardsQuery = query(collection(db, "flashcards"), where("createdBy", "==", currentUser.uid))
        }
        const flashcardsSnapshot = await getDocs(flashcardsQuery)

        // Fetch folder count
        let foldersQuery
        if (userRole === "admin") {
          // Admins can see all folders
          foldersQuery = collection(db, "folders")
        } else {
          // Regular users can only see their own folders
          foldersQuery = query(collection(db, "folders"), where("createdBy", "==", currentUser.uid))
        }
        const foldersSnapshot = await getDocs(foldersQuery)

        // Fetch class count (for admins)
        let classesCount = 0
        if (userRole === "admin") {
          const classesQuery = collection(db, "classes")
          const classesSnapshot = await getDocs(classesQuery)
          classesCount = classesSnapshot.size
        } else {
          // For regular users, count classes they're members of
          const classesQuery = collection(db, "classes")
          const classesSnapshot = await getDocs(classesQuery)
          classesCount = classesSnapshot.docs.filter(
            (doc) => doc.data().members && doc.data().members.includes(currentUser.uid),
          ).length
        }

        setStats({
          flashcards: flashcardsSnapshot.size,
          folders: foldersSnapshot.size,
          classes: classesCount,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchStats()
    }
  }, [currentUser, userRole])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loading ? (
        <div className="text-center py-8 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading dashboard data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.flashcards}</p>
                <p className="text-muted-foreground">
                  Total flashcards {userRole === "admin" ? "in system" : "created"}
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/flashcards">View Flashcards</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FolderPlus className="mr-2 h-5 w-5" />
                  Folders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.folders}</p>
                <p className="text-muted-foreground">Total folders {userRole === "admin" ? "in system" : "created"}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to="/folders">View Folders</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.classes}</p>
                <p className="text-muted-foreground">
                  {userRole === "admin" ? "Total classes created" : "Classes you're a member of"}
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={userRole === "admin" ? "/admin/classes" : "/my-classes"}>
                    {userRole === "admin" ? "Manage Classes" : "View Classes"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to perform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/flashcards/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Flashcard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/folders/new">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create New Folder
                  </Link>
                </Button>
                {userRole === "admin" ? (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/classes">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Manage Classes
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/my-classes">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      My Classes
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <DashboardCharts />
          </div>
        </>
      )}
    </div>
  )
}
