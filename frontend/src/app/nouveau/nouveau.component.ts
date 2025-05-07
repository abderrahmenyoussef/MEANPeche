import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { PanierService } from '../services/panier.service';
import { FavorisService } from '../services/favoris.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';

@Component({
  selector: 'app-nouveau',
  standalone: true,
  imports: [CommonModule, RouterModule, TunisianCurrencyPipe],
  templateUrl: './nouveau.component.html',
  styleUrl: './nouveau.component.css'
})
export class NouveauComponent implements OnInit, AfterViewInit {
  nouveautes: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  imagesLoaded: number = 0;
  totalImages: number = 0;

  constructor(
    private articleService: ArticleService,
    private panierService: PanierService,
    private favorisService: FavorisService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.chargerNouveautes();
  }

  ngAfterViewInit(): void {
    // Force une mise à jour du DOM après le rendu initial
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }

  chargerNouveautes(): void {
    this.loading = true;
    this.articleService.getNouveautes(3).subscribe({
      next: (data) => {
        this.nouveautes = data.map((article: any) => ({
          ...article,
          imageLoaded: false
        }));
        this.totalImages = this.nouveautes.length;
        this.loading = false;

        // Force le rafraîchissement de la vue après un court délai
        setTimeout(() => {
          this.zone.run(() => {
            this.cdr.detectChanges();
          });
        }, 100);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des nouveautés';
        this.loading = false;
        console.error('Erreur lors du chargement des nouveautés', err);
      }
    });
  }

  onImageLoad(article: any): void {
    article.imageLoaded = true;
    this.imagesLoaded++;
    // Force le rafraîchissement de la vue quand toutes les images sont chargées
    if (this.imagesLoaded === this.totalImages) {
      this.zone.run(() => {
        this.cdr.detectChanges();
      });
    }
  }

  ajouterAuPanier(article: any): void {
    this.panierService.ajouterArticle(article);
  }

  toggleFavoris(article: any): void {
    if (this.estEnFavoris(article._id)) {
      this.favorisService.retirerDesFavoris(article._id);
    } else {
      this.favorisService.ajouterAuxFavoris(article);
    }
  }

  estEnFavoris(articleId: string): boolean {
    return this.favorisService.estEnFavoris(articleId);
  }
}
