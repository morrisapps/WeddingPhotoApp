import { GalleryComment } from './gallery-comment';

export interface GalleryInformation {
  id: string;
  author: string;
  width: number;
  height: number;
  likes: number;
  date: Date;
  comments: GalleryComment[];
}
