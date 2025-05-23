"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, FolderOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "../ui/spinner"

export default function FolderList() {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchFolders() {
      try {
        setLoading(true)
        let foldersQuery

        if (userRole === "admin") {
          // Admins can see all folders
          foldersQuery = collection(db, "folders")
        } else {
          // Regular users can only see their own folders
          foldersQuery = query(collection(db, "folders"), where("createdBy", "==", currentUser.uid))
        }

        const querySnapshot = await getDocs(foldersQuery)
        const foldersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFolders(foldersData)
      } catch (error) {
        console.error("Error fetching folders:", error)
        toast.error("Error", {
          description: "Failed to load folders",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchFolders()
    }
  }, [currentUser, userRole, toast])

  const handleDeleteFolder = async (id) => {
    try {
      await deleteDoc(doc(db, "folders", id))
      setFolders(folders.filter((folder) => folder.id !== id))
      toast.success("Success", {
        description: "Folder deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting folder:", error)
      toast.error("Error", {
        description: "Failed to delete folder",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Folders</h2>
        <Button onClick={() => navigate("/folders/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading folders...</div>
      ) : folders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No folders found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/folders/new")}>
            Create your first folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card key={folder.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  {folder.name}
                </CardTitle>
                <CardDescription>
                  Created on {folder.createdAt?.toDate().toLocaleDateString() || "Unknown date"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate(`/flashcards?folder=${folder.id}`)}>
                  View Flashcards
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this folder? This action cannot be undone. Note: This will not
                        delete the flashcards inside the folder.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
