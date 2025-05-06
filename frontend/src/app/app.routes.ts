import { Routes } from '@angular/router';
import { GestionArticleComponent } from './gestion-article/gestion-article.component';

export const routes: Routes = [
  { path: '', redirectTo: 'liste', pathMatch: 'full' },
  { path: 'liste', component: GestionArticleComponent },
  { path: '**', redirectTo: 'liste' }
];
