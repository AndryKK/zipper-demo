'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  variantArticle: string;
  variantColor: string;
  colorHex: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>) => void;
  remove: (article: string) => void;
  update: (article: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx>({
  items: [], add: () => {}, remove: () => {}, update: () => {}, clear: () => {}, total: 0, count: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantArticle === item.variantArticle);
      if (existing) return prev.map(i => i.variantArticle === item.variantArticle ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((article: string) => {
    setItems(prev => prev.filter(i => i.variantArticle !== article));
  }, []);

  const update = useCallback((article: string, qty: number) => {
    if (qty <= 0) { remove(article); return; }
    setItems(prev => prev.map(i => i.variantArticle === article ? { ...i, quantity: qty } : i));
  }, [remove]);

  const clear = useCallback(() => setItems([]), []);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
