import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirm } from '../../shared/dialogs/dialog-confirm/dialog-confirm';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);

  openConfirmDialog(message?: string) {
    return this.dialog
      .open(DialogConfirm, {
        data: {
          message: message || 'Realmente deseja realizar esta ação?',
          confirmText: 'Sim',
          cancelText: 'Não',
        },
        width: '400px',
        disableClose: true,
      })
      .afterClosed();
  }
}
