import { Directive, input, Signal, inject, ElementRef } from "@angular/core";

@Directive({
	selector: "audio"
})
export class PlayerAudio {
	readonly key = input.required<string>();
	protected readonly audio = inject(ElementRef);

	play(currentTime?: number | Signal<number>) {
		const audio = this.audio.nativeElement;
		if (currentTime != undefined) {
			if (typeof currentTime !== "number") currentTime = currentTime();
			audio.currentTime = currentTime;
		}
		audio.play();
	}

	pause(currentTime?: number | Signal<number>) {
		const audio = this.audio.nativeElement;
		if (currentTime != undefined) {
			if (typeof currentTime !== "number") currentTime = currentTime();
			audio.currentTime = currentTime;
		}
		audio.pause();
	}
}
