import { Injectable, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

@Injectable({
	providedIn: "root",
})
export class ExternalHiddenContentService {
	protected container: Element;
	protected readonly commonElements: Record<string, Element> = Object.create(null);
	private _failed = false;

	constructor() {
		const document: HTMLDocument = inject(DOCUMENT);
		this.container = document.getElementById("hidden-root-container")!;

		if (!this.container) {
			this._failed = true;
			(this.append as any) = (this.list as any) = (this.remove as any) = (this.clear as any) = this._throwError;
			return;
		}

		this.container.parentNode && this.container.parentNode.removeChild(this.container);
		document.body.appendChild(this.container);

		const customScript: HTMLScriptElement = document.createElement("script");
		customScript.src = "assets/js/custom.js";
		this.commonElements["customScript"] = customScript;
	}

	append(node: Node | string) {
		if (typeof node === "string") node = this.getCommonElement(node);
		this.container.appendChild(node);
	}

	list(): NodeList {
		return this.container.childNodes;
	}

	remove(node: Node | string) {
		if (typeof node === "string") node = this.getCommonElement(node);
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

	protected getCommonElement(name: string): Element {
		const element = this.commonElements[name];
		if (!element) throw new Error("No existe un elemento común con ese nombre: " + name);
		return element;
	}

	private _throwError() {
		throw new Error("The ExternalHiddenContentService failed to find its container");
	}
}
