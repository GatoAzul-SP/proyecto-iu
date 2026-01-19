import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SimpleCta } from "./simple-cta";

describe("SimpleCta", () => {
	let component: SimpleCta;
	let fixture: ComponentFixture<SimpleCta>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SimpleCta]
		})
		.compileComponents();

		fixture = TestBed.createComponent(SimpleCta);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
