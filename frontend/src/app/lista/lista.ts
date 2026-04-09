import { Component, signal, inject, computed, OnDestroy, afterNextRender } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { Header, HeaderDescription } from "../header/header";
import { Footer } from "../footer/footer";
import { ExternalHiddenContentService } from "../external-hidden-content-service";
import { catalogState, CatalogItem } from "../catalog.state";
import { addToCart } from "../cart.state";

declare function loadSetting(key: string): any;

@Component({
	selector: "app-lista",
	imports: [ CommonModule, Header, Footer, DecimalPipe ],
	templateUrl: "./lista.html",
	styleUrl: "./lista.css"
})
export class Lista implements OnDestroy {
	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);

	protected readonly headerLinks = signal<HeaderDescription>({
		links: {
			Inicio: "/",
			Lista: "/lista",
			Servicios: "/#services",
			Productos: "/#productos"
		},
		button: {"Iniciar Sesión": "login"}
	});

	protected searchText = signal("");
	protected filterType = signal<'all'|'service'|'product'>('all');

	protected catalog = catalogState;

	protected filteredItems = computed(() => {
		const search = this.searchText().toLowerCase();
		const type = this.filterType();

		return this.catalog().filter(item => {
			const textMatch = item.title.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
			const typeMatch = type === 'all' || item.type === type;
			return textMatch && typeMatch;
		});
	});

	constructor() {
		afterNextRender(() => {
			this.extHidContentSvc.append("customScript");
			window.scrollTo(0,0);
		});
	}

	setFilter(type: 'all'|'service'|'product') {
		this.filterType.set(type);
	}

	onSearchChange(event: Event) {
		const target = event.target as HTMLInputElement;
		this.searchText.set(target.value);
	}

	protected handleAddToCart(item: CatalogItem) {
		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			const session = loadSetting("user_session");
			if (!session || !session.email) {
				alert("Por favor, inicia sesión para añadir al carrito.");
				return;
			}
			addToCart({
				id: item.id,
				title: item.title,
				price: item.price,
				image: item.image
			});
			alert(`¡"${item.title}" añadido al carrito correctamente!`);
		}
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove("customScript");
	}
}
