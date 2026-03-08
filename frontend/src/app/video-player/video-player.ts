import { Component, signal, input, computed, linkedSignal, viewChild, viewChildren,
         ElementRef, inject, effect, untracked, afterNextRender, OnDestroy} from "@angular/core";
import { PlayerAudio } from "./player-audio";
import { PlayerText } from "./player-text";

export interface VideoConfig {
	sources: { url: string; type?: string }[];
	audios: {
		url: string;
		type?: string;
		label: string
	}[];
	texts: {
		url: string;
		kind?: string;
		lang?: string;
		label: string
	}[];
}

@Component({
	selector: "div.video-player",
	imports: [PlayerAudio, PlayerText],
	templateUrl: "./video-player.html",
	styleUrl: "./video-player.css",
	host: {
		"[class.small]": "small()"
	}
})
export class VideoPlayer implements OnDestroy {
	readonly sources = input.required<VideoConfig["sources"]>();
	readonly audios = input<VideoConfig["audios"]>([]);
	readonly texts = input<VideoConfig["texts"]>([]);
	readonly boundTexts = input(false);

	protected readonly _paused = signal(true);
	readonly paused = this._paused.asReadonly();
	protected readonly _currentTime = signal(0);
	readonly currentTime = this._currentTime.asReadonly();
	protected readonly _duration = signal(0);
	readonly duration = this._duration.asReadonly();
	readonly elapsedRatio = computed(() => this._currentTime() / this._duration());
	protected readonly _volume = signal(1);
	readonly volume = this._volume.asReadonly();
	protected readonly _muted = signal(false);
	readonly muted = this._muted.asReadonly();

	protected readonly player = inject(ElementRef);
	protected readonly video = viewChild.required<ElementRef<HTMLVideoElement>>("video");
	protected readonly progress = viewChild.required<ElementRef<HTMLInputElement>>("progress");
	protected readonly audioComps = viewChildren(PlayerAudio);
	protected readonly textComps = viewChildren(PlayerText);
	protected readonly currentAudio = linkedSignal<Readonly<PlayerAudio[]>, PlayerAudio | undefined>({
		source: this.audioComps,
		computation(comps, previous) {
			return (previous && previous.value
			        && comps.find(c => c.key() === previous.value!.key())
			        || comps[0]);
		},
		equal(audio1, audio2) {
			return audio1 ? audio2 != undefined && audio1.key() === audio2.key() : audio2 == undefined;
		}
	});
	protected readonly currentText = linkedSignal<
		{comps: Readonly<PlayerText[]>} & ({bound: false} | {bound: true; audio?: PlayerAudio}) ,
		PlayerText | undefined>(
	{
		source: computed(() => { return {
			comps: this.textComps(),
			bound: this.boundTexts(),
			...(this.boundTexts() && { audio: this.currentAudio() })
		}}),
		computation: (params, previous) => {
			if (params.bound) {
				return params.audio && params.comps[this.audioComps().indexOf(params.audio)];
			}

			return (previous && previous.value
			        && params.comps.find(c => c.key() === previous.value!.key())
			        || params.comps[0]);
		},
		equal(text1, text2) {
			return text1 ? text2 != undefined && text1.key() === text2.key() : text2 == undefined;
		}
	});

	protected readonly currentTimeLabel = computed(
		() => this.formatTime(this._currentTime()) );
	protected readonly durationLabel = computed(
		() => this.formatTime(this._duration()) );
	protected readonly small = signal(true);
	protected _wasPlaying = false;

	protected readonly resizeDetector = globalThis.ResizeObserver && new ResizeObserver(players => {
		const player = players[0];
		if (!player) return;

		this.small.set(player.contentRect.width < 540);
	});

	constructor() {
		effect(() => {
			let ratio = this.elapsedRatio();
			const progress = this.progress().nativeElement;

			if (!Number.isFinite(ratio)) ratio = 0;
			progress.valueAsNumber = ratio;
			progress.style.setProperty("--current", this.formatPercentage(ratio));
		});

		effect((onCleanup) => {
			const audio = this.currentAudio();
			untracked(() => {
				if (audio && !this._paused()) {
					audio.play(this.currentTime);
				}
			});

			onCleanup(() => {
				if (audio) audio.pause();
			});
		});

		effect((onCleanup) => {
			const text = this.currentText();
			if (text) text.show();

			onCleanup(() => {
				if (text) text.hide();
			});
		});

		if (this.resizeDetector) {
			this.resizeDetector.observe(this.player.nativeElement);
		}
	}

	ngOnDestroy() {
		if (this.resizeDetector) {
			this.resizeDetector.unobserve(this.player.nativeElement);
		}
	}

	play(shouldPlay = true) {
		const video = this.video().nativeElement;

		if (shouldPlay) video.play();
		else video.pause();
	}

	pause() {
		this.play(false);
	}

	togglePause() {
		this.play(this._paused());
	}

	seek(time: number) {
		this.video().nativeElement.currentTime = time;
	}

	mute(shouldMute = true) {
		this.video().nativeElement.muted = shouldMute;
	}

	unmute() {
		this.mute(false);
	}

	setVolume(volume: number) {
		this.video().nativeElement.volume = volume;
	}

	changeAudio(index: number) {
		const audios = this.audioComps();
		if (index >= audios.length) return;

		this.currentAudio.set(audios[index]);
	}

	changeText(index: number) {
		const texts = this.textComps();
		if (index >= texts.length || this.boundTexts()) return;

		this.currentText.set(texts[index]);
	}

	protected handlePlay() {
		const audio = this.currentAudio();
		if (audio) audio.play(this.currentTime);

		const duration = this.video().nativeElement.duration;
		if (this._duration() !== duration) {
			this._duration.set(duration);
		}

		this._paused.set(false);
	}

	protected handlePause() {
		const audio = this.currentAudio();
		if (audio) audio.pause();

		this._paused.set(true);
	}

	protected handleSeekStart(e: MouseEvent) {
		if (e.button === 0) {
			(this._wasPlaying = !this._paused() || this._wasPlaying) && this.pause();
		}
	}

	protected handleSeekEnd(e: MouseEvent) {
		if (e.button === 0 && this._wasPlaying) {
			this._wasPlaying = false;
			this.play();
		}
	}

	protected fillNumber(number: number): string {
		return number.toString().padStart(2, "0");
	}

	protected formatTime(seconds: number): string {
		if (!Number.isFinite(seconds)) return "00:00:00";

		let minutes, hours, temp;
		temp = Math.floor(seconds);
		seconds = temp % 60;
		temp = (temp - seconds) / 60;
		minutes = temp % 60;
		hours = (temp - minutes) / 60;

		return `${this.fillNumber(hours)}:${this.fillNumber(minutes)}:${this.fillNumber(seconds)}`;
	}

	protected formatPercentage(ratio: number): string {
		if (!Number.isFinite(ratio)) return "0%";
		return ratio * 100 + "%";
	}
}
