import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['landing']);
const routes: Routes = [
 
  { path: '', loadChildren: () => import('./public/login/login.module').then( m => m.LoginPageModule), ...canActivate(redirectLoggedInToHome) },

 // { path: 'login', loadChildren: () => import('./public/login/login.module').then( m => m.LoginPageModule), },
  { path: 'register', loadChildren: () => import('./public/register/register.module').then( m => m.RegisterPageModule) ,},
  { path: 'members', loadChildren: () => import('./members/member-routing.module').then(m => m.MemberRoutingModule), ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'landing', loadChildren: () => import('./members/landing/landing.module').then( m => m.LandingPageModule) },
  { path: 'clients', loadChildren: () => import('./admin/clients/clients.module').then( m => m.ClientsPageModule) },
  { path: 'users', loadChildren: () => import('./admin/users/users.module').then( m => m.UsersPageModule) },
  { path: 'modal', loadChildren: () => import('./admin/modal/modal.module').then( m => m.ModalPageModule) },
  { path: 'add', loadChildren: () => import('./admin/add/add.module').then( m => m.AddPageModule) },
  { path: 'options', loadChildren: () => import('./admin/options/options.module').then( m => m.OptionsPageModule) },
  { path: 'settings', loadChildren: () => import('./admin/settings/settings.module').then( m => m.SettingsPageModule) },

  { path: '**', redirectTo: 'landing', pathMatch: 'full' },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
