"use client"

import type React from "react"
import { useState } from "react"
import { XIcon } from "lucide-react"
import type { FoodItem } from "../../contexts/InventoryContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface AddItemFormProps {
  /** existing item when editing */
  item?: FoodItem | null
  /** called with new/updated payload */
  onSubmit: (data: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">) => Promise<void>
  onClose: () => void
}

const AddItemForm: React.FC<AddItemFormProps> = ({ item = null, onSubmit, onClose }) => {
  const [showScanner, setShowScanner] = useState(false)
  const [formData, setFormData] = useState(() => ({
    name: item?.name || "",
    quantity: item?.quantity || 1,
    unit: item?.unit || "piece",
    category: item?.category || "dairy",
    purchaseDate: (item?.purchased && item.purchased.split("T")[0]) || new Date().toISOString().split("T")[0],
    expirationDate: (item?.expiration && item.expiration.split("T")[0]) || "",
    storageLocation: item?.location || "refrigerator",
  }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at"> = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      purchased: formData.purchaseDate,
      expiration: formData.expirationDate,
      location: formData.storageLocation,
    }

    try {
      console.log("AddItemForm.handleSubmit", payload)
      await onSubmit(payload)
      onClose()
    } catch (err) {
      console.error("❌ Error submitting item:", err)
      alert("Failed to save item. Please try again.")
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{item ? "Edit Item" : "Add New Item"}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {showScanner ? (
          <div>
            <div className="bg-muted h-64 rounded-lg flex items-center justify-center mb-4">
              <p className="text-muted-foreground">Receipt Scanner Simulation</p>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setShowScanner(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setFormData({
                    ...formData,
                    name: "Milk",
                    quantity: 1,
                    unit: "gallon",
                    category: "dairy",
                    expirationDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                  })
                  setShowScanner(false)
                }}
              >
                Use Scanned Data
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Item Name*
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., Milk"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-sm font-medium mb-2">Quantity & Unit*</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  name="quantity"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="flex-1"
                />
                <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="gallon">Gallon</SelectItem>
                    <SelectItem value="oz">Ounce</SelectItem>
                    <SelectItem value="lb">Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium mb-2">
                Purchase Date*
              </label>
              <Input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-medium mb-2">
                Expiration Date*
              </label>
              <Input
                type="date"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category*
              </label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Storage Location */}
            <div>
              <label htmlFor="storageLocation" className="block text-sm font-medium mb-2">
                Storage Location*
              </label>
              <Select
                value={formData.storageLocation}
                onValueChange={(value) => handleSelectChange("storageLocation", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refrigerator">Refrigerator</SelectItem>
                  <SelectItem value="freezer">Freezer</SelectItem>
                  <SelectItem value="pantry">Pantry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{item ? "Save Changes" : "Add Item"}</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default AddItemForm
