import { Component, inject, afterNextRender, OnDestroy, signal } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Header, HeaderDescription } from "../header/header";
import { Footer } from "../footer/footer";
import { ExternalHiddenContentService } from "../external-hidden-content-service";
import { cartState, cartTotalItems, cartTotalPrice, cartSubtotalPrice, cartDiscountAmount, appliedCoupon, applyCoupon, removeCoupon, removeFromCart, updateQuantity } from "../cart.state";

@Component({
	selector: "app-checkout",
	imports: [
		Header, Footer, CommonModule, RouterLink, FormsModule
	],
	templateUrl: "./checkout.html",
	styleUrl: "./checkout.css"
})
export class Checkout implements OnDestroy {
	protected readonly headerLinks = {
		links: {
			Servicios: "/#services",
			Productos: "/#productos"
		},
		button: {"Iniciar Sesión": "login"}
	} as HeaderDescription;

	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);
	protected cartItems = cartState;
	protected cartSubtotal = cartSubtotalPrice;
	protected cartDiscount = cartDiscountAmount;
	protected activeCoupon = appliedCoupon;
	protected cartTotal = cartTotalPrice;
	protected cartCount = cartTotalItems;

	protected couponInput = signal("");
	protected couponError = signal("");

	handleApplyCoupon() {
		if (!this.couponInput().trim()) return;
		
		const success = applyCoupon(this.couponInput());
		if (success) {
			this.couponError.set("");
			this.couponInput.set("");
		} else {
			this.couponError.set("Cupón inválido o caducado.");
		}
	}

	handleRemoveCoupon() {
		removeCoupon();
		this.couponError.set("");
	}

	constructor() {
		afterNextRender(() => {
			this.extHidContentSvc.append("customScript");
			window.scrollTo(0,0);
		});
	}

	removeItem(id: string) {
		removeFromCart(id);
	}

	updateItemQuantity(id: string, quantity: number) {
		updateQuantity(id, quantity);
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove("customScript");
	}
}
