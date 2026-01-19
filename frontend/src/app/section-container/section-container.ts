import { Component, contentChild } from "@angular/core";
import { SectionHeading } from "../section-heading/section-heading";

@Component({
	selector: "div.section-container",
	imports: [],
	templateUrl: "./section-container.html",
	styleUrl: "./section-container.css",
	host: {
		"[class]": "'container'"
	}
})
export class SectionContainer {
	protected readonly heading = contentChild(SectionHeading, {descendants: false});
}
