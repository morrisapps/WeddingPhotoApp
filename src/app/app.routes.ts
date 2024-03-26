import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DetailsComponent } from './components/details/details.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { ShootComponent } from './components/shoot/shoot.component';
import { UploadTestComponent } from './components/uploadtest/uploadtest.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page'
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    title: 'Gallery'
  },
  {
    path: 'shoot',
    component: ShootComponent,
    title: 'Take a photo'
  },
  {
    path: 'upload',
    component: UploadTestComponent,
    title: 'Upload'
  },
  {
    path: 'photos',
    redirectTo: '../../photos',
    title: 'photos'
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    title: 'Home details'
  }
];
