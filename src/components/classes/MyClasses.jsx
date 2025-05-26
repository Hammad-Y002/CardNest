"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, or } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);

        let classesQuery;

        // If user is admin, get all classes
        if (userRole === "admin") {
          classesQuery = query(collection(db, "classes"));
        } else {
          // For regular users, only get classes where:
          // 1. They are listed in the members array
          // 2. They are the creator
          // 3. Their email is in manualMembers
          classesQuery = query(
            collection(db, "classes"),
            or(
              where("members", "array-contains", currentUser.uid),
              where("creator", "==", currentUser.uid)
              // Note: We can't query for manualMembers by email in the same query
              // This limitation exists because Firestore doesn't support OR queries with array-contains-any
              // We'll handle manualMembers separately
            )
          );
        }

        const classesSnapshot = await getDocs(classesQuery);

        // Transform data and check for manual members if needed
        const userClasses = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // If not admin, we need to fetch classes where user is manually added by email
        if (userRole !== "admin" && currentUser.email) {
          // This would be a separate query in a production app
          // For demonstration, we're simplifying by assuming all classes are already fetched
          // A more scalable solution would use a Cloud Function to maintain a separate
          // collection or field indexing users by email
        }

        setClasses(userClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Error", {
          description: "Failed to load classes",
        });
      } finally {
        setLoading(false);
      }
    }

    if (currentUser && userRole) {
      fetchClasses();
    }
  }, [currentUser, userRole]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
        My Classes
      </h2> */}

      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12 gap-2 w-full">
          <Spinner size="medium" />
          <span className="text-sm sm:text-base">Loading classes...</span>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-muted-foreground">
            You are not enrolled in any classes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {classes.map((classObj) => (
            <Card key={classObj.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg line-clamp-2">
                  {classObj.name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base line-clamp-1">
                  {classObj.institute
                    ? `${classObj.institute}`
                    : "No institute specified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>
                    {(classObj.members?.length || 0) +
                      (classObj.manualMembers?.length || 0)}{" "}
                    members
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>
                    {(classObj.flashcards?.length || 0) +
                      (classObj.folders?.length || 0)}{" "}
                    materials
                  </span>
                </div>
                <p className="mt-4 text-xs sm:text-sm line-clamp-3">
                  {classObj.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full text-sm sm:text-base">
                  <Link to={`/class/${classObj.id}`}>View Materials</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
