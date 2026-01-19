import { Component } from "@angular/core";

@Component({
	selector: "div.grid-container",
	imports: [],
	templateUrl: "./grid-container.html",
	styleUrl: "./grid-container.css",
	host: {
		"[class]": "'container'"
	}
})
export class GridContainer {

}
