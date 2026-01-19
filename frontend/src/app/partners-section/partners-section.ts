import { Component, input } from "@angular/core";
import { SectionContainer } from "../section-container/section-container";

@Component({
	selector: "section.partners",
	imports: [SectionContainer],
	templateUrl: "./partners-section.html",
	styleUrl: "./partners-section.css",
})
export class PartnersSection {
	readonly logos = input.required<string[]>();
}
