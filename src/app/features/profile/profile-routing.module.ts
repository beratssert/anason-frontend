// src/app/features/profile/profile-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './pages/user-profile/user-profile.component'; // Import et

const routes: Routes = [
  { path: '', component: UserProfileComponent }, // /profile yolu UserProfileComponent'i gösterecek
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
