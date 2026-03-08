import { Component, signal, input, viewChild, effect } from "@angular/core";
import { VideoPlayer, VideoConfig } from "../video-player/video-player";

export type { VideoConfig };

@Component({
	selector: "div.media-card.video",
	imports: [VideoPlayer],
	templateUrl: "./video-card.html",
	styleUrl: "./video-card.css",
	host: {
		"[class.started]": "started()"
	}
})
export class VideoCard {
	readonly imgSrc = input.required<string>();
	readonly imgAlt = input("");
	readonly vidLabel = input("");
	readonly vidConfig = input.required<VideoConfig>();
	protected readonly started = signal(false);
	protected readonly player = viewChild.required(VideoPlayer);

	play() {
		this.started.set(true);
		setTimeout(() => this.player().play(), 500);
	}
}
