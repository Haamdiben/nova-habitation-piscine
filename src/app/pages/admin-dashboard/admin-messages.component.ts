import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Messages</h1>
        <p class="text-gray-600 mt-2 text-sm sm:text-base">
          Demandes envoyées depuis le formulaire de la page Contact.
          <span *ngIf="unreadCount() > 0" class="font-semibold text-gray-900">{{ unreadCount() }} non lu(s).</span>
        </p>
        <p class="text-gray-500 mt-1 text-xs">
          Conformément aux mentions légales (RGPD), les messages sont supprimés automatiquement après 3 ans.
        </p>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p *ngIf="loading()" class="text-gray-600">Chargement des messages...</p>
      <p *ngIf="errorMessage()" class="text-red-600 mb-4">{{ errorMessage() }}</p>

      <div *ngIf="!loading() && messages().length === 0 && !errorMessage()" class="bg-white rounded-lg shadow p-8 text-center text-gray-600">
        Aucun message pour le moment.
      </div>

      <div class="space-y-4">
        <div
          *ngFor="let msg of messages()"
          class="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4"
          [style.border-left-color]="msg.isRead ? '#e5e7eb' : '#C09453'"
        >
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div class="min-w-0">
              <p class="font-bold text-gray-900 flex items-center gap-2">
                {{ msg.name }}
                <span *ngIf="!msg.isRead" class="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style="background-color: #C09453;">Nouveau</span>
              </p>
              <p class="text-sm text-gray-600 break-all">
                <a [href]="'mailto:' + msg.email" class="underline hover:no-underline">{{ msg.email }}</a>
                <ng-container *ngIf="msg.phone"> · <a [href]="'tel:' + msg.phone" class="underline hover:no-underline">{{ msg.phone }}</a></ng-container>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ msg.createdAt | date: 'dd/MM/yyyy à HH:mm' }}
                <ng-container *ngIf="msg.projectType"> · {{ msg.projectType }}</ng-container>
              </p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                (click)="toggleRead(msg)"
                class="px-3 py-2 rounded text-sm font-semibold"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                {{ msg.isRead ? 'Marquer non lu' : 'Marquer lu' }}
              </button>
              <button
                (click)="deleteMessage(msg)"
                class="px-3 py-2 rounded text-sm font-semibold border-2 border-red-500 text-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
          <p class="text-gray-700 whitespace-pre-line break-words">{{ msg.message }}</p>
        </div>
      </div>
    </div>
  `,
})
export class AdminMessagesComponent implements OnInit {
  messages = signal<any[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  unreadCount = computed(() => this.messages().filter((m) => !m.isRead).length);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading.set(true);
    this.apiService.getContactMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.errorMessage.set('Impossible de charger les messages.');
        this.loading.set(false);
      },
    });
  }

  toggleRead(msg: any) {
    const isRead = !msg.isRead;
    this.apiService.setContactMessageRead(msg.id, isRead).subscribe({
      next: () => this.messages.update((list) => list.map((m) => (m.id === msg.id ? { ...m, isRead } : m))),
      error: (err) => console.error('Error updating message:', err),
    });
  }

  deleteMessage(msg: any) {
    if (!confirm(`Supprimer définitivement le message de ${msg.name} ?`)) return;
    this.apiService.deleteContactMessage(msg.id).subscribe({
      next: () => this.messages.update((list) => list.filter((m) => m.id !== msg.id)),
      error: (err) => console.error('Error deleting message:', err),
    });
  }
}
