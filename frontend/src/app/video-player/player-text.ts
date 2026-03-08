import { Directive, input, inject, ElementRef } from "@angular/core";

@Directive({
	selector: "track"
})
export class PlayerText {
	readonly key = input.required<string>();
	protected readonly track = inject(ElementRef);

	show() {
		const track = this.track.nativeElement;
		track.default = true;
		track.track.mode = "showing";
	}

	hide() {
		const track = this.track.nativeElement;
		track.default = false;
		if (track.track.mode === "showing") track.track.mode = "hidden";
	}
}
