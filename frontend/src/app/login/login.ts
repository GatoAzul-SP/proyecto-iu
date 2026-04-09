import { Component, signal, viewChild, inject, afterNextRender,
         OnDestroy, AfterViewInit, WritableSignal } from "@angular/core";
import { FormsModule, NgForm, NgModel, ControlEvent, StatusChangeEvent, TouchedChangeEvent } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { OverlayContainer } from "../overlay-container/overlay-container";
import { OverlayContainerItem } from "../overlay-container/overlay-container-item/overlay-container-item";
import { SectionHeading } from "../section-heading/section-heading";
import { ExternalHiddenContentService } from "../external-hidden-content-service";

export interface User {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: string;
	created: number;
}

@Component({
	selector: "app-login",
	imports: [OverlayContainer, OverlayContainerItem, SectionHeading, FormsModule],
	templateUrl: "./login.html",
	styleUrl: "./login.css",
	host: {
		"[class]": "'login'"
	}
})
export class Login implements OnDestroy, AfterViewInit {
	protected readonly loginEmailValid = signal(true);
	protected readonly registerEmailValid = signal(true);
	protected readonly loginErrorMsg = signal("");
	protected readonly registerErrorMsg = signal("");
	protected readonly loginForm = viewChild.required<NgForm>("loginForm");
	protected readonly registerForm = viewChild.required<NgForm>("registerForm")
	protected readonly loginEmailModel = viewChild.required<NgModel>("loginEmail");
	protected readonly registerEmailModel = viewChild.required<NgModel>("registerEmail");


	protected readonly router = inject(Router);
	protected readonly route = inject(ActivatedRoute);
	protected readonly extHidContentSvc = inject(ExternalHiddenContentService);
	protected readonly adminPath = "/admin/admin.html";
	protected readonly usersPath = "/";

	constructor() {
		afterNextRender(() => {
			this.extHidContentSvc.append("customScript");
		})
	}

	ngOnDestroy() {
		this.extHidContentSvc.remove("customScript");
	}

	ngAfterViewInit() {
		const handler = (valid: WritableSignal<boolean>) => (e: ControlEvent) => {
			if (! (e instanceof StatusChangeEvent || e instanceof TouchedChangeEvent))
				return;

			if (e.source.valid) valid.set(true);
			else if (e.source.invalid && e.source.touched) valid.set(false);
		}

		this.loginEmailModel().control.events.subscribe(handler(this.loginEmailValid));
		this.registerEmailModel().control.events.subscribe(handler(this.registerEmailValid));

		this.route.queryParams.subscribe(params => {
			const mode = params['mode'];
			setTimeout(() => {
				const tabIndex = mode === 'register' ? 2 : 1;
				const tabMenu = document.querySelector(`.naccs .menu div:nth-child(${tabIndex})`) as HTMLElement;
				if (tabMenu && !tabMenu.classList.contains("active")) {
					tabMenu.click();
				}
			}, 50);
		});
	}

	protected getUsers(): User[] {
		return (loadSetting("users") || []) as User[];
	}

	protected saveUsers(users: User[]) {
		saveSetting("users", users);
	}

	protected startSession(userSession: Omit<User, "password" | "created">, redirectUrl?: string) {
		saveSetting("user_session", userSession);
		if (userSession.role === "admin") {
			saveSetting("admin_session", userSession);
			this.router.navigateByUrl(this.adminPath);
		} else {
			if (redirectUrl) {
				this.router.navigateByUrl(redirectUrl);
			} else {
				this.router.navigateByUrl(this.usersPath);
			}
		}
	}

	protected handleLogin(e: Event) {
		e.preventDefault();

		const form = this.loginForm().form;
		if (!form.valid) {
			this.loginErrorMsg.set("Por favor introduce correo y contraseña válidos.");
			return;
		}

		const [email, password] = [form.get("email")!.value.trim().toLowerCase(),
		                           form.get("password")!.value];
		
		if (email === "admin@example.com" && password === "admin123") {
			this.loginErrorMsg.set("");
			this.startSession({
				firstName: "Admin",
				lastName: "Administrador",
				email: email,
				role: "admin"
			});
			return;
		}

		const user = this.getUsers().find(u => u.email === email && u.password === password);
		if (!user) {
			this.loginErrorMsg.set("Usuario o contraseña inválidos.");
			return;
		}

		this.loginErrorMsg.set("");

		this.startSession({
			firstName: user.firstName,
			lastName: user.lastName,
			email: email,
			role: user.role
		});
	}

	protected handleRegister(e: Event) {
		e.preventDefault();

		const form = this.registerForm().form;
		if (!form.valid) {
			this.registerErrorMsg.set("Por favor completa todos los campos correctamente.");
			return;
		}

		const [firstName, lastName, email, pass1, pass2] = [
			form.get("firstName")!.value, form.get("lastName")!.value,
			form.get("email")!.value.trim().toLowerCase(),
			form.get("password1")!.value, form.get("password2")!.value
		];
		const role = "normal";
		if (pass1 !== pass2) {
			this.registerErrorMsg.set("Las contraseñas no coinciden.");
			return;
		}

		const users = this.getUsers();
		if (users.some(u => u.email === email)) {
			this.registerErrorMsg.set("Ya existe una cuenta con ese correo.");
			return;
		}

		const userSession = {
			firstName: firstName,
			lastName: lastName,
			email: email,
			role: role
		}
		users.push({
			...userSession,
			password: pass1,
			created: Date.now()
		});
		this.saveUsers(users);
		this.startSession(userSession, '/profile');
	}
}
