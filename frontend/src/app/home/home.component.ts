import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { Router } from '@angular/router';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, TunisianCurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  articlesEnPromo: any[] = [];
  loading: boolean = true;

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerPromotions();
  }

  chargerPromotions(): void {
    this.loading = true;
    this.articleService.getPromotions().subscribe({
      next: (articles) => {
        // Limite à 3 articles pour l'aperçu sur la page d'accueil
        this.articlesEnPromo = articles.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des promotions', err);
        this.loading = false;
      }
    });
  }

  voirDetails(articleId: string): void {
    this.router.navigate(['/article', articleId]);
  }
}
