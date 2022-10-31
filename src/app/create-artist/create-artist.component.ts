import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ArtistService } from 'src/app/Services/artist.service';
import { Artist } from '../models/artist.model';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { AlertService } from '../Services/alert.service';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GlobalDataService } from '../Services/global-data.service';

@Component({
  selector: 'app-create-artist',
  templateUrl: './create-artist.component.html',
  styleUrls: ['./create-artist.component.css'],
})
export class CreateArtistComponent implements OnInit, OnDestroy {
  artistCreateForm: FormGroup;
  isArtistActive = true;
  isArtistActiveMessage = 'Artist is still active';
  artist: Artist;
  newArtistDate: string;
  userId: number = null;
  editMode: boolean;
  artistId: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private artistService: ArtistService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService,
    private globalDataService: GlobalDataService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // init Form and subscribe to get the id from the params
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap: ParamMap) => {
      this.artistId = +paramMap.get('artistId');
    });
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user.userRole != "admin") {
        this.userId = user.userId;
      }
    });
    this.onCheckEditMode();
    this.initForm();
  }
  // Submit the form to get a new artist
  onSubmit(): void {
    if (!this.editMode) {
      this.artistService.addNewArtist(
        new Artist({
          ...this.artistCreateForm.value,
          activeDate: this.artistCreateForm.value.startDate,
          dissolvedDate: this.artistCreateForm.value.endDate,
          userId: this.userId
        }));
      this.artistService.artist.pipe(takeUntil(this.destroy$)).subscribe((artist) => {
        this.artistService.fetchArtists(this.userId);
        this.globalDataService.fetchArtists();
        this.router.navigate(['../artist', artist.artistId]);
        this.alertService.success('artist is Created', true);
      });
    } else {
      this.SubmitUpdateArtist();
    }
  }

  SubmitUpdateArtist(): void {
    this.artistService.updateArtist(this.userId, this.artistId,
      new Artist({
        ...this.artistCreateForm.value,
        activeDate: this.artistCreateForm.value.startDate,
        dissolvedDate: this.artistCreateForm.value.endDate,
        userId: this.userId
      }));
    this.router.navigate(['../artist', this.artistId]);
    this.alertService.success('artist is updated', true);
  }
  // git message for the User that the  'Artist is not active or Active';
  onCheckMarkActive(): void {
    if (this.isArtistActive) {
      this.isArtistActive = false;
      this.isArtistActiveMessage = 'Artist is not active';
    } else {
      this.isArtistActive = true;
      this.isArtistActiveMessage = 'Artist is still active';
    }
  }
  // initForm Create new Artist
  private async initForm(): Promise<void> {
    if (!this.editMode) {
      const dateObj = new Date();
      const month = dateObj.getUTCMonth() + 1 < 10 ? '0' + (dateObj.getUTCMonth() + 1) : dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate() < 10 ? '0' + dateObj.getUTCDate() : dateObj.getUTCDate();
      const year = dateObj.getUTCFullYear();
      this.newArtistDate = `${year}-${month}-${day}`;
    }
    this.artistCreateForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      genre: new FormControl('rock'),
      startDate: new FormControl(this.newArtistDate, Validators.required),
      endDate: new FormControl(null),
    });

    if (this.editMode) {
      this.initFormInEditMode();
    }
  }

  async initFormInEditMode(): Promise<void> {
    this.artist = await this.artistService.getArtist(this.artistId, this.userId);
    if (this.artist) {
      if (this.artist.dissolvedDate !== null) {
        this.artist.dissolvedDate = formatDate(this.artist.dissolvedDate, 'yyyy-MM-dd', 'en');
      }
      this.artistCreateForm = new FormGroup({
        name: new FormControl(this.artist.name, Validators.required),
        description: new FormControl(this.artist.description, Validators.required),
        genre: new FormControl(this.artist.genre),
        startDate: new FormControl(formatDate(this.artist.activeDate, 'yyyy-MM-dd', 'en'), Validators.required),
        endDate: new FormControl(this.artist.dissolvedDate),
      });
    }
  }
  // reset the form and navigate to artist by id
  onClear(): void {
    this.artistCreateForm.reset();
    if (this.editMode) {
      this.router.navigate(['../artist', this.artistId]);
    } else {
      this.router.navigate([''], { relativeTo: this.route });
    }
    this.alertService.success('artist is Canceled', true);
  }

  onCheckEditMode(): void {
    this.route.url.subscribe((urls) => {
      urls.map((url) => {
        if (url.path === 'edit-artist') {
          this.editMode = true;
        }
      });
    });
  }
}
