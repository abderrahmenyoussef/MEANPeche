import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { PanierService } from '../services/panier.service';
import { FavorisService } from '../services/favoris.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  nombreArticles: number = 0;
  nombreFavoris: number = 0;
  isAdmin: boolean = false;
  private subscriptions: Subscription[] = [];
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private panierService: PanierService,
    private favorisService: FavorisService,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Subscribe to panier updates
    const panierSubscription = this.panierService.panier$.subscribe(() => {
      this.nombreArticles = this.panierService.getNombreArticles();
    });
    this.subscriptions.push(panierSubscription);

    // Subscribe to favoris updates
    const favorisSubscription = this.favorisService.favoris$.subscribe(favoris => {
      this.nombreFavoris = favoris.length;
    });
    this.subscriptions.push(favorisSubscription);

    // Subscribe to auth status
    const authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAdmin = isAuthenticated;
    });
    this.subscriptions.push(authSubscription);

    // Initialisation des compteurs au démarrage
    this.nombreArticles = this.panierService.getNombreArticles();
    this.nombreFavoris = this.favorisService.nombreArticles();

    // Écouter les réinitialisations de recherche seulement si nous sommes dans un navigateur
    if (this.isBrowser) {
      window.addEventListener('reset-search', this.handleResetSearch.bind(this));
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Nettoyer les event listeners seulement si nous sommes dans un navigateur
    if (this.isBrowser) {
      window.removeEventListener('reset-search', this.handleResetSearch.bind(this));
    }
  }

  handleResetSearch() {
    this.searchTerm = '';
  }

  // Appelé à chaque frappe dans la barre de recherche
  onSearchInput(): void {
    if (this.isBrowser) {
      // Dispatch global search event à chaque frappe
      window.dispatchEvent(new CustomEvent('global-search', {
        detail: { searchTerm: this.searchTerm }
      }));
    }
  }

  // Gérer la soumission du formulaire de recherche
  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchTerm.trim() && this.isBrowser) {
      // Dispatch global search event
      window.dispatchEvent(new CustomEvent('global-search', {
        detail: { searchTerm: this.searchTerm }
      }));
    }
  }

  // Fonction pour gérer l'action sur l'icône utilisateur
  goToProfile(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Fonction pour déconnexion
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
