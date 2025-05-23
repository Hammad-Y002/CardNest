"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Users, BookOpen, UserPlus } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "../ui/spinner"

export default function ClassManagement() {
  const [classes, setClasses] = useState([])
  const [users, setUsers] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [className, setClassName] = useState("")
  const [instituteName, setInstituteName] = useState("")
  const [classDescription, setClassDescription] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedFlashcards, setSelectedFlashcards] = useState([])
  const [selectedFolders, setSelectedFolders] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentClass, setCurrentClass] = useState(null)
  const [dialogType, setDialogType] = useState("create") // "create", "members", "flashcards", "manualAdd"
  const [manualMemberName, setManualMemberName] = useState("")
  const [manualMemberEmail, setManualMemberEmail] = useState("")
  const [manualMemberRoll, setManualMemberRoll] = useState("")
  const [activeTab, setActiveTab] = useState("flashcards") // "flashcards" or "folders"
  const { currentUser, userRole } = useAuth()

  useEffect(() => {
    async function fetchData() {
      if (userRole !== "admin") return

      try {
        setLoading(true)

        // Fetch classes
        const classesQuery = collection(db, "classes")
        const classesSnapshot = await getDocs(classesQuery)
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setClasses(classesData)

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUsers(usersData)

        // Fetch flashcards
        const flashcardsSnapshot = await getDocs(collection(db, "flashcards"))
        const flashcardsData = flashcardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFlashcards(flashcardsData)

        // Fetch folders
        const foldersSnapshot = await getDocs(collection(db, "folders"))
        const foldersData = foldersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setFolders(foldersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error", {
          description: "Failed to load data",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && userRole === "admin") {
      fetchData()
    }
  }, [currentUser, userRole, toast])

  const handleCreateClass = async (e) => {
    e.preventDefault()

    if (!className.trim()) {
      toast.error("Error", {
        description: "Class name is required",
      })
      return
    }

    try {
      const newClass = {
        name: className,
        institute: instituteName,
        description: classDescription,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [],
        flashcards: [],
        folders: [],
        manualMembers: [],
      }

      const docRef = await addDoc(collection(db, "classes"), newClass)

      setClasses([...classes, { id: docRef.id, ...newClass }])

      toast.success("Success", {
        description: "Class created successfully",
      })

      setClassName("")
      setInstituteName("")
      setClassDescription("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Error creating class:", error)
      toast.error("Error", {
        description: "Failed to create class: " + error.message,
      })
    }
  }

  const handleDeleteClass = async (classId) => {
    try {
      await deleteDoc(doc(db, "classes", classId))
      setClasses(classes.filter((c) => c.id !== classId))
      toast.success("Success", {
        description: "Class deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting class:", error)
      toast.error("Error", {
        description: "Failed to delete class",
      })
    }
  }

  const handleManageMembers = (classObj) => {
    setCurrentClass(classObj)
    setSelectedUsers(classObj.members || [])
    setDialogType("members")
    setDialogOpen(true)
  }

  const handleManualAddMember = (classObj) => {
    setCurrentClass(classObj)
    setManualMemberName("")
    setManualMemberEmail("")
    setManualMemberRoll("")
    setDialogType("manualAdd")
    setDialogOpen(true)
  }

  const handleManageMaterials = (classObj) => {
    setCurrentClass(classObj)
    setSelectedFlashcards(classObj.flashcards || [])
    setSelectedFolders(classObj.folders || [])
    setDialogType("materials")
    setActiveTab("flashcards")
    setDialogOpen(true)
  }

  const handleUpdateMembers = async () => {
    try {
      await updateDoc(doc(db, "classes", currentClass.id), {
        members: selectedUsers,
      })

      setClasses(classes.map((c) => (c.id === currentClass.id ? { ...c, members: selectedUsers } : c)))

      toast.success("Success", {
        description: "Class members updated successfully",
      })

      setDialogOpen(false)
    } catch (error) {
      console.error("Error updating class members:", error)
      toast.error("Error", {
        description: "Failed to update class members",
      })
    }
  }

  const handleAddManualMember = async () => {
    if (!manualMemberName || !manualMemberEmail) {
      toast.error("Error", {
        description: "Name and email are required",
      })
      return
    }

    try {
      const newManualMember = {
        name: manualMemberName,
        email: manualMemberEmail,
        roll: manualMemberRoll || "",
        addedAt: new Date().toISOString(),
      }

      const updatedManualMembers = [...(currentClass.manualMembers || []), newManualMember]

      await updateDoc(doc(db, "classes", currentClass.id), {
        manualMembers: updatedManualMembers,
      })

      setClasses(classes.map((c) => (c.id === currentClass.id ? { ...c, manualMembers: updatedManualMembers } : c)))

      toast.success("Success", {
        description: "Member added successfully",
      })

      setDialogOpen(false)
    } catch (error) {
      console.error("Error adding manual member:", error)
      toast.error("Error", {
        description: "Failed to add member",
      })
    }
  }

  const handleUpdateMaterials = async () => {
    try {
      await updateDoc(doc(db, "classes", currentClass.id), {
        flashcards: selectedFlashcards,
        folders: selectedFolders,
      })

      setClasses(
        classes.map((c) =>
          c.id === currentClass.id ? { ...c, flashcards: selectedFlashcards, folders: selectedFolders } : c,
        ),
      )

      toast.success("Success", {
        description: "Class materials updated successfully",
      })

      setDialogOpen(false)
    } catch (error) {
      console.error("Error updating class materials:", error)
      toast.error("Error", {
        description: "Failed to update class materials",
      })
    }
  }

  const toggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const toggleFlashcard = (flashcardId) => {
    if (selectedFlashcards.includes(flashcardId)) {
      setSelectedFlashcards(selectedFlashcards.filter((id) => id !== flashcardId))
    } else {
      setSelectedFlashcards([...selectedFlashcards, flashcardId])
    }
  }

  const toggleFolder = (folderId) => {
    if (selectedFolders.includes(folderId)) {
      setSelectedFolders(selectedFolders.filter((id) => id !== folderId))
    } else {
      setSelectedFolders([...selectedFolders, folderId])
    }
  }

  const openCreateDialog = () => {
    setDialogType("create")
    setClassName("")
    setInstituteName("")
    setClassDescription("")
    setDialogOpen(true)
  }

  if (userRole !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Manage your classes, members, and assigned materials</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 flex items-center gap-2 justify-center w-full"><Spinner size="small" /> Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No classes found</p>
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                Create your first class
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Institute</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classObj) => (
                  <TableRow key={classObj.id}>
                    <TableCell className="font-medium">{classObj.name}</TableCell>
                    <TableCell>{classObj.institute || "Not specified"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleManageMembers(classObj)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage ({(classObj.members?.length || 0) + (classObj.manualMembers?.length || 0)})
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleManualAddMember(classObj)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleManageMaterials(classObj)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Share ({(classObj.flashcards?.length || 0) + (classObj.folders?.length || 0)})
                      </Button>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Class</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this class? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClass(classObj.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog
        open={dialogOpen && dialogType === "create"}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>Create a new class for organizing flashcards and users</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClass}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input id="instituteName" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classDescription">Description (Optional)</Label>
                <Textarea
                  id="classDescription"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Class</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog
        open={dialogOpen && dialogType === "members"}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Class Members</DialogTitle>
            <DialogDescription>{currentClass?.name} - Select users to add to this class</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateMembers}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Add Member Dialog */}
      <Dialog
        open={dialogOpen && dialogType === "manualAdd"}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manually Add Member</DialogTitle>
            <DialogDescription>
              {currentClass?.name} - Add a member who is not registered in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Full Name</Label>
              <Input
                id="memberName"
                value={manualMemberName}
                onChange={(e) => setManualMemberName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberEmail">Email Address</Label>
              <Input
                id="memberEmail"
                type="email"
                value={manualMemberEmail}
                onChange={(e) => setManualMemberEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberRoll">Roll Number (Optional)</Label>
              <Input id="memberRoll" value={manualMemberRoll} onChange={(e) => setManualMemberRoll(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddManualMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Materials Dialog */}
      <Dialog
        open={dialogOpen && dialogType === "materials"}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Share Materials</DialogTitle>
            <DialogDescription>{currentClass?.name} - Select materials to share with this class</DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="folders">Folders</TabsTrigger>
            </TabsList>
            <TabsContent value="flashcards">
              <div className="py-4 max-h-[300px] overflow-y-auto">
                {flashcards.length === 0 ? (
                  <p className="text-center text-muted-foreground">No flashcards found</p>
                ) : (
                  <div className="space-y-2">
                    {flashcards.map((flashcard) => (
                      <div key={flashcard.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`flashcard-${flashcard.id}`}
                          checked={selectedFlashcards.includes(flashcard.id)}
                          onChange={() => toggleFlashcard(flashcard.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`flashcard-${flashcard.id}`} className="text-sm">
                          {flashcard.question.substring(0, 50)}
                          {flashcard.question.length > 50 ? "..." : ""}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="folders">
              <div className="py-4 max-h-[300px] overflow-y-auto">
                {folders.length === 0 ? (
                  <p className="text-center text-muted-foreground">No folders found</p>
                ) : (
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <div key={folder.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`folder-${folder.id}`}
                          checked={selectedFolders.includes(folder.id)}
                          onChange={() => toggleFolder(folder.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`folder-${folder.id}`} className="text-sm">
                          {folder.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button onClick={handleUpdateMaterials}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
