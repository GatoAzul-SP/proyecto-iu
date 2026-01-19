import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionHeading } from "./section-heading";

describe("SectionHeading", () => {
	let component: SectionHeading;
	let fixture: ComponentFixture<SectionHeading>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SectionHeading]
		})
		.compileComponents();

		fixture = TestBed.createComponent(SectionHeading);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
