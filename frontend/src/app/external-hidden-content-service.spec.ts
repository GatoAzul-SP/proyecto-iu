import { TestBed } from "@angular/core/testing";

import { ExternalHiddenContentService } from "./external-hidden-content-service";

describe("ExternalHiddenContentService", () => {
	let service: ExternalHiddenContentService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ExternalHiddenContentService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
