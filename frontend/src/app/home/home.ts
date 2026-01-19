import { Component, signal, WritableSignal, inject, afterNextRender, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Header, HeaderDescription } from "../header/header";
import { SlideshowBanner } from "../slideshow-banner/slideshow-banner";
import { SlideshowBannerSlide } from "../slideshow-banner/slideshow-banner-slide/slideshow-banner-slide";
import { AccentedButton } from "../accented-button/accented-button";
import { SectionContainer } from "../section-container/section-container";
import { SectionHeading } from "../section-heading/section-heading";
import { Card } from "../card/card";
import { ServiceCard } from "../service-card/service-card";
import { GridContainer } from "../grid-container/grid-container";
import { GridContainerItem } from "../grid-container/grid-container-item/grid-container-item";
import { SimpleCTA } from "../simple-cta/simple-cta";
import { OverlayContainer } from "../overlay-container/overlay-container";
import { OverlayContainerItem } from "../overlay-container/overlay-container-item/overlay-container-item";
import { DivTable, TableModel } from "../div-table/div-table";
import { PartnersSection } from "../partners-section/partners-section";
import { Footer } from "../footer/footer";
import { ExternalHiddenContentService } from "../external-hidden-content-service";

@Component({
	selector: "app-home",
	imports: [
		Header, SlideshowBanner, SlideshowBannerSlide, AccentedButton, SectionContainer,
		SectionHeading, Card, ServiceCard, GridContainer, GridContainerItem,
		SimpleCTA, OverlayContainer, OverlayContainerItem, DivTable, PartnersSection,
		Footer
	],
	templateUrl: "./home.html",
	styleUrl: "./home.css",
})
export class Home implements OnDestroy {
	protected readonly headerLinks = signal<HeaderDescription>({
		links: {
			Home: "#top",
			Services: "#services",
			About: "#about",
			Pages: {
				"About Us": "about-us.html",
				"Our Services": "our-services.html",
				"Contact Us": "contact-us.html"
			},
			Testimonials: "#testimonials"
		},
		button: {"Contact Support": "contact-us.html"}
	});

	protected readonly tableTitles = signal(["Web Design", "Graphics", "Web Coding"]);
	protected tables: WritableSignal<TableModel>[] = [
		signal(new TableModel({
			headingsColumn: true,
			head: ["Project Title", "Budget", "Deadline", "Client"],
			body: [["Website Redesign", "$1,500 to $2,200", "2022 Dec 12", "Web Biz"],
			       ["Website Renovation", "$2,500 to $3,600", "2022 Dec 10", "Online Ads"],
			       ["Marketing Plan", "$2,500 to $4,200", "2022 Dec 8", "Web Biz"],
			       ["All-new Website", "$3,000 to $6,600", "2022 Dec 2", "Web Presence"]],
			_cols: 4
		} as any as TableModel)),
		signal(new TableModel({
			headingsColumn: true,
			head: ["Project Title", "Budget", "Deadline", "Client"],
			body: [["Graphics Redesign", "$500 to $800", "2022 Nov 24", "Media One"],
			       ["Digital Graphics", "$1,500 to $3,000", "2022 Nov 18", "Second Media"],
			       ["New Artworks", "$2,200 to $4,400", "2022 Nov 10", "Artwork Push"],
			       ["Complex Arts", "$1,100 to $2,400", "2022 Nov 3", "Media One"]],
			_cols: 4
		} as any as TableModel)),
		signal(new TableModel({
			headingsColumn: true,
			head: ["Project Title", "Budget", "Deadline", "Client"],
			body: [["Backend Coding", "$2,000 to $5,000", "2022 Nov 28", "PHP MySQL"],
			       ["New Web App", "$1,500 to $3,000", "2022 Nov 18", "Python Programming"],
			       ["Frontend Interactions", "$3,000 to $6,000", "2022 Nov 10", "JavaScripts"],
			       ["Video Creations", "$1,800 to $4,400", "2022 Nov 3", "Multimedia"]],
			_cols: 4
		} as any as TableModel))
	];

	protected readonly partnerLogos = signal<string[]>(Array(6).fill("assets/images/client-01.png"));

	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);
	protected readonly customScript: HTMLScriptElement;

	constructor() {
		const document = inject(DOCUMENT);
		this.customScript = document.createElement("script");
		this.customScript.src = "assets/js/custom.js";

		if (this.tableTitles().length != this.tables.length) {
			throw new Error("tables and their titles are not the same in quantity");
		}

		afterNextRender(() => {
			this.extHidContentSvc.append(this.customScript);
		});
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove(this.customScript);
	}
}
