//Defines a React component that displays a list of recipes, while integrating inventory data from the InventoryContext
import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import RecipeCard, { Recipe } from '../components/Recipes/RecipeCard';
import { SearchIcon, RefreshCwIcon } from 'lucide-react';
import RecipeList from '../components/Recipes/RecipeList'; 

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Creamy Garlic Parmesan Chicken',
    image: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg',
    readyInMinutes: 45,
    servings: 4,
    sourceUrl: 'https://example.com/recipe1',
    usedIngredientCount: 5,
    missedIngredientCount: 2,
    usedIngredients: [
      { name: 'Chicken' },
      { name: 'Garlic' },
      { name: 'Parmesan' },
      { name: 'Cream' },
      { name: 'Butter' }
    ],
    missedIngredients: [
      { name: 'Fresh Herbs' },
      { name: 'White Wine' }
    ]
  },
  {
    id: '2',
    title: 'Quick Vegetable Stir Fry',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg',
    readyInMinutes: 20,
    servings: 2,
    sourceUrl: 'https://example.com/recipe2',
    usedIngredientCount: 4,
    missedIngredientCount: 1,
    usedIngredients: [
      { name: 'Broccoli' },
      { name: 'Carrots' },
      { name: 'Bell Peppers' },
      { name: 'Soy Sauce' }
    ],
    missedIngredients: [
      { name: 'Sesame Oil' }
    ]
  },
  {
    id: '3',
    title: 'Classic Spaghetti Bolognese',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    readyInMinutes: 60,
    servings: 6,
    sourceUrl: 'https://example.com/recipe3',
    usedIngredientCount: 6,
    missedIngredientCount: 3,
    usedIngredients: [
      { name: 'Ground Beef' },
      { name: 'Onions' },
      { name: 'Garlic' },
      { name: 'Tomatoes' },
      { name: 'Pasta' },
      { name: 'Olive Oil' }
    ],
    missedIngredients: [
      { name: 'Bay Leaves' },
      { name: 'Red Wine' },
      { name: 'Fresh Basil' }
    ]
  },
  {
    id: '4',
    title: 'Simple Greek Salad',
    image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg',
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: 'https://example.com/recipe4',
    usedIngredientCount: 5,
    missedIngredientCount: 1,
    usedIngredients: [
      { name: 'Cucumber' },
      { name: 'Tomatoes' },
      { name: 'Red Onion' },
      { name: 'Feta Cheese' },
      { name: 'Olive Oil' }
    ],
    missedIngredients: [
      { name: 'Kalamata Olives' }
    ]
  },
  {
    id: '5',
    title: 'Berry Breakfast Smoothie',
    image: 'https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg',
    readyInMinutes: 5,
    servings: 1,
    sourceUrl: 'https://example.com/recipe5',
    usedIngredientCount: 3,
    missedIngredientCount: 1,
    usedIngredients: [
      { name: 'Banana' },
      { name: 'Berries' },
      { name: 'Yogurt' }
    ],
    missedIngredients: [
      { name: 'Honey' }
    ]
  },
  {
    id: '6',
    title: 'Easy Baked Salmon',
    image: 'https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg',
    readyInMinutes: 25,
    servings: 2,
    sourceUrl: 'https://example.com/recipe6',
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [
      { name: 'Salmon Fillet' },
      { name: 'Lemon' },
      { name: 'Garlic' },
      { name: 'Olive Oil' }
    ],
    missedIngredients: [
      { name: 'Fresh Dill' },
      { name: 'Dijon Mustard' }
    ]
  }
];

const Recipes: React.FC = () => {
  const { items, loading } = useInventory();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'time'>('relevance');

  // Simulate loading recipes based on inventory
  useEffect(() => {
    if (items.length > 0) {
      setLoadingRecipes(true);
      
      // Simulate API delay
      const timer = setTimeout(() => {
        setRecipes(mockRecipes);
        setLoadingRecipes(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [items]);

  // Filter recipes by search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'relevance') {
      return b.usedIngredientCount - a.usedIngredientCount;
    } else {
      return a.readyInMinutes - b.readyInMinutes;
    }
  });

  // Refresh recipes (simulate)
  const refreshRecipes = () => {
    setLoadingRecipes(true);
    
    setTimeout(() => {
      // Shuffle the recipes to simulate new results
      setRecipes([...mockRecipes].sort(() => Math.random() - 0.5));
      setLoadingRecipes(false);
    }, 1000);
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Recipe Suggestions</h1>
        <p className="text-gray-300">Discover recipes based on what's in your inventory.</p>
      </header>
      
      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Add items to get recipe suggestions</h2>
          <p className="text-gray-600 mb-6">
            Your inventory is empty. Add items to get personalized recipe suggestions.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'time')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="relevance">Ingredient Match</option>
                  <option value="time">Preparation Time</option>
                </select>
              </div>
              
              <button
                onClick={refreshRecipes}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={loadingRecipes}
              >
                <RefreshCwIcon size={18} className={`mr-1 ${loadingRecipes ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {loadingRecipes ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : sortedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No recipes found matching your search.</p>
            </div>
          )}
          
          <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
            <h3 className="font-medium text-amber-800 mb-1">Recipe Suggestion Tip</h3>
            <p className="text-amber-700 text-sm">
              Use up ingredients about to expire! Sort by ingredient match to find recipes that use the most items from your inventory.
            </p>
          </div>
        </>
      )}

      <div>
        <RecipeList />
      </div>
    </div>
  );
};

export default Recipes;