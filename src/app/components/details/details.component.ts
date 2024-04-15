import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { PhotoInformation } from '../../interfaces/photo-information';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
  <article>
    <img class="listing-photo" [src]=""
      alt="Exterior photo of {{photoInformation?.name}}"/>
    <section class="listing-description">
      <h2 class="listing-heading">{{photoInformation?.name}}</h2>
      <p class="listing-location"></p>
    </section>
    <section class="listing-features">
      <h2 class="section-heading">About this housing location</h2>
      <ul>
        <li>Units available: </li>
        <li>Does this location have wifi: </li>
        <li>Does this location have laundry: </li>
      </ul>
    </section>
    <section class="listing-apply">
      <h2 class="section-heading">Apply now to live here</h2>
      <form [formGroup]="applyForm" (submit)="submitApplication()">
        <label for="first-name">First Name</label>
        <input id="first-name" type="text" formControlName="firstName">

        <label for="last-name">Last Name</label>
        <input id="last-name" type="text" formControlName="lastName">

        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
        <button type="submit" class="primary">Apply now</button>
      </form>
    </section>
  </article>
`,
  styleUrl: './details.component.css'
})

export class DetailsComponent {

  route: ActivatedRoute = inject(ActivatedRoute);
  PhotoService = inject(PhotoService);
  photoInformation: PhotoInformation | undefined;

  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('')
  });

  constructor() {
    const photoId = parseInt(this.route.snapshot.params['id'], 10);
    this.PhotoService.getPhotoById(photoId).then(photoInformation => {
      this.photoInformation = photoInformation;
    });
  }

  submitApplication() {
    this.PhotoService.submitApplication(
      this.applyForm.value.firstName ?? '',
      this.applyForm.value.lastName ?? '',
      this.applyForm.value.email ?? ''
    );
  }

}
