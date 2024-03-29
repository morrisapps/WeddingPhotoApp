import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-shoot-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule],
  templateUrl: './shoot-dialog.component.html',
  styleUrl: './shoot-dialog.component.css'
})
export class ShootDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShootDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    dialogRef.disableClose = true
  }

  onYes(): void {
    this.dialogRef.close(true);
  }
  onNope(): void {
    this.dialogRef.close(false);
  }
}
