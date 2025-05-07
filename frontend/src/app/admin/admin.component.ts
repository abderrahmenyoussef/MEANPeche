import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ArticleService } from '../services/article.service';
import { TunisianCurrencyPipe } from '../pipes/tunisian-currency.pipe';
import Swal from 'sweetalert2';

interface Article {
  id?: string;
  iid: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorie: string;
  images: string;
  date_ajout?: Date;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TunisianCurrencyPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  // État d'affichage
  showArticleForm = false;
  isEditMode = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Données des articles
  articles: Article[] = [];
  currentArticle: Article = {
    iid: '',
    nom: '',
    description: '',
    prix: 0,
    stock: 0,
    categorie: '',
    images: ''
  };

  // Liste des catégories disponibles
  categories: string[] = [
    'Cannes à pêche',
    'Moulinets',
    'Leurres',
    'Accessoires',
    'Épuisettes',
    'Hameçons',
    'Fils et tresses',
    'Équipement',
    'Vêtements'
  ];

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est authentifié, sinon rediriger vers la page de connexion
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Charger les articles
    this.loadArticles();
  }

  // Méthode pour charger tous les articles
  loadArticles(): void {
    this.isLoading = true;
    this.articleService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des articles';
        console.error('Erreur lors du chargement des articles:', error);
        this.isLoading = false;
      }
    });
  }

  // Méthode pour ouvrir le formulaire de création d'article
  openNewArticleForm(): void {
    this.isEditMode = false;
    this.showArticleForm = true;
    this.resetArticleForm();
  }

  // Méthode pour ouvrir le formulaire de modification d'article
  openEditArticleForm(article: Article): void {
    this.isEditMode = true;
    this.showArticleForm = true;
    this.currentArticle = { ...article };
  }

  // Méthode pour réinitialiser le formulaire
  resetArticleForm(): void {
    this.currentArticle = {
      iid: '',
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      categorie: '',
      images: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Méthode pour annuler l'édition
  cancelEdit(): void {
    this.showArticleForm = false;
    this.resetArticleForm();
  }

  // Méthode pour sauvegarder un article (création ou mise à jour)
  saveArticle(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Vérification améliorée et plus stricte des champs requis
    let isMissingRequiredField = false;
    let missingFields = [];

    if (!this.currentArticle.iid || this.currentArticle.iid.trim() === '') {
      isMissingRequiredField = true;
      missingFields.push('ID Article');
    }

    if (!this.currentArticle.nom || this.currentArticle.nom.trim() === '') {
      isMissingRequiredField = true;
      missingFields.push('Nom');
    }

    if (!this.currentArticle.description || this.currentArticle.description.trim() === '') {
      isMissingRequiredField = true;
      missingFields.push('Description');
    }

    if (this.currentArticle.prix === null || this.currentArticle.prix === undefined) {
      isMissingRequiredField = true;
      missingFields.push('Prix');
    }

    // Vérification spécifique pour le stock qui permet explicitement la valeur 0
    if (this.currentArticle.stock === null || this.currentArticle.stock === undefined) {
      isMissingRequiredField = true;
      missingFields.push('Stock');
    }

    if (!this.currentArticle.categorie || this.currentArticle.categorie.trim() === '') {
      isMissingRequiredField = true;
      missingFields.push('Catégorie');
    }

    if (!this.currentArticle.images || this.currentArticle.images.trim() === '') {
      isMissingRequiredField = true;
      missingFields.push('URL de l\'image');
    }

    if (isMissingRequiredField) {
      this.errorMessage = `Tous les champs sont obligatoires. Champs manquants : ${missingFields.join(', ')}`;
      this.isLoading = false;
      return;
    }

    // Conversion explicite du stock en nombre pour éviter tout problème
    this.currentArticle.stock = Number(this.currentArticle.stock);
    this.currentArticle.prix = Number(this.currentArticle.prix);

    console.log('Article à sauvegarder:', this.currentArticle); // Pour debug

    if (this.isEditMode && this.currentArticle.id) {
      // Mise à jour d'un article existant
      this.articleService.updateArticle(this.currentArticle.id, this.currentArticle).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Succès!',
            text: 'Article mis à jour avec succès',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.isLoading = false;
          this.loadArticles();
          this.showArticleForm = false;
          this.resetArticleForm();
        },
        error: (error) => {
          Swal.fire({
            title: 'Erreur!',
            text: "Erreur lors de la mise à jour de l'article",
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Erreur lors de la mise à jour de l'article:", error);
          this.isLoading = false;
        }
      });
    } else {
      // Création d'un nouvel article
      this.articleService.createArticle(this.currentArticle).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Succès!',
            text: 'Article créé avec succès',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.isLoading = false;
          this.loadArticles();
          this.showArticleForm = false;
          this.resetArticleForm();
        },
        error: (error) => {
          Swal.fire({
            title: 'Erreur!',
            text: "Erreur lors de la création de l'article",
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Erreur lors de la création de l'article:", error);
          this.isLoading = false;
        }
      });
    }
  }

  // Méthode pour supprimer un article
  deleteArticle(id: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.articleService.deleteArticle(id).subscribe({
          next: (response) => {
            Swal.fire(
              'Supprimé!',
              'L\'article a été supprimé avec succès.',
              'success'
            );
            this.loadArticles();
            this.isLoading = false;
          },
          error: (error) => {
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
            console.error("Erreur lors de la suppression de l'article:", error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Méthode pour se déconnecter
  logout(): void {
    this.authService.logout();
  }
}
