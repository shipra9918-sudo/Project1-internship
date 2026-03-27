import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  items: [],
  restaurant: null,
  total: 0,

  addItem: (item, restaurant) => {
    const { items, restaurant: currentRestaurant } = get();

    // Validate single restaurant per cart
    if (currentRestaurant && currentRestaurant._id !== restaurant._id) {
      toast.error('Cannot add items from different restaurants. Please clear your cart first.');
      return false;
    }

    const existingIndex = items.findIndex(i => i.menuItem === item._id);

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      set({ items: newItems });
    } else {
      set({
        items: [...items, {
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: 1
        }],
        restaurant
      });
    }

    get().calculateTotal();
    toast.success(`${item.name} added to cart`);
    return true;
  },

  removeItem: (menuItemId) => {
    const newItems = get().items.filter(item => item.menuItem !== menuItemId);
    set({ items: newItems });
    
    if (newItems.length === 0) {
      set({ restaurant: null, total: 0 });
    } else {
      get().calculateTotal();
    }
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    const newItems = get().items.map(item =>
      item.menuItem === menuItemId ? { ...item, quantity } : item
    );
    set({ items: newItems });
    get().calculateTotal();
  },

  clearCart: () => {
    set({ items: [], restaurant: null, total: 0 });
    toast.success('Cart cleared');
  },

  calculateTotal: () => {
    const total = get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ total });
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
