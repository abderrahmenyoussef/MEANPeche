import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ArticleService } from '../services/article.service';

@Component({
  selector: 'app-gestion-article',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './gestion-article.component.html',
  styleUrl: './gestion-article.component.css'
})
export class GestionArticleComponent implements OnInit {
  articles: any[] = [];
  loading: boolean = true;
  error: string = '';

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
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des articles:', err);
          this.error = 'Une erreur est survenue lors du chargement des articles.';
          this.loading = false;
        }
      });
  }

  deleteArticle(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.articleService.deleteArticle(id)
        .subscribe({
          next: () => {
            this.articles = this.articles.filter(article => article.id !== id);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'article:', err);
            alert('Une erreur est survenue lors de la suppression de l\'article.');
          }
        });
    }
  }
}
