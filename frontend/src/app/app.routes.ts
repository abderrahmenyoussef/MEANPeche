import { Routes } from '@angular/router';
import { GestionArticleComponent } from './gestion-article/gestion-article.component';
import { HomeComponent } from './home/home.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { PanierComponent } from './panier/panier.component';
import { FavorisComponent } from './favoris/favoris.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { NouveauComponent } from './nouveau/nouveau.component';
import { PromoComponent } from './promo/promo.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'liste', component: GestionArticleComponent },
  { path: 'article/:id', component: ProductDetailComponent },
  { path: 'panier', component: PanierComponent },
  { path: 'favoris', component: FavorisComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'nouveautes', component: NouveauComponent },
  { path: 'promotions', component: PromoComponent },
  { path: '**', redirectTo: '' }
];
