"use client"

import { useState, useCallback, useEffect } from "react"
import { useDrop } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, MoveVertical, Settings } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { ComponentRenderer } from "@/components/component-renderer"
import { ComponentEditor } from "@/components/component-editor"

interface SlideEditorProps {
  slide: Slide
  updateSlide: (slide: Slide) => void
  addComponent: (type: string, defaultProps: Record<string, any>) => string
}

export function SlideEditor({ slide, updateSlide, addComponent }: SlideEditorProps) {
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)

  // Reset editing component when slide changes
  useEffect(() => {
    setEditingComponentId(null)
  }, [slide.id])

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item: { type: string; defaultProps: Record<string, any> }) => {
      console.log("Component dropped:", item.type)
      const newComponentId = addComponent(item.type, item.defaultProps)
      setEditingComponentId(newComponentId)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleAddParagraph = useCallback(() => {
    console.log("Adding paragraph component")
    const newComponentId = addComponent("paragraph", { content: "Enter your text here..." })
    setEditingComponentId(newComponentId)
  }, [addComponent])

  const updateComponent = useCallback(
    (componentId: string, updatedProps: Record<string, any>) => {
      console.log("Updating component:", componentId)
      const updatedComponents = slide.components.map((component) =>
        component.id === componentId ? { ...component, props: updatedProps } : component,
      )

      updateSlide({
        ...slide,
        components: updatedComponents,
      })
    },
    [slide, updateSlide],
  )

  const deleteComponent = useCallback(
    (componentId: string) => {
      console.log("Deleting component:", componentId)
      const updatedComponents = slide.components.filter((component) => component.id !== componentId)

      updateSlide({
        ...slide,
        components: updatedComponents,
      })

      if (editingComponentId === componentId) {
        setEditingComponentId(null)
      }
    },
    [slide, updateSlide, editingComponentId],
  )

  const reorderComponents = useCallback(
    (startIndex: number, endIndex: number) => {
      const result = Array.from(slide.components)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      updateSlide({
        ...slide,
        components: result,
      })
    },
    [slide, updateSlide],
  )

  const updateSlideTitle = useCallback(
    (title: string) => {
      updateSlide({
        ...slide,
        title,
      })
    },
    [slide, updateSlide],
  )

  const currentComponent = slide.components.find((component) => component.id === editingComponentId)

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 p-4 overflow-hidden flex flex-col" ref={drop}>
        <div className="mb-4">
          <Input
            value={slide.title}
            onChange={(e) => updateSlideTitle(e.target.value)}
            className="text-lg font-semibold"
            placeholder="Slide Title"
          />
        </div>

        <Card className={`flex-1 overflow-hidden ${isOver ? "border-primary border-dashed" : ""}`}>
          <CardContent className="p-6 h-full">
            <ScrollArea className="h-full">
              {slide.components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <p>Drag and drop components here</p>
                  <p className="text-sm">or</p>
                  <Button variant="outline" className="mt-2" onClick={handleAddParagraph}>
                    Add Paragraph
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {slide.components.map((component, index) => (
                    <div
                      key={component.id}
                      className="relative group border rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <div className="absolute right-2 top-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingComponentId(component.id)}
                          title="Edit Component"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteComponent(component.id)}
                          title="Delete Component"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="cursor-move" title="Drag to Reorder">
                          <MoveVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <ComponentRenderer
                        component={component}
                        isEditing={true}
                        onClick={() => setEditingComponentId(component.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {currentComponent && (
        <ComponentEditor
          component={currentComponent}
          updateComponent={(props) => updateComponent(currentComponent.id, props)}
          onClose={() => setEditingComponentId(null)}
        />
      )}
    </div>
  )
}
