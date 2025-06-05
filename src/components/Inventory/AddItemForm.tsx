"use client"

import type React from "react"
import { useState } from "react"
import { XIcon } from "lucide-react"
import type { FoodItem } from "../../contexts/InventoryContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { format } from "date-fns"
import "../../components-css/addItemForm.css"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddItemFormProps {
  /** existing item when editing */
  item?: FoodItem | null
  /** called with new/updated payload */
  onSubmit: (data: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">) => Promise<void>
  onClose: () => void
}

const AddItemForm: React.FC<AddItemFormProps> = ({ item = null, onSubmit, onClose }) => {
  const [expirationTouched, setExpirationTouched] = useState(false)

  // Keep purchaseDate and expirationDate as Date objects (or null)
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

  // When the user picks a native date string, convert it back to Date
  const handleDateInputChange = (name: "purchaseDate" | "expirationDate", value: string) => {
    const newDate = value ? new Date(value) : null
    if (name === "expirationDate") {
      setExpirationTouched(true)
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newDate,
    }))
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

  // Only show the “required” error if user has touched and not provided a date
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

            {/* Dates Row: Purchase Date & Expiration Date with Calendar Popover */}
            <div className="grid grid-cols-2 gap-2">
              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300">
                  Purchase Date*
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-full border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600 hover:border-emerald-500 hover:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 transition-colors cursor-pointer",
                        !formData.purchaseDate && "text-gray-400",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.purchaseDate ? format(formData.purchaseDate, "MMM d") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.purchaseDate}
                      onSelect={(date) => handleDateInputChange("purchaseDate", date ? format(date, "yyyy-MM-dd") : "")}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="bg-gray-800 text-gray-100"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-gray-100",
                        caption_label: "text-sm font-medium text-gray-100",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100 hover:bg-gray-700 rounded-md",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-emerald-600 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-700 hover:text-emerald-400 rounded-md transition-colors",
                        day_selected:
                          "bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white focus:bg-emerald-600 focus:text-white",
                        day_today: "bg-gray-700 text-emerald-400",
                        day_outside: "text-gray-500 opacity-50",
                        day_disabled: "text-gray-500 opacity-50",
                        day_range_middle: "aria-selected:bg-emerald-600 aria-selected:text-white",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-300">
                  Expiration Date*
                  {showExpirationError && <span className="text-red-400 text-xs ml-1">(Required)</span>}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-full border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-emerald-500 transition-colors cursor-pointer",
                        !formData.expirationDate && "text-gray-400",
                        showExpirationError
                          ? "text-red-400 border-red-600 hover:text-red-400 hover:border-red-500"
                          : "text-gray-100 hover:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expirationDate ? format(formData.expirationDate, "MMM d") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expirationDate}
                      onSelect={(date) =>
                        handleDateInputChange("expirationDate", date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="bg-gray-800 text-gray-100"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-gray-100",
                        caption_label: "text-sm font-medium text-gray-100",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100 hover:bg-gray-700 rounded-md",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-emerald-600 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-700 hover:text-emerald-400 rounded-md transition-colors",
                        day_selected:
                          "bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white focus:bg-emerald-600 focus:text-white",
                        day_today: "bg-gray-700 text-emerald-400",
                        day_outside: "text-gray-500 opacity-50",
                        day_disabled: "text-gray-500 opacity-50",
                        day_range_middle: "aria-selected:bg-emerald-600 aria-selected:text-white",
                        day_hidden: "invisible",
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
