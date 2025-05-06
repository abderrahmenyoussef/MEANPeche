import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionArticleComponent } from './gestion-article.component';

describe('GestionArticleComponent', () => {
  let component: GestionArticleComponent;
  let fixture: ComponentFixture<GestionArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionArticleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
