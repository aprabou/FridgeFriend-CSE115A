// Defines a React component that displays a dashboard for managing food inventory
// Shows summaries like expiration and storage distribution
// All while handling loading states and rendering appropriate content based on inventory data
import React from 'react';
import ExpirationSummary from '../components/Dashboard/ExpirationSummary';
import StorageDistribution from '../components/Dashboard/StorageDistribution';
import { useInventory } from '../contexts/useInventory';
import { Link } from 'react-router-dom';
import { PlusIcon, CookingPotIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { items, loading } = useInventory();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Track your food inventory and reduce waste.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <PlusIcon size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your inventory is empty</h2>
          <p className="text-gray-600 mb-6">Start by adding some items to your inventory.</p>
          <Link 
            to="/inventory" 
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <PlusIcon size={20} className="mr-2" />
            Add Items
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ExpirationSummary />
            <StorageDistribution />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-orange-500 text-white flex items-center justify-between">
              <div className="flex items-center">
                <CookingPotIcon size={20} className="mr-2" />
                <h2 className="text-lg font-semibold">Recipe Suggestions</h2>
              </div>
              <Link 
                to="/recipes" 
                className="text-sm bg-white text-orange-500 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center py-8">
                Check out recipe suggestions based on your inventory on the Recipes page!
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">Storage Tip</h3>
            <p className="text-blue-700 text-sm">
              Store herbs like cilantro and parsley with stems in a glass of water and cover loosely with a plastic bag in the refrigerator. They'll stay fresh for up to two weeks!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
