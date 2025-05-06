import { Component, OnInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PanierService } from '../services/panier.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

// Déclaration pour Bootstrap Modal
declare var bootstrap: any;

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TunisianCurrencyPipe],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  montantTotal = 0;
  fraisLivraison = 8; // Frais de livraison fixes à 8 DT
  montantFinal = 0; // Montant incluant les frais de livraison
  private isBrowser: boolean;
  private panierSubscription: Subscription | undefined;

  // Modal pour le formulaire de commande
  commandeModal: any;
  commandeForm: FormGroup;

  constructor(
    private panierService: PanierService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialiser le formulaire
    this.commandeForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      carteBancaire: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]]
    });
  }

  ngOnInit(): void {
    // S'abonner aux changements du panier
    this.panierSubscription = this.panierService.panier$.subscribe(articles => {
      this.articles = articles;
      this.montantTotal = this.panierService.getMontantTotal();
      this.calculerMontantFinal();
    });

    // Initialiser le modal Bootstrap après que le DOM soit pleinement chargé
    if (this.isBrowser) {
      // Attendre que le DOM soit complètement chargé
      document.addEventListener('DOMContentLoaded', () => {
        const modalElement = document.getElementById('commandeModal');
        if (modalElement) {
          this.commandeModal = new bootstrap.Modal(modalElement);
        } else {
          console.error("L'élément commandeModal n'a pas été trouvé dans le DOM");
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.panierSubscription) {
      this.panierSubscription.unsubscribe();
    }
  }

  // Calculer le montant final (sous-total + frais de livraison)
  calculerMontantFinal(): void {
    this.montantFinal = this.montantTotal + this.fraisLivraison;
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

  // Gérer l'événement blur de l'input quantité
  handleQuantiteBlur(event: Event, articleId: string): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const valeur = parseInt(inputElement.value) || 1;
      this.changerQuantite(articleId, valeur);
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

  // Passer à la commande : ouvre le modal avec le formulaire
  commander(): void {
    if (this.isBrowser) {
      // Réinitialiser le formulaire
      this.commandeForm.reset();

      // Si le modal est déjà initialisé, l'utiliser
      if (this.commandeModal) {
        this.commandeModal.show();
      } else {
        // Essayer de l'initialiser à la volée si ce n'est pas déjà fait
        const modalElement = document.getElementById('commandeModal');
        if (modalElement) {
          try {
            this.commandeModal = new bootstrap.Modal(modalElement);
            this.commandeModal.show();
          } catch (error) {
            console.error("Erreur lors de l'initialisation du modal:", error);

            // Fallback: utiliser SweetAlert si le modal ne fonctionne pas
            Swal.fire({
              title: 'Formulaire de commande',
              html: `
                <form id="swalForm">
                  <div class="mb-3">
                    <label class="form-label">Nom</label>
                    <input id="nom" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Prénom</label>
                    <input id="prenom" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Adresse</label>
                    <textarea id="adresse" class="form-control"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Téléphone</label>
                    <input id="telephone" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Carte bancaire</label>
                    <input id="carteBancaire" class="form-control">
                  </div>
                </form>
              `,
              showCancelButton: true,
              confirmButtonText: 'Confirmer',
              cancelButtonText: 'Annuler',
              preConfirm: () => {
                return {
                  nom: (document.getElementById('nom') as HTMLInputElement).value,
                  prenom: (document.getElementById('prenom') as HTMLInputElement).value,
                  adresse: (document.getElementById('adresse') as HTMLTextAreaElement).value,
                  telephone: (document.getElementById('telephone') as HTMLInputElement).value,
                  carteBancaire: (document.getElementById('carteBancaire') as HTMLInputElement).value
                };
              }
            }).then((result) => {
              if (result.isConfirmed && result.value) {
                this.commandeForm.patchValue(result.value);
                this.confirmerCommande();
              }
            });
          }
        } else {
          console.error("L'élément modal n'a pas été trouvé dans le DOM");
        }
      }
    }
  }

  // Confirmer la commande après validation du formulaire
  confirmerCommande(): void {
    if (this.commandeForm.valid && this.isBrowser) {
      // Fermer le modal
      this.commandeModal.hide();

      // Utiliser SweetAlert2 pour la confirmation finale
      Swal.fire({
        title: 'Confirmer votre commande?',
        text: 'Vous êtes sur le point de finaliser votre commande.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, commander',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Traitement de la commande (à implémenter plus tard avec API)
          const commande = {
            articles: this.articles,
            montantTotal: this.montantFinal,
            informationsClient: this.commandeForm.value,
            dateCommande: new Date()
          };

          console.log('Commande passée:', commande);

          // Vider le panier après commande
          this.panierService.viderPanier();

          // Afficher notification de succès
          Swal.fire({
            title: 'Commande passée avec succès!',
            text: 'Merci pour votre achat.',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  }
}
