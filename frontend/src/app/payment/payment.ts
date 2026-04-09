import { Component, inject, afterNextRender, OnDestroy, OnInit } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Header, HeaderDescription } from "../header/header";
import { Footer } from "../footer/footer";
import { SectionHeading } from "../section-heading/section-heading";
import { ExternalHiddenContentService } from "../external-hidden-content-service";
import { cartTotalPrice } from "../cart.state";

@Component({
	selector: "app-payment",
	imports: [
		Header, Footer, CommonModule, RouterLink
	],
	templateUrl: "./payment.html",
	styleUrl: "./payment.css"
})
export class Payment implements OnInit, OnDestroy {
	protected readonly headerLinks = {
		links: {
			Servicios: "/#services",
			Productos: "/#productos"
		},
		button: {"Iniciar Sesión": "login"}
	} as HeaderDescription;

	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);
	protected readonly router = inject(Router);
	
	protected cartTotal = cartTotalPrice;
	protected splitAmount = 0;

	ngOnInit() {
		// Calculate 50% split natively each time it mounts
		this.splitAmount = this.cartTotal() / 2;
	}

	constructor() {
		afterNextRender(() => {
			this.extHidContentSvc.append("customScript");
			window.scrollTo(0, 0);

			// Prevent accessing payment page with empty cart
			if (this.cartTotal() <= 0) {
				alert("No hay artículos en el carrito para procesar su pago.");
				this.router.navigateByUrl("/");
			}
		});
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove("customScript");
	}
}
