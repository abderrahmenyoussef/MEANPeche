import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TunisianCurrencyPipe, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  article: any = null;
  loading: boolean = true;
  error: string = '';
  quantity: number = 1;
  relatedProducts: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'article depuis l'URL
    this.route.paramMap.subscribe(params => {
      const articleId = params.get('id');
      if (articleId) {
        this.loadArticle(articleId);
      } else {
        this.error = 'ID de l\'article non trouvé dans l\'URL';
        this.loading = false;
      }
    });
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.articleService.getArticleById(id)
      .subscribe({
        next: (data) => {
          this.article = data;
          this.loading = false;
          // Charger éventuellement des produits similaires
          this.loadRelatedProducts();
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'article:', err);
          this.error = 'Une erreur est survenue lors du chargement de l\'article.';
          this.loading = false;
        }
      });
  }

  // Fonction pour ajouter au panier
  addToCart(article: any): void {
    if (this.quantity < 1) this.quantity = 1;
    if (article.stock > 0 && this.quantity <= article.stock) {
      console.log(`Article ${article.nom} ajouté au panier (Quantité: ${this.quantity})`);
      // Ici, vous implémenterez la logique de panier réelle plus tard
    }
  }

  // Méthodes pour augmenter/diminuer la quantité
  increaseQuantity(): void {
    if (this.article && this.quantity < this.article.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Chargement de produits similaires (placeholder pour l'instant)
  loadRelatedProducts(): void {
    if (this.article && this.article.categorie) {
      this.articleService.getArticles()
        .subscribe({
          next: (data) => {
            // Filtrer les produits de la même catégorie (sauf l'article actuel)
            this.relatedProducts = data
              .filter((item: any) =>
                item.categorie === this.article.categorie &&
                item.id !== this.article.id
              )
              .slice(0, 4); // Limiter à 4 produits similaires
          },
          error: (err) => {
            console.error('Erreur lors du chargement des produits similaires:', err);
          }
        });
    }
  }
}
