import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccentedButton } from "./accented-button";

describe("AccentedButton", () => {
	let component: AccentedButton;
	let fixture: ComponentFixture<AccentedButton>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AccentedButton]
		})
		.compileComponents();

		fixture = TestBed.createComponent(AccentedButton);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
