import {Component} from '@angular/core';
import {MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button'

@Component({
  selector: 'shoot-bottomsheet',
  templateUrl: 'shoot-bottomsheet.component.html',
  standalone: true,
  imports: [MatListModule],
})
export class ShootBottomsheetComponent {
  constructor(private _bottomSheetRef: MatBottomSheetRef<ShootBottomsheetComponent>) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
