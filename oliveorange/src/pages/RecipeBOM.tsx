import React, { useState } from 'react';
import { Recipe, InventoryItem, Store } from '../types';
import { Modal } from '../components/ui/Modal';
import { BookOpen, Plus, Play, Calculator, Layers, Flame } from 'lucide-react';

interface RecipeBOMProps {
  recipes: Recipe[];
  items: InventoryItem[];
  stores: Store[];
  onCreateRecipe: (recipe: Partial<Recipe>) => void;
  onExecuteProduction: (recipeId: string, portions: number, kitchenStoreId: string) => void;
}

export const RecipeBOM: React.FC<RecipeBOMProps> = ({
  recipes,
  items,
  stores,
  onCreateRecipe,
  onExecuteProduction
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(recipes[0] || null);
  const [isNewRecipeOpen, setIsNewRecipeOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);

  // Production Execution State
  const [prodPortions, setProdPortions] = useState(100);
  const [prodKitchenId, setProdKitchenId] = useState(stores.find(s => s.type === 'KITCHEN')?.id || 'store-2');

  const handleStartProduction = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setProdPortions(recipe.standardServings);
    setIsProductionOpen(true);
  };

  const handleConfirmProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe) return;

    onExecuteProduction(selectedRecipe.id, prodPortions, prodKitchenId);
    setIsProductionOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#3D4A1E]" />
            <span>Recipe & Bill of Materials (BOM)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Standard ingredient proportions, portion cost analysis & automated batch production stock deduct
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewRecipeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#EA580C]" />
            <span>Create New Recipe / BOM</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left List, Right BOM Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipes Cards List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase text-gray-500 tracking-wider px-1">
            Standard Master Recipes ({recipes.length})
          </div>

          {recipes.map((r) => {
            const isSelected = selectedRecipe?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3D4A1E] text-white border-[#3D4A1E] shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#3D4A1E]'
                  }`}>
                    {r.code}
                  </span>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-200' : 'text-gray-500'}`}>
                    {r.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm mb-2">{r.dishName}</h3>

                <div className="flex items-center justify-between text-xs border-t pt-2 opacity-90 border-current/20">
                  <div>Standard: <strong>{r.portionSize}</strong></div>
                  <div>Cost / Portion: <strong className={isSelected ? 'text-amber-300' : 'text-[#3D4A1E]'}>₹ {r.costPerServing}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected BOM Ingredient Breakdown */}
        {selectedRecipe ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#3D4A1E]">{selectedRecipe.code}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedRecipe.dishName}</h3>
                <p className="text-xs text-gray-500">
                  Category: {selectedRecipe.category} • Prep Time: {selectedRecipe.prepTimeMinutes} mins
                </p>
              </div>

              <button
                onClick={() => handleStartProduction(selectedRecipe)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                <Flame className="w-4 h-4" />
                <span>Execute Batch Production</span>
              </button>
            </div>

            {/* Costing Overview Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
                  Standard Batch Output
                </span>
                <span className="text-base font-bold text-gray-900">{selectedRecipe.portionSize}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">
                  Total BOM Batch Cost
                </span>
                <span className="text-base font-bold text-[#3D4A1E]">₹ {selectedRecipe.totalBOMCost.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Calculated Cost / Serving
                </span>
                <span className="text-base font-extrabold text-[#3D4A1E]">₹ {selectedRecipe.costPerServing}</span>
              </div>
            </div>

            {/* Ingredient Table */}
            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">
                Bill of Materials (Raw Ingredients required for standard batch)
              </h4>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#3D4A1E] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">SKU Code</th>
                      <th className="p-3">Ingredient Name</th>
                      <th className="p-3">Required Batch Qty</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3 text-right">Estimated Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-[#3D4A1E]">{ing.itemCode}</td>
                        <td className="p-3 font-bold text-gray-900">{ing.itemName}</td>
                        <td className="p-3 font-semibold text-gray-800">{ing.quantityPerPortion}</td>
                        <td className="p-3 text-gray-600">{ing.unit}</td>
                        <td className="p-3 text-right font-bold text-[#3D4A1E]">₹ {ing.costPerPortion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRecipe.preparationNotes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <strong>Standard Culinary Instructions:</strong> {selectedRecipe.preparationNotes}
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
            Select a recipe from the master list to inspect the Bill of Materials
          </div>
        )}
      </div>

      {/* Production Execution Modal */}
      <Modal
        isOpen={isProductionOpen}
        onClose={() => setIsProductionOpen(false)}
        title={`Execute Batch Production: ${selectedRecipe?.dishName}`}
        subtitle="Automated deduction of raw materials from kitchen inventory"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmProduction} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-gray-800">
            <div className="font-bold text-[#3D4A1E]">Recipe Code: {selectedRecipe?.code}</div>
            <div className="text-[11px] mt-0.5">Standard Servings: {selectedRecipe?.standardServings} Portions</div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Kitchen Section</label>
            <select
              value={prodKitchenId}
              onChange={(e) => setProdKitchenId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-bold text-gray-900"
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Number of Servings / Portions to Produce</label>
            <input
              type="number"
              required
              min={1}
              value={prodPortions}
              onChange={(e) => setProdPortions(Number(e.target.value))}
              className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-base text-gray-900"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
            ⚡ <strong>Automated Stock Impact:</strong> Confirming batch execution will automatically deduct proportional raw material quantities from <strong>{stores.find(s => s.id === prodKitchenId)?.name}</strong> stock.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsProductionOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Execute & Deduct Raw Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
