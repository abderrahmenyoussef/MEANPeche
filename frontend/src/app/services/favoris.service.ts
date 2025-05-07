import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FavorisService {
  private favorisKey = 'favoris_articles';
  private favorisSubject = new BehaviorSubject<any[]>([]);
  public favoris$ = this.favorisSubject.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.chargerFavoris();
  }

  private chargerFavoris(): void {
    // Vérifier que nous sommes dans un environnement navigateur
    if (isPlatformBrowser(this.platformId)) {
      const favorisString = localStorage.getItem(this.favorisKey);
      if (favorisString) {
        try {
          const favoris = JSON.parse(favorisString);
          this.favorisSubject.next(favoris);
        } catch (error) {
          console.error('Erreur lors du chargement des favoris:', error);
          this.favorisSubject.next([]);
        }
      } else {
        this.favorisSubject.next([]);
      }
    } else {
      // Si nous sommes côté serveur, initialiser avec un tableau vide
      this.favorisSubject.next([]);
    }
  }

  private sauvegarderFavoris(favoris: any[]): void {
    this.favorisSubject.next(favoris);

    // Vérifier que nous sommes dans un environnement navigateur avant d'utiliser localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.favorisKey, JSON.stringify(favoris));
    }
  }

  public ajouterAuxFavoris(article: any): void {
    const favoris = this.favorisSubject.value;

    // Vérifier si l'article existe déjà dans les favoris
    const index = favoris.findIndex(item => item.id === article.id);

    if (index === -1) {
      // Ajouter l'article s'il n'existe pas déjà
      favoris.push(article);
      this.sauvegarderFavoris(favoris);
    }
  }

  public retirerDesFavoris(articleId: string): void {
    const favoris = this.favorisSubject.value;
    const index = favoris.findIndex(item => item.id === articleId);

    if (index !== -1) {
      favoris.splice(index, 1);
      this.sauvegarderFavoris(favoris);
    }
  }

  public estEnFavoris(articleId: string): boolean {
    return this.favorisSubject.value.some(item => item.id === articleId);
  }

  public obtenirFavoris(): any[] {
    return this.favorisSubject.value;
  }

  public viderFavoris(): void {
    this.sauvegarderFavoris([]);
  }

  public nombreArticles(): number {
    return this.favorisSubject.value.length;
  }
}
