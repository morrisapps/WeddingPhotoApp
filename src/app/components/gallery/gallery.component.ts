import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../../housinglocation';
import { HousingService } from '../../services/housing.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    HousingLocationComponent,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by Author" #filter>

        <button mat-raised-button (click)="filterResults(filter.value)">Search</button>
      </form>
    </section>
    <mat-spinner style="margin:0 auto;margin-top:33dvh;"  *ngIf="show"></mat-spinner>
    <section class="results">
    <app-housing-location *ngFor="let housingLocation of filteredLocationList" [housingLocation]="housingLocation"></app-housing-location>
    </section>
  `,
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  filteredLocationList: HousingLocation[] = [];
  housingLocationList: HousingLocation[] = [];
  housingService: HousingService = inject(HousingService);
  show: boolean = true;

  constructor() {
    this.housingService.getAllHousingLocations().then((housingLocationList: HousingLocation[]) => {
      this.housingLocationList = housingLocationList;
      this.filteredLocationList = housingLocationList;
      this.show = false
    });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }

    this.filteredLocationList = this.housingLocationList.filter(
      housingLocation => housingLocation?.city.toLowerCase().includes(text.toLowerCase())
    );
  }
}
