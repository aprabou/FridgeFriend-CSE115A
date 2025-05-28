import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/useInventory';
import RecipeCard, { Recipe } from '../components/Recipes/RecipeCard';
import { SearchIcon, RefreshCwIcon } from 'lucide-react';

const RECIPES_PER_PAGE = 9;

const Recipes: React.FC = () => {
  const { items, loading } = useInventory();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'time'>('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (items.length === 0) return;

      setLoadingRecipes(true);
      try {
        const ingredients = items.map(item => item.name).join(',');
        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

        const response = await fetch(
          `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=50&ranking=1&ignorePantry=true&apiKey=${apiKey}`
        );

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error('Unexpected API response:', data);
          return;
        }

        const formattedRecipes: Recipe[] = data.map((recipe: any) => ({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 2,
          sourceUrl: `https://spoonacular.com/recipes/${recipe.title.replace(/ /g, '-')}-${recipe.id}`,
          usedIngredientCount: recipe.usedIngredientCount,
          missedIngredientCount: recipe.missedIngredientCount,
          usedIngredients: recipe.usedIngredients.map((i: any) => ({ name: i.name })),
          missedIngredients: recipe.missedIngredients.map((i: any) => ({ name: i.name }))
        }));

        setRecipes(formattedRecipes);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [items]);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    return sortBy === 'relevance'
      ? b.usedIngredientCount - a.usedIngredientCount
      : a.readyInMinutes - b.readyInMinutes;
  });

  const totalPages = Math.ceil(sortedRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = sortedRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const refreshRecipes = () => {
    setCurrentPage(1);
    setLoadingRecipes(true);
    setTimeout(() => {
      setRecipes([...recipes].sort(() => Math.random() - 0.5));
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
        <p className="text-gray-600">Discover recipes based on what's in your inventory.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Add items to get recipe suggestions</h2>
          <p className="text-gray-600 mb-6">Your inventory is empty. Add items to get personalized recipe suggestions.</p>
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
          ) : paginatedRecipes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
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
    </div>
  );
};

export default Recipes;
