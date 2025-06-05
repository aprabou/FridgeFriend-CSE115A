//Defines and exports a React component that displays details of a food item, including expiration and purchase dates
//It calculates the number of days until expiration and provides edit and delete functionality through callback props
        
"use client"

import type React from "react"
import { Trash2Icon, EditIcon } from "lucide-react"
import type { FoodItem } from "../../contexts/InventoryContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FoodItemCardProps {
  item: FoodItem
  onEdit: (item: FoodItem) => void
  onDelete: (id: string) => void
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onEdit, onDelete }) => {
  // Safety check for undefined item
  if (!item) {
    return null
  }

  // Provide default values for item properties
  const safeItem = {
    id: item.id || "",
    name: item.name || "Unknown Item",
    quantity: item.quantity || 0,
    unit: item.unit || "",
    location: item.location || "unknown",
    expiration: item.expiration || null,
    purchased: item.purchased || null,
    notes: item.notes || "",
  }

  const expirationDate = safeItem.expiration ? new Date(safeItem.expiration) : null
  const purchasedDate = safeItem.purchased ? new Date(safeItem.purchased) : null

  let daysUntilExpiration: number | null = null
  if (expirationDate && !isNaN(expirationDate.getTime())) {
    const today = new Date()
    daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getExpirationStatus = () => {
    if (daysUntilExpiration === null) {
      return {
        label: "Unknown expiration",
        bgColor: "bg-gray-700",
        textColor: "text-gray-300",
        borderColor: "border-gray-600",
        hoverBgColor: "hover:bg-gray-600/30",
        shadowColor: "hover:shadow-gray-600/10",
      }
    } else if (daysUntilExpiration < 0) {
      return {
        label: "Expired",
        bgColor: "bg-red-900/50",
        textColor: "text-red-300",
        borderColor: "border-red-700",
        hoverBgColor: "hover:bg-red-700/30",
        shadowColor: "hover:shadow-red-700/10",
      }
    } else if (daysUntilExpiration == 0) {
      return {
        label: `Expires today!`,
        bgColor: "bg-orange-900/50",
        textColor: "text-orange-300",
        borderColor: "border-orange-700",
        hoverBgColor: "hover:bg-orange-700/30",
        shadowColor: "hover:shadow-orange-700/10",
      }
    } else if (daysUntilExpiration <= 2) {
      return {
        label: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}`,
        bgColor: "bg-amber-900/50",
        textColor: "text-amber-300",
        borderColor: "border-amber-700",
        hoverBgColor: "hover:bg-amber-700/30",
        shadowColor: "hover:shadow-amber-700/10",
      }
    } else if (daysUntilExpiration <= 7) {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-blue-900/50",
        textColor: "text-blue-300",
        borderColor: "border-blue-700",
        hoverBgColor: "hover:bg-blue-700/30",
        shadowColor: "hover:shadow-blue-700/10",
      }
    } else {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-emerald-900/50",
        textColor: "text-emerald-300",
        borderColor: "border-emerald-700",
        hoverBgColor: "hover:bg-emerald-700/30",
        shadowColor: "hover:shadow-emerald-700/10",
      }
    }
  }

  const status = getExpirationStatus()

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl ${status.shadowColor} border ${status.borderColor} ${status.hoverBgColor} cursor-pointer hover:z-10 relative bg-gray-800`}
    >
      {/* Header with expiration status */}
      <div className={`${status.bgColor} px-3 py-2 flex justify-between items-center`}>
        <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(item)
            }}
            className={`h-6 w-6 ${status.textColor} hover:bg-gray-700/50 hover:text-emerald-400 rounded-full transition-colors cursor-pointer`}
            title="Edit"
          >
            <EditIcon className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className={`h-6 w-6 ${status.textColor} hover:bg-gray-700/50 hover:text-red-400 rounded-full transition-colors cursor-pointer`}
            title="Delete"
          >
            <Trash2Icon className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main content - expands on hover */}
      <CardContent className="p-3 transition-all duration-300 ease-in-out bg-gray-800">
        {/* Always visible content */}
        <h3 className="font-medium text-sm truncate mb-2 text-gray-100">{safeItem.name}</h3>

        {/* Expandable details - hidden by default, shown on hover */}
        <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300 ease-in-out">
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Quantity:</span>
              <span className="font-medium text-gray-200">
                {safeItem.quantity} {safeItem.unit}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Location:</span>
              <span className="font-medium capitalize text-gray-200">{safeItem.location}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Purchased:</span>
              <span className="font-medium text-gray-200">
                {purchasedDate && !isNaN(purchasedDate.getTime()) ? purchasedDate.toLocaleDateString() : "Unknown"}
              </span>
            </div>
            {safeItem.notes && (
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400 italic">{safeItem.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Compact notes shown when not hovering */}
        {safeItem.notes && <p className="text-xs text-gray-400 mt-1 truncate group-hover:hidden">{safeItem.notes}</p>}
      </CardContent>
    </Card>
  )
}

export default FoodItemCard
