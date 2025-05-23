"use client"
import { useNavigate, Link, useLocation } from "react-router-dom" // Added useLocation
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { LayoutDashboard, LogOut, User, BookOpen, Users, FolderPlus, Home, GraduationCap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function MainLayout({ children }) {
  const { currentUser, logout, userRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() // Get the current location

  async function handleLogout() {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isAdmin = userRole === "admin"

  const menuItems = [
    { label: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { label: "Flashcards", icon: <BookOpen className="h-5 w-5" />, path: "/flashcards" },
    { label: "Folders", icon: <FolderPlus className="h-5 w-5" />, path: "/folders" },
  ]

  // Add My Classes for regular users
  if (!isAdmin) {
    menuItems.push({ label: "My Classes", icon: <GraduationCap className="h-5 w-5" />, path: "/my-classes" })
  }

  if (isAdmin) {
    menuItems.push(
      { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin/users" },
      { label: "Manage Classes", icon: <GraduationCap className="h-5 w-5" />, path: "/admin/classes" },
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {currentUser && (
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-2">
                <Link to="/" className="text-xl font-bold text-primary">
                  CardNest
                </Link>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.path}
                            className={`flex items-center ${
                              location.pathname === item.path ? "bg-primary text-white" : ""
                            }`}
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
        )}
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            {currentUser && <SidebarTrigger className="-ml-1" />}
            <div className="flex flex-1 items-center justify-between w-full container mx-auto">
              {!currentUser && (
                <Link to="/" className="text-xl font-bold text-primary">
                  CardNest
                </Link>
              )}
              <div className="flex justify-end items-center gap-2 w-full">
                <ModeToggle />
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.photoURL || "/placeholder.svg"} alt={currentUser.displayName} />
                          <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuLabel className="flex flex-col text-xs">
                        <span>{currentUser?.email}</span>
                        <span>{currentUser?.displayName}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => navigate("/login")}>Login</Button>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 container mx-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}