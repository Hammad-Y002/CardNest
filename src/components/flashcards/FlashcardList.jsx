"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, FolderPlus, Edit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FlashcardItem from "./FlashcardItem";
import { Spinner } from "../ui/spinner";

// Utility to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FlashcardList() {
  const [flashcards, setFlashcards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editFolderId, setEditFolderId] = useState(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const urlQuery = useQuery(); // Renamed to avoid shadowing Firestore query

  // Set initial selectedFolder based on URL query parameter
  useEffect(() => {
  const folderId = urlQuery.get("folder");
  const filter = urlQuery.get("filter");
  
  if (folderId) {
    setSelectedFolder(folderId);
  } else if (filter === "unorganized") {
    setSelectedFolder("unorganized");
  } else {
    setSelectedFolder("all");
  }
}, [urlQuery]);

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true);
        let flashcardsQuery;

        if (userRole === "admin") {
          flashcardsQuery = collection(db, "flashcards");
        } else {
          flashcardsQuery = query(
            collection(db, "flashcards"),
            where("createdBy", "==", currentUser.uid)
          );
        }

        const querySnapshot = await getDocs(flashcardsQuery);
        const flashcardsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log("Fetched flashcards:", flashcardsData); // Debug log
        setFlashcards(flashcardsData);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        toast.error("Error", {
          description: "Failed to load flashcards",
        });
      } finally {
        setLoading(false);
      }
    }

    async function fetchFolders() {
      try {
        setLoading(true);
        let foldersQuery;

        if (userRole === "admin") {
          foldersQuery = collection(db, "folders");
        } else {
          foldersQuery = query(
            collection(db, "folders"),
            where("createdBy", "==", currentUser.uid)
          );
        }

        const querySnapshot = await getDocs(foldersQuery);
        const foldersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log("Fetched folders:", foldersData); // Debug log
        setFolders(foldersData);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast.error("Error", {
          description: "Failed to load folders",
        });
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchFlashcards();
      fetchFolders();
    }
  }, [currentUser, userRole]);

  const handleDeleteFlashcard = async (id) => {
    try {
      await deleteDoc(doc(db, "flashcards", id));
      setFlashcards(flashcards.filter((flashcard) => flashcard.id !== id));
      toast.success("Success", {
        description: "Flashcard deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Error", {
        description: "Failed to delete flashcard",
      });
    }
  };

  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcard(flashcard);
    setEditTitle(flashcard.title);
    setEditQuestion(flashcard.question);
    setEditAnswer(flashcard.answer);
    setEditFolderId(flashcard.folderId || null);
  };

  const handleSaveEdit = async () => {
    if (!editQuestion.trim() || !editAnswer.trim() || !editTitle.trim()) {
      toast.error("Error", {
        description: "Question, answer, and title cannot be empty",
      });
      return;
    }

    try {
      await updateDoc(doc(db, "flashcards", editingFlashcard.id), {
        title: editTitle,
        question: editQuestion,
        answer: editAnswer,
        folderId: editFolderId,
      });

      setFlashcards(
        flashcards.map((flashcard) =>
          flashcard.id === editingFlashcard.id
            ? {
              ...flashcard,
              question: editQuestion,
              answer: editAnswer,
              title: editTitle,
              folderId: editFolderId,
            }
            : flashcard
        )
      );

      toast.success("Success", {
        description: "Flashcard updated successfully",
      });

      setEditingFlashcard(null);
      setEditTitle("");
      setEditQuestion("");
      setEditAnswer("");
      setEditFolderId(null);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Error", {
        description: "Failed to update flashcard",
      });
    }
  };

  const handleTabChange = (value) => {
  setSelectedFolder(value);
  if (value === "all") {
    navigate("/flashcards");
  } else if (value === "unorganized") {
    navigate("/flashcards?filter=unorganized");
  } else {
    navigate(`/flashcards?folder=${value}`);
  }
};

  const filteredFlashcards =
  selectedFolder === "all"
    ? flashcards
    : selectedFolder === "unorganized"
    ? flashcards.filter(
        (flashcard) => 
          !flashcard.folderId || 
          flashcard.folderId === null || 
          flashcard.folderId === ""
      )
    : flashcards.filter((flashcard) => flashcard.folderId === selectedFolder);

  // console.log("Flashcard folderIds:", flashcards.map(f => f.folderId));
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">
          {selectedFolder === "all"
            ? "All Flashcards"
            : selectedFolder === "unorganized"
              ? "Unorganized Flashcards"
              : `Flashcards in ${folders.find((f) => f.id === selectedFolder)?.name || "Folder"
              }`}
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={() => navigate("/folders/new")}
            className="w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            <FolderPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            New Folder
          </Button>
          <Button
            onClick={() =>
              navigate(
                `/flashcards/new${selectedFolder !== "all" && selectedFolder !== "unorganized"
                  ? `?folder=${selectedFolder}`
                  : ""
                }`
              )
            }
            className="w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            New Flashcard
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue={selectedFolder}
        value={selectedFolder}
        onValueChange={handleTabChange}
      >
        {/* <TabsList className="mb-4 sm:mb-6 flex flex-wrap gap-2 overflow-x-auto">
          <TabsTrigger
            value="all"
            className="text-xs sm:text-sm md:text-base px-3 py-1"
          >
            All Flashcards
          </TabsTrigger>
          <TabsTrigger
            value="unorganized"
            className="text-xs sm:text-sm md:text-base px-3 py-1"
          >
            Unorganized
          </TabsTrigger>
          {folders.map((folder) => (
            <TabsTrigger
              key={folder.id}
              value={folder.id}
              className="text-xs sm:text-sm md:text-base px-3 py-1"
            >
              {folder.name}
            </TabsTrigger>
          ))}
        </TabsList> */}
        <TabsList className="mb-4 flex flex-wrap gap-2 h-auto ">
          <TabsTrigger value="all">All Flashcards</TabsTrigger>
          <TabsTrigger value="unorganized">Unorganized</TabsTrigger>
          {/* <div className=" "> */}
            {folders.map((folder) => (
              <TabsTrigger key={folder.id} value={folder.id}>
                {folder.name}

              </TabsTrigger>
            ))}
          {/* </div> */}
        </TabsList>

        <TabsContent value={selectedFolder}>
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12 gap-2 w-full">
              <Spinner size="small" />
              <span className="text-sm sm:text-base md:text-lg">
                Loading flashcards...
              </span>
            </div>
          ) : filteredFlashcards.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                {selectedFolder === "all"
                  ? "No flashcards found"
                  : selectedFolder === "unorganized"
                    ? "No unorganized flashcards"
                    : "No flashcards in this folder"}
              </p>
              <Button
                variant="outline"
                className="mt-4 text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2"
                onClick={() =>
                  navigate(
                    `/flashcards/new${selectedFolder !== "all" &&
                      selectedFolder !== "unorganized"
                      ? `?folder=${selectedFolder}`
                      : ""
                    }`
                  )
                }
              >
                Create your first flashcard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
              {filteredFlashcards.map((flashcard) => (
                <div
                  key={flashcard.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedFlashcard(flashcard)}
                >
                  <Card className="flex flex-col overflow-hidden h-full">
                    <CardContent className="p-0 flex-1">
                      <FlashcardItem flashcard={flashcard} />
                      <div className="p-3 sm:p-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFlashcard(flashcard);
                          }}
                          className="h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w[600px] p-4 sm:p-6 md:p-8">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">
                                Delete Flashcard
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm sm:text-base md:text-lg">
                                Are you sure you want to delete this flashcard?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-xs sm:text-sm md:text-base px-3 py-2">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="text-xs sm:text-sm md:text-base px-3 py-2"
                                onClick={() =>
                                  handleDeleteFlashcard(flashcard.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Flashcard Dialog */}
      <Dialog
        open={!!editingFlashcard}
        onOpenChange={(open) => !open && setEditingFlashcard(null)}
      >
        <DialogContent className="w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[50vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] p-2 sm:p-4 md:p-6 lg:p-8 bg-background border border-border rounded-lg shadow-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-foreground">
              Edit Flashcard
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Update the details for this flashcard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 sm:space-y-3 md:space-y-4 py-2 sm:py-3 md:py-4">
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="edit-title"
                className="text-xs sm:text-sm md:text-base text-foreground"
              >
                Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter a title, like “Biology - Chapter 22: Evolution”"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="text-xs sm:text-sm md:text-base bg-input border-input text-foreground w-full"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="edit-question"
                className="text-xs sm:text-sm md:text-base text-foreground"
              >
                Question
              </Label>
              <Textarea
                id="edit-question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                className="min-h-[60px] sm:min-h-[80px] md:min-h-[100px] text-xs sm:text-sm md:text-base bg-input border-input text-foreground w-full"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="edit-answer"
                className="text-xs sm:text-sm md:text-base text-foreground"
              >
                Answer
              </Label>
              <Textarea
                id="edit-answer"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                className="min-h-[60px] sm:min-h-[80px] md:min-h-[100px] text-xs sm:text-sm md:text-base bg-input border-input text-foreground w-full"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="edit-folder"
                className="text-xs sm:text-sm md:text-base text-foreground"
              >
                Folder
              </Label>
              <Select value={editFolderId} onValueChange={setEditFolderId}>
                <SelectTrigger className="text-xs sm:text-sm md:text-base bg-input border-input text-foreground w-full">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border w-full">
                  <SelectItem
                    value={null}
                    className="text-xs sm:text-sm md:text-base text-foreground"
                  >
                    None
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem
                      key={folder.id}
                      value={folder.id}
                      className="text-xs sm:text-sm md:text-base text-foreground"
                    >
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingFlashcard(null)}
              className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={loading}
              className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-primary text-primary-foreground hover:bg-primary/80 w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flashcard Details Dialog */}
      <Dialog
        open={!!selectedFlashcard}
        onOpenChange={() => setSelectedFlashcard(null)}
      >
        <DialogContent className="w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[50vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] p-2 sm:p-4 md:p-6 lg:p-8 bg-background border border-border rounded-lg shadow-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-foreground line-clamp-2">
              {selectedFlashcard?.title}
            </DialogTitle>
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground">
              <div>
                <p className="mb-1">Question</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-foreground">
                  {selectedFlashcard?.question}
                </p>
              </div>
              <div>
                <p className="mb-1">Answer</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-foreground">
                  {selectedFlashcard?.answer}
                </p>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
