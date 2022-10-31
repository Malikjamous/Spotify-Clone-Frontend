import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateArtistComponent } from './create-artist/create-artist.component';
import { ArtistDetailsComponent } from './artist-details/artist-details.component';
import { CreateAlbumComponent } from './create-album/create-album.component';
import { AlbumDetailsComponent } from './album-details/album-details.component';
import { SongsFavoritesComponent } from './songs-favorites/songs-favorites.component';
import { AuthComponent } from './auth/auth-login/auth-login.component';
import { AuthGuard } from './auth/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PlaceholderImageComponent } from './placeholder-image/placeholder-image.component';
// All existing routes and All existing routes by id

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: PlaceholderImageComponent },
      { path: 'create-artist', component: CreateArtistComponent, canActivate: [AuthGuard] },
      { path: 'edit-artist/:artistId', component: CreateArtistComponent, canActivate: [AuthGuard] },
      { path: 'artist/:artistId', component: ArtistDetailsComponent, canActivate: [AuthGuard] },
      { path: 'artist/:artistId/album/:albumId', component: AlbumDetailsComponent, canActivate: [AuthGuard] },
      { path: 'favorite', component: SongsFavoritesComponent, canActivate: [AuthGuard] },
      { path: 'artist/:artistId/album-create', component: CreateAlbumComponent, canActivate: [AuthGuard] },
      { path: 'artist/:artistId/edit-album/:albumId', component: CreateAlbumComponent, canActivate: [AuthGuard] },

    ],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'not-found', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {

}
