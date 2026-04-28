import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent {
  public loaderService = inject(LoaderService);
  
  // Expose signal directly to template
  get isVisible() {
    return this.loaderService.isVisible();
  }
}
