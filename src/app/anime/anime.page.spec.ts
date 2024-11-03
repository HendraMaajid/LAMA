import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimePage } from './anime.page';

describe('AnimePage', () => {
  let component: AnimePage;
  let fixture: ComponentFixture<AnimePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
