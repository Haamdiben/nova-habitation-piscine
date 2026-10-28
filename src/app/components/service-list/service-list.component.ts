import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

/** Grid of service cards used on the home and about pages. */
@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [ScrollRevealDirective],
  host: { class: 'block' },
  template: `
    <!-- Equal-width grid: rows of 3 when the count divides by 3, otherwise 2 per row (e.g. 2x2) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" [class.lg:grid-cols-3]="services().length % 3 === 0">
      @for (service of services(); track service.id ?? $index; let i = $index) {
        <div appScrollReveal="up" [revealDelay]="(i % 3) * 100">
          <article
            class="card group relative flex h-full min-h-[16rem] lg:min-h-[18rem] flex-col justify-center overflow-hidden p-8 lg:p-10
              transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_rgba(20,40,70,0.35)]"
          >
            <!-- Soft pool-blue glow in the corner -->
            <span class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sea-400/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"></span>

            <h3 class="relative text-2xl lg:text-3xl leading-tight text-sea-200 mb-4">{{ service.title }}</h3>
            <p class="relative leading-relaxed text-sea-100/75">{{ service.description }}</p>

            @if (showFeatures() && features(service).length) {
              <ul class="relative mt-6 space-y-3 border-t border-sea-200/10 pt-6">
                @for (feature of features(service); track feature) {
                  <li class="flex items-start gap-3 text-sea-100/80">
                    <svg class="mt-1 h-4 w-4 flex-shrink-0 text-sea-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>
            }
          </article>
        </div>
      }
    </div>
  `,
})
export class ServiceListComponent {
  services = input.required<any[]>();
  /** Show each service's feature list (one per line in the back office) as a checklist */
  showFeatures = input(false);

  features(service: any): string[] {
    return (service.features || '')
      .split('\n')
      .map((f: string) => f.trim())
      .filter((f: string) => f.length > 0);
  }
}
