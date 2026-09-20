import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Small inline badge indicating where an admin field's content is actually
 * displayed on the public site. Use variant="home" for content shown on the
 * homepage, or variant="other" with a custom `text` for anywhere else.
 */
@Component({
  selector: 'app-field-visibility-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
      [class.text-green-600]="variant() === 'home'"
      [class.text-gray-400]="variant() !== 'home'"
    >
      <ng-container *ngIf="variant() === 'home'">●</ng-container>
      {{ text() }}
    </span>
  `,
})
export class FieldVisibilityBadgeComponent {
  variant = input<'home' | 'other'>('home');
  text = input<string>("visible sur l'accueil");
}
