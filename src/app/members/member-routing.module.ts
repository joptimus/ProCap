import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'landing',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'select',
    loadChildren: () => import('./report/select/select.module').then( m => m.SelectPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./report/main/main.module').then( m => m.MainPageModule)
  },
  {
    path: 'engines',
    loadChildren: () => import('./report/engines/engines.module').then( m => m.EnginesPageModule)
  },
  {
    path: 'generator',
    loadChildren: () => import('./report/generator/generator.module').then( m => m.GeneratorPageModule)
  },
  {
    path: 'hvac',
    loadChildren: () => import('./report/hvac/hvac.module').then( m => m.HvacPageModule)
  },
  {
    path: 'bilge',
    loadChildren: () => import('./report/bilge/bilge.module').then( m => m.BilgePageModule)
  },
  {
    path: 'misc',
    loadChildren: () => import('./report/misc/misc.module').then( m => m.MiscPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
