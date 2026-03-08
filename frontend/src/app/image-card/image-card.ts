import { Component, input } from "@angular/core";

@Component({
	selector: "div.media-card.image",
	imports: [],
	templateUrl: "./image-card.html",
	styleUrl: "./image-card.css",
})
export class ImageCard {
	readonly imgSrc = input.required<string>();
	readonly imgAlt = input("");
}
