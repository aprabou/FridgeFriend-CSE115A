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
  const expirationDate = item.expiration ? new Date(item.expiration) : null
  const purchasedDate = item.purchased ? new Date(item.purchased) : null

  let daysUntilExpiration: number | null = null
  if (expirationDate && !isNaN(expirationDate.getTime())) {
    const today = new Date()
    daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getExpirationStatus = () => {
    if (daysUntilExpiration === null) {
      return {
        label: "Unknown expiration",
        bgColor: "bg-muted",
        textColor: "text-muted-foreground",
        borderColor: "border-border",
      }
    } else if (daysUntilExpiration < 0) {
      return {
        label: "Expired",
        bgColor: "bg-red-100 dark:bg-red-950/30",
        textColor: "text-red-700 dark:text-red-400",
        borderColor: "border-red-200 dark:border-red-800",
      }
    } else if (daysUntilExpiration == 0) {
      return {
        label: `Expires today!`,
        bgColor: "bg-orange-100 dark:bg-orange-950/30",
        textColor: "text-orange-700 dark:text-orange-400",
        borderColor: "border-orange-200 dark:border-orange-800",
      }
    } else if (daysUntilExpiration <= 2) {
      return {
        label: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}`,
        bgColor: "bg-amber-100 dark:bg-amber-950/30",
        textColor: "text-amber-700 dark:text-amber-400",
        borderColor: "border-amber-200 dark:border-amber-800",
      }
    } else if (daysUntilExpiration <= 7) {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-blue-100 dark:bg-blue-950/30",
        textColor: "text-blue-700 dark:text-blue-400",
        borderColor: "border-blue-200 dark:border-blue-800",
      }
    } else {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-green-100 dark:bg-green-950/30",
        textColor: "text-green-700 dark:text-green-400",
        borderColor: "border-green-200 dark:border-green-800",
      }
    }
  }

  const status = getExpirationStatus()

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md border ${status.borderColor}`}>
      <div className={`${status.bgColor} px-3 py-2 flex justify-between items-center`}>
        <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
            className={`h-6 w-6 ${status.textColor} hover:bg-background/20`}
            title="Edit"
          >
            <EditIcon className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className={`h-6 w-6 ${status.textColor} hover:bg-background/20`}
            title="Delete"
          >
            <Trash2Icon className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-2 truncate">{item.name}</h3>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Qty:</span>
            <span className="font-medium">
              {item.quantity} {item.unit}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium capitalize">{item.location}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Purchased:</span>
            <span className="font-medium">
              {purchasedDate && !isNaN(purchasedDate.getTime()) ? purchasedDate.toLocaleDateString() : "Unknown"}
            </span>
          </div>
        </div>

        {item.notes && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground italic truncate">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FoodItemCard
