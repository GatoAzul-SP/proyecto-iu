import { Component, OnInit } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { Router } from "@angular/router";
import { cartState, cartTotalPrice, cartSubtotalPrice, cartDiscountAmount, clearCart } from "../cart.state";

declare function loadSetting(key: string): any;

@Component({
	selector: "app-factura",
	imports: [ CommonModule ],
	templateUrl: "./factura.html",
	styleUrl: "./factura.css"
})
export class Factura implements OnInit {
	protected cartItems = cartState;
	protected cartTotal = cartTotalPrice;
	protected cartSubtotal = cartSubtotalPrice;
	protected cartDiscount = cartDiscountAmount;
	
	// Dynamic variables for invoice
	protected currentDate: string = "";
	protected currentTime: string = "";
	protected facturaNumber: string = "";
	protected controlNumber: string = "";
	
	// Mathematical values
	protected totalAmount: number = 0;
	protected baseImponible: number = 0;
	protected ivaAmount: number = 0;

	// Client Info
	protected clientName: string = "AL CONTADO / CONSUMIDOR FINAL";
	protected clientDoc: string = "NO APLICA";
	protected clientAddress: string = "NO APLICA";

	constructor(private router: Router) {}

	ngOnInit() {
		// Verify cart is not empty, normally could redirect if empty but allowed for demo
		this.totalAmount = this.cartTotal();
		
		// Perfect Inverse math to derive Subtotal (16% IVA in VE)
		// TotalAmount = baseImponible * 1.16 -> baseImponible = TotalAmount / 1.16
		this.baseImponible = this.totalAmount / 1.16;
		this.ivaAmount = this.totalAmount - this.baseImponible;

		// Generate dynamic dates matching template's layout Format
		const now = new Date();
		this.currentDate = now.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
		this.currentTime = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

		// Generate random control parameters for authenticity
		this.facturaNumber = Math.floor(1000 + Math.random() * 9000).toString().padStart(6, '0');
		this.controlNumber = "00-" + Math.floor(100000 + Math.random() * 900000).toString();

		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			const session = loadSetting("user_session");
			if (session) {
				if (session.firstName || session.lastName) {
					this.clientName = `${session.firstName || ""} ${session.lastName || ""}`.trim().toUpperCase();
				}
				if (session.documentId) {
					this.clientDoc = `${session.docType || "V"}-${session.documentId}`;
				}
				if (session.address) {
					this.clientAddress = session.address.toUpperCase();
				}
			}
		}
	}

	printInvoice() {
		window.print();
	}

	finishAndExit() {
		clearCart();
		this.router.navigateByUrl("/");
	}
}
