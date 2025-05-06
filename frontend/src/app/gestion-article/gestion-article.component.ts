import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ArticleService } from '../services/article.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-article',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './gestion-article.component.html',
  styleUrl: './gestion-article.component.css'
})
export class GestionArticleComponent implements OnInit {
  articles: any[] = [];
  displayedArticles: any[] = []; // Articles affichés sur la page courante
  loading: boolean = true;
  error: string = '';
  currentView: string = 'grid'; // Pour basculer entre vue grille et liste

  // Variables de pagination
  currentPage: number = 1;
  pageSize: number = 6; // 6 articles par page comme demandé
  totalArticles: number = 0;
  totalPages: number = 0;

  constructor(private articleService: ArticleService) { }

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles()
      .subscribe({
        next: (data) => {
          this.articles = data;
          this.totalArticles = this.articles.length;
          this.totalPages = Math.ceil(this.totalArticles / this.pageSize);
          this.currentPage = 1;
          this.getPaginatedArticles();
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des articles:', err);
          this.error = 'Une erreur est survenue lors du chargement des articles.';
          this.loading = false;
        }
      });
  }

  // Méthode pour obtenir les articles de la page courante
  getPaginatedArticles(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedArticles = this.articles.slice(startIndex, endIndex);
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

  deleteArticle(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.articleService.deleteArticle(id)
        .subscribe({
          next: () => {
            this.articles = this.articles.filter(article => article.id !== id);
            this.totalArticles = this.articles.length;
            this.totalPages = Math.ceil(this.totalArticles / this.pageSize);
            // S'assurer que la page actuelle est toujours valide
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
              this.currentPage = this.totalPages;
            }
            this.getPaginatedArticles();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'article:', err);
            alert('Une erreur est survenue lors de la suppression de l\'article.');
          }
        });
    }
  }

  // Pour la nouvelle interface utilisateur
  changeView(view: string): void {
    this.currentView = view;
  }

  // Fonction pour ajouter au panier (à implémenter ultérieurement)
  addToCart(article: any): void {
    // À implémenter plus tard avec un service de panier
    console.log(`Article ${article.nom} ajouté au panier`);
    // Ici vous pourriez déclencher une notification ou animation
  }

  // Fonction pour ajouter aux favoris (à implémenter ultérieurement)
  addToFavorites(article: any): void {
    // À implémenter plus tard avec un service de favoris
    console.log(`Article ${article.nom} ajouté aux favoris`);
  }
}
