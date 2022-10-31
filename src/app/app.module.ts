import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { HomePageComponent } from './home-page/home-page.component';
import { HeadingComponent } from './heading/heading.component';
import { CreateArtistComponent } from './create-artist/create-artist.component';
import { ArtistDetailsComponent } from './artist-details/artist-details.component';
import { CreateAlbumComponent } from './create-album/create-album.component';
import { CreateSongsComponent } from './create-songs/create-songs.component';
import { SidebarListComponent } from './sidebar-nav/sidebar-list/sidebar-list.component';
import { ArtistItemComponent } from './sidebar-nav/artist-item/artist-item.component';
import { AlbumDetailsComponent } from './album-details/album-details.component';
import { SongsFavoritesComponent } from './songs-favorites/songs-favorites.component';
import { AuthComponent } from './auth/auth-login/auth-login.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner';
import { AuthInterceptorService } from './Services/auth.interceptor.service';
import { DisplayListComponent } from './display-list/display-list.component';
import { AuthSigninComponent } from './auth/auth-signin/auth-signin.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PlaceholderImageComponent } from './placeholder-image/placeholder-image.component';
import { AlertComponent } from './alert/alert.component';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from './material-module';
@NgModule({
  declarations: [
    AppComponent,
    SidebarNavComponent,
    HomePageComponent,
    HeadingComponent,
    CreateArtistComponent,
    ArtistDetailsComponent,
    CreateAlbumComponent,
    CreateSongsComponent,
    SidebarListComponent,
    ArtistItemComponent,
    AlbumDetailsComponent,
    SongsFavoritesComponent,
    AuthComponent,
    LoadingSpinnerComponent,
    DisplayListComponent,
    AuthSigninComponent,
    PageNotFoundComponent,
    PlaceholderImageComponent,
    AlertComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule, MatNativeDateModule, MaterialModule],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
