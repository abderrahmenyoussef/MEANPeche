import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/${environment.apiPrefix}/articles`;

  constructor(private http: HttpClient) { }

  // Récupérer tous les articles
  getArticles(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Récupérer un article par ID
  getArticleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
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
