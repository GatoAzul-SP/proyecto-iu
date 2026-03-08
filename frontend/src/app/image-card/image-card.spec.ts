import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageCard } from "./image-card";

describe("ImageCard", () => {
	let component: ImageCard;
	let fixture: ComponentFixture<ImageCard>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ImageCard]
		})
		.compileComponents();

		fixture = TestBed.createComponent(ImageCard);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
