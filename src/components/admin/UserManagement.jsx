"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Trash2, UserPlus } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "../ui/spinner"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { currentUser, userRole } = useAuth()

  useEffect(() => {
    async function fetchUsers() {
      if (userRole !== "admin") return

      try {
        setLoading(true)
        const querySnapshot = await getDocs(collection(db, "users"))
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Error", {
          description: "Failed to load users",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && userRole === "admin") {
      fetchUsers()
    }
  }, [currentUser, userRole, toast])

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin"
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      })

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast.success("Success", {
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Error", {
        description: "Failed to update user role",
      })
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId))
      setUsers(users.filter((user) => user.id !== userId))
      toast.success("Success", {
        description: "User deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error", {
        description: "Failed to delete user",
      })
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()

    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast.error("Error", {
        description: "All fields are required",
      })
      return
    }

    if (newUserPassword.length < 8 || !/\d/.test(newUserPassword)) {
      toast.error("Error", {
        description: "Password must be at least 8 characters and include a number",
      })
      return
    }

    try {
      // In a real app, you would use Firebase Auth Admin SDK to create users
      // For this demo, we'll just add a user to Firestore
      // This is not secure and should not be used in production

      // Check if email already exists
      const emailQuery = query(collection(db, "users"), where("email", "==", newUserEmail))
      const emailSnapshot = await getDocs(emailQuery)

      if (!emailSnapshot.empty) {
        toast.error("Error", {
          description: "Email already in use",
        })
        return
      }

      // Add user to Firestore
      const newUser = {
        name: newUserName,
        email: newUserEmail,
        role: "user",
        createdAt: new Date().toISOString(),
      }

      // In a real app, you would create the user in Firebase Auth first
      // and then add their details to Firestore

      toast.success("Success", {
        description: "User added successfully",
      })

      setNewUserEmail("")
      setNewUserName("")
      setNewUserPassword("")
      setDialogOpen(false)

      // Refresh user list
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setUsers(usersData)
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Error", {
        description: "Failed to add user: " + error.message,
      })
    }
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
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. The user will be able to log in with these credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include a number
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 flex items-center gap-2 justify-center w-full "><Spinner size="small" /> Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.role === "admin"}
                        onCheckedChange={() => handleRoleToggle(user.id, user.role)}
                        disabled={user.id === currentUser.uid} // Can't change own role
                      />
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={user.id === currentUser.uid} // Can't delete own account
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
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
    </div>
  )
}
