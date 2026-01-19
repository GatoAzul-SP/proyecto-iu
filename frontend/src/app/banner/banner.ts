import { Component, input } from "@angular/core";
import { SectionContainer } from "../section-container/section-container";

@Component({
	selector: "div.page-heading",
	imports: [SectionContainer],
	templateUrl: "./banner.html",
	styleUrl: "./banner.css",
})
export class Banner {
	readonly heading = input("");
}
