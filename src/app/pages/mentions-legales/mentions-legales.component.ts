import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ScrollRevealDirective],
  template: `
    <app-navbar></app-navbar>

    <section class="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl sm:text-5xl font-bold mb-4 text-center" style="color: #C09453;">Mentions légales</h1>
        <p class="text-gray-500 text-sm text-center mb-16">Dernière mise à jour : {{ today }}</p>

        <div class="prose-legal space-y-12">
          <!-- 1. Éditeur -->
          <div appScrollReveal="up">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
            <p class="text-gray-600 leading-relaxed">
              Le présent site est édité par <strong>ipswim</strong>, entreprise spécialisée dans la construction,
              la rénovation de piscines et de bâtiments, ainsi que la peinture et les finitions.
            </p>
            <ul class="text-gray-600 leading-relaxed mt-4 space-y-1">
              <li><strong>Nom commercial :</strong> ipswim</li>
              <li *ngIf="info()?.siren"><strong>SIREN :</strong> {{ info()?.siren }}</li>
              <li *ngIf="info()?.siret"><strong>SIRET :</strong> {{ info()?.siret }}</li>
              <li *ngIf="info()?.address"><strong>Adresse :</strong> {{ info()?.address }}<span *ngIf="info()?.postalCode || info()?.city">, {{ info()?.postalCode }} {{ info()?.city }}</span></li>
              <li *ngIf="info()?.email"><strong>Email :</strong> <a [href]="'mailto:' + info()?.email" class="underline hover:no-underline">{{ info()?.email }}</a></li>
              <li *ngIf="info()?.phone"><strong>Téléphone :</strong> {{ info()?.phone }}</li>
              <li><strong>Directeur de la publication :</strong> le représentant légal d'ipswim</li>
            </ul>
          </div>

          <!-- 2. Hébergement -->
          <div appScrollReveal="up">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
            <p class="text-gray-600 leading-relaxed">
              Le site est hébergé par un prestataire tiers. Les coordonnées complètes de l'hébergeur
              (raison sociale, adresse, contact) sont disponibles sur simple demande auprès de l'éditeur
              aux coordonnées mentionnées ci-dessus.
            </p>
          </div>

          <!-- 3. Propriété intellectuelle -->
          <div appScrollReveal="up">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
            <p class="text-gray-600 leading-relaxed">
              L'ensemble des contenus présents sur ce site (textes, images, photographies, logos, graphismes,
              vidéos, icônes) est la propriété exclusive d'ipswim, sauf mention contraire, et est protégé par le
              Code de la propriété intellectuelle. Toute reproduction, représentation, modification, publication
              ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
              est interdite sans l'autorisation écrite préalable d'ipswim.
            </p>
          </div>

          <!-- 4. Liens hypertextes -->
          <div appScrollReveal="up">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Liens hypertextes</h2>
            <p class="text-gray-600 leading-relaxed">
              Le site peut contenir des liens hypertextes vers d'autres sites. ipswim n'exerce aucun contrôle sur
              ces sites tiers et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs
              pratiques en matière de protection des données.
            </p>
          </div>

          <!-- 5. Responsabilité -->
          <div appScrollReveal="up">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Limitation de responsabilité</h2>
            <p class="text-gray-600 leading-relaxed">
              ipswim s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site,
              mais ne peut garantir l'exhaustivité ou l'absence de modification des contenus. ipswim ne saurait
              être tenue responsable des erreurs, d'une absence de disponibilité des fonctionnalités, ou de tout
              dommage résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des
              informations mises à disposition sur le site.
            </p>
          </div>

          <!-- 6. RGPD -->
          <div appScrollReveal="up" class="border-t border-gray-200 pt-12">
            <h2 class="text-3xl font-bold mb-6" style="color: #C09453;">Protection des données personnelles (RGPD)</h2>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.1 Responsable du traitement</h3>
                <p class="text-gray-600 leading-relaxed">
                  Le responsable du traitement des données personnelles collectées sur ce site est <strong>ipswim</strong>,
                  joignable à l'adresse <a [href]="'mailto:' + info()?.email" class="underline hover:no-underline">{{ info()?.email }}</a>
                  ou par téléphone au {{ info()?.phone }}.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.2 Données collectées</h3>
                <p class="text-gray-600 leading-relaxed mb-3">
                  Dans le cadre de l'utilisation du site, notamment via le formulaire de contact, les données
                  suivantes peuvent être collectées :
                </p>
                <ul class="text-gray-600 leading-relaxed space-y-1 list-disc list-inside">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Contenu du message et type de projet renseigné</li>
                  <li>Données de navigation à des fins statistiques (pages visitées, durée de visite)</li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.3 Finalités du traitement</h3>
                <p class="text-gray-600 leading-relaxed">
                  Les données collectées sont utilisées exclusivement pour répondre à vos demandes de contact ou
                  de devis, assurer le suivi de la relation commerciale, et améliorer la qualité de nos services.
                  Elles ne font l'objet d'aucune cession ou vente à des tiers.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.4 Base légale</h3>
                <p class="text-gray-600 leading-relaxed">
                  Le traitement de vos données repose sur votre consentement, exprimé librement lors de la
                  soumission du formulaire de contact, ainsi que sur l'intérêt légitime d'ipswim à répondre aux
                  demandes qui lui sont adressées.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.5 Durée de conservation</h3>
                <p class="text-gray-600 leading-relaxed">
                  Les données collectées via le formulaire de contact sont conservées pendant une durée maximale
                  de 3 ans à compter du dernier contact, sauf obligation légale de conservation plus longue
                  (notamment en matière comptable et fiscale).
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.6 Destinataires des données</h3>
                <p class="text-gray-600 leading-relaxed">
                  Les données collectées sont destinées exclusivement au personnel d'ipswim habilité à traiter les
                  demandes de contact. Elles peuvent également être transmises à nos prestataires techniques
                  (hébergement, maintenance) strictement dans la mesure nécessaire au bon fonctionnement du site,
                  dans le respect de la réglementation applicable.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.7 Vos droits</h3>
                <p class="text-gray-600 leading-relaxed mb-3">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
                  et Libertés, vous disposez des droits suivants sur vos données personnelles :
                </p>
                <ul class="text-gray-600 leading-relaxed space-y-1 list-disc list-inside">
                  <li><strong>Droit d'accès :</strong> obtenir une copie des données vous concernant</li>
                  <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
                  <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                  <li><strong>Droit à la limitation du traitement</strong></li>
                  <li><strong>Droit d'opposition</strong> au traitement de vos données</li>
                  <li><strong>Droit à la portabilité</strong> de vos données</li>
                </ul>
                <p class="text-gray-600 leading-relaxed mt-3">
                  Pour exercer ces droits, vous pouvez nous contacter à l'adresse
                  <a [href]="'mailto:' + info()?.email" class="underline hover:no-underline">{{ info()?.email }}</a>.
                  Une réponse vous sera apportée dans un délai maximum d'un mois.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.8 Réclamation</h3>
                <p class="text-gray-600 leading-relaxed">
                  Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez
                  adresser une réclamation à la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener" class="underline hover:no-underline">www.cnil.fr</a>.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.9 Cookies</h3>
                <p class="text-gray-600 leading-relaxed">
                  Ce site peut utiliser des cookies techniques strictement nécessaires à son bon fonctionnement.
                  Aucun cookie de mesure d'audience ou publicitaire tiers n'est déposé sans votre consentement
                  préalable. Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies.
                </p>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">6.10 Sécurité</h3>
                <p class="text-gray-600 leading-relaxed">
                  ipswim met en œuvre les mesures techniques et organisationnelles appropriées afin de garantir un
                  niveau de sécurité adapté au risque, et de protéger vos données contre toute perte, altération,
                  divulgation ou accès non autorisé.
                </p>
              </div>
            </div>
          </div>

          <!-- 7. Droit applicable -->
          <div appScrollReveal="up" class="border-t border-gray-200 pt-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Droit applicable</h2>
            <p class="text-gray-600 leading-relaxed">
              Les présentes mentions légales sont soumises au droit français. Tout litige relatif à
              l'interprétation ou à l'exécution des présentes sera de la compétence exclusive des tribunaux
              français.
            </p>
          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `,
})
export class MentionsLegalesComponent implements OnInit {
  info = signal<any>(null);
  today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading contact info:', err),
    });
  }
}
