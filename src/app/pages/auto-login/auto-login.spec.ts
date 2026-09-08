import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoLogin } from './auto-login';

describe('AutoLogin', () => {
  let component: AutoLogin;
  let fixture: ComponentFixture<AutoLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
