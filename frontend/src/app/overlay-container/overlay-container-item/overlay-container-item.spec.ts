import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OverlayContainerItem } from "./overlay-container-item";

describe("OverlayContainerItem", () => {
	let component: OverlayContainerItem;
	let fixture: ComponentFixture<OverlayContainerItem>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [OverlayContainerItem]
		})
		.compileComponents();

		fixture = TestBed.createComponent(OverlayContainerItem);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
