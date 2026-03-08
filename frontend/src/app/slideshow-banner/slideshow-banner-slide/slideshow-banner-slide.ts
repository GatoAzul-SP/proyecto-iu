import { Component, input } from "@angular/core";
import { SectionContainer } from "../../section-container/section-container";
import { AccentedButton } from "../../accented-button/accented-button";

@Component({
	selector: "div.slideshow-banner-slide",
	imports: [SectionContainer, AccentedButton],
	templateUrl: "./slideshow-banner-slide.html",
	styleUrl: "./slideshow-banner-slide.css",
	host: {
		"[class]": "'slide-inner'",
		"[style.background-image]": "`url(${ bgImg() })`"
	}
})
export class SlideshowBannerSlide {
	readonly bgImg = input("");
}
