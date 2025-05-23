"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FolderPlus, Users } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
// import { useEffect } from "react"
// import { collection, getDocs } from "firebase/firestore"
// import { db } from "../lib/firebase"

export default function HomePage() {
  const { currentUser, userRole } = useAuth()

  // useEffect(() => {
  //   const testConnection = async () => {
  //     try {
  //       const docRef = collection(db, "testCollection");
  //       console.log("Firestore connection successful:", docRef);
  //     } catch (error) {
  //       console.error("Firestore connection failed:", error.message);
  //     }
  //   };
  //   testConnection();
  // }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to CardNest</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The ultimate flashcard quiz hub for online learning and quizzes
        </p>
        {!currentUser && (
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Create Flashcards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create customized flashcards with questions and answers to help you study effectively.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to={currentUser ? "/flashcards/new" : "/signup"}>
                {currentUser ? "Create Flashcard" : "Sign Up to Create"}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderPlus className="mr-2 h-5 w-5" />
              Organize with Folders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Keep your flashcards organized by creating folders for different subjects or topics.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to={currentUser ? "/folders" : "/signup"}>
                {currentUser ? "Manage Folders" : "Sign Up to Organize"}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {userRole === "admin" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Manage Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create and manage classes, add members, and assign flashcards to your students.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/classes">Manage Classes</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Join Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Join classes created by your teachers to access shared flashcards and study materials.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={currentUser ? "/dashboard" : "/signup"}>
                  {currentUser ? "View Classes" : "Sign Up to Join"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Why Choose CardNest?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
            <p className="text-muted-foreground">Create flashcards in seconds with our intuitive interface.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Organized Learning</h3>
            <p className="text-muted-foreground">Keep your study materials organized with folders and classes.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Collaborative</h3>
            <p className="text-muted-foreground">Share flashcards with classmates and teachers for better learning.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
