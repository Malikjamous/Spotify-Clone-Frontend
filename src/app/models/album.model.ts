// album model
import { Song } from './song.model';
export class Album {
  public name: string;
  public description: string;
  public date: Date;
  public songs: Song[];
  public artistId: number;
  public albumId: number;
  public userId: number;
  public albumIndex: number;
  constructor(values: {
    name: string;
    description: string;
    date: Date;
    songs: Song[];
    artistId?: number;
    albumId?: number;
    userId?: number;
    albumIndex?: number;
  }) {
    this.name = values.name;
    this.description = values.description;
    this.date = values.date;
    this.songs = values.songs;
    this.artistId = values.artistId;
    this.albumId = values.albumId;
    this.userId = values.userId;
    this.albumIndex = values.albumIndex;
  }
}
