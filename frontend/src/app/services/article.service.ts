import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/${environment.apiPrefix}/articles`;

  // Articles en promotion (statiques)
  private articlesEnPromotion = [
    {
      _id: 'promo1',
      nom: 'Canne à pêche professionnelle',
      description: 'Canne à pêche en carbone haute résistance, idéale pour la pêche en mer',
      prix: 150,
      prixPromo: 99.90,
      categorie: 'Cannes',
      image: 'assets/images/canne.jpg',
      enPromotion: true,
      pourcentagePromo: 33,
      stock: 15
    },
    {
      _id: 'promo2',
      nom: 'Ensemble de leurres premium',
      description: 'Kit complet de 20 leurres variés pour tous types de poissons',
      prix: 80,
      prixPromo: 49.99,
      categorie: 'Accessoires',
      image: 'assets/images/leuure.jpeg',
      enPromotion: true,
      pourcentagePromo: 37,
      stock: 25
    },
    {
      _id: 'promo3',
      nom: 'Moulinet automatique',
      description: 'Moulinet automatique avec frein progressif et bobine en aluminium',
      prix: 120,
      prixPromo: 79.90,
      categorie: 'Moulinets',
      image: 'assets/images/moulinet.jpg',
      enPromotion: true,
      pourcentagePromo: 33,
      stock: 10
    }
  ];

  constructor(private http: HttpClient) { }

  // Récupérer tous les articles
  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Récupérer un article par ID
  getArticleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Récupérer les nouveaux articles (les 3 derniers ajoutés)
  getNouveautes(limit: number = 3): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((articles: any[]) => {
        // Trier les articles par date d'ajout décroissante
        const sortedArticles = [...articles].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        // Prendre les n premiers articles et les marquer comme nouveaux
        const recentArticles = sortedArticles.slice(0, limit).map(article => ({
          ...article,
          nouveau: true
        }));
        return recentArticles;
      })
    );
  }

  // Récupérer les articles en promotion (statiques)
  getPromotions(): Observable<any[]> {
    return of(this.articlesEnPromotion);
  }

  // Créer un nouvel article
  createArticle(article: any): Observable<any> {
    return this.http.post(this.apiUrl, article);
  }

  // Mettre à jour un article
  updateArticle(id: string, article: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, article);
  }

  // Supprimer un article
  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
