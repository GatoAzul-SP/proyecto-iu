import { Component } from "@angular/core";

@Component({
	selector: "div.carousel-slide",
	imports: [],
	templateUrl: "./carousel-slide.html",
	styleUrl: "./carousel-slide.css",
	host: {
		"[class]": "'swiper-slide'"
	}
})
export class CarouselSlide {

}
