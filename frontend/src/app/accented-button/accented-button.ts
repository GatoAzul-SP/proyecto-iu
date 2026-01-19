import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
	selector: "div.green-button, div.orange-button",
	imports: [RouterLink],
	templateUrl: "./accented-button.html",
	styleUrl: "./accented-button.css",
})
export class AccentedButton {
	readonly href = input("");
}
