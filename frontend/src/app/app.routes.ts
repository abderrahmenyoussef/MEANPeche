import { Routes } from '@angular/router';
import { GestionArticleComponent } from './gestion-article/gestion-article.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'liste', component: GestionArticleComponent },
  { path: '**', redirectTo: '' }
];
