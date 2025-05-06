import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../services/panier.service';
import Swal from 'sweetalert2';

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
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private panierService: PanierService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
      // Utiliser le service panier pour ajouter l'article
      this.panierService.ajouterArticle(article, this.quantity);

      // Afficher une notification avec SweetAlert2
      if (this.isBrowser) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'success',
          title: `${article.nom} ajouté au panier`,
          text: `Quantité: ${this.quantity}`
        });
      }
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
