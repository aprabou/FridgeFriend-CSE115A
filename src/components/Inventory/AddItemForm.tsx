//Defines and exports a React component that provides a form for adding or editing food items in an inventory
//It manages form state with useState, pre-fills fields when editing an existing item, and handles submission and closure
import React, { useState } from 'react';
import { XIcon, CameraIcon } from 'lucide-react';
import { FoodItem } from '../../contexts/InventoryContext';

interface AddItemFormProps {
  /** existing item when editing */
  item?: FoodItem | null;
  /** called with new/updated payload */
  onSubmit: (
    data: Omit<FoodItem, 'id' | 'user_id' | 'household_id' | 'created_at'>
  ) => Promise<void>;
  onClose: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ item = null, onSubmit, onClose }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: item?.name || '',
    quantity: item?.quantity || 1,
    unit: item?.unit || 'piece',
    category: item?.category || 'dairy',
    purchaseDate:
      (item?.purchased && item.purchased.split('T')[0]) ||
      new Date().toISOString().split('T')[0],
    expirationDate: (item?.expiration && item.expiration.split('T')[0]) || '',
    storageLocation: item?.location || 'refrigerator',
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Omit<FoodItem, 'id' | 'user_id' | 'household_id' | 'created_at'> = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      purchased: formData.purchaseDate,
      expiration: formData.expirationDate,
      location: formData.storageLocation,
    };

    try {
      console.log('AddItemForm.handleSubmit', payload);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('❌ Error submitting item:', err);
      alert('Failed to save item. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div className="flex items-center justify-between bg-green-500 text-white px-4 py-3">
        <h2 className="text-lg font-semibold">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <XIcon size={20} />
        </button>
      </div>

      {showScanner ? (
        <div className="p-6">
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Receipt Scanner Simulation</p>
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
              onClick={() => setShowScanner(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-white bg-blue-500 rounded-lg"
              onClick={() => {
                setFormData({
                  ...formData,
                  name: 'Milk',
                  quantity: 1,
                  unit: 'gallon',
                  category: 'dairy',
                  expirationDate: new Date(
                    Date.now() + 7 * 86400000
                  )
                    .toISOString()
                    .split('T')[0],
                });
                setShowScanner(false);
              }}
            >
              Use Scanned Data
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
              Item Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., Milk"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Quantity & Unit */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Quantity & Unit*
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="quantity"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-1/2 px-3 py-2 border rounded"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-1/2 px-3 py-2 border rounded"
              >
                <option value="piece">Piece</option>
                <option value="gallon">Gallon</option>
                <option value="oz">Ounce</option>
                <option value="lb">Pound</option>
              </select>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label htmlFor="purchaseDate" className="block text-sm text-gray-700 mb-1">
              Purchase Date*
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label htmlFor="expirationDate" className="block text-sm text-gray-700 mb-1">
              Expiration Date*
            </label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm text-gray-700 mb-1">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="fruits">Fruits</option>
              <option value="vegetables">Vegetables</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Storage Location */}
          <div>
            <label htmlFor="storageLocation" className="block text-sm text-gray-700 mb-1">
              Storage Location*
            </label>
            <select
              id="storageLocation"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="refrigerator">Refrigerator</option>
              <option value="freezer">Freezer</option>
              <option value="pantry">Pantry</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddItemForm;
