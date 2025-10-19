"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  _id: string;
  title: string;
  cost: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { _id: string; title: string; cost: number; imageUrl: string; category?: string }) => void;
  updateQuantity: (_id: string, quantity: number) => void;
  removeFromCart: (_id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: { _id: string; title: string; cost: number; imageUrl: string; category?: string }) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          title: product.title,
          cost: product.cost,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(_id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (_id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== _id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const total = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}