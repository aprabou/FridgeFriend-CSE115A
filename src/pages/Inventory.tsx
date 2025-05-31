"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useInventory } from "../contexts/useInventory"
import type { FoodItem } from "../contexts/InventoryContext"
import FoodItemCard from "../components/Inventory/FoodItemCard"
import AddItemForm from "../components/Inventory/AddItemForm"
import { PlusIcon, FilterIcon, Search, Calendar, Package, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const Inventory: React.FC = () => {
  const { items, loading, deleteItem, addItem, updateItem } = useInventory()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    expiringSoon: false,
    search: "",
  })

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id)
    }
  }

  const handleFormSubmit = async (data: Omit<FoodItem, "id" | "user_id" | "household_id" | "created_at">) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
    setShowAddForm(false)
    setEditingItem(null)
  }

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => setFilters({ location: "", category: "", expiringSoon: false, search: "" })

  const filteredItems = items.filter((item) => {
    const matchesLocation = !filters.location || item.location === filters.location
    const matchesCategory = !filters.category || item.category === filters.category
    const matchesSearch = !filters.search || item.name.toLowerCase().includes(filters.search.toLowerCase())

    const today = new Date()
    const expDate = new Date(item.expiration)
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const matchesExpiringSoon = !filters.expiringSoon || (daysUntilExpiration >= 0 && daysUntilExpiration <= 7)

    return matchesLocation && matchesCategory && matchesSearch && matchesExpiringSoon
  })

  const categorizedItems = useMemo(() => {
    const today = new Date()

    const expired: FoodItem[] = []
    const expiringToday: FoodItem[] = []
    const expiringSoon: FoodItem[] = [] // 1-3 days
    const expiringThisWeek: FoodItem[] = [] // 4-7 days
    const fresh: FoodItem[] = [] // 8+ days

    filteredItems.forEach((item) => {
      const expDate = new Date(item.expiration)
      const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiration < 0) {
        expired.push(item)
      } else if (daysUntilExpiration === 0) {
        expiringToday.push(item)
      } else if (daysUntilExpiration <= 3) {
        expiringSoon.push(item)
      } else if (daysUntilExpiration <= 7) {
        expiringThisWeek.push(item)
      } else {
        fresh.push(item)
      }
    })

    return { expired, expiringToday, expiringSoon, expiringThisWeek, fresh }
  }, [filteredItems])

  const locations = [...new Set(items.map((item) => item.location))]
  const categories = [...new Set(items.map((item) => item.category))]

  const ColumnHeader = ({
    title,
    count,
    icon: Icon,
    color,
  }: {
    title: string
    count: number
    icon: any
    color: string
  }) => (
    <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
      <h3 className="font-semibold text-lg">{title}</h3>
      <Badge variant="secondary" className="ml-auto">
        {count}
      </Badge>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory</h1>
            <p className="text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} in your inventory
            </p>
          </div>

          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Filters</CardTitle>
                <Button variant="ghost" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Storage Location</label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => handleFilterChange("location", value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc.charAt(0).toUpperCase() + loc.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expiringSoon"
                      checked={filters.expiringSoon}
                      onCheckedChange={(checked) => handleFilterChange("expiringSoon", checked)}
                    />
                    <label htmlFor="expiringSoon" className="text-sm font-medium">
                      Expiring Soon (7 days)
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Columns */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Expired Items */}
            <div className="space-y-4">
              <ColumnHeader
                title="Expired"
                count={categorizedItems.expired.length}
                icon={AlertTriangle}
                color="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
              />
              <div className="space-y-3">
                {categorizedItems.expired.map((item) => (
                  <FoodItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                ))}
                {categorizedItems.expired.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No expired items</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expiring Today */}
            <div className="space-y-4">
              <ColumnHeader
                title="Today"
                count={categorizedItems.expiringToday.length}
                icon={Clock}
                color="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400"
              />
              <div className="space-y-3">
                {categorizedItems.expiringToday.map((item) => (
                  <FoodItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                ))}
                {categorizedItems.expiringToday.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nothing expires today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expiring Soon (1-3 days) */}
            <div className="space-y-4">
              <ColumnHeader
                title="Soon (1-3 days)"
                count={categorizedItems.expiringSoon.length}
                icon={Calendar}
                color="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
              />
              <div className="space-y-3">
                {categorizedItems.expiringSoon.map((item) => (
                  <FoodItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                ))}
                {categorizedItems.expiringSoon.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nothing expiring soon</p>
                  </div>
                )}
              </div>
            </div>

            {/* This Week (4-7 days) */}
            <div className="space-y-4">
              <ColumnHeader
                title="This Week"
                count={categorizedItems.expiringThisWeek.length}
                icon={Package}
                color="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
              />
              <div className="space-y-3">
                {categorizedItems.expiringThisWeek.map((item) => (
                  <FoodItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                ))}
                {categorizedItems.expiringThisWeek.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nothing this week</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fresh (8+ days) */}
            <div className="space-y-4">
              <ColumnHeader
                title="Fresh"
                count={categorizedItems.fresh.length}
                icon={CheckCircle}
                color="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
              />
              <div className="space-y-3">
                {categorizedItems.fresh.map((item) => (
                  <FoodItemCard key={item.id} item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
                ))}
                {categorizedItems.fresh.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No fresh items</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No items match your current filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <AddItemForm
              item={editingItem}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowAddForm(false)
                setEditingItem(null)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
