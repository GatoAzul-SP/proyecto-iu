import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "div.primary-button, div.secondary-button",
	imports: [RouterLink],
	templateUrl: "./accented-button.html",
	styleUrl: "./accented-button.css",
})
export class AccentedButton {
	readonly href = input("");
}
