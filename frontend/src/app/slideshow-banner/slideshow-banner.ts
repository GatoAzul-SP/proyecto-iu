import { Component } from "@angular/core";
import { Carousel } from "../carousel/carousel";

@Component({
	selector: "div.slideshow-banner",
	imports: [],
	templateUrl: "../carousel/carousel.html",
	styleUrl: "./slideshow-banner.css",
})
export class SlideshowBanner extends Carousel {

}
