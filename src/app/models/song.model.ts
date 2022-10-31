// Song model
export class Song {
  public name: string;
  public duration: string;
  public index: number;
  public isFavorite: boolean;
  public albumId: number;
  public songId: number;
  public artistId: number;
  constructor(values: {
    name: string;
    duration: string;
    index: number;
    isFavorite: boolean;
    albumId: number;
    songId?: number;
    artistId: number;
  }) {
    this.name = values.name;
    this.duration = values.duration;
    this.index = values.index;
    this.isFavorite = values.isFavorite || false;
    this.albumId = values.albumId;
    this.songId = values.songId;
    this.artistId = values.artistId;
  }
}
