"use client"

export default function FlashcardItem({ flashcard }) {
  return (
    <div className="flashcard w-full h-48 bg-card p-4 flex flex-col justify-center text-center">
      <div className="flashcard-question mb-2">
        <p className="text-sm text-muted-foreground mb-1">Title</p>
        <p className="text-lg font-bold">{flashcard?.title}</p>
      </div>
      {/* <div className="flashcard-question mb-2">
        <p className="text-sm text-muted-foreground mb-1">Question</p>
        <p className="text-base font-bold">{flashcard.question}</p>
      </div>
      <div className="flashcard-answer mt-2">
        <p className="text-sm text-muted-foreground mb-1">Answer</p>
        <p className="text-base">{flashcard.answer}</p>
      </div> */}
    </div>
  )
}