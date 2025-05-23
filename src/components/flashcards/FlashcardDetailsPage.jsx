"use client"

import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Spinner } from "@/components/ui/spinner"
import { db } from "../../lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function FlashcardDetailsPage() {
    const { flashcardId } = useParams()
    const [flashcard, setFlashcard] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchFlashcard() {
            try {
                setLoading(true)
                const flashcardDoc = await getDoc(doc(db, "flashcards", flashcardId))
                if (flashcardDoc.exists()) {
                    setFlashcard({ id: flashcardDoc.id, ...flashcardDoc.data() })
                } else {
                    console.error("Flashcard not found")
                }
            } catch (error) {
                console.error("Error fetching flashcard:", error)
            } finally {
                setLoading(false)
            }
        }

        if (flashcardId) {
            fetchFlashcard()
        }
    }, [flashcardId])

    if (loading) {
        return (
            <div className="text-center py-8">
                <Spinner size="small" /> Loading flashcard details...
            </div>
        )
    }

    if (!flashcard) {
        return <div className="text-center py-8">Flashcard not found</div>
    }

    return (
        <>
            <Button variant="ghost" onClick={() => navigate("/flashcards")} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flashcards
            </Button>

            <Card className="h-64">
                <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                    <div className="p-6 text-center w-full">
                        <div className="mb-4 flex gap-2 items-center justify-center">
                            <p className="text-lg text-muted-foreground">Title:</p>
                            <p className="text-lg font-bold">{flashcard.title}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Question</p>
                            <p className="text-lg font-bold">{flashcard.question}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Answer</p>
                            <p className="text-base">{flashcard.answer}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}