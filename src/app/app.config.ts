import { ApplicationConfig }
    from '@angular/core';
import { InMemoryScrollingFeature, InMemoryScrollingOptions, provideRouter, withHashLocation, withInMemoryScrolling }
    from '@angular/router';
import { routes }
    from './app.routes';
import { provideHttpClient, withFetch }
    from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes, withHashLocation(), inMemoryScrollingFeature),
    provideHttpClient(withFetch()), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()],
};
