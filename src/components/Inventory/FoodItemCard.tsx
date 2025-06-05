//Defines and exports a React component that displays details of a food item, including expiration and purchase dates
//It calculates the number of days until expiration and provides edit and delete functionality through callback props
import React from "react";
import { Trash2Icon, EditIcon } from "lucide-react";
import { FoodItem } from "../../contexts/InventoryContext";

interface FoodItemCardProps {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (id: string) => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const expirationDate = item.expiration ? new Date(item.expiration) : null;
  const purchasedDate = item.purchased ? new Date(item.purchased) : null;

  let daysUntilExpiration: number | null = null;
  if (expirationDate && !isNaN(expirationDate.getTime())) {
    const today = new Date();
    daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  const getExpirationStatus = () => {
    if (daysUntilExpiration === null) {
      return {
        label: "Unknown expiration",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
      };
    } else if (daysUntilExpiration < 0) {
      return {
        label: "Expired",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    } else if (daysUntilExpiration == 0) {
      return {
        label: `Expires today!`,
        bgColor: "bg-orange-300",
        textColor: "text-orange-900",
        borderColor: "border-orange-300",
      };
    } else if (daysUntilExpiration <= 2) {
      return {
        label: `Expires in ${daysUntilExpiration} day${
          daysUntilExpiration !== 1 ? "s" : ""
        }`,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    } else if (daysUntilExpiration <= 7) {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      };
    } else {
      return {
        label: `Expires in ${daysUntilExpiration} days`,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      };
    }
  };

  const status = getExpirationStatus();

  return (
    <div
      className={`rounded-lg border ${status.borderColor} overflow-hidden transition-all duration-200 hover:shadow-md`}
    >
      <div
        className={`${status.bgColor} px-4 py-2 flex justify-between items-center`}
      >
        <span className={`text-sm font-medium ${status.textColor}`}>
          {status.label}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-30"
            title="Edit"
          >
            <EditIcon size={16} className={status.textColor} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-30"
            title="Delete"
          >
            <Trash2Icon size={16} className={status.textColor} />
          </button>
        </div>
      </div>

      <div className="p-4 bg-white">
        <h3 className="font-medium text-lg text-gray-800">{item.name}</h3>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Quantity:</span>
            <span className="text-gray-800 font-medium">
              {item.quantity} {item.unit}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-800 font-medium">{item.location}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Purchased:</span>
            <span className="text-gray-800 font-medium">
              {purchasedDate && !isNaN(purchasedDate.getTime())
                ? purchasedDate.toLocaleDateString()
                : "Unknown"}
            </span>
          </div>
        </div>

        {item.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodItemCard;
