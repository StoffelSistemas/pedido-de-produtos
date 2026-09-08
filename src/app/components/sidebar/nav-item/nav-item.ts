import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-item',
  imports: [],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.css',
})
export class NavItem {
  @Input() active: boolean = false;
  @Input() icon: string = '';
  @Input() label: string = '';
}
