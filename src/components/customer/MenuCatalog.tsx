import React, { useState, useMemo } from 'react';
import { Search, Flame, Clock, Star, Plus, Minus, Sparkles, SlidersHorizontal, AlertCircle, ShoppingCart } from 'lucide-react';
import { MenuItem } from '../../types';
import { aiService } from '../../services/aiService';

interface MenuCatalogProps {
  items: MenuItem[];
  cart: { [itemId: string]: number };
  onAddToCart: (item: MenuItem, instruction?: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onOpenCart: () => void;
}

const CATEGORIES = [
  'All',
  'Burgers',
  'Fries & Sides',
  'Sandwiches & Rolls',
  'Rice & Desi',
  'Drinks',
  'Desserts & Breakfast',
];

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [specialInstruction, setSpecialInstruction] = useState('');

  // AI Recommendations
  const cartItemIds = Object.keys(cart);
  const aiRecommendations = useMemo(() => {
    return aiService.getRecommendations(items, cartItemIds);
  }, [items, cartItemIds]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Price filter
      if (item.price > maxPrice) {
        return false;
      }
      // Hide sold out
      if (hideSoldOut && (item.status === 'Sold Out' || item.status === 'Temporarily Unavailable')) {
        return false;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery, maxPrice, hideSoldOut]);

  const handleOpenItemModal = (item: MenuItem) => {
    setSelectedItemForModal(item);
    setSpecialInstruction('');
  };

  const handleConfirmAddWithInstruction = () => {
    if (selectedItemForModal) {
      onAddToCart(selectedItemForModal, specialInstruction.trim() || undefined);
      setSelectedItemForModal(null);
    }
  };

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* 1. TOP STICKY SEARCH & FILTER BAR (Required: At top of customer screen) */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search canteen menu (burgers, biryani, karak chai, fries...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF7A00]/40 focus:border-[#FF7A00]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Price slider trigger */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">Max: <strong>Rs. {maxPrice}</strong></span>
              <input
                type="range"
                min="100"
                max="600"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-[#FF7A00] cursor-pointer"
              />
            </div>

            {/* Hide sold out toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
              <input
                type="checkbox"
                checked={hideSoldOut}
                onChange={(e) => setHideSoldOut(e.target.checked)}
                className="rounded text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              <span className="hidden sm:inline">Hide Sold Out</span>
              <span className="sm:hidden">Available</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF7A00] text-white shadow-sm shadow-orange-500/30'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#25282D] via-[#32373E] to-[#25282D] text-white p-6 sm:p-7 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" /> Pre-Order & Collect • Zero Counter Lines
          </div>
          <h1 className="font-heading text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Order fresh meals before the <span className="text-[#FF7A00]">break bell rings</span>.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Pick your favorite food, add custom notes, select your 15-minute pickup window, and receive a digital token.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl text-xs border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prep Time on Every Item</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl text-xs border border-white/10">
              <Flame className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Unique Digital Tokens</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-orange-500/20 to-transparent pointer-events-none" />
      </div>

      {/* 3. AI Personalized Recommendations */}
      {aiRecommendations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                Recommended For You
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] font-semibold">
                AI Popular Pick
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl p-3 border border-orange-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
              >
                <img
                  src={rec.image}
                  alt={rec.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-xs text-slate-900 truncate">{rec.name}</h4>
                  <p className="text-[#FF7A00] font-bold text-xs mt-0.5">Rs. {rec.price}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <Clock className="w-3 h-3 text-[#FF7A00]" /> ⏱ {rec.preparationTime} min
                  </p>
                </div>
                <button
                  onClick={() => onAddToCart(rec)}
                  disabled={rec.status === 'Sold Out' || rec.status === 'Temporarily Unavailable'}
                  className="p-2 rounded-xl bg-orange-50 hover:bg-[#FF7A00] hover:text-white text-[#FF7A00] transition-colors disabled:opacity-50"
                  title="Add to cart"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Food Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredItems.length}</strong> items in{' '}
            <strong className="text-[#FF7A00]">{selectedCategory}</strong>
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-heading font-bold text-slate-800 text-base">No items match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range, clearing search terms, or toggling "Hide Sold Out" off.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMaxPrice(600);
                setHideSoldOut(false);
              }}
              className="px-4 py-2 rounded-xl bg-orange-50 text-[#FF7A00] font-semibold text-xs hover:bg-orange-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const inCartQty = cart[item.id] || 0;
              const isUnavailable = item.status === 'Sold Out' || item.status === 'Temporarily Unavailable';
              const isLimited = item.status === 'Limited';

              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                    isUnavailable
                      ? 'border-slate-200 opacity-60 grayscale-30'
                      : 'border-slate-200/80 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/5'
                  }`}
                >
                  {/* Card Image & Badges */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {isUnavailable && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md">
                          SOLD OUT
                        </span>
                      )}
                      {isLimited && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md">
                          Only {item.availableQuantity} Left!
                        </span>
                      )}
                      {item.isPopular && !isUnavailable && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
                          ★ Most Ordered
                        </span>
                      )}
                    </div>

                    {/* Preparation Time prominently displayed on every card */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>⏱ {item.preparationTime} min</span>
                      {item.rating && (
                        <>
                          <span className="text-white/40">•</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                          {item.name}
                        </h3>
                        {item.isSpicy && (
                          <span title="Spicy Recipe" className="text-rose-500 text-xs">🌶️</span>
                        )}
                        {item.isVegetarian && (
                          <span title="Vegetarian" className="text-emerald-500 text-xs">🌱</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price, Prep Time, and Cart Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Price</span>
                        <p className="font-heading font-extrabold text-base text-[#FF7A00]">
                          Rs. {item.price}
                        </p>
                      </div>

                      {/* Action buttons */}
                      {isUnavailable ? (
                        <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl">
                          Sold Out
                        </span>
                      ) : inCartQty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#25282D] text-white p-1 rounded-2xl shadow-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs px-1 min-w-[16px] text-center">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            disabled={inCartQty >= item.availableQuantity}
                            className="w-7 h-7 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenItemModal(item)}
                          className="px-4 py-2 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 animate-fade-in-up">
          <div
            onClick={onOpenCart}
            className="bg-[#25282D] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer hover:bg-black transition-all border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF7A00] flex items-center justify-center font-bold text-xs text-white">
                {cartTotalItems}
              </div>
              <div>
                <p className="text-xs font-bold leading-none">Tray Ready ({cartTotalItems} items)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tap to review & schedule pickup</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF7A00] text-white font-bold text-xs">
              <ShoppingCart className="w-3.5 h-3.5" /> View Cart
            </button>
          </div>
        </div>
      )}

      {/* Customize Instruction Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center gap-3">
              <img
                src={selectedItemForModal.image}
                alt={selectedItemForModal.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0"
              />
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">{selectedItemForModal.name}</h3>
                <p className="text-[#FF7A00] font-bold text-sm">Rs. {selectedItemForModal.price}</p>
                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A00]" /> ⏱ {selectedItemForModal.preparationTime} min prep time
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Special Kitchen Instructions (Optional)
              </label>
              <textarea
                placeholder="e.g. Extra spicy, no mayonnaise, well-done fries, pack separately..."
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                maxLength={100}
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 float-right mt-1">
                {specialInstruction.length}/100 chars
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddWithInstruction}
                className="flex-1 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Add To Tray
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
