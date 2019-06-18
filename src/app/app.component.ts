import { Component } from '@angular/core';
import { HomeNewsPage } from '../pages/home-news/home-news';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = HomeNewsPage;

  constructor() {}

  ngOnInit() {}
}

