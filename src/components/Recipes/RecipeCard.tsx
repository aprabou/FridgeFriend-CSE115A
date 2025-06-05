//Renders lists of used and missing ingredients for a recipe, styling each ingredient as a tag
//Used ingredients are displayed with a green background and missing ingredients are shown with a gray background
//Both backgrounds are conditionally rendered based on the recipe data
"use client"

import type React from "react"
import { ClockIcon, UsersIcon, GlobeIcon } from "lucide-react"

export interface Recipe {
  id: string
  title: string
  image: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  usedIngredientCount: number
  missedIngredientCount: number
  usedIngredients: { name: string }[]
  missedIngredients: { name: string }[]
}

interface RecipeCardProps {
  recipe: Recipe
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:border-emerald-600 group">
      {/* Image */}
      <div className="relative h-48 bg-gray-700 shrink-0">
        <img
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
          }}
        />
        <div className="absolute top-0 right-0 bg-emerald-600 text-white px-2 py-1 text-xs font-medium rounded-bl-lg">
          {recipe.usedIngredientCount} ingredients matched
        </div>
      </div>

      {/* Info Section that stretches to bottom */}
      <div className="flex flex-col justify-between flex-grow p-4">
        <div>
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-lg text-gray-100 mb-2 line-clamp-2 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            {recipe.title}
          </a>

          <div className="flex items-center text-gray-400 text-sm space-x-4 mb-3">
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1 text-emerald-400" />
              <span>{recipe.readyInMinutes} min</span>
            </div>
            <div className="flex items-center">
              <UsersIcon size={16} className="mr-1 text-emerald-400" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-1">Available Ingredients:</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.usedIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-full border border-emerald-700/50"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>

          {recipe.missedIngredientCount > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-1">Missing Ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {recipe.missedIngredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full border border-gray-600"
                  >
                    {ingredient.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Link */}
        <div className="pt-2 border-t border-gray-700 mt-4">
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-400 hover:text-emerald-400 text-sm font-medium transition-colors group/link"
          >
            <GlobeIcon size={16} className="mr-1 group-hover/link:text-emerald-400 transition-colors" />
            View Recipe
          </a>
        </div>
      </div>
    </div>

  )
}

export default RecipeCard
