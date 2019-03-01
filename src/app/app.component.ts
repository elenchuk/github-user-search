import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GithubService } from './services/github.service';
import { User } from './models/user.model';
import { filter, switchMap, debounceTime, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  // Контрол для поиска пользователей
  findControl = new FormControl();
  // Ошибка поиска
  error: boolean;
  // Найденный пользователь
  user: User = null;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    // Подключение githubService для поиска пользователя
    private githubService: GithubService
  ) {
    this.initializeApp();
  }
    clearSearch() {
        this.user = null;
        this.error = false;
    }
// Хук инициализации компонента
  ngOnInit() {
    this.findControl.valueChanges
        .pipe(
            // Фильтруем если введено меньше двух символов
            filter(value => value.length > 2),
            // Ставим задержку одну секунду
            debounceTime(1000),
            // Запрашиваем данные пользователя
            switchMap(value =>
                this.githubService.getUser(value).pipe(
                    // Обработка ошибок
                    catchError(err => {
                      this.user = null;
                      this.error = true;
                      return EMPTY;
                    })
                )
            )
        )
        // Получение данных
        .subscribe(user => {
          this.user = user;
          this.error = false;
        });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
