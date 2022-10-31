import { Component, OnInit, OnDestroy } from '@angular/core';
import { Song } from '../models/song.model';
import { AlbumService } from '../Services/album.service';
import { Album } from '../models/album.model';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from 'src/app/Services/artist.service';
import { Artist } from 'src/app/models/artist.model';
import { AuthService } from 'src/app/Services/auth.service';
import { AlertService } from '../Services/alert.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-album-details',
  templateUrl: './album-details.component.html',
  styleUrls: ['./album-details.component.css'],
})
export class AlbumDetailsComponent implements OnInit, OnDestroy {
  songs: Song[] = [];
  album: Album;
  artist: Artist;
  artistId: number;
  albumId: number;
  userId: number = null;
  userRole: string;
  isUserRoleAndAlbumHasUserId: boolean;
  isAdminRoleAndAlbumHasNoUserId: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();
  favSongs: Song[] = [];
  constructor(
    private artistService: ArtistService,
    private albumService: AlbumService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) { }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // subscribe the Params to get artist and album and Songs
  async ngOnInit(): Promise<void> {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.userRole = user.userRole;
      if (user.userRole != "admin") {
        this.userId = user.userId;
      }
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(async (params: ParamMap) => {
      this.artistId = +params.get('artistId');
      this.albumId = +params.get('albumId');
      this.getAlbumDetails();
    });
  }
  async getAlbumDetails(): Promise<void> {
    this.album = await this.albumService.getAlbum(this.albumId, this.artistId, this.userId);
    this.isUserRoleAndAlbumHasUserId = false;
    this.isAdminRoleAndAlbumHasNoUserId = false;
    if (this.userRole === "user") {
      if (this.album.userId != null) {
        this.isUserRoleAndAlbumHasUserId = true;
      }
    } else {
      if (this.album.userId === null) {
        this.isAdminRoleAndAlbumHasNoUserId = true;
      }
    }
    this.artist = await this.artistService.getArtist(this.artistId, this.userId);
    this.songs = await this.album.songs;
    if (this.songs) {
      this.songs.sort((a, b) => {
        return a.index - b.index;
      });
    }
    this.CheckFavoriteSongs();
  }

  async CheckFavoriteSongs() {
    this.favSongs = await this.albumService.getFavoriteSongs(this.userId);
    this.songs.map((song) => {
      if (this.favSongs) {
        this.favSongs.map((favSong) => {
          if (song.songId === favSong.songId) {
            song.isFavorite = true;
          }
        });
      }
    });
  }
  // add favorite to list in the Service
  onAddToFavorite(index: number): void {
    this.songs[index].isFavorite = true;
    this.albumService.setFavoriteSongs(this.songs[index], this.userId);
    this.alertService.success('Favorite is Created', true);
  }
  // Cancel favorite to list in the Service
  onCancelFavorite(index: number): void {
    this.songs[index].isFavorite = false;
    // this.albumService.setFavoriteSongs(this.songs[index], this.userId);
    this.albumService.deleteFavSong(this.userId, this.songs[index].artistId, this.songs[index].albumId, this.songs[index].songId);
    this.alertService.success('Favorite is Canceled', true);
  }
  onNavigateToArtistDetails(): void {
    this.router.navigate(['artist/', this.artistId]);
  }

  onEditAlbum(): void {
    this.router.navigate(['../../edit-album/', this.albumId], { relativeTo: this.route });
  }
}
