import { Component, signal, inject, afterNextRender, OnDestroy } from "@angular/core";
import { Header, HeaderDescription } from "../header/header";
import { Carousel, SwiperOptions } from "../carousel/carousel";
import * as CarouselMods from "../carousel/carousel-mods";
import { CarouselSlide } from "../carousel/carousel-slide/carousel-slide";
import { SlideshowBanner } from "../slideshow-banner/slideshow-banner";
import { SlideshowBannerSlide } from "../slideshow-banner/slideshow-banner-slide/slideshow-banner-slide";
import { AccentedButton } from "../accented-button/accented-button";
import { SectionContainer } from "../section-container/section-container";
import { SectionHeading } from "../section-heading/section-heading";
import { Footer } from "../footer/footer";
import { ExternalHiddenContentService } from "../external-hidden-content-service";
import { DecimalPipe } from "@angular/common";
import { addToCart } from "../cart.state";
import { productsOnly, servicesOnly } from "../catalog.state";

declare function loadSetting(key: string): any;

@Component({
	selector: "app-home",
	imports: [
		Header, Carousel, CarouselSlide, SlideshowBanner, SlideshowBannerSlide,
		AccentedButton, SectionContainer, SectionHeading, DecimalPipe,
		Footer
	],
	templateUrl: "./home.html",
	styleUrl: "./home.css",
})
export class Home implements OnDestroy {
	protected readonly headerLinks = signal<HeaderDescription>({
		links: {
			Lista: "/lista",
			Servicios: "#services",
			Productos: "#productos"
		},
		button: {"Iniciar Sesión": "login"}
	});

	private _interleaveOffset = 0.5;
	protected readonly bannerOptions = signal<SwiperOptions>({
		modules: [...Object.values(CarouselMods)],
		loop: true,
		speed: 1000,
		grabCursor: true,
		watchSlidesProgress: true,
		keyboard: true,
		mousewheel:  { enabled: true, forceToAxis: true },
		navigation: true,
		/*on: {
			progress: function() {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					var slideProgress = swiper.slides[i].progress;
					var innerOffset = swiper.width * interleaveOffset;
					var innerTranslate = slideProgress * innerOffset;
					swiper.slides[i].querySelector(".slide-inner").style.transform =
						"translate3d(" + innerTranslate + "px, 0, 0)";
				}
			},
			touchStart: function() {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					swiper.slides[i].style.transition = "";
				}
			},
			setTransition: function(speed) {
				var swiper = this;
				for (var i = 0; i < swiper.slides.length; i++) {
					swiper.slides[i].style.transition = speed + "ms";
					swiper.slides[i].querySelector(".slide-inner").style.transition =
						speed + "ms";
				}
			}
		}*/
	});

	protected readonly carouselOptions = signal<SwiperOptions>({
		modules: [...Object.values(CarouselMods)],
		loop: true,
		spaceBetween: 30,
		keyboard: true,
		mousewheel: { enabled: true, forceToAxis: true },
		navigation: true,
		pagination: { enabled: true, clickable: true },
		speed: 800,
		autoplay: {
			delay: 4000,
			disableOnInteraction: true
		},
		breakpoints: {
			0: { slidesPerView: 1 },
			768: { slidesPerView: 2 },
			992: { slidesPerView: 3 }
		}
	});

	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);

	protected readonly products = productsOnly;
	protected readonly services = servicesOnly;

	protected handleAddToCart(product: any) {
		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			const session = loadSetting("user_session");
			if (!session || !session.email) {
				alert("Por favor, inicia sesión para añadir productos al carrito.");
				return;
			}
			addToCart({
				id: product.id,
				title: product.title,
				price: product.price,
				image: product.image
			});
			alert(`¡"${product.title}" añadido al carrito correctamente!`);
		}
	}

	constructor() {


		afterNextRender(() => {
			this.extHidContentSvc.append("customScript");
		});
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove("customScript");
	}
}
