"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })

      // Set user role as "user" by default
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
      })

      return userCredential
    } catch (error) {
      throw error
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  async function fetchUserRole(user) {
    if (!user) return null

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserRole(userData.role)
        return userData.role
      }
      return null
    } catch (error) {
      console.error("Error fetching user role:", error)
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserRole(user)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    fetchUserRole,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
