// Defines a React component that allows users to search for recipes based on ingredients
// It fetches recipe data from the Spoonacular API and processes additional recipe details
// Manages the loading state and recipe list using React state
import React, { useState } from 'react';
import RecipeCard, { Recipe } from './RecipeCard';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;

const RecipeList: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredients
        )}&number=10&ranking=1&ignorePantry=true&apiKey=${API_KEY}`
      );

      const data = await response.json();

      const fullData = await Promise.all(
        data.map(async (item: any) => {
          const res = await fetch(
            `https://api.spoonacular.com/recipes/${item.id}/information?includeNutrition=false&apiKey=${API_KEY}`
          );
          return await res.json();
        })
      );

      // Adapt Spoonacular data to your Recipe type
      const mapped: Recipe[] = fullData.map((item, index) => ({
        id: item.id.toString(),
        title: item.title,
        image: item.image,
        readyInMinutes: item.readyInMinutes,
        servings: item.servings,
        sourceUrl: item.sourceUrl,
        usedIngredientCount: data[index].usedIngredientCount,
        missedIngredientCount: data[index].missedIngredientCount,
        usedIngredients: data[index].usedIngredients.map((ing: any) => ({ name: ing.name })),
        missedIngredients: data[index].missedIngredients.map((ing: any) => ({ name: ing.name })),
      }));

      setRecipes(mapped);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find Recipes by Ingredients</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. tomato, cheese, bread"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button
          onClick={fetchRecipes}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center">Loading recipes...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;