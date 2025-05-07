import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FavorisService } from '../services/favoris.service';
import { RouterModule } from '@angular/router';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import { PanierService } from '../services/panier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [CommonModule, RouterModule, TunisianCurrencyPipe],
  templateUrl: './favoris.component.html',
  styleUrl: './favoris.component.css'
})
export class FavorisComponent implements OnInit {
  articles: any[] = [];
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(
    private favorisService: FavorisService,
    private panierService: PanierService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.chargerArticlesFavoris();

    // S'abonner aux changements de favoris
    this.favorisService.favoris$.subscribe(articles => {
      this.articles = articles;
    });
  }

  chargerArticlesFavoris(): void {
    this.articles = this.favorisService.obtenirFavoris();
  }

  retirerDesFavoris(article: any): void {
    this.favorisService.retirerDesFavoris(article.id);

    // Notification de suppression seulement si nous sommes dans un navigateur
    if (this.isBrowser) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Article retiré des favoris',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
    }
  }

  ajouterAuPanier(article: any): void {
    // Ajouter l'article au panier avec la quantité par défaut à 1
    this.panierService.ajouterArticle({...article, quantite: 1});

    // Afficher une notification seulement si nous sommes dans un navigateur
    if (this.isBrowser) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Article ajouté au panier!',
        text: `${article.nom} a été ajouté à votre panier`,
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
    }
  }
}
