import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isVisible = signal<boolean>(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'admin_loader_enabled') {
          // just to listen to cross-tab changes
        }
      });
      
      // Also listen to broadcast channel just in case
      try {
        if (window.BroadcastChannel) {
          const bc = new BroadcastChannel('admin-loader');
          bc.onmessage = (ev) => {
            if (ev.data && ev.data.type === 'loader-toggled') {
              // The setting was changed in admin
            }
          };
        }
      } catch (e) {}
    }
  }

  public isEnabled(): boolean {
    if (!this.isBrowser) return false;
    try {
      const setting = localStorage.getItem('admin_loader_enabled');
      // Default to disabled
      return setting ? JSON.parse(setting) === true : false;
    } catch (e) {
      return false;
    }
  }

  public show(): void {
    this.isVisible.set(true);
  }

  public hide(): void {
    this.isVisible.set(false);
  }
}
