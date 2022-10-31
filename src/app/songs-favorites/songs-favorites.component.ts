import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlbumService } from '../Services/album.service';
import { Song } from '../models/song.model';
import { Artist } from '../models/artist.model';
import { ArtistService } from 'src/app/Services/artist.service';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { AlertService } from '../Services/alert.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-songs-favorites',
  templateUrl: './songs-favorites.component.html',
  styleUrls: ['./songs-favorites.component.css'],
})
export class SongsFavoritesComponent implements OnInit, OnDestroy {
  favoriteSongsInfo: any[] = [];
  favoriteSongs: Song[];
  artist: Artist;
  userId: number = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private albumService: AlbumService,
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // loop throw all songs in favoriteSongsArr and get all songs infos to show in html
  async ngOnInit(): Promise<void> {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe(async (user) => {
      if (user) {
        if (user.userRole != "admin") {
          this.userId = user.userId;
        }
      }
    });
    this.getSongsInfo();
  }
  // get Favorite songs
  async getSongsInfo(): Promise<void> {
    this.favoriteSongsInfo = [];
    this.favoriteSongs = [];
    this.favoriteSongs = await this.albumService.getFavoriteSongs(this.userId);
    if (this.favoriteSongs) {
      for (const favSong of this.favoriteSongs) {
        favSong.isFavorite = true;
        const album = await this.albumService.getAlbum(favSong.albumId, favSong.artistId, this.userId);
        this.artist = await this.artistService.getArtist(album.artistId, this.userId);
        const songInfo = { album, artist: this.artist, favSong };
        this.favoriteSongsInfo.push(songInfo);
      }
    }
  }
  // Cancel favorite to list in the Service
  async onCancelFavorite(index: number): Promise<void> {
    this.favoriteSongsInfo[index].favSong.isFavorite = false;
    this.albumService.deleteFavSong(this.userId, this.favoriteSongsInfo[index].favSong.artistId,
      this.favoriteSongsInfo[index].favSong.albumId, this.favoriteSongsInfo[index].favSong.songId);
    this.alertService.success('Song favorite is Canceled', true);
  }
}
