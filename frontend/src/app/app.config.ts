import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, withNavigationErrorHandler } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes, withNavigationErrorHandler(err => {
			location.href = err.url;
		})),
		provideClientHydration(withEventReplay())
	]
};
