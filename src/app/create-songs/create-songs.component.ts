import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Song } from '../models/song.model';
import { AlbumService } from '../Services/album.service';
import { AuthService } from 'src/app/Services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-create-songs',
  templateUrl: './create-songs.component.html',
  styleUrls: ['./create-songs.component.css'],
})
export class CreateSongsComponent implements OnInit, OnDestroy, OnChanges {
  songsListForm: FormGroup;
  songCreateForm: FormGroup;
  albumId: number;
  artistId: number;
  userId: number;
  songFormIndex = 1;
  @Input() songs: Song[];
  @Output() songsChange: EventEmitter<Song[]> = new EventEmitter<Song[]>();
  @Input() editMode: boolean;
  @ViewChild('songName') songNameInput: ElementRef;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private authService: AuthService,
  ) { }
  // Init form on changes songs
  ngOnChanges(changes: SimpleChanges): void {
    this.initForm(this.songFormIndex, true);
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // init the Form and subscribe to get the id
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      this.artistId = +params.get('artistId');
      this.albumId = +params.get('albumId');
    });
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.userId = user.userId;
    });
  }
  // add a new song and emit the event
  onAddNewSong(): void {
    this.songFormIndex++;
    this.songNameInput.nativeElement.focus();

    const songsFormArray: FormArray = this.songsListForm.get('songs') as FormArray;
    songsFormArray.push(
      new FormGroup({
        index: new FormControl(this.songCreateForm.value.index),
        name: new FormControl(this.songCreateForm.value.name),
        duration: new FormControl(this.songCreateForm.value.duration),
      })
    );

    this.setSongsInAlbum();
    this.songCreateForm.reset();
    this.initForm(this.songFormIndex, false);
  }

  setSongsInAlbum(): Song[] {
    this.songs = this.songsListForm.get('songs').value;
    const lastSong = this.songCreateForm;
    if (lastSong.valid) {
      this.songs.push(lastSong.value);
    }
    this.songsChange.emit(this.songs);
    return this.songs;
  }
  // // delete item by index song
  onDeleteSong(songIndex: number): void {
    this.songFormIndex--;
    if (this.editMode) {
      const song = this.controls[songIndex].value;
      if (song) {
        this.albumService.deleteSong(this.userId, this.artistId, this.albumId, song.songId);
        if (song.isFavorite) {
          this.albumService.deleteFavSong(this.userId, this.artistId, this.albumId, song.songId)
        }
      }
    }
    this.makeSongsIndexLesser(songIndex);
    (this.songsListForm.get('songs') as FormArray).removeAt(songIndex);
    this.initForm(this.songFormIndex, false);
  }

  makeSongsIndexLesser(songIndex): void {
    const deletedSongIndex = this.controls[songIndex].value.index;
    this.controls.map((song) => {
      if (deletedSongIndex <= song.value.index) {
        song.value.index--;
      }
    });
  }
  // get Song Control to loop throw all songs and get all songs in the ArrSong
  get controls(): AbstractControl[] {
    return (this.songsListForm.get('songs') as FormArray).controls;
  }
  // init Form
  private initForm(initIndex: number, loopThrowSongs: boolean): void {
    if (initIndex === 1) {
      this.songsListForm = new FormGroup({
        songs: new FormArray([]),
      });
    }
    if (this.editMode) {
      this.InitFormInEditMode(loopThrowSongs);
    }
    this.songCreateForm = new FormGroup({
      index: new FormControl(this.songFormIndex, Validators.required),
      name: new FormControl(null, Validators.required),
      duration: new FormControl(null, Validators.required),
    });
  }
  // init Form in Edit mode
  InitFormInEditMode(loopThrowSongs: boolean): void {
    if (this.songs) {
      if (loopThrowSongs) {
        if (this.songFormIndex === 1) {
          for (const song of this.songs) {
            this.songFormIndex++;
            const songsFormArray: FormArray = this.songsListForm.get('songs') as FormArray;
            songsFormArray.push(
              new FormGroup({
                index: new FormControl(song.index),
                name: new FormControl(song.name),
                duration: new FormControl(song.duration),
                songId: new FormControl(song.songId),
                isFavorite: new FormControl(song.isFavorite)
              })
            );
          }
        }
      }
    }
  }

  // changes Songs position's
  dropSongs(event: CdkDragDrop<Song>): void {
    moveItemInArray(this.controls, event.previousIndex, event.currentIndex);
    this.controls.map((song, index) => {
      song.value.index = index + 1;
    });
    this.setSongsInAlbum();
  }
}

