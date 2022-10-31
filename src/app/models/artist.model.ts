// artist model
import { Album } from './album.model';
export class Artist {
  public userId: number;
  public name: string;
  public description: string;
  public genre: string;
  public activeDate: Date;
  public dissolvedDate: string;
  public isActive: boolean;
  public artistId: number;
  public albums: Album[];
  constructor(values: {
    userId: number;
    name: string;
    description: string;
    genre: string;
    activeDate: Date;
    dissolvedDate?: string;
    isActive: boolean;
    artistId?: number;
    albums: Album[];
  }) {
    this.userId = values.userId;
    this.name = values.name;
    this.description = values.description;
    this.genre = values.genre;
    this.activeDate = values.activeDate;
    this.dissolvedDate = values.dissolvedDate || null;
    this.isActive = values.isActive || !values.dissolvedDate;
    this.artistId = values.artistId;
    this.albums = values.albums;
  }
}
