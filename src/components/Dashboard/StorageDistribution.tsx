import React from 'react';
import { PackageIcon } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

const StorageDistribution: React.FC = () => {
  const { getStorageLocationCounts } = useInventory();
  const locationCounts = getStorageLocationCounts();
  
  const totalItems = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
  
  const formatLocationName = (location: string) => {
    return location.charAt(0).toUpperCase() + location.slice(1);
  };
  
  const getLocationColor = (location: string) => {
    switch (location) {
      case 'refrigerator':
        return { bg: 'bg-blue-500', text: 'text-blue-500' };
      case 'freezer':
        return { bg: 'bg-indigo-500', text: 'text-indigo-500' };
      case 'pantry':
        return { bg: 'bg-amber-500', text: 'text-amber-500' };
      case 'counter':
        return { bg: 'bg-green-500', text: 'text-green-500' };
      case 'cabinet':
        return { bg: 'bg-purple-500', text: 'text-purple-500' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-500' };
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-green-500 text-white flex items-center">
        <PackageIcon size={20} className="mr-2" />
        <h2 className="text-lg font-semibold">Storage Distribution</h2>
      </div>
      
      <div className="p-4">
        {totalItems > 0 ? (
          <>
            <div className="flex h-8 rounded-lg overflow-hidden mb-4">
              {Object.entries(locationCounts).map(([location, count]) => {
                const percentage = (count / totalItems) * 100;
                return (
                  <div 
                    key={location}
                    className={`${getLocationColor(location).bg} h-full`}
                    style={{ width: `${percentage}%` }}
                    title={`${formatLocationName(location)}: ${count} items (${percentage.toFixed(1)}%)`}
                  ></div>
                );
              })}
            </div>
            
            <div className="space-y-2">
              {Object.entries(locationCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([location, count]) => (
                  <div key={location} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getLocationColor(location).bg} mr-2`}></div>
                      <span className="text-gray-700">{formatLocationName(location)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({((count / totalItems) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">No items in inventory</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageDistribution;