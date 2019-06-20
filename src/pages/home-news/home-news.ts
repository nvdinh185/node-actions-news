import { Component } from '@angular/core';
import { Events, ModalController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { DynamicCardSocialPage } from '../dynamic-card-social/dynamic-card-social';
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
  curPageIndex = 0;
  lastPageIndex = 0;
  maxOnePage = 3;
  contacts = {}
  isShow = false;

  constructor(private events: Events
    , public modalCtrl: ModalController
    , private auth: ApiAuthService
    , private apiContact: ApiContactService
  ) { }

  ngOnInit() {
    this.userInfo = { username: "901952666" }
    setTimeout(() => {
      //console.log(this.dynamicCards.items)
      //console.log(this.userInfo)
    }, 2000);
    this.refreshNews();
    this.events.subscribe('postok', () => {
      this.getHomeNews(true);
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
    this.getHomeNews(true);
  }

  getHomeNews(reNews?: boolean) {
    //console.log("456", this.contacts)
    this.dynamicCards.title = "Đây là trang tin của " + (this.userInfo ? this.userInfo.username : "Public")
    if (reNews) {
      this.lastPageIndex = this.curPageIndex > 0 ? this.curPageIndex : this.lastPageIndex;
      this.curPageIndex = 0;
    } else {
      this.lastPageIndex = this.curPageIndex > this.lastPageIndex ? this.curPageIndex : this.lastPageIndex;
      this.curPageIndex = this.curPageIndex < this.lastPageIndex ? this.lastPageIndex : this.curPageIndex;
    }
    this.getJsonPostNews()
      .then(data => {
        if (reNews) {
          //console.log("new: ", data)
          let isHaveNew = 0;
          data.reverse().forEach((el, idx) => {
            let index = this.dynamicCards.items
              .findIndex(x => x.group_id === el.group_id);
            if (index < 0) {
              this.dynamicCards.items.unshift(el);
              isHaveNew++;
            }
          })
          if (isHaveNew >= 1 && this.curPageIndex < this.lastPageIndex) this.curPageIndex = this.lastPageIndex + 1
        } else {
          //console.log("data: ", data)
          data.forEach((el, idx) => {
            let index = this.dynamicCards.items
              .findIndex(x => x.group_id === el.group_id);
            if (index < 0) {
              this.dynamicCards.items.push(el);
            }
          })
        }
      })
      .catch(err => console.log(err))
  }

  getJsonPostNews() {
    let offset = this.curPageIndex * this.maxOnePage;
    let limit = this.maxOnePage;
    let follows = [];
    for (let key in this.contacts) {
      follows.push(key);
    }

    let json_data = {
      limit: limit,
      offset: offset,
      follows: follows
    }
    //console.log("json_data", json_data)
    return this.auth.postDynamicForm(this.server + "/get-news", json_data, true)
      .then(data => {
        console.log("789", data)
        let items = [];
        data.forEach(el => {
          el.actions = JSON.parse(el.actions)
          el.results = JSON.parse(el.results)
          if(el.medias) {
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
        if (items.length > 0) this.curPageIndex++;
        return items;
      })
      .catch(err => { return [] })
  }

  doInfinite(ev) {
    this.getHomeNews();
    setTimeout(() => {
      ev.complete();
    }, 500);
  }

  doRefresh(ev) {
    this.getHomeNews(true);
    setTimeout(() => {
      ev.complete();
    }, 500);
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

  onClickMedia(number, it) {
    let dynamicCardsOrigin: any = {
      title: it.user
      , buttons: [
        { color: "danger", icon: "close", next: "CLOSE" }
      ]
      , items: [
        {
          short_detail: {
            avatar: this.userInfo ? this.userInfo.data.image : ""
            , h1: this.userInfo ? this.userInfo.data.fullname : ""
            , p: it.content
            , note: it.time
            , action: { color: "primary", icon: "more", next: "MORE" }
          }
          , content: {
            title: it.title
            , paragraphs: [
              {
                //h2: "Chốn yên bình"
                //, p: "Là nơi bình yên nhất. Bạn có thể dạo bước trên con đường rợp bóng mát thanh bình đến lạ"
                medias: it.medias
              }
            ]
            , note: "Nguyễn Văn Định 2019"
          }
          , actions: it.actions
        }
      ]
    };
    this.openModal(DynamicCardSocialPage, { form: dynamicCardsOrigin })
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
    //console.log(group_id, ev.result.likes)
    let json_data = {
      group_id: group_id,
      result: ev.result.likes
    }
    this.auth.postDynamicFormData(this.server + "/post-actions", json_data, true)
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }
}