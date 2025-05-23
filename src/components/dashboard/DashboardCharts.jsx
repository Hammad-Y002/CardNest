"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Spinner } from "../ui/spinner"

export default function DashboardCharts() {
  const [userData, setUserData] = useState([])
  const [flashcardData, setFlashcardData] = useState([])
  const [classData, setClassData] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userRole } = useAuth()

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true)

        // Fetch users data for admin
        if (userRole === "admin") {
          const usersSnapshot = await getDocs(collection(db, "users"))
          const usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setUserData(usersData)
        }

        // Fetch flashcards data
        let flashcardsQuery
        if (userRole === "admin") {
          flashcardsQuery = collection(db, "flashcards")
        } else {
          flashcardsQuery = query(collection(db, "flashcards"), where("createdBy", "==", currentUser.uid))
        }
        const flashcardsSnapshot = await getDocs(flashcardsQuery)
        const flashcardsData = flashcardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setFlashcardData(flashcardsData)

        // Fetch classes data
        let classesQuery
        if (userRole === "admin") {
          classesQuery = collection(db, "classes")
        } else {
          classesQuery = collection(db, "classes")
        }
        const classesSnapshot = await getDocs(classesQuery)
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setClassData(classesData)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchChartData()
    }
  }, [currentUser, userRole])

  // Prepare data for charts
  const userRoleData = userData.reduce(
    (acc, user) => {
      if (user.role === "admin") {
        acc[0].value++
      } else {
        acc[1].value++
      }
      return acc
    },
    [
      { name: "Admins", value: 0 },
      { name: "Users", value: 0 },
    ],
  )

  // Prepare flashcard data by folder
  const folderFlashcardCounts = flashcardData.reduce((acc, flashcard) => {
    const folderId = flashcard.folderId || "Unorganized"
    acc[folderId] = (acc[folderId] || 0) + 1
    return acc
  }, {})

  const folderFlashcardData = Object.entries(folderFlashcardCounts).map(([folderId, count]) => ({
    name: folderId === "Unorganized" ? "Unorganized" : folderId,
    value: count,
  }))

  // Prepare class member data
  const classMemberData = classData.map((classObj) => ({
    name: classObj.name,
    members: (classObj.members?.length || 0) + (classObj.manualMembers?.length || 0),
    materials: (classObj.flashcards?.length || 0) + (classObj.folders?.length || 0),
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (loading) {
    return <div className="text-center py-4 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading charts...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Visual representation of your data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flashcards">
          <TabsList className="mb-4">
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="users">Users</TabsTrigger>}
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={folderFlashcardData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {folderFlashcardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="users">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#00C49F" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          )}

          <TabsContent value="classes">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classMemberData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" fill="#0088FE" name="Members" />
                  <Bar dataKey="materials" fill="#00C49F" name="Materials" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
