import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, NavParams, Events } from 'ionic-angular';
import { ApiImageService } from '../../services/apiImageService';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-post-news',
  templateUrl: 'post-news.html'
})
export class PostNewsPage implements OnInit {
  fileImages: any;
  owner: any = 1;
  ownerType = {
    "1": "public",
    "2": "friends",
    "3": "friends of friends",
    "4": "only me",
  }

  server = "http://localhost:9238/site-manager/news"
  userInfo: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private apiImageService: ApiImageService,
    private apiAuth: ApiAuthService,
    private loadingCtrl: LoadingController,
    public events: Events
  ) { }

  ngOnInit() {
    this.userInfo = this.apiAuth.getUserInfo();
    console.log(this.userInfo)
  }

  fileChange(event) {
    if (event.target && event.target.files) {

      let size = 480; //default site anh

      const files: any = event.target.files;
      const processImages = new Promise((resolve, reject) => {
        let fileProcessed = [];
        let countFile = Object.keys(files).length, countResize = 0;
        if (files.length === 0) resolve();

        for (let key in files) { //index, length, item
          if (!isNaN(parseInt(key))) {
            this.apiImageService.resizeImage(files[key].name, files[key], size)
              .then(data => {
                fileProcessed.push(data);
                if (++countResize >= countFile) {
                  resolve(fileProcessed);
                }
              })
              .catch(err => {
                reject(err);
              })
          }
        }
      });

      let loading = this.loadingCtrl.create({
        content: 'Đang xử lý các ảnh theo định dạng lưu trữ tiết kiệm ...'
      });
      loading.present();

      processImages.then(data => {
        if (data) {
          this.fileImages = data;
        }
        loading.dismiss();
      })
        .catch(err => {
          loading.dismiss();
        });

      setTimeout(() => {
        //1 phut ma ko x ly duoc thi thoat ra cho cai khac thuc hien
        loading.dismiss();
      }, 60000);
    }
  }

  onClickSelect() {

    let options = [];
    for (let key in this.ownerType) {
      options.push({ name: this.ownerType[key], value: key })
    }

    let form = {
      title: "Tiêu đề của trang"
      , items: [
        { type: "title", name: "Tiêu đề form" }
        , { type: "select", key: "owner", name: "chon chia se", value: this.owner, options: options }
        , {
          type: "button"
          , options: [
            { name: "CHỌN", next: "CALLBACK" },
            { name: "ĐÓNG", next: "CLOSE" }
          ]
        }]
    };

    let modal = this.modalCtrl.create(DynamicFormWebPage, {
      parent: this,
      callback: this.callback,
      form: form
    });
    modal.present();
  }

  //callback la ham ma co gia tri res la do page dynamic-form-web tra ve
  callback = (res) => {
    console.log('Goi logout', res.data);
    this.owner = res.data.owner;
    return Promise.resolve({ next: "CLOSE" });
  }

  content;

  onShare() {
    let form_data: FormData = new FormData();
    form_data.append("count_image", this.fileImages ? this.fileImages.length : 0);
    form_data.append("share_status", this.owner);
    form_data.append("title", this.content);  //nhap lieu tu text-area
    form_data.append("content", this.content);  //nhap lieu tu text-area

    if (this.fileImages) {
      this.fileImages.forEach((el, idx) => {
        if (el.file && el.filename) {
          let key = "image" + idx;
          form_data.append(key, el.file, el.filename);
          form_data.append("origin_date_" + key, el.last_modified);
        }
      });
    }
    this.apiAuth.postDynamicFormData(this.server + "/post-news", form_data, true)
      .then(data => {
        console.log('receive form data:', data);
        this.events.publish('postok');
        this.navCtrl.pop();
      })
      .catch(err => {
        alert("Post không thành công!");
      })
  }
  cancel() {
    this.navCtrl.pop();
  }
}