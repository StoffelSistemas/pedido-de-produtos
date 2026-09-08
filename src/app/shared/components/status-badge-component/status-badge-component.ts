import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  template: `
    <span
      class="badge border px-3 py-1 rounded-pill fw-black"
      [ngClass]="badgeClass"
      style="font-size: 9px; letter-spacing: 0.5px"
    >
      {{ status }}
    </span>
  `,
  styleUrl: './status-badge-component.css',
})
export class StatusBadgeComponent {
  @Input() status: string = ''; // ou OrderStatus se tiver tipagem estrita

  get badgeClass(): string {
    if (this.status === 'Orçamento') {
      return 'text-primary bg-primary-subtle border-primary-subtle';
    } else if (this.status === 'Pedido') {
      return 'text-success bg-success-subtle border-success-subtle';
    }
    const map: any = {
      FINALIZADO: 'text-success bg-success-subtle border-success-subtle',
      ENVIADO: 'text-primary bg-primary-subtle border-primary-subtle',
      CANCELADO: 'text-danger bg-danger-subtle border-danger-subtle',
      PENDENTE: 'text-warning bg-warning-subtle border-warning-subtle',
    };
    return map[this.status] || '';
  }
}
