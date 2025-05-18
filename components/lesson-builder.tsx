"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { useToast } from "@/components/ui/use-toast"
import { ComponentLibrary } from "@/components/component-library"
import { SlideEditor } from "@/components/slide-editor"
import { SlidePreview } from "@/components/slide-preview"
import { LessonControls } from "@/components/lesson-controls"
import { SlideNavigator } from "@/components/slide-navigator"
import { useMobile } from "@/hooks/use-mobile"
import type { Lesson, Slide, Component } from "@/types/lesson"
import { defaultLesson } from "@/lib/default-lesson"

export function LessonBuilder() {
  // Initialize with default lesson or from localStorage
  const [lesson, setLesson] = useState<Lesson>(() => {
    if (typeof window !== "undefined") {
      const savedLesson = localStorage.getItem("currentLesson")
      if (savedLesson) {
        try {
          return JSON.parse(savedLesson)
        } catch (e) {
          console.error("Failed to parse saved lesson:", e)
        }
      }
    }
    return defaultLesson
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Save lesson to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentLesson", JSON.stringify(lesson))
    }
  }, [lesson])

  // Make sure currentSlideIndex is valid
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1))
    }
  }, [lesson.slides.length, currentSlideIndex])

  // Get the current slide safely
  const currentSlide = lesson.slides[currentSlideIndex] || lesson.slides[0]

  // Add a new slide
  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${lesson.slides.length + 1}`,
      components: [],
    }

    setLesson((prevLesson) => ({
      ...prevLesson,
      slides: [...prevLesson.slides, newSlide],
    }))

    // Set the current slide to the new slide
    setCurrentSlideIndex(lesson.slides.length)

    toast({
      title: "Slide added",
      description: `Added new slide: ${newSlide.title}`,
    })
  }, [lesson.slides.length, toast])

  // Update a slide
  const updateSlide = useCallback(
    (updatedSlide: Slide) => {
      console.log("Updating slide at index:", currentSlideIndex, "with:", updatedSlide)

      setLesson((prevLesson) => {
        // Create a new slides array with the updated slide
        const updatedSlides = prevLesson.slides.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide,
        )

        // Return a new lesson object with the updated slides
        return {
          ...prevLesson,
          slides: updatedSlides,
        }
      })
    },
    [currentSlideIndex],
  )

  // Delete a slide
  const deleteSlide = useCallback(
    (index: number) => {
      if (lesson.slides.length <= 1) {
        toast({
          title: "Cannot delete slide",
          description: "A lesson must have at least one slide",
          variant: "destructive",
        })
        return
      }

      setLesson((prevLesson) => {
        // Create a new slides array without the deleted slide
        const updatedSlides = prevLesson.slides.filter((_, i) => i !== index)

        // Return a new lesson object with the updated slides
        return {
          ...prevLesson,
          slides: updatedSlides,
        }
      })

      // Adjust the current slide index if needed
      if (currentSlideIndex >= index && currentSlideIndex > 0) {
        setCurrentSlideIndex((prevIndex) => prevIndex - 1)
      }

      toast({
        title: "Slide deleted",
        description: `Deleted slide: ${lesson.slides[index].title}`,
      })
    },
    [currentSlideIndex, lesson.slides, toast],
  )

  // Reorder slides
  const reorderSlides = useCallback((startIndex: number, endIndex: number) => {
    setLesson((prevLesson) => {
      const slides = Array.from(prevLesson.slides)
      const [removed] = slides.splice(startIndex, 1)
      slides.splice(endIndex, 0, removed)

      return {
        ...prevLesson,
        slides,
      }
    })

    setCurrentSlideIndex(endIndex)
  }, [])

  // Update lesson metadata
  const updateLessonMetadata = useCallback((metadata: Partial<Omit<Lesson, "slides">>) => {
    setLesson((prevLesson) => ({
      ...prevLesson,
      ...metadata,
    }))
  }, [])

  // Export lesson
  const exportLesson = useCallback(() => {
    const dataStr = JSON.stringify(lesson, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `${lesson.title.replace(/\s+/g, "-").toLowerCase()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Lesson exported",
      description: `Saved as ${exportFileDefaultName}`,
    })
  }, [lesson, toast])

  // Import lesson
  const importLesson = useCallback(
    (importedLesson: Lesson) => {
      setLesson(importedLesson)
      setCurrentSlideIndex(0)

      toast({
        title: "Lesson imported",
        description: `Loaded lesson: ${importedLesson.title}`,
      })
    },
    [toast],
  )

  // Add component to current slide
  const addComponent = useCallback(
    (type: string, defaultProps: Record<string, any>) => {
      console.log("Adding component to slide at index:", currentSlideIndex, "type:", type)

      const newComponent: Component = {
        id: `component-${Date.now()}`,
        type: type as any,
        props: { ...defaultProps },
      }

      setLesson((prevLesson) => {
        // Create a new slides array with the updated slide
        const updatedSlides = prevLesson.slides.map((slide, index) => {
          if (index === currentSlideIndex) {
            // Create a new slide with the updated components
            return {
              ...slide,
              components: [...slide.components, newComponent],
            }
          }
          return slide
        })

        // Return a new lesson object with the updated slides
        return {
          ...prevLesson,
          slides: updatedSlides,
        }
      })

      return newComponent.id
    },
    [currentSlideIndex],
  )

  const Backend = isMobile ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={Backend}>
      <div className="flex flex-col h-screen">
        <LessonControls
          lesson={lesson}
          updateLessonMetadata={updateLessonMetadata}
          exportLesson={exportLesson}
          importLesson={importLesson}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />

        <div className="flex flex-1 overflow-hidden">
          {!previewMode ? (
            <>
              <SlideNavigator
                slides={lesson.slides}
                currentSlideIndex={currentSlideIndex}
                setCurrentSlideIndex={setCurrentSlideIndex}
                addSlide={addSlide}
                deleteSlide={deleteSlide}
                reorderSlides={reorderSlides}
              />

              <div className="flex flex-1 overflow-hidden">
                <ComponentLibrary />

                <SlideEditor
                  key={`slide-editor-${currentSlideIndex}`}
                  slide={currentSlide}
                  updateSlide={updateSlide}
                  addComponent={addComponent}
                />
              </div>
            </>
          ) : (
            <SlidePreview lesson={lesson} initialSlideIndex={currentSlideIndex} />
          )}
        </div>
      </div>
    </DndProvider>
  )
}
