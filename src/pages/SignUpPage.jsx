"use client"

import SignUpForm from "../components/auth/SignUpForm"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function SignUpPage() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  // Example implementation in your signup form component
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      // Redirect or show success message
      router.push("/login"); // or wherever you want to redirect after successful signup
    } catch (error) {
      // Handle the error and display it to the user
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-57px)]">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
