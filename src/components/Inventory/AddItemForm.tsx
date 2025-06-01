"use client"

import type React from "react"
import { useState } from "react"
import { XIcon, CalendarIcon } from "lucide-react"
import type { FoodItem } from "../../contexts/InventoryContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import "../../components-css/addItemForm.css"

interface AddItemFormProps {
  /** existing item when editing */
  item?: FoodItem | null
  /** called with new/updated payload */
  onSubmit: (data: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">) => Promise<void>
  onClose: () => void
}

const AddItemForm: React.FC<AddItemFormProps> = ({ item = null, onSubmit, onClose }) => {
  const [expirationTouched, setExpirationTouched] = useState(false)
  const [formData, setFormData] = useState(() => {
    const today = new Date()
    const purchaseDate = item?.purchased ? new Date(item.purchased) : today
    const expirationDate = item?.expiration ? new Date(item.expiration) : null

    return {
      name: item?.name || "",
      quantity: item?.quantity || 1,
      unit: item?.unit || "piece",
      category: item?.category || "dairy",
      purchaseDate,
      expirationDate,
      storageLocation: item?.location || "refrigerator",
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (name === "expirationDate") {
      setExpirationTouched(true)
    }
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setExpirationTouched(true) // Mark as touched on submit attempt

    if (!formData.expirationDate) {
      return // Don't submit if expiration date is missing
    }

    const payload: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at"> = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      purchased: formData.purchaseDate ? formData.purchaseDate.toISOString() : new Date().toISOString(),
      expiration: formData.expirationDate ? formData.expirationDate.toISOString() : "",
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

  // Determine if we should show the error state for expiration
  const showExpirationError = expirationTouched && !formData.expirationDate

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0 bg-gray-800">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-lg force-width">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{item ? "Edit Item" : "Add New Item"}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full h-8 w-8"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
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
                className="rounded-full border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quantity & Unit */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Quantity & Unit*</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  name="quantity"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="flex-1 rounded-full border-gray-600 bg-gray-700 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-500 transition-colors"
                />
                <Select value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                  <SelectTrigger className="flex-1 rounded-full border-gray-600 bg-gray-700 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-gray-700 border-gray-600">
                    <SelectItem
                      value="piece"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Piece
                    </SelectItem>
                    <SelectItem
                      value="gallon"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Gallon
                    </SelectItem>
                    <SelectItem
                      value="oz"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Ounce
                    </SelectItem>
                    <SelectItem
                      value="lb"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Pound
                    </SelectItem>
                    <SelectItem
                      value="kg"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Kilogram
                    </SelectItem>
                    <SelectItem
                      value="g"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Gram
                    </SelectItem>
                    <SelectItem
                      value="ml"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Milliliter
                    </SelectItem>
                    <SelectItem
                      value="l"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      Liter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Purchase Date*</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal rounded-full border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-400" />
                      {formData.purchaseDate ? (
                        <span className="text-xs">{format(formData.purchaseDate, "MMM d")}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl bg-gray-700 border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.purchaseDate || undefined}
                      onSelect={(date) => handleDateChange("purchaseDate", date)}
                      initialFocus
                      className="rounded-xl border-0 bg-gray-700 text-gray-100"
                      classNames={{
                        day_selected:
                          "bg-emerald-600 text-gray-900 hover:bg-emerald-500 hover:text-gray-900 cursor-pointer",
                        day_today: "bg-gray-600 text-gray-50 cursor-pointer",
                        day: "hover:bg-gray-600 hover:text-emerald-400 cursor-pointer",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Expiration Date*
                  {showExpirationError && <span className="text-red-400 text-xs ml-1">(Required)</span>}
                </label>
                <Popover onOpenChange={() => !expirationTouched && setExpirationTouched(true)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal rounded-full border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-emerald-500 ${
                        showExpirationError
                          ? "text-red-400 border-red-600 hover:text-red-400"
                          : "text-gray-100 hover:text-emerald-400"
                      } transition-colors cursor-pointer`}
                    >
                      <CalendarIcon
                        className={`mr-2 h-4 w-4 ${formData.expirationDate ? "text-emerald-400" : showExpirationError ? "text-red-400" : "text-gray-400"}`}
                      />
                      {formData.expirationDate ? (
                        <span className="text-xs">{format(formData.expirationDate, "MMM d")}</span>
                      ) : (
                        <span className={`text-xs ${showExpirationError ? "text-red-400" : "text-gray-400"}`}>
                          Select date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl bg-gray-700 border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expirationDate || undefined}
                      onSelect={(date) => handleDateChange("expirationDate", date)}
                      initialFocus
                      className="rounded-xl border-0 bg-gray-700 text-gray-100"
                      fromDate={new Date()} // Can't select dates in the past for expiration
                      classNames={{
                        day_selected:
                          "bg-emerald-600 text-gray-900 hover:bg-emerald-500 hover:text-gray-900 cursor-pointer",
                        day_today: "bg-gray-600 text-gray-50 cursor-pointer",
                        day: "hover:bg-gray-600 hover:text-emerald-400 cursor-pointer",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Category & Location Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                  Category*
                </label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger className="rounded-full border-gray-600 bg-gray-700 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-gray-700 border-gray-600">
                    <SelectItem
                      value="fruits"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🍎 Fruits
                    </SelectItem>
                    <SelectItem
                      value="vegetables"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🥕 Vegetables
                    </SelectItem>
                    <SelectItem
                      value="dairy"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🥛 Dairy
                    </SelectItem>
                    <SelectItem
                      value="meat"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🥩 Meat
                    </SelectItem>
                    <SelectItem
                      value="grains"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🌾 Grains
                    </SelectItem>
                    <SelectItem
                      value="snacks"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🍿 Snacks
                    </SelectItem>
                    <SelectItem
                      value="beverages"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🥤 Beverages
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      📦 Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-300">
                  Storage*
                </label>
                <Select
                  value={formData.storageLocation}
                  onValueChange={(value) => handleSelectChange("storageLocation", value)}
                >
                  <SelectTrigger className="rounded-full border-gray-600 bg-gray-700 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-gray-700 border-gray-600">
                    <SelectItem
                      value="refrigerator"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      ❄️ Refrigerator
                    </SelectItem>
                    <SelectItem
                      value="freezer"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🧊 Freezer
                    </SelectItem>
                    <SelectItem
                      value="pantry"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🏠 Pantry
                    </SelectItem>
                    <SelectItem
                      value="counter"
                      className="text-gray-100 hover:text-emerald-400 focus:text-emerald-400 focus:bg-gray-600 cursor-pointer"
                    >
                      🍌 Counter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-full bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.name || !formData.expirationDate}
                className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-colors cursor-pointer"
              >
                {item ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddItemForm
