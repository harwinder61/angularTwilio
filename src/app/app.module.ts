import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TwilioService } from './twilio/services/twilio.service';
import { AppComponent } from './app.component';
import { TwilioComponent } from './twilio/twilio.component';
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  // { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat/:id/:route/:site', component:TwilioComponent },
];
@NgModule({
  declarations: [
    AppComponent,
    TwilioComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [TwilioService],
  bootstrap: [TwilioComponent]
})
export class AppModule { }
