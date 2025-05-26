"use client";

import MyClasses from "../components/classes/MyClasses";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function MyClassesPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-screen flex flex-col">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center">
        My Classes
      </h1>
      <div className="flex-1">
        <MyClasses />
      </div>
    </div>
  );
}
