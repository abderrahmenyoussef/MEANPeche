import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface ArticlePanier {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  images: string;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private articles: ArticlePanier[] = [];
  private panierSubject = new BehaviorSubject<ArticlePanier[]>([]);

  // Observable que les composants peuvent suivre
  panier$ = this.panierSubject.asObservable();

  // Variable pour vérifier si on est dans un environnement navigateur
  private isBrowser: boolean;

  // État initial du panier
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Récupérer le panier sauvegardé dans le localStorage si disponible et si on est dans un navigateur
    if (this.isBrowser) {
      const savedPanier = localStorage.getItem('panier');
      if (savedPanier) {
        this.articles = JSON.parse(savedPanier);
        this.panierSubject.next(this.articles);
      }
    }
  }

  // Ajouter un article au panier
  ajouterArticle(article: any, quantite: number = 1) {
    const articleExistant = this.articles.find(a => a.id === article.id);

    if (articleExistant) {
      // Si l'article existe déjà, augmenter la quantité
      articleExistant.quantite += quantite;
    } else {
      // Sinon, ajouter un nouvel article
      this.articles.push({
        id: article.id,
        nom: article.nom,
        prix: article.prix,
        quantite: quantite,
        images: article.images
      });
    }

    this.sauvegarderPanier();
  }

  // Supprimer un article du panier
  supprimerArticle(id: string) {
    this.articles = this.articles.filter(article => article.id !== id);
    this.sauvegarderPanier();
  }

  // Modifier la quantité d'un article
  modifierQuantite(id: string, quantite: number) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.quantite = quantite;
      this.sauvegarderPanier();
    }
  }

  // Vider complètement le panier
  viderPanier() {
    this.articles = [];
    this.sauvegarderPanier();
  }

  // Obtenir le nombre total d'articles dans le panier
  getNombreArticles(): number {
    return this.articles.reduce((total, article) => total + article.quantite, 0);
  }

  // Obtenir le montant total du panier
  getMontantTotal(): number {
    return this.articles.reduce((total, article) => total + (article.prix * article.quantite), 0);
  }

  // Sauvegarder l'état du panier
  private sauvegarderPanier() {
    // Sauvegarde dans le localStorage uniquement côté client
    if (this.isBrowser) {
      localStorage.setItem('panier', JSON.stringify(this.articles));
    }
    this.panierSubject.next([...this.articles]);
  }
}
