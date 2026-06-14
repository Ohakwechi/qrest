// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export type CategoryType = 'Flower' | 'Cones' | 'Edibles' | 'Accessories';

export interface ProductOption {
  label: string;  
  price: number;
  category: CategoryType;
  strain: string;
  thc: number;
  cbd: number;
  image: string;
  weight: string;
}

export interface Product {
  _id: string; 
  name: string;
  brand: string;
  options: ProductOption[]; 
}

export interface CartItem {
  product: Product;
  selectedOption: ProductOption;
  quantity: number;
}

export default function Home() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [selectedCardOptions, setSelectedCardOptions] = useState<Record<string, ProductOption>>({});
  const [loading, setLoading] = useState(true);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('cannabis_age_verified');
    setIsAgeVerified(verified === 'true');

    async function loadInventory() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          
          const initialOpts: Record<string, ProductOption> = {};
          data.forEach((p: Product) => {
            if (p.options && p.options.length > 0) {
              initialOpts[p._id] = p.options[0];
            }
          });
          setSelectedCardOptions(initialOpts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const handleVerifyAge = (verified: boolean) => {
    if (verified) {
      localStorage.setItem('cannabis_age_verified', 'true');
      setIsAgeVerified(true);
    } else {
      alert('Access denied. You must be 21 or older.');
    }
  };

  const addToCart = (product: Product) => {
    const activeOption = selectedCardOptions[product._id] || product.options[0];
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        item => item.product._id === product._id && item.selectedOption.label === activeOption.label
      );

      if (existingIndex > -1) {
        return prevCart.map((item, idx) => 
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, selectedOption: activeOption, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, optionLabel: string, delta: number) => {
    setCart((prevCart) => 
      prevCart.map(item => {
        if (item.product._id === productId && item.selectedOption.label === optionLabel) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.selectedOption.price * item.quantity), 0);

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'All') return true;
    const currentOption = selectedCardOptions[product._id] || product.options[0];
    return currentOption.category === selectedCategory;
  });

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Please fill out delivery form fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const compiledCartItems = cart.map(item => ({
        name: item.selectedOption.label,
        parentGroup: item.product.name,
        price: item.selectedOption.price,
        quantity: item.quantity,
        weight: item.selectedOption.weight
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          cartItems: compiledCartItems,
          totalAmount: cartTotal
        })
      });

      const data = await response.json();
      if (data.success && data.cashierUrl) {
        setCart([]);
        setIsCartOpen(false);
        window.location.href = data.cashierUrl;
      } else {
        alert('Checkout validation pipeline failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error establishing secure checkout session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAgeVerified === false || isAgeVerified === null) {
    return (
      <div className="fixed inset-0 bg-[#0B1511] flex flex-col items-center justify-center text-white px-4 z-50">
        <div className="max-w-md w-full bg-[#1C3A27] p-8 rounded-2xl text-center border border-emerald-800 shadow-2xl">
          <h1 className="text-3xl font-serif font-bold tracking-wide text-amber-400 mb-2">Greenhouse</h1>
          <p className="text-gray-300 text-sm mb-6">Age Verification Required</p>
          <p className="text-xl font-medium mb-8">Are you 21 years of age or older?</p>
          <div className="flex gap-4">
            <button onClick={() => handleVerifyAge(false)} className="flex-1 py-3 px-6 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition">No</button>
            <button onClick={() => handleVerifyAge(true)} className="flex-1 py-3 px-6 rounded-lg bg-emerald-500 font-bold text-black hover:bg-emerald-400 transition">Yes, I am 21+</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0B1511] font-sans antialiased">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-6 py-4 flex justify-between items-center">
        <span className="text-2xl font-serif font-bold tracking-wider text-[#1C3A27]">GREENHOUSE</span>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-[#1C3A27] text-white py-2 px-5 rounded-full font-medium flex items-center gap-2 hover:bg-[#2c583c] transition">
          Cart
          <span className="bg-emerald-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="relative bg-gradient-to-r min-h-[14rem] sm:h-[16rem] from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg mb-10 flex flex-col sm:flex-row sm:items-center justify-between overflow-hidden">
          <div className="z-10 max-w-xs md:max-w-md mb-4 sm:mb-0">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-wide mb-2">Premium Essentials</h1>
            <p className="text-emerald-100 text-sm">Monolithic dynamic menu connected directly to your cluster database layer.</p>
          </div>
          <div className="relative w-full sm:w-1/3 h-36 sm:h-full min-h-[120px] sm:min-h-0 opacity-90 sm:opacity-100">
            <Image
              src="/images/wizkid2.jpeg"
              alt="Smoke Accessories"
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              loading="eager"
              className="rounded-xl shadow-md object-cover"
            />
          </div>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-max mb-10 overflow-x-auto">
          {(['All', 'Flower', 'Cones', 'Edibles', 'Accessories'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-5 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                selectedCategory === cat ? 'bg-white shadow-sm text-[#1C3A27]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Querying active inventory clusters...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No items uploaded match this filter selection.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentOption = selectedCardOptions[product._id] || product.options[0];

              return (
                <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img src={currentOption.image} alt={currentOption.label} className="w-full h-full object-cover transition-all duration-300" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-white border-gray-200 shadow-sm">
                      {currentOption.category}
                    </span>
                    <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-xs">
                      {currentOption.weight}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{product.brand}</p>
                      
                      <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight mb-2">
                        {currentOption.label}
                      </h3>
                      
                      <p className="text-xs text-gray-500 italic mb-3">
                        Profile: {currentOption.strain}
                      </p>
                      
                      {currentOption.thc > 0 && (
                        <div className="flex gap-3 text-xs font-semibold text-emerald-700 bg-emerald-50 w-max px-2.5 py-1 rounded-md mb-2">
                          <span>THC: {currentOption.thc}%</span>
                          {currentOption.cbd > 0 && <span>• CBD: {currentOption.cbd}%</span>}
                        </div>
                      )}

                      {product.options.length > 1 && (
                        <div className="mt-4 mb-2">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Choose Item:</p>
                          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-full border border-gray-200/50">
                            {product.options.map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setSelectedCardOptions(prev => ({ ...prev, [product._id]: opt }))}
                                className={`flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 ${
                                  currentOption.label === opt.label 
                                    ? 'bg-[#1C3A27] text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/60'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-gray-100">
                      <span className="text-xl font-black text-gray-900">₦{currentOption.price.toLocaleString()}</span>
                      <button onClick={() => addToCart(product)} className="bg-[#1C3A27] hover:bg-[#2c583c] text-white font-bold text-sm py-2.5 px-5 rounded-xl transition shadow-sm active:scale-95">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <h2 className="text-xl font-serif font-bold">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black">✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={`${item.product._id}-${item.selectedOption.label}`} className="flex gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <img src={item.selectedOption.image} className="w-16 h-16 object-cover rounded-lg" alt="" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.selectedOption.label}</h4>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">{item.selectedOption.weight} • ₦{item.selectedOption.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.product._id, item.selectedOption.label, -1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">-</button>
                          <span className="text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product._id, item.selectedOption.label, 1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCheckoutSubmit} className="border-t border-gray-100 pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</label>
                  <input required type="text" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Wizkid" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-700" />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Phone Number</label>
                  <input required type="tel" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="+234..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-700" />
                </div>

                <div className="flex justify-between text-lg font-black text-gray-900 py-2">
                  <span>Total Due</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1C3A27] disabled:bg-gray-400 text-white text-center font-bold py-3.5 rounded-xl transition shadow-sm">
                  {isSubmitting ? 'Processing Secure Session...' : 'Pay with OPay'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}