import { Component } from "@angular/core";
import { SlideshowBannerSlide } from "./slideshow-banner-slide/slideshow-banner-slide";
import { AccentedButton } from "../accented-button/accented-button";

@Component({
	selector: "div.slideshow-banner",
	imports: [SlideshowBannerSlide, AccentedButton],
	templateUrl: "./slideshow-banner.html",
	styleUrl: "./slideshow-banner.css",
	host: {
		"[class]": "'swiper-container'"
	}
})
export class SlideshowBanner {

}
