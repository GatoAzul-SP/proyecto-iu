import { Component, input, inject, ElementRef, viewChild, afterRenderEffect,
         OnChanges, SimpleChanges, OnDestroy } from "@angular/core";
import Swiper from "swiper";
import { SwiperOptions } from "swiper/types";

export type { SwiperOptions };

@Component({
	selector: "div.carousel",
	imports: [],
	templateUrl: "./carousel.html",
	styleUrl: "./carousel.css",
	host: {
		"[class]": "'swiper'"
	}
})
export class Carousel implements OnChanges, OnDestroy {
	readonly config = input<SwiperOptions>({});
	protected readonly el = inject(ElementRef);
	private readonly _fakeSwiper = {destroy() {}} as any as Swiper;
	protected swiper: Swiper = this._fakeSwiper;
	protected nextBtn = viewChild<ElementRef>("next");
	protected prevBtn = viewChild<ElementRef>("prev");
	protected pager = viewChild<ElementRef>("pager");

	constructor() {
		afterRenderEffect(() => {
			this.createSwiper();
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		const config = changes["config"];
		if (config.previousValue !== config.currentValue) {
			this.destroySwiper();
		}
	}

	ngOnDestroy() {
		this.destroySwiper();
	}

	private createSwiper(extraOptions?: SwiperOptions) {
		let config = this.config();
		config = {...config, ...extraOptions,
			...(config.navigation as {} && { navigation: {...config.navigation as {},
				nextEl: this.nextBtn()?.nativeElement, prevEl: this.prevBtn()?.nativeElement}}),
			...(config.pagination as {} && { pagination: {...config.pagination as {},
				el: this.pager()?.nativeElement}})
		};

		this.swiper = new Swiper(this.el.nativeElement, config);
	}

	private destroySwiper() {
		this.swiper.destroy();
		this.swiper = this._fakeSwiper;
	}
}
