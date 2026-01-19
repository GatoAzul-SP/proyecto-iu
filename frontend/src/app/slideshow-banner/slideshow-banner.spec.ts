import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SlideshowBanner } from "./slideshow-banner";

describe("SlideshowBanner", () => {
	let component: SlideshowBanner;
	let fixture: ComponentFixture<SlideshowBanner>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SlideshowBanner]
		})
		.compileComponents();

		fixture = TestBed.createComponent(SlideshowBanner);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
