import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import MainLayout from "./components/layout/MainLayout"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import DashboardPage from "./pages/DashboardPage"
import FlashcardsPage from "./pages/FlashcardsPage"
import CreateFlashcardPage from "./pages/CreateFlashcardPage"
import FoldersPage from "./pages/FoldersPage"
import CreateFolderPage from "./pages/CreateFolderPage"
import UsersPage from "./pages/admin/UsersPage"
import ClassesPage from "./pages/admin/ClassesPage"
import MyClassesPage from "./pages/MyClassesPage"
import ClassFlashcardsPage from "./pages/ClassFlashcardsPage"
import FlashcardDetailsPage from "./components/flashcards/FlashcardDetailsPage"

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/flashcards/:flashcardId" element={<FlashcardDetailsPage />} />
              <Route path="/flashcards/new" element={<CreateFlashcardPage />} />
              <Route path="/folders" element={<FoldersPage />} />
              <Route path="/folders/new" element={<CreateFolderPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/classes" element={<ClassesPage />} />
              <Route path="/my-classes" element={<MyClassesPage />} />
              <Route path="/class/:classId" element={<ClassFlashcardsPage />} />
            </Routes>
          </MainLayout>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
