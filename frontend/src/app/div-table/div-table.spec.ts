import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DivTable } from "./div-table";

describe("DivTable", () => {
	let component: DivTable;
	let fixture: ComponentFixture<DivTable>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DivTable]
		})
		.compileComponents();

		fixture = TestBed.createComponent(DivTable);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
