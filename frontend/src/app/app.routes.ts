import { Routes } from '@angular/router';
import { GestionArticleComponent } from './gestion-article/gestion-article.component';
import { HomeComponent } from './home/home.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'liste', component: GestionArticleComponent },
  { path: 'article/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '' }
];
