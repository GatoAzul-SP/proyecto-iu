import { Component, input } from "@angular/core";
import { SectionContainer } from "../../section-container/section-container";
import { AccentedButton } from "../../accented-button/accented-button";

@Component({
	selector: "div.slideshow-banner-slide",
	imports: [SectionContainer, AccentedButton],
	templateUrl: "./slideshow-banner-slide.html",
	styleUrl: "./slideshow-banner-slide.css",
	host: {
		"[class]": "'swiper-slide'"
	}
})
export class SlideshowBannerSlide {
	readonly bgImg = input("");
}
