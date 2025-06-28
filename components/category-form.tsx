"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Category } from "@/types/menu"

interface CategoryFormProps {
  category?: Category
  onSubmit: (category: Omit<Category, "id">) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
}

export const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const result = await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: category?.order || 0,
        createdAt: category?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      if (result.success) {
        onCancel()
      }
    } catch (error) {
      console.error("Error submitting category:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{category ? "Edit Category" : "Add New Category"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={16} />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Appetizers, Main Courses"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : category ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
