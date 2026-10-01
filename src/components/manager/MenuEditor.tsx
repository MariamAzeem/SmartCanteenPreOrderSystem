import React, { useState } from 'react';
import { Plus, Edit2, CheckCircle2, AlertTriangle, Layers, Trash2, Search, X } from 'lucide-react';
import { MenuItem, ItemStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface MenuEditorProps {
  menuItems: MenuItem[];
}

export const MenuEditor: React.FC<MenuEditorProps> = ({ menuItems }) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [price, setPrice] = useState(350);
  const [quantity, setQuantity] = useState(15);
  const [prepTime, setPrepTime] = useState(8);
  const [status, setStatus] = useState<ItemStatus>('Available');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsNew(true);
    setName('');
    setCategory('Burgers');
    setPrice(350);
    setQuantity(20);
    setPrepTime(8);
    setStatus('Available');
    setImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80');
    setDescription('Delicious freshly cooked meal item.');
    setEditingItem({
      id: `menu-${Date.now()}`,
      name: '',
      category: 'Burgers',
      price: 350,
      availableQuantity: 20,
      preparationTime: 8,
      status: 'Available',
      image: '',
      description: '',
    });
  };

  const handleOpenEdit = (item: MenuItem) => {
    setIsNew(false);
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setQuantity(item.availableQuantity);
    setPrepTime(item.preparationTime);
    setStatus(item.status);
    setImage(item.image);
    setDescription(item.description);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter an item name', 'error');
      return;
    }

    const numQty = Number(quantity);
    if (numQty === 0 && (status === 'Available' || status === 'Limited')) {
      showToast('Add stock first. Quantity must be more than 0.', 'error');
      return;
    }

    try {
      const saved: MenuItem = {
        id: editingItem?.id || `menu-${Date.now()}`,
        name: name.trim(),
        category,
        price: Number(price),
        availableQuantity: numQty,
        preparationTime: Number(prepTime),
        status: numQty === 0 ? 'Sold Out' : status,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        description,
        isPopular: editingItem?.isPopular || false,
      };

      storageService.saveMenuItem(saved);
      showToast(`Saved "${saved.name}" to menu.`, 'success');
      setEditingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cannot save item';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="font-heading font-extrabold text-lg text-slate-900">
            Menu Item & Real-Time Stock Management
          </h2>
          <p className="text-xs text-slate-500">
            Edit pricing, available portion counts, preparation durations, and instant status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs shadow-md shadow-orange-500/20 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#FF7A00]"
        />
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">{item.category}</td>
                  <td className="py-3 px-4 font-bold text-[#FF7A00]">Rs. {item.price}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        item.availableQuantity === 0
                          ? 'text-rose-600'
                          : item.availableQuantity <= 4
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.availableQuantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">~{item.preparationTime} min</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'Limited'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {isNew ? 'Add New Canteen Item' : `Edit: ${editingItem.name}`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Fries & Sides">Fries & Sides</option>
                    <option value="Sandwiches & Rolls">Sandwiches & Rolls</option>
                    <option value="Rice & Desi">Rice & Desi</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts & Breakfast">Desserts & Breakfast</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={Number(quantity) === 0 ? 'Sold Out' : status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Available" disabled={Number(quantity) === 0}>
                      Available {Number(quantity) === 0 ? '(Disabled: Add stock first)' : ''}
                    </option>
                    <option value="Limited" disabled={Number(quantity) === 0}>
                      Limited Stock {Number(quantity) === 0 ? '(Disabled: Add stock first)' : ''}
                    </option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                  </select>
                  {Number(quantity) === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">
                      Add stock first. Quantity must be more than 0 to mark Available.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#e66e00] font-bold text-white shadow-md shadow-orange-500/20"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
