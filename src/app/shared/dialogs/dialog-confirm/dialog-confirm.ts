import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogClose,
} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './dialog-confirm.html',
  styleUrl: './dialog-confirm.css',
})
export class DialogConfirm {
  readonly dialogRef = inject(MatDialogRef<DialogConfirm>);
  readonly data = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

  // openDialog(): void {
  //   const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
  //     data: { name: this.name(), animal: this.animal() },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed');
  //     if (result !== undefined) {
  //       this.animal.set(result);
  //     }
  //   });
  // }
}
