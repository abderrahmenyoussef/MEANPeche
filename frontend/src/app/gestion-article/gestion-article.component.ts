import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ArticleService } from '../services/article.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-article',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule, TunisianCurrencyPipe],
  templateUrl: './gestion-article.component.html',
  styleUrl: './gestion-article.component.css'
})
export class GestionArticleComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  filteredArticles: any[] = [];
  displayedArticles: any[] = [];
  loading: boolean = true;
  error: string = '';
  currentView: string = 'grid';

  // Variables de recherche, filtrage et tri
  searchTerm: string = '';
  selectedCategory: string = 'Toutes';
  sortOption: string = 'default';
  categories: string[] = ['Toutes'];

  // Variables pour les filtres originaux
  showFilters: boolean = false;
  showSortOptions: boolean = false;

  // État du filtre de prix
  priceRange: { min: number, max: number } = { min: 0, max: 1000 };

  // État du filtre de stock
  stockFilter: string = 'tous'; // 'tous', 'en-stock', 'stock-limité', 'rupture'

  // Variables de pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalArticles: number = 0;
  totalPages: number = 0;

  // Abonnements
  private queryParamsSub?: Subscription;
  private globalSearchListener: any;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Écouter les paramètres de requête URL (pour la recherche depuis d'autres pages)
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
    });

    // Écouter les événements de recherche globale depuis le header
    this.globalSearchListener = (event: any) => {
      if (event.detail && event.detail.searchTerm !== undefined) {
        this.searchTerm = event.detail.searchTerm;
        this.applyFilters();
      }
    };
    window.addEventListener('global-search', this.globalSearchListener);

    this.loadArticles();
  }

  ngOnDestroy(): void {
    // Nettoyage des abonnements pour éviter les fuites de mémoire
    if (this.queryParamsSub) {
      this.queryParamsSub.unsubscribe();
    }

    window.removeEventListener('global-search', this.globalSearchListener);
  }

  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles()
      .subscribe({
        next: (data) => {
          this.articles = data;

          // Extraction de toutes les catégories uniques
          const uniqueCategories = [...new Set(this.articles.map(article => article.categorie))];
          this.categories = ['Toutes', ...uniqueCategories];

          // Déterminer les prix min et max pour le filtre de prix
          if (this.articles.length > 0) {
            const prices = this.articles.map(article => article.prix);
            this.priceRange.min = Math.min(...prices);
            this.priceRange.max = Math.max(...prices);
          }

          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des articles:', err);
          this.error = 'Une erreur est survenue lors du chargement des articles.';
          this.loading = false;
        }
      });
  }

  // Méthode principale pour appliquer recherche, filtrage et tri
  applyFilters(): void {
    let result = [...this.articles];

    // Recherche par terme
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      result = result.filter(article =>
        article.nom.toLowerCase().includes(searchTermLower) ||
        article.description.toLowerCase().includes(searchTermLower) ||
        article.categorie.toLowerCase().includes(searchTermLower)
      );
    }

    // Filtrage par catégorie
    if (this.selectedCategory !== 'Toutes') {
      result = result.filter(article => article.categorie === this.selectedCategory);
    }

    // Filtrage par prix
    result = result.filter(article =>
      article.prix >= this.priceRange.min &&
      article.prix <= this.priceRange.max
    );

    // Filtrage par stock
    if (this.stockFilter === 'en-stock') {
      result = result.filter(article => article.stock > 5);
    } else if (this.stockFilter === 'stock-limité') {
      result = result.filter(article => article.stock <= 5 && article.stock > 0);
    } else if (this.stockFilter === 'rupture') {
      result = result.filter(article => article.stock <= 0);
    }

    // Tri
    switch(this.sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.prix - b.prix);
        break;
      case 'price-desc':
        result.sort((a, b) => b.prix - a.prix);
        break;
      case 'name-asc':
        result.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'name-desc':
        result.sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.date_ajout).getTime() - new Date(a.date_ajout).getTime());
        break;
      default:
        // Pas de tri spécial
        break;
    }

    this.filteredArticles = result;
    this.totalArticles = this.filteredArticles.length;
    this.totalPages = Math.ceil(this.totalArticles / this.pageSize);

    // Réinitialiser à la première page après filtrage
    this.currentPage = 1;
    this.getPaginatedArticles();
  }

  // Méthodes pour les filtres originaux
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.showSortOptions = false; // Fermer les options de tri si ouvertes
    }
  }

  toggleSortOptions(): void {
    this.showSortOptions = !this.showSortOptions;
    if (this.showSortOptions) {
      this.showFilters = false; // Fermer les filtres si ouverts
    }
  }

  // Appliquer un tri
  applySortOption(option: string): void {
    this.sortOption = option;
    this.showSortOptions = false;
    this.applyFilters();
  }

  // Appliquer un filtre de stock
  applyStockFilter(filter: string): void {
    this.stockFilter = filter;
    this.applyFilters();
    // Fermer le menu filtre après sélection
    this.showFilters = false;
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'Toutes';
    this.sortOption = 'default';
    this.stockFilter = 'tous';
    // Réinitialiser également le champ de recherche dans le header via un événement
    window.dispatchEvent(new CustomEvent('reset-search'));
    this.applyFilters();
  }

  // Méthode pour obtenir les articles de la page courante
  getPaginatedArticles(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedArticles = this.filteredArticles.slice(startIndex, endIndex);
  }

  // Méthode pour gérer la recherche (pour compatibilité)
  onSearch(): void {
    this.applyFilters();
  }

  // Méthode pour gérer le changement de catégorie
  onCategoryChange(): void {
    this.applyFilters();
    // Fermer le menu filtre après sélection
    this.showFilters = false;
  }

  // Méthode pour gérer le changement de tri
  onSortChange(): void {
    this.applyFilters();
  }

  // Changer de vue (grille ou liste)
  changeView(view: string): void {
    this.currentView = view;
  }

  // Méthodes de navigation de pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPaginatedArticles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedArticles();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedArticles();
    }
  }

  // Fonction pour ajouter au panier (à implémenter ultérieurement)
  addToCart(article: any): void {
    console.log(`Article ${article.nom} ajouté au panier`);
  }

  // Fonction pour ajouter aux favoris (à implémenter ultérieurement)
  addToFavorites(article: any): void {
    console.log(`Article ${article.nom} ajouté aux favoris`);
  }

  // Gestionnaire de clic en dehors des menus déroulants pour les fermer
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si on clique en dehors des menus déroulants, on les ferme
    if (!this.isClickInsideDropdown(event)) {
      this.showFilters = false;
      this.showSortOptions = false;
    }
  }

  // Vérifier si le clic est à l'intérieur d'un menu déroulant
  private isClickInsideDropdown(event: MouseEvent): boolean {
    const clickedElement = event.target as HTMLElement;
    return !!clickedElement.closest('.dropdown-menu') ||
           !!clickedElement.closest('.dropdown-toggle');
  }
}
