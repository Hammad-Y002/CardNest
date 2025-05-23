"use client"

import { useState } from "react"

export default function FlashcardItem({ flashcard }) {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  return (
    <div className={`flashcard relative w-full h-48 cursor-pointer ${flipped ? "flipped" : ""}`} onClick={handleFlip}>
      <div className="flashcard-front absolute inset-0 bg-card p-4 flex items-center justify-center text-center">
        <p>{flashcard.question}</p>
      </div>
      <div className="flashcard-back absolute inset-0 bg-primary text-primary-foreground p-4 flex items-center justify-center text-center">
        <p>{flashcard.answer}</p>
      </div>
    </div>
  )
}
