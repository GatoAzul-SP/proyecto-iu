import { signal, computed } from '@angular/core';

export interface CartItem {
	id: string;
	title: string;
	price: number;
	image: string;
	quantity: number;
}

declare function loadSetting(key: string): any;
declare function saveSetting(key: string, value: any): void;

// Initialize cart from persistent storage
function initCart(): CartItem[] {
	if (typeof window !== "undefined" && typeof loadSetting === "function") {
		try {
			const saved = loadSetting("cart_data");
			if (Array.isArray(saved)) return saved;
		} catch(e) {}
	}
	return [];
}

export const cartState = signal<CartItem[]>(initCart());

export const appliedCoupon = signal<string | null>(null);

// Computes the total quantity of items in the cart
export const cartTotalItems = computed(() => {
	return cartState().reduce((acc, item) => acc + item.quantity, 0);
});

// Computes the subtotal price (before discount)
export const cartSubtotalPrice = computed(() => {
	return cartState().reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

export const cartDiscountAmount = computed(() => {
	const code = appliedCoupon();
	if (code === 'ABCDFG') {
		return cartSubtotalPrice() * 0.30;
	}
	return 0;
});

// Computes the total price of all items in the cart (after discount)
export const cartTotalPrice = computed(() => {
	return cartSubtotalPrice() - cartDiscountAmount();
});

export function applyCoupon(code: string): boolean {
	if (code.trim().toUpperCase() === 'ABCDFG') {
		appliedCoupon.set('ABCDFG');
		return true;
	}
	return false;
}

export function removeCoupon() {
	appliedCoupon.set(null);
}

// Synchronizes the cart with persistent storage
function syncCart() {
	if (typeof window !== "undefined" && typeof saveSetting === "function") {
		saveSetting("cart_data", cartState());
	}
}

// Global actions
export function addToCart(product: Omit<CartItem, 'quantity'>) {
	cartState.update(items => {
		const existingItemIndex = items.findIndex(i => i.id === product.id);
		let newItems = [...items];
		
		if (existingItemIndex >= 0) {
			// Increase quantity
			const current = newItems[existingItemIndex];
			newItems[existingItemIndex] = { ...current, quantity: current.quantity + 1 };
		} else {
			// Add new item
			newItems.push({ ...product, quantity: 1 });
		}
		
		return newItems;
	});
	syncCart();
}

export function removeFromCart(id: string) {
	cartState.update(items => items.filter(i => i.id !== id));
	syncCart();
}

export function updateQuantity(id: string, quantity: number) {
	if (quantity <= 0) {
		removeFromCart(id);
		return;
	}
	cartState.update(items => {
		const newItems = [...items];
		const idx = newItems.findIndex(i => i.id === id);
		if (idx >= 0) {
			newItems[idx] = { ...newItems[idx], quantity };
		}
		return newItems;
	});
	syncCart();
}

export function clearCart() {
	cartState.set([]);
	syncCart();
}
