import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SlideshowBannerSlide } from "./slideshow-banner-slide";

describe("SlideshowBannerSlide", () => {
	let component: SlideshowBannerSlide;
	let fixture: ComponentFixture<SlideshowBannerSlide>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SlideshowBannerSlide]
		})
		.compileComponents();

		fixture = TestBed.createComponent(SlideshowBannerSlide);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
