//Imports necessary dependencies, including React hooks, the useInventory context, and components like RecipeCard
import React, { useState, useEffect } from "react";
import { useInventory } from "../contexts/useInventory";
import RecipeCard, { Recipe } from "../components/Recipes/RecipeCard";
import { SearchIcon, RefreshCwIcon } from "lucide-react";
import "../components-css/recipeCard.css";

const Recipes: React.FC = () => {
  const { items, loading } = useInventory();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "time">("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 9;

  useEffect(() => {
    const fetchRecipes = async () => {
      if (items.length === 0) return;

      setLoadingRecipes(true);

      try {
        const ingredients = items.map((item) => item.name).join(",");
        const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
        const response = await fetch(
          `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=50&ranking=2&ignorePantry=true&apiKey=${apiKey}`
        );
        const data = await response.json();

        const formattedRecipes: Recipe[] = data.map((recipe: any) => ({
          id: recipe.id.toString(),
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 2,
          sourceUrl: `https://spoonacular.com/recipes/${recipe.title.replace(
            / /g,
            "-"
          )}-${recipe.id}`,
          usedIngredientCount: recipe.usedIngredientCount,
          missedIngredientCount: recipe.missedIngredientCount,
          usedIngredients: recipe.usedIngredients.map((i: any) => ({
            name: i.name,
          })),
          missedIngredients: recipe.missedIngredients.map((i: any) => ({
            name: i.name,
          })),
        }));

        setRecipes(formattedRecipes);
        setCurrentPage(1); // reset page on new fetch
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [items]);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "relevance") {
      return b.usedIngredientCount - a.usedIngredientCount;
    } else {
      return a.readyInMinutes - b.readyInMinutes;
    }
  });

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = sortedRecipes.slice(
    indexOfFirstRecipe,
    indexOfLastRecipe
  );
  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage);

  const refreshRecipes = () => {
    setLoadingRecipes(true);
    setTimeout(() => {
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
    <div className="max-w-6xl mx-auto mb-6">
      <header className="mb-6 mt-8">
        <h1 className="text-3xl font-bold text-white">Recipe Suggestions</h1>
        <p className="text-gray-400">
          Discover recipes based on what's in your inventory.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-white">
            Add items to get recipe suggestions
          </h2>
          <p className="text-gray-400 mb-6">
            Your inventory is empty. Add items to get personalized recipe
            suggestions.
          </p>
        </div>
      ) : (
        <>
          <div className="dark-search rounded-lg shadow p-4 mb-6">
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
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "relevance" | "time")
                  }
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
                <RefreshCwIcon
                  size={18}
                  className={`mr-1 ${loadingRecipes ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {loadingRecipes ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : currentRecipes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i + 1
                          ? "bg-green-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                No recipes found matching your search.
              </p>
            </div>
          )}

          <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
            <h3 className="font-medium text-amber-800 mb-1">
              Recipe Suggestion Tip
            </h3>
            <p className="text-amber-700 text-sm">
              Use up ingredients about to expire! Sort by ingredient match to
              find recipes that use the most items from your inventory.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Recipes;
