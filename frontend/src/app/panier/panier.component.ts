import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../services/panier.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TunisianCurrencyPipe],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit {
  articles: any[] = [];
  montantTotal = 0;
  private isBrowser: boolean;

  constructor(
    private panierService: PanierService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // S'abonner aux changements du panier
    this.panierService.panier$.subscribe(articles => {
      this.articles = articles;
      this.montantTotal = this.panierService.getMontantTotal();
    });
  }

  // Supprimer un article du panier
  supprimerArticle(id: string): void {
    this.panierService.supprimerArticle(id);
  }

  // Mettre à jour la quantité d'un article
  changerQuantite(id: string, quantite: number): void {
    if (quantite <= 0) {
      this.supprimerArticle(id);
    } else {
      this.panierService.modifierQuantite(id, quantite);
    }
  }

  // Vider complètement le panier avec SweetAlert2 pour confirmation
  viderPanier(): void {
    if (this.isBrowser) {
      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: 'Voulez-vous vraiment vider votre panier?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, vider le panier',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.panierService.viderPanier();
          Swal.fire(
            'Panier vidé!',
            'Votre panier a été vidé avec succès.',
            'success'
          );
        }
      });
    } else {
      // Fallback pour SSR
      this.panierService.viderPanier();
    }
  }

  // Passer à la commande
  commander(): void {
    alert('Fonctionnalité de commande à implémenter');
    // Ici vous pourriez rediriger vers une page de paiement ou autre
  }
}
