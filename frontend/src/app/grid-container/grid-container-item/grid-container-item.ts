import { Component } from "@angular/core";

@Component({
	selector: "div.grid-container-item",
	imports: [],
	templateUrl: "./grid-container-item.html",
	styleUrl: "./grid-container-item.css",
	host: {
		"[class]": "'col-lg-6'"
	}
})
export class GridContainerItem {

}
