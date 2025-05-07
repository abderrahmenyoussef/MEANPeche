import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../services/article.service';
import { PanierService } from '../services/panier.service';
import { FavorisService } from '../services/favoris.service';
import { Router } from '@angular/router';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';

@Component({
  selector: 'app-promo',
  standalone: true,
  imports: [CommonModule, TunisianCurrencyPipe],
  templateUrl: './promo.component.html',
  styleUrl: './promo.component.css'
})
export class PromoComponent implements OnInit {
  articlesEnPromotion: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private articleService: ArticleService,
    private panierService: PanierService,
    private favorisService: FavorisService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.articleService.getPromotions().subscribe({
      next: (articles) => {
        this.articlesEnPromotion = articles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Une erreur est survenue lors du chargement des promotions.';
        this.loading = false;
        console.error('Erreur lors du chargement des promotions', err);
      }
    });
  }

  voirDetails(articleId: string): void {
    this.router.navigate(['/article', articleId]);
  }

  addToPanier(article: any, event: Event): void {
    event.stopPropagation(); // Empêche la navigation vers la page détails lors du clic sur le bouton

    // Adapter l'objet article pour qu'il soit compatible avec le service de panier
    const articlePourPanier = {
      id: article._id,
      nom: article.nom,
      prix: article.prixPromo, // Utiliser le prix promo
      quantite: 1,
      images: article.image
    };

    this.panierService.ajouterArticle(articlePourPanier);
  }

  addToFavoris(article: any, event: Event): void {
    event.stopPropagation(); // Empêche la navigation vers la page détails lors du clic sur le bouton

    // Adapter l'objet article pour qu'il soit compatible avec le service de favoris
    const articlePourFavoris = {
      id: article._id,
      nom: article.nom,
      prix: article.prixPromo, // Utiliser le prix promo
      description: article.description,
      image: article.image,
      categorie: article.categorie
    };

    this.favorisService.ajouterAuxFavoris(articlePourFavoris);
  }

  estFavori(articleId: string): boolean {
    return this.favorisService.estEnFavoris(articleId);
  }

  calculateDiscount(price: number, promoPrice: number): number {
    return Math.round(((price - promoPrice) / price) * 100);
  }
}
