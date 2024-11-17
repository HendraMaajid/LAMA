import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { initializeApp } from "firebase/app"; 
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
if (environment.production) {
  enableProdMode();
}

initializeApp(environment.firebase);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

