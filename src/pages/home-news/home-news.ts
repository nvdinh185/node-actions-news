import { Component } from '@angular/core';
import { Events, ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiContactService } from '../../services/apiContactService';
import { DynamicPostPage } from '../dynamic-post/dynamic-post';

@Component({
  selector: 'page-home-news',
  templateUrl: 'home-news.html'
})
export class HomeNewsPage {

  //server = ApiStorageService.newsServer;
  server = "http://localhost:9238/site-manager/news"
  userInfo: any;
  contacts = {}

  constructor(private events: Events
    , public modalCtrl: ModalController
    , private auth: ApiAuthService
    , private apiContact: ApiContactService
  ) { }

  ngOnInit() {
    this.userInfo = { username: "903500888" }
    setTimeout(() => {
      console.log(this.dynamicCards.items[0].actions)
      console.log(this.dynamicCards.items[0].actions.like)
    }, 2000);
    this.refreshNews();
    this.events.subscribe('postok', () => {
      this.getHomeNews();
    });
  }

  dynamicCards = {
    title: ""
    , buttons: [
      { color: "primary", icon: "photos", next: "ADD" }
    ]
    , items: []
  }

  async refreshNews() {
    //chay ham nay de KHOI TAO CAC USER PUBLIC
    await this.apiContact.getPublicUsers(true);
    //lay cac danh ba public
    this.contacts = this.apiContact.getUniqueContacts();
    //neu chua dang nhap thi lay cac tin cua user public
    this.getHomeNews();
  }

  getHomeNews() {
    this.getJsonPostNews()
      .then(data => {
        data.reverse().forEach((el, idx) => {
          let index = this.dynamicCards.items
            .findIndex(x => x.group_id === el.group_id);
          if (index < 0) {
            this.dynamicCards.items.unshift(el);
          }
        })
      })
      .catch(err => console.log(err))
  }

  getJsonPostNews() {
    let offset = 0
    let limit = 4
    let follows = [];
    for (let key in this.contacts) {
      follows.push(key);
    }

    let json_data = {
      limit: limit,
      offset: offset,
      follows: follows
    }
    return this.auth.postDynamicForm(this.server + "/get-news", json_data, true)
      .then(data => {
        console.log("789", data)
        let items = [];
        data.forEach(el => {
          el.actions = JSON.parse(el.actions)
          el.results = JSON.parse(el.results)
          if (el.medias) {
            el.results.likes = JSON.parse(el.medias.likes)
            el.results.comments = JSON.parse(el.medias.comments)
            el.results.shares = JSON.parse(el.medias.shares)
            el.results.reads = JSON.parse(el.medias.reads)
          }
          el.short_detail = {
            p: el.title
            , note: el.time
            , action: { color: "primary", icon: "more", next: "MORE" }
          }
          items.push(el);
        });
        return items;
      })
      .catch(err => { return [] })
  }

  onClickHeader(btn) {
    if (btn.next === 'ADD') {
      this.openModal(DynamicPostPage, {
        parent: this,
        callback: this.callBackProcess,
        form: {
          status: 1,   //hình thức chia sẻ công khai
          content: "", //cho phép nhập nội dung để post
          medias: [], //cho phép chọn ảnh hoặc video để post
          files: [],  //Cho phép chọn file để gửi
          action: { name: "Đăng tin", next: "CALLBACK", url: this.server + "/post-news" }
        }
      })
    }
  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

  callBackProcess = function (res) {
    console.log('Ket qua:', res);
    return new Promise((resolve, reject) => {
      if (res.error) {
        resolve();
      } else {
        resolve({ next: "CLOSE" });
      }
    })
  }.bind(this);

  onClickAction(ev, group_id) {
    console.log(group_id, ev)
    let json_data = {
      group_id: group_id,
      result: ev.result.likes
    }
    this.auth.postDynamicFormData(this.server + "/post-actions", json_data, true)
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }
}