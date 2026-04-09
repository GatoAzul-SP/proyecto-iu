import { Component, signal, inject, OnInit } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Header } from "../header/header";

declare function loadSetting(key: string): any;
declare function saveSetting(key: string, value: any): void;

@Component({
	selector: "app-profile",
	imports: [FormsModule, Header],
	templateUrl: "./profile.html",
	styleUrl: "./profile.css"
})
export class Profile implements OnInit {
	protected readonly router = inject(Router);
	
	protected userProfile = signal({
		firstName: "",
		lastName: "",
		email: "",
		docType: "V",
		documentId: "",
		phone: "",
		address: ""
	});

	protected successMsg = signal("");
	protected errorMsg = signal("");
	protected saved = signal(false);

	ngOnInit() {
		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			const session = loadSetting("user_session");
			if (!session || !session.email) {
				this.router.navigateByUrl("/login");
				return;
			}
			
			this.userProfile.set({
				firstName: session.firstName || "",
				lastName: session.lastName || "",
				email: session.email || "",
				docType: session.docType || "V",
				documentId: session.documentId || "",
				phone: session.phone || "",
				address: session.address || ""
			});
		}
	}

	protected handleSave(form: NgForm) {
		if (form.invalid) {
			this.errorMsg.set("Por favor complete todos los campos requeridos correctamente.");
			this.successMsg.set("");
			return;
		}

		this.errorMsg.set("");
		
		if (typeof window !== "undefined" && typeof loadSetting === "function") {
			const currentUser = this.userProfile();
			
			// Actualizar en la sesión
			const session = loadSetting("user_session") || {};
			const updatedSession = { ...session, ...currentUser };
			saveSetting("user_session", updatedSession);

			// Actualizar en el "backend" (la lista users)
			const users: any[] = loadSetting("users") || [];
			const userIndex = users.findIndex((u: any) => u.email === currentUser.email);
			if (userIndex !== -1) {
				users[userIndex] = { ...users[userIndex], ...currentUser };
				saveSetting("users", users);
			}

			this.saved.set(true);
			this.successMsg.set("Información guardada exitosamente.");
			
			// Redirigir sutilmente
			setTimeout(() => {
				this.router.navigateByUrl("/");
			}, 1500);
		}
	}
}
