import { Injectable, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

@Injectable({
	providedIn: "root",
})
export class ExternalHiddenContentService {
	protected container: Element;
	private _failed = false;

	constructor() {
		const document: HTMLDocument = inject(DOCUMENT);
		this.container = document.getElementById("hidden-root-container")!;

		if (!this.container) {
			this._failed = true;
			(this.append as any) = (this.list as any) = (this.remove as any) = (this.clear as any) = this._throwError;
			return;
		}

		this.container.parentNode?.removeChild(this.container);
		document.body.appendChild(this.container);
	}

	append(node: Node) {
		this.container.appendChild(node);
	}

	list(): NodeList {
		return this.container.childNodes;
	}

	remove(node: Node) {
		try {
			this.container.removeChild(node);
		} catch (e) {
			if (!(e instanceof DOMException && e.name === "NotFoundError")) {
				throw e;
			}
		}
	}

	clear() {
		this.container.innerHTML = "";
	}

	private _throwError() {
		throw new Error("The ExternalHiddenContentService failed to find its container");
	}
}
