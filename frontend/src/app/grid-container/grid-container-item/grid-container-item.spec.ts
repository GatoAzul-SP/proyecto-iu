import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GridContainerItem } from "./grid-container-item";

describe("GridContainerItem", () => {
	let component: GridContainerItem;
	let fixture: ComponentFixture<GridContainerItem>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GridContainerItem]
		})
		.compileComponents();

		fixture = TestBed.createComponent(GridContainerItem);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
