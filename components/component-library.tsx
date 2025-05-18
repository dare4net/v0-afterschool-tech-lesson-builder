"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { componentDefinitions } from "@/lib/component-definitions"
import type { ComponentCategory } from "@/types/lesson"

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all")

  const filteredComponents = componentDefinitions.filter((component) => {
    const matchesSearch =
      component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "all" || component.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">Components</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 h-auto p-1 mx-2 mt-2">
            <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>
              All
            </TabsTrigger>
            <TabsTrigger value="content" onClick={() => setActiveCategory("content")}>
              Content
            </TabsTrigger>
            <TabsTrigger value="interactive" onClick={() => setActiveCategory("interactive")}>
              Interactive
            </TabsTrigger>
            <TabsTrigger value="gamified" onClick={() => setActiveCategory("gamified")}>
              Gamified
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="all" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents.map((component) => (
                    <DraggableComponent key={component.type} component={component} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="content" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "content")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="interactive" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "interactive")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="gamified" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "gamified")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function DraggableComponent({ component }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: {
      type: component.type,
      defaultProps: component.defaultProps,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-md cursor-grab bg-card hover:border-primary transition-colors ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{component.icon}</span>
        <div>
          <h3 className="text-sm font-medium">{component.label}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{component.description}</p>
        </div>
      </div>
    </div>
  )
}
