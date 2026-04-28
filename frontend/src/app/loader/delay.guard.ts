import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LoaderService } from './loader.service';

export const delayGuard: CanActivateFn = (route, state) => {
	const loaderService = inject(LoaderService);

	if (!loaderService.isEnabled()) {
		return true;
	}

	loaderService.show();

	return new Promise<boolean>((resolve) => {
		setTimeout(() => {
			loaderService.hide();
			resolve(true);
		}, 20000);
	});
};
