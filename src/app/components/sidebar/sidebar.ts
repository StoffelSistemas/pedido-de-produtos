import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NavItem } from './nav-item/nav-item';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() darkMode: boolean = false;

  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Output() toggleDarkMode = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<string>();

  onToggleDarkMode() {
    this.toggleDarkMode.emit();
  }

  onViewChange(view: string) {
    this.viewChange.emit(view);
  }

  handleNavClick() {
    // Lógica para itens sem ação definida no exemplo original
  }

  @Input() active: boolean = false;
  @Input() icon: string = '';
  @Input() label: string = '';

  logout() {
    this.authService.logout();
    return this.router.navigate([`/login/${this.authService.getFranquia()}`]);
  }
}
