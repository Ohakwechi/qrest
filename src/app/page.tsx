// src/app/page.tsx
'use html';
'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { Product, CartItem, StrainType, CategoryType } from '@/types';

export default function SimpleShop() {
  // --- STATE ---
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [selectedStrain, setSelectedStrain] = useState<StrainType | 'All'>('All');

  // Load/Save verification state
  useEffect(() => {
    const verified = localStorage.getItem('cannabis_age_verified');
    setIsAgeVerified(verified === 'true');
  }, []);

  const handleVerifyAge = (verified: boolean) => {
    if (verified) {
      localStorage.setItem('cannabis_age_verified', 'true');
      setIsAgeVerified(true);
    } else {
      alert('You must be 21 or older to view this shop.');
    }
  };

  // --- CART FUNCTIONS ---
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => 
      prevCart.map(item => {
        if (item.product.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // --- FILTER LOGIC ---
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchCat = selectedCategory === 'All' || product.category === selectedCategory;
    const matchStrain = selectedStrain === 'All' || product.strain === selectedStrain;
    return matchCat && matchStrain;
  });

  // --- RENDER AGE GATE ---
  if (isAgeVerified === false || isAgeVerified === null) {
    return (
      <div className="fixed inset-0 bg-[#0B1511] flex flex-col items-center justify-center text-white px-4 z-50">
        <div className="max-w-md w-full bg-[#1C3A27] p-8 rounded-2xl text-center border border-emerald-800 shadow-2xl">
          <h1 className="text-3xl font-serif font-bold tracking-wide text-amber-400 mb-2">Boutique Menu</h1>
          <p className="text-gray-300 text-sm mb-6">Verify location compliance protocols</p>
          <p className="text-xl font-medium mb-8">Are you 21 years of age or older?</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleVerifyAge(false)}
              className="flex-1 py-3 px-6 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition"
            >
              No
            </button>
            <button 
              onClick={() => handleVerifyAge(true)}
              className="flex-1 py-3 px-6 rounded-lg bg-emerald-500 font-bold text-black hover:bg-emerald-400 transition"
            >
              Yes, I am 21+
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CORE INTERACTIVE MENU ---
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0B1511] font-sans antialiased">
      {/* Navbar Header */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-6 py-4 flex justify-between items-center">
        <span className="text-2xl font-serif font-bold tracking-wider text-[#1C3A27]">GREENHOUSE</span>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-[#1C3A27] text-white py-2 px-5 rounded-full font-medium flex items-center gap-2 hover:bg-[#2c583c] transition"
        >
          Cart
          <span className="bg-emerald-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      </nav>

      {/* Main Framework Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Quick Categorization Controls */}
        <div className="flex flex-wrap gap-8 items-center justify-between mb-10 pb-6 border-b border-gray-200">
          {/* Category Filter */}
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
            {(['All', 'Flower', 'Concentrates', 'Edibles'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition ${
                  selectedCategory === cat ? 'bg-white shadow-sm text-[#1C3A27]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Strain Filter Tag Badging */}
          <div className="flex gap-2">
            {(['All', 'Sativa', 'Indica', 'Hybrid'] as const).map((strain) => (
              <button
                key={strain}
                onClick={() => setSelectedStrain(strain)}
                className={`py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition border ${
                  selectedStrain === strain
                    ? strain === 'Sativa' ? 'bg-amber-500 border-amber-500 text-white' :
                      strain === 'Indica' ? 'bg-purple-600 border-purple-600 text-white' :
                      strain === 'Hybrid' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-[#0B1511] text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {strain}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            // Setup accent badges for Leafly-style strain visualization
            const colorMap = {
              Sativa: 'text-amber-600 bg-amber-50 border-amber-200',
              Indica: 'text-purple-600 bg-purple-50 border-purple-200',
              Hybrid: 'text-emerald-600 bg-emerald-50 border-emerald-200'
            };

            return (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300" 
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${colorMap[product.strain]}`}>
                    {product.strain}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{product.brand}</p>
                    <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight mb-2">{product.name}</h3>
                    <div className="flex gap-3 text-xs font-semibold text-gray-500 mb-4">
                      <span>THC: {product.thc}%</span>
                      {product.cbd > 0 && <span>CBD: {product.cbd}%</span>}
                      <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded text-gray-600">{product.weight}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-[#1C3A27] hover:bg-[#2c583c] text-white font-medium text-sm py-2 px-4 rounded-xl transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Slide-out Sidebar Drawer for Shopping Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop Closer Click Catch */}
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <h2 className="text-xl font-serif font-bold">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black text-xl font-bold">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Your shopping cart is currently empty.</p>
              ) : (
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <img src={item.product.image} className="w-16 h-16 object-cover rounded-lg" alt="" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-gray-400">{item.product.weight} • ${item.product.price.toFixed(2)}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-300">-</button>
                          <span className="text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-300">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Layout Footer Section */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => alert('Proceeding to compliant checkout flow integrations...')}
                  className="w-full bg-[#1C3A27] hover:bg-[#2c583c] text-white text-center font-bold py-3.5 rounded-xl transition shadow-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}