import { Component, input } from "@angular/core";

@Component({
	selector: "div.card",
	imports: [],
	templateUrl: "./card.html",
	styleUrl: "./card.css",
	host: {
		"[class]": "'item'"
	}
})
export class Card {
	readonly faIcon = input(""); // Font Awesome icon name without fa- prefix
}
