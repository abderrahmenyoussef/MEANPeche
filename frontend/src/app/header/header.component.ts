import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  searchSubject = new Subject<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Configure la recherche dynamique avec un délai de 300ms pour éviter trop d'appels
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  // Appelé à chaque frappe dans la barre de recherche
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Effectue la recherche ou réinitialise si le terme est vide
  performSearch(term: string): void {
    if (this.router.url === '/liste') {
      // On est déjà sur la page de liste, pas besoin de naviguer
      // Émet un événement personnalisé pour que le composant gestion-article puisse y réagir
      window.dispatchEvent(new CustomEvent('global-search', {
        detail: { searchTerm: term }
      }));
    } else {
      // On est sur une autre page, naviguer vers la liste avec le terme de recherche
      this.router.navigate(['/liste'], {
        queryParams: { search: term }
      });
    }
  }

  // Gérer la soumission du formulaire de recherche
  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.performSearch(this.searchTerm);
  }
}
