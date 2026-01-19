import { Component } from "@angular/core";
import { Card } from "../card/card";

@Component({
	selector: "div.service-item",
	imports: [],
	templateUrl: "./service-card.html",
	styleUrl: "./service-card.css",
	host: {
		"[class]": "''"
	}
})
export class ServiceCard extends Card {

}
