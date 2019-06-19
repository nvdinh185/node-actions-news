import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, NavParams, Events, ViewController } from 'ionic-angular';
import { ApiImageService } from '../../services/apiImageService';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-dynamic-post',
  templateUrl: 'dynamic-post.html'
})
export class DynamicPostPage implements OnInit {

  statusIcon = {
    0: "ios-lock", //only me
    1: "md-globe", //public
    2: "ios-contacts", //friend
    3: "ios-people-outline", //friend of friend
  }

  statusOptions = [
    { name: "Chỉ mình tôi", value: 0 }
    , { name: "Công khai", value: 1 }
    , { name: "Bạn bè", value: 2 }
    , { name: "Bạn của bạn", value: 3 }
  ]

  postData: any;

  /**
   * Đây là đối tượng form cần mở form này lên để điều khiển post tin tức
   * Được khai báo ngay trên parent các tham số này
   */
  postDataOrigin: any = {
    options: {}, //tùy chọn các tham số gửi lên như nhóm, thư mục lưu trữ, cá nhân hóa...
    isSingleFile: false, //upload file Đơn (1 file thôi)
    status: 1,   //hình thức chia sẻ công khai
    content: "", //cho phép nhập nội dung để post
    medias: [], //cho phép chọn ảnh hoặc video để post
    files: [],  //cho phép lựa chọn file doc/pdf/excel để post
    action: { name: "Đăng", next: "CALLBACK", url: "http://localhost:9238/site-manager/news/post-news" }
    //next là thực hiện công việc tiếp theo
    //url là link để thực hiện gọi theo phương thức
    //method = POST/FORM-DATA
  }

  fileImages: any;
  owner: any = 1;

  userInfo: any;

  server = ApiStorageService.newsServer;

  parent: any;
  callback: any;


