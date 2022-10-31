import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlbumService } from '../Services/album.service';
import { Album } from '../models/album.model';
import { Song } from '../models/song.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { AlertService } from '../Services/alert.service';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreateSongsComponent } from '../create-songs/create-songs.component';
@Component({
  selector: 'app-create-album',
  templateUrl: './create-album.component.html',
  styleUrls: ['./create-album.component.css'],
})
export class CreateAlbumComponent implements OnInit, OnDestroy {
  @ViewChild('songForm', { static: true }) songFormRef: CreateSongsComponent;
  albumCreateForm: FormGroup;
  album: Album;
  artistId: number;
  userId: number = null;
  albumId: number;
  editMode: boolean;
  newDate: string;
  @Input() songList: Song[] = [];
  @Input() lastSong: Song;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
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
  // init the form  and get Artist id to get artistId in the Album
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      this.artistId = +params.get('artistId');
      this.albumId = +params.get('albumId');
    });
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user.userRole != "admin") {
        this.userId = user.userId;
      }
    });
    this.onCheckEditMode();
    this.initForm();
  }
  // this will will implemented when User is in create mode
  private async initForm(): Promise<void> {
    if (!this.editMode) {
      const dateObj = new Date();
      const month = dateObj.getUTCMonth() + 1 < 10 ? '0' + (dateObj.getUTCMonth() + 1) : dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate() < 10 ? '0' + dateObj.getUTCDate() : dateObj.getUTCDate();
      const year = dateObj.getUTCFullYear();
      this.newDate = `${year}-${month}-${day}`;
    }
    this.albumCreateForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      date: new FormControl(this.newDate, Validators.required),
    });
    if (this.editMode) {
      this.initFromInEditMode();
    }
  }
  // this will implemented when User in Edit Album mode
  async initFromInEditMode(): Promise<void> {
    this.album = await this.albumService.getAlbum(this.albumId, this.artistId, this.userId);
    if (this.album) {
      this.albumCreateForm = new FormGroup({
        name: new FormControl(this.album.name, Validators.required),
        description: new FormControl(this.album.description, Validators.required),
        date: new FormControl(formatDate(this.album.date, 'yyyy-MM-dd', 'en'), Validators.required),
      });
      this.songList = this.album.songs.sort((a, b) => {
        return a.index - b.index;
      });
    }
  }
  // reset album Form values to null
  // navigate to the Artist Details
  onClear(): void {
    this.albumCreateForm.reset();
    if (!this.editMode) {
      this.router.navigate(['artist', this.artistId]);
    } else {
      this.router.navigate(['../../album', this.albumId], { relativeTo: this.route });
    }
    this.alertService.success('album is Canceled', true);
  }
  // Add a new Album to Artist
  onAddNewAlbum(): void {
    this.songList = this.songFormRef.setSongsInAlbum();
    const tAlbum = new Album({
      ...this.albumCreateForm.value,
      artistId: this.artistId,
      albumId: this.albumId,
      songs: this.songList.map((song) => new Song(song)),
    });

    tAlbum.songs.map((song) => {
      song.albumId = tAlbum.albumId;
      song.artistId = tAlbum.artistId;
      return song;
    });
    // this will implemented when User not in Edit Album mode
    if (!this.editMode) {
      this.albumService.addNewAlbum(tAlbum, this.userId);
      this.albumService.album.pipe(takeUntil(this.destroy$)).subscribe(album => {
        this.router.navigate(['../album', album.albumId], { relativeTo: this.route });
      });
      this.alertService.success('album is Created', true);
    }
    if (this.editMode) {
      this.onUpdateAlbum(tAlbum);
    }
  }
  // this will implemented when User in Edit Album mode
  onUpdateAlbum(album: Album): void {
    this.albumService.updateAlbumAndSongs(this.userId, album.artistId, this.albumId, album);
    this.router.navigate(['../../album', this.albumId], { relativeTo: this.route });
    this.alertService.success('album is Updated', true);
  }
  onCheckEditMode(): void {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe((urls) => {
      urls.map((url) => {
        if (url.path === 'edit-album') {
          this.editMode = true;
        }
      });
    });
  }

}
