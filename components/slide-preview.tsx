"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ComponentRenderer } from "@/components/component-renderer"
import type { Lesson } from "@/types/lesson"

interface SlidePreviewProps {
  lesson: Lesson
  initialSlideIndex: number
}

export function SlidePreview({ lesson, initialSlideIndex }: SlidePreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex)
  const [score, setScore] = useState(0)
  const [totalPossible, setTotalPossible] = useState(0)

  const currentSlide = lesson.slides[currentSlideIndex]

  // Calculate total possible score
  useEffect(() => {
    let total = 0

    lesson.slides.forEach((slide) => {
      slide.components.forEach((component) => {
        if (component.type === "quiz" && component.props.points) {
          total += component.props.points
        }
        if (component.type === "matchingPairs" && component.props.points) {
          total += component.props.points
        }
        // Add other scoring components as needed
      })
    })

    setTotalPossible(total)
  }, [lesson])

  const addPoints = (points: number) => {
    setScore((prevScore) => prevScore + points)
  }

  const goToNextSlide = () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const scoreContext = {
    score,
    totalPossible,
    addPoints,
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6">
            {currentSlide.components.map((component) => (
              <div key={component.id} className="mb-6">
                <ComponentRenderer component={component} scoreContext={scoreContext} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t flex items-center justify-between bg-background">
        <div className="text-sm">
          Slide {currentSlideIndex + 1} of {lesson.slides.length}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousSlide} disabled={currentSlideIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === lesson.slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm font-medium">
          Score: {score} / {totalPossible}
        </div>
      </div>
    </div>
  )
}
