"use client";

import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  LayoutDashboard,
  LogOut,
  User,
  BookOpen,
  Users,
  FolderPlus,
  Home,
  GraduationCap,
  X,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useSidebar,
} from "@/components/ui/sidebar";

export default function MainLayout({ children }) {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isAdmin = userRole === "admin";

  const menuItems = [
    { label: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      label: "Flashcards",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/flashcards",
    },
    {
      label: "Folders",
      icon: <FolderPlus className="h-5 w-5" />,
      path: "/folders",
    },
    ...(!isAdmin
      ? [
          {
            label: "My Classes",
            icon: <GraduationCap className="h-5 w-5" />,
            path: "/my-classes",
          },
        ]
      : [
          {
            label: "Manage Users",
            icon: <Users className="h-5 w-5" />,
            path: "/admin/users",
          },
          {
            label: "Manage Classes",
            icon: <GraduationCap className="h-5 w-5" />,
            path: "/admin/classes",
          },
        ]),
  ];

  // Separate component to access sidebar context
  const SidebarWithClose = () => {
    const { setOpenMobile } = useSidebar();

    return (
      <Sidebar className="fixed md:relative z-50 transition-transform duration-300">
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="text-xl font-bold text-primary">
              CardNest
            </Link>
            {/* Close button for mobile/tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted md:hidden"
              onClick={() => setOpenMobile(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 p-2">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                          ${
                            location.pathname === item.path
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted hover:text-primary"
                          }`}
                        onClick={() => {
                          // Close sidebar on mobile when clicking a menu item
                          if (window.innerWidth < 768) {
                            setOpenMobile(false);
                          }
                        }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
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
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {currentUser && <SidebarWithClose />}
        <SidebarInset className="w-full">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-1 items-center gap-4 px-4 w-full container mx-auto">
              {currentUser && (
                <SidebarTrigger className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
              )}
              {!currentUser && (
                <Link to="/" className="text-xl font-bold text-primary">
                  CardNest
                </Link>
              )}
              <div className="flex justify-end items-center gap-3 ml-auto">
                <ModeToggle />
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full hover:bg-muted"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={currentUser.photoURL || "/placeholder.svg"}
                            alt={currentUser.displayName}
                          />
                          <AvatarFallback>
                            {getInitials(currentUser.displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuLabel className="flex flex-col text-xs font-normal">
                        <span className="truncate">{currentUser?.email}</span>
                        <span className="text-muted-foreground">
                          {currentUser?.displayName}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled className="opacity-60">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive focus:text-destructive"
                      >
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
          <main className="flex-1 p-4 md:p-6 lg:p-8 container mx-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
