import { PlayerAudio } from "./player-audio";

describe("PlayerAudio", () => {
	it("should create an instance", () => {
		const directive = new PlayerAudio();
		expect(directive).toBeTruthy();
	});
});
