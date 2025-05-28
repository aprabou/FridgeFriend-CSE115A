import React from 'react';
import { ClockIcon, UsersIcon, GlobeIcon } from 'lucide-react';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: { name: string }[];
  missedIngredients: { name: string }[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg';
          }}
        />
        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg">
          {recipe.usedIngredientCount} ingredients matched
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg text-gray-800 mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center text-gray-600 text-sm space-x-4 mb-3">
          <div className="flex items-center">
            <ClockIcon size={16} className="mr-1" />
            <span>{recipe.readyInMinutes} min</span>
          </div>
          <div className="flex items-center">
            <UsersIcon size={16} className="mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Available Ingredients:</h4>
          <div className="flex flex-wrap gap-1">
            {recipe.usedIngredients.map((ingredient, index) => (
              <span 
                key={index} 
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
              >
                {ingredient.name}
              </span>
            ))}
          </div>
        </div>
        
        {recipe.missedIngredientCount > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Missing Ingredients:</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.missedIngredients.map((ingredient, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <a 
            href={recipe.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <GlobeIcon size={16} className="mr-1" />
            View Recipe
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
