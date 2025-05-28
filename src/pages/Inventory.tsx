import React, { useState } from 'react';
import { useInventory } from '../contexts/useInventory'; // ✅ fixed import
import { FoodItem } from '../contexts/InventoryContext';
import FoodItemCard from '../components/Inventory/FoodItemCard';
import AddItemForm from '../components/Inventory/AddItemForm';
import { PlusIcon, FilterIcon } from 'lucide-react';

const Inventory: React.FC = () => {
  const { items, loading, deleteItem, addItem, updateItem } = useInventory();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    expiringSoon: false,
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  const handleFormSubmit = async (
    data: Omit<FoodItem, 'id' | 'user_id' | 'household_id' | 'created_at'>
  ) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      console.log('Inventory.handleFormSubmit', data, { editingItem });
      await addItem(data);
    }
    setShowAddForm(false);
    setEditingItem(null);
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      category: '',
      expiringSoon: false,
      search: '',
    });
  };

  const filteredItems = items.filter(item => {
    const matchesLocation = !filters.location || item.location === filters.location;
    const matchesCategory = !filters.category || item.category === filters.category;

    const matchesExpiringSoon = !filters.expiringSoon || (() => {
      const today = new Date();
      const expDate = new Date(item.expiration);
      const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiration >= 0 && daysUntilExpiration <= 7;
    })();

    const matchesSearch = !filters.search ||
      item.name.toLowerCase().includes(filters.search.toLowerCase());

    return matchesLocation && matchesCategory && matchesExpiringSoon && matchesSearch;
  });

  const locations = [...new Set(items.map(item => item.location))];
  const categories = [...new Set(items.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in your inventory
          </p>
        </div>

        <div className="flex space-x-3 mt-3 sm:mt-0">
          <button
            onClick={toggleFilters}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FilterIcon size={18} className="mr-1" />
            Filter
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <PlusIcon size={18} className="mr-1" />
            Add Item
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium text-gray-700">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="expiringSoon"
                  checked={filters.expiringSoon}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-green-500 focus:ring-green-400 border-gray-300 rounded mr-2"
                />
                Expiring Soon (7 days)
              </label>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No items match your current filters.</p>
          {items.length > 0 && (
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
          {items.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <PlusIcon size={18} className="mr-1" />
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <FoodItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0	bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AddItemForm
            item={editingItem}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowAddForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;
