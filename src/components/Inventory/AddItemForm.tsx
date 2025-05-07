import React, { useState } from 'react';
import { XIcon, CameraIcon, MessageSquareTextIcon } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

interface AddItemFormProps {
  onClose: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onClose }) => {
  const { addItem } = useInventory();
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem(formData);
    onClose();
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
                // Simulate scanned data
                setFormData({
                  ...formData,
                  name: 'Milk',
                  quantity: 1,
                  unit: 'gallon',
                  category: 'dairy',
                  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
                setShowScanner(false);
              }}
            >
              Use Scanned Data
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity*
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit*
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="piece">Piece</option>
                  <option value="lb">Pound (lb)</option>
                  <option value="oz">Ounce (oz)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="gallon">Gallon</option>
                  <option value="quart">Quart</option>
                  <option value="pint">Pint</option>
                  <option value="cup">Cup</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="l">Liter (l)</option>
                  <option value="bunch">Bunch</option>
                  <option value="package">Package</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="poultry">Poultry</option>
                  <option value="seafood">Seafood</option>
                  <option value="grains">Grains</option>
                  <option value="bakery">Bakery</option>
                  <option value="canned">Canned Goods</option>
                  <option value="frozen">Frozen Foods</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                  <option value="condiments">Condiments</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location*
                </label>
                <select
                  id="storageLocation"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="refrigerator">Refrigerator</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                  <option value="counter">Counter</option>
                  <option value="cabinet">Cabinet</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date*
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date*
                </label>
                <input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            {showNotes && (
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add any additional details..."
                ></textarea>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <MessageSquareTextIcon size={16} className="mr-1" />
                {showNotes ? 'Hide Notes' : 'Add Notes'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <CameraIcon size={16} className="mr-1" />
                Scan Receipt
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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