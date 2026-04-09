import { Component, input, inject, signal, HostListener, afterNextRender } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { Router, RouterLink, UrlTree, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { SectionContainer } from "../section-container/section-container";
import { cartState, cartTotalItems, cartTotalPrice, removeFromCart } from "../cart.state";

declare function loadSetting(key: string): any;
declare function saveSetting(key: string, value: any): void;

export interface HeaderDescription {
	links: {
		[key: string]: string | {
			[key: string]: string;
		};
	};
	button?: { [onlykey: string]: string };
}

@Component({
	selector: "header.header-area",
	imports: [RouterLink, SectionContainer, DecimalPipe],
	templateUrl: "./header.html",
	styleUrl: "./header.css",
	host: {
		"[class]": "'header-sticky'"
	}
})
export class Header {
	readonly links = input.required<HeaderDescription>();
	protected readonly router = inject(Router);

	/** Dropdown menus state */
	protected readonly accountMenuOpen = signal(false);
	protected readonly cartMenuOpen = signal(false);
	
	protected readonly currentUser = signal<{firstName: string, lastName: string, email: string} | null>(null);

	// Expose cart state signals to the template
	protected cartItems = cartState;
	protected cartCount = cartTotalItems;
	protected cartTotal = cartTotalPrice;

	constructor() {
		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd)
		).subscribe(() => this.checkSession());

		afterNextRender(() => {
			this.checkSession();
		});
	}

	protected checkSession() {
		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			try {
				const session = loadSetting("user_session");
				if (session && session.email) {
					this.currentUser.set(session);
				} else {
					this.currentUser.set(null);
				}
			} catch(e) {}
		}
	}

	protected logout() {
		if (typeof window !== "undefined" && typeof saveSetting === "function") {
			saveSetting("user_session", {});
			saveSetting("admin_session", {});
		}
		this.currentUser.set(null);
		this.closeAccountMenu();
		this.router.navigateByUrl("/");
	}

	protected readLinks<T extends HeaderDescription["links"]>(links: T): [string, T[string]][] {
		return Object.entries(links) as [string, T[string]][];
	}

	protected toTree(url: string): UrlTree {
		return this.router.parseUrl(url);
	}

	scrollToTop(): void {
		window.location.href = '/';
	}

	protected toggleAccountMenu(event: MouseEvent): void {
		event.stopPropagation();
		if (!this.accountMenuOpen()) {
			this.checkSession();
		}
		this.accountMenuOpen.update(open => !open);
		if (this.accountMenuOpen()) {
			this.cartMenuOpen.set(false);
		}
	}

	protected toggleCartMenu(event: MouseEvent): void {
		event.stopPropagation();
		this.cartMenuOpen.update(open => !open);
		if (this.cartMenuOpen()) {
			this.accountMenuOpen.set(false);
		}
	}

	protected removeItem(id: string) {
		removeFromCart(id);
	}

	protected closeAccountMenu(): void {
		this.accountMenuOpen.set(false);
	}

	@HostListener('document:click')
	onDocumentClick(): void {
		if (this.accountMenuOpen()) {
			this.accountMenuOpen.set(false);
		}
		if (this.cartMenuOpen()) {
			this.cartMenuOpen.set(false);
		}
	}
}
