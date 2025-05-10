import React, { useState } from 'react';
import { XIcon, CameraIcon, MessageSquareTextIcon } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';

interface AddItemFormProps {
  onClose: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onClose }) => {
  const { addItem } = useInventory();
  const { user } = useAuth();

  const [showNotes, setShowNotes] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    category: 'dairy',
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    storageLocation: 'refrigerator',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      expiration: formData.expirationDate,
      category: formData.category,
      unit: formData.unit,
      purchased: formData.purchaseDate,
      location: formData.storageLocation,
      quantity: formData.quantity,
      notes: formData.notes,
      user_id: user?.id,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to add item to backend');
      await addItem(payload);
      onClose();
    } catch (err) {
      console.error('❌ Error adding item:', err);
      alert('Failed to add item. Please check the backend.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
      <div className="flex items-center justify-between bg-green-500 text-white px-4 py-3">
        <h2 className="text-lg font-semibold">Add New Item</h2>
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
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
              onClick={() => setShowScanner(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded-lg"
              onClick={() => {
                setFormData({
                  ...formData,
                  name: 'Milk',
                  quantity: 1,
                  unit: 'gallon',
                  category: 'dairy',
                  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
          <div>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="name">
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

          <div>
            <label className="block text-sm text-gray-700 mb-1">Quantity & Unit*</label>
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
                placeholder="1"
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

          {showNotes && (
            <div>
              <label htmlFor="notes" className="block text-sm text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded"
                placeholder="Add any additional details..."
              />
            </div>
          )}

          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => setShowNotes(!showNotes)} className="text-blue-600">
              {showNotes ? 'Hide Notes' : 'Add Notes'}
            </button>
            <button type="button" onClick={() => setShowScanner(true)} className="text-blue-600">
              Scan Receipt
            </button>
          </div>

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
              Add Item
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddItemForm;
