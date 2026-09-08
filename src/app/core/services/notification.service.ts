import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  // Método para Sucesso
  success(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000, // Fecha após 3 segundos
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'], // Aplica o estilo verde
    });
  }

  // Método para Erro
  error(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000, // Erros ficam um pouco mais na tela (5s)
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'], // Aplica o estilo vermelho
    });
  }
}
