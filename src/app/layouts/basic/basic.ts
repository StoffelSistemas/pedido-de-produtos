import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-basic',
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './basic.html',
  styleUrl: './basic.css',
})
export class Basic implements OnInit {
  protected readonly authService = inject(AuthService);
  darkMode = signal(false);

  ngOnInit() {
    if (this.authService.isAutoLogin()) {
      return this.setLightMode();
    }

    const darkMode = this.getDarkMode();
    if (darkMode === 'enabled') {
      this.darkMode.set(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleDarkMode() {
    const darkMode = this.getDarkMode();
    if (darkMode == 'enabled') {
      this.setLightMode();
    } else {
      this.setDarkMode();
    }
  }

  setDarkMode() {
    localStorage.setItem('darkMode', 'enabled');
    document.body.classList.add('dark-mode');
    this.darkMode.set(true);
  }

  setLightMode() {
    localStorage.setItem('darkMode', 'disabled');
    document.body.classList.remove('dark-mode');
    this.darkMode.set(false);
  }

  getDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (!darkMode) {
      localStorage.setItem('darkMode', 'disabled');
    }

    return localStorage.getItem('darkMode') || 'disabled';
  }
}