  isShowDetail: boolean = false;
  isTextAreaFocus: boolean = false;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private apiImage: ApiImageService,
    private apiAuth: ApiAuthService,
    private loadingCtrl: LoadingController,
    public events: Events
  ) { }

  ngOnInit() {

    this.postDataOrigin = this.navParams.get("form") ? this.navParams.get("form") : this.postDataOrigin;
    this.parent = this.navParams.get("parent");
    this.callback = this.navParams.get("callback");
    this.userInfo = this.apiAuth.getUserInfo();

    this.resetForm();
  }

  resetForm() {
    this.isShowDetail = this.postDataOrigin && this.postDataOrigin.isSingleFile ? true : false;
    this.postData = this.apiAuth.cloneObject(this.postDataOrigin);
  }


  onClickResetTextArea() {
    this.postData.content = "";
  }

  /**
   * Mở file này ra để xem thử (cái này chỉ dùng trên máy tính)
   * Mở theo kiểu inappbrowser với thuộc tính là file
   * @param f 
   */
  onClickViewFile(f) {
    //open file for review
    console.log(f.file);
  }

  /**
   * Hiển thị chi tiết cho phép chỉnh sửa và xóa ảnh
   */
  onClickShowDetail() {
    this.isShowDetail = !this.isShowDetail;
  }

  /**
   * Bấm chi tiết từng ảnh
   * thì xem như mở rộng ảnh ra để xem
   * @param event 
   */
  onClickMedia(event) {
    this.onClickShowDetail();
  }

  /**
   * Bỏ qua không post tin này nữa
   */
  onClickCancel() {
    if (this.parent) this.viewCtrl.dismiss();
  }

  fileChangeImage(event) {
    if (event.target && event.target.files) {
      let size = 480; //default nén ảnh (nếu không muốn nén thì set = 0)

      const files: any /* { [key: string]: File } */ = event.target.files;
      const processImages = new Promise<any>((resolve, reject) => {
        let fileProcessed = [];
        let countFile = Object.keys(files).length, countResize = 0;

        if (files.length === 0) resolve();

        for (let key in files) { //index, length, item
          if (!isNaN(parseInt(key))) {
            this.apiImage.resizeImageNew(files[key].name, files[key], size)
              .then(imageData => {
                fileProcessed.push(imageData);
                if (++countResize >= countFile) {
                  resolve(fileProcessed);
                }
              })
              .catch(err => {
                resolve();
              })
          }
        }
      });

      let loading = this.loadingCtrl.create({
        content: 'Đang xử lý các ảnh theo định dạng lưu trữ tiết kiệm ....'
      });
      loading.present();

      processImages.then(data => {
        if (data) {
          data.forEach(el => {
            this.postData.medias.push(el);
          });
        }
        loading.dismiss();
      })

      setTimeout(() => {
        //1 phut ma ko x ly duoc thi thoat ra cho cai khac thuc hien
        loading.dismiss();
      }, 60000);
    }
  }


  /**
   * Chọn file bất kỳ kiểu tài liệu doc/excel/pdf không biến đổi
   * @param event 
   */
  fileChangeAny(event) {
    if (event.target && event.target.files) {
      //đây là file gốc không chỉnh sửa nên truyền tải dung lượng thực lên server
      const files: any = event.target.files;

      //console.log('Các file có được',files);

      for (let key in files) { //duyệt qua hết các file đã chọn

        if (!isNaN(parseInt(key))) {
          this.postData.files.push({
            filename: this.apiImage.encodeFilename(files[key].name), //chuyển đổi tên để post
            origin: files[key].name, //tên gốc của file có thể chỉnh sửa nội dung này
            alt: files[key].name, //tham số này có thể thay đổi và chỉnh sửa trên client
            type: files[key].type, //kiểu file là gì
            size: files[key].size, //kích cỡ của file
            file_date: files[key].lastModified ? files[key].lastModified : files[key].lastModifiedDate ? files[key].lastModifiedDate.getTime() : Date.now(),
            file: files[key] //đối tượng file gốc
          })
        }

      }

      //console.log('Biên dịch được',this.postData.files);
    }
  }


  onFocusIn() {
    //console.log("focus");
    this.isTextAreaFocus = true;
  }

  onFocusOut() {
    this.isTextAreaFocus = false;
  }


  /**
   * Xóa file chi tiết
   * @param idx 
   */
  onClickRemoveFile(idx) {
    this.postData.files.splice(idx, 1);
  }

  /**
   * Xóa ảnh chi tiết
   * @param event 
   */
  onClickRemoveImage(event) {
    this.postData.medias.splice(event.id, 1);
  }

  /**
   * Thực hiện post tin lên theo tham số url cho trước
   * trả kết quả về hoặc trả nội dung cho hàm callback như dynamic-web
   */
  onClickPost(btn) {
    console.log('data nhập được', btn, this.postData);
    if (btn) {
      if (btn.url) {
        let loading = this.loadingCtrl.create({
          content: 'Đang load dữ liệu lên máy chủ ....'
        });
        loading.present();

        let form_data: FormData = new FormData();

        //Các nội dung cần luu trữ vào csdl
        //trong đó lưu ý 3 tham số là options và image_options_ và file_options thì cần phải parse sang json 
        form_data.append("content", this.postData.content);
        form_data.append("status", this.postData.status);
        if (this.postData.options) form_data.append("options", JSON.stringify(this.postData.options));

        if (this.postData.medias) {
          this.postData.medias.forEach((el, idx) => {
            if (el.file && el.filename) {
              let key = "image_" + idx;
              form_data.append(key, el.file, el.filename);
              form_data.append("options_" + key, JSON.stringify({
                origin: el.origin, //tên file gốc của nó
                alt: el.alt, //nội dung của file này được truyền lên
                type: el.type,
                size: el.size,
                file_date: el.file_date
              }));
            }
          });
        }

        if (this.postData.files) {
          this.postData.files.forEach((el, idx) => {
            if (el.file && el.filename) {
              let key = "file_" + idx;
              form_data.append(key, el.file, el.filename);
              form_data.append("options_" + key, JSON.stringify({
                origin: el.origin, //tên file gốc của nó
                alt: el.alt, //nội dung của file này được truyền lên
                type: el.type,
                size: el.size,
                file_date: el.file_date
              }));
            }
          });
        }

        //group_id, content, title
        this.apiAuth.postDynamicFormData(btn.url, form_data, true)
          .then(data => {
            console.log('data',data);

            loading.dismiss();

            btn.next_data = {
              data: data,
              button: btn
            }
            this.next(btn);

          })
          .catch(err => {
            //console.log('err',err);

            loading.dismiss();

            btn.next_data = {
              error: err,
              button: btn
            }
            this.next(btn);

          });
      } else {
        btn.next_data = {
          data: this.postData,
          button: btn
        }
        this.next(btn);
      }
    } else {
      if (this.parent) this.navCtrl.pop()
    }
  }


  next(btn) {

    if (btn) {
      if (btn.next == 'RESET') {
        this.resetForm();
      } else if (btn.next == 'CLOSE') {
        if (this.parent) this.viewCtrl.dismiss(btn.next_data)
      } else if (btn.next == 'HOME') {
        if (this.parent) this.navCtrl.popToRoot()
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
      } else if (btn.next == 'CALLBACK') {
        if (this.callback) {
          this.callback(btn.next_data)
            .then(nextStep => this.next(nextStep));
        } else {
          if (this.parent) this.navCtrl.pop()
        }
      } else if (btn.next == 'NEXT' && btn.next_data && btn.next_data.data) {
        btn.next_data.callback = this.callback; //gan lai cac function object
        btn.next_data.parent = this.parent;     //gan lai cac function object
        btn.next_data.form = btn.next_data.data; //gan du lieu tra ve tu server
        this.navCtrl.push(DynamicPostPage, btn.next_data);
      }
    }

  }

}
