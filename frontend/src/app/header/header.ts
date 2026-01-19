import { Component, input, inject } from "@angular/core";
import { Router, RouterLink, UrlTree } from "@angular/router";
import { SectionContainer } from "../section-container/section-container";

export interface HeaderDescription {
	links: {
		[key: string]: string | {
			[key: string]: string;
		};
	};
	button: { [onlykey: string]: string };
}

@Component({
	selector: "header.header-area",
	imports: [RouterLink, SectionContainer],
	templateUrl: "./header.html",
	styleUrl: "./header.css",
	host: {
		"[class]": "'header-sticky'"
	}
})
export class Header {
	readonly links = input.required<HeaderDescription>();
	protected readonly router = inject(Router);

	protected readLinks<T extends HeaderDescription["links"]>(links: T): [string, T[string]][] {
		return Object.entries(links) as [string, T[string]][];
	}

	protected toTree(url: string): UrlTree {
		return this.router.parseUrl(url);
	}
}
