import { signal, computed } from '@angular/core';

export interface CatalogItem {
	id: string;
	type: 'service' | 'product';
	title: string;
	price: number;
	image: string;
	description: string;
	tag?: string;
	duration?: string; // used for services
	stock?: number;    // used for products
}

const INITIAL_CATALOG: CatalogItem[] = [
	// Services
	{
		id: "srv-1",
		type: "service",
		title: "Corte en Capas",
		price: 25.00,
		image: "assets/images/corte-servicio.png",
		tag: "NUEVO",
		duration: "60 min",
		description: "Ideal para media melena o cabello largo. Aporta volumen, movimiento y textura sin perder el largo. Incluye lavado, corte técnico y peinado final."
	},
	{
		id: "srv-2",
		type: "service",
		title: "Secado Estilizado",
		price: 15.00,
		image: "assets/images/slide-01.jpg",
		duration: "45 min",
		description: "Deja tu cabello suave, brillante y sin frizz. Nuestro secado con cepillo profesional garantiza un acabado liso y duradero."
	},
	{
		id: "srv-3",
		type: "service",
		title: "Tinte Completo",
		price: 45.00,
		image: "assets/images/slide-02.jpg",
		tag: "PROMO",
		duration: "120 min",
		description: "Cambia tu look o cubre canas con nuestros tintes de alta duración que además protegen y nutren la fibra capilar."
	},
	{
		id: "srv-4",
		type: "service",
		title: "Cirugía Capilar",
		price: 60.00,
		image: "assets/images/slide-03.jpg",
		duration: "150 min",
		description: "Alisa progresivamente tu cabello y restaura el brillo natural. Elimina la porosidad y deja un liso perfecto por meses."
	},
	// Products
	{
		id: "prod-1",
		type: "product",
		title: "Tinte Nelly Permanente",
		price: 8.50,
		image: "assets/images/Tinte-Nelly.png",
		stock: 24,
		tag: "NUEVO",
		description: "Tinte de coloración permanente con cobertura 100% de canas. Fórmula enriquecida que cuida y protege el cabello."
	},
	{
		id: "prod-2",
		type: "product",
		title: "Champú Sin Sal",
		price: 12.00,
		image: "assets/images/service-details-01.jpg",
		stock: 15,
		description: "Ideal para cabellos con cirugía capilar o keratina. Mantiene tu alisado por más tiempo con aroma a frutas."
	},
	{
		id: "prod-3",
		type: "product",
		title: "Mascarilla de Argán",
		price: 18.99,
		image: "assets/images/service-details-02.jpg",
		stock: 8,
		description: "Tratamiento intensivo con aceite puro de argán. Devuelve la vida a cabellos resecos o dañados por la decoloración."
	},
	{
		id: "prod-4",
		type: "product",
		title: "Caja de Ampollas",
		price: 20.00,
		image: "assets/images/service-details-03.jpg",
		stock: 30,
		tag: "OFERTA",
		description: "Caja por 12 unidades. Ampollas de botox capilar para hidratación profunda. Se aplica directo en la fibra después del lavado."
	}
];

// Global Signal holding the unified catalog
export const catalogState = signal<CatalogItem[]>(INITIAL_CATALOG);

// Convenience computed signals
export const servicesOnly = computed(() => catalogState().filter(i => i.type === 'service'));
export const productsOnly = computed(() => catalogState().filter(i => i.type === 'product'));
