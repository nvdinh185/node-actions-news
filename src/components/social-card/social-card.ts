/**
 * card hien thi thong tin text noi dung
 * đưa vào text có chứa nội dung và url,
 * card này sẽ hiển thị nội dung có link cho phép kích vào
 * hiển thị các ảnh lấy được trong các link để hiển thị trong khung ảnh
 * đồng thời hiển thị các link bên dưới của trang cho phép gọi inappbrowser
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PopoverController } from 'ionic-angular';
import { ApiAuthService } from '../../services/apiAuthService';
import { PopoverCard } from '../popover-card/popover-card';

@Component({
    selector: 'social-card',
    templateUrl: "social-card.html"
})
export class SocialCard implements OnInit {
    //các biến dữ liệu đầu vào
    @Input() ownerData: any;
    @Input() resultData: any; //Là đối tượng kết quả hành động like, comment, share ở dưới
    @Input() actionData: any; //Là đối tượng hành động like, comment, share

    //sự kiện truyền các hành động thực hiện trên card này ra 
    @Output() onClickSub = new EventEmitter();

    iconLikes: any = {
        like: { name: "Thích", color: "primary", icon: "md-thumbs-up" },
        love: { name: "Đáng yêu", color: "danger", icon: "heart" },
        unlike: { name: "Không thích", color: "dark", icon: "md-thumbs-down" },
        sad: { name: "Buồn", color: "star", icon: "ios-sad-outline" },
        angery: { name: "Giận sôi", color: "dr-vilolet", icon: "ios-sad" }
    }

    constructor(
        private apiAuth: ApiAuthService,
        private popoverCtrl: PopoverController
    ) { }

    ngOnInit() {
        if (this.actionData) {
            if (this.actionData["like"]) this.actionData["like"] = { name: "Thích", color: "primary", icon: "thumbs-up", next: "LIKE" };
            if (this.actionData["comment"]) this.actionData["comment"] = { name: "Góp ý", color: "secondary", icon: "chatbubbles", next: "COMMENT" };
            if (this.actionData["share"]) this.actionData["share"] = { name: "Chia sẻ", color: "dr-green", icon: "share-alt", next: "SHARE" };
        }
    }
    //khi bấm vào phần tử item (toàn bộ dòng - thuộc tích click=true) 
    //thì sự kiện này được sinh ra
    onClickActions(ev, action) {
        //console.log('action',action);
        if (action.next === "LIKE") {
            //console.log("this.resultData: ", !this.resultData)
            //nếu chưa truyền đối tượng resultData qua thì khởi tạo đối tượng này
            if (!this.resultData) this.resultData = {};
            //nếu đối tượng resultData chưa có thuộc tính likes thì khởi tạo thuộc tính này
            if (!this.resultData["likes"]) Object.defineProperty(this.resultData, "likes", { value: {}, writable: true, enumerable: true, configurable: true })
            if (this.ownerData) {
                //nếu username đã có cảm xúc và số lượng cảm xúc đó lớn hơn 0
                if (this.resultData.likes[this.ownerData.username] && this.resultData.likes[this.resultData.likes[this.ownerData.username]]) {
                    //da like truoc do roi, nen bam lan nay la unlike
                    //giảm số lượng cảm xúc đó 1
                    this.resultData.likes[this.resultData.likes[this.ownerData.username]] -= 1;
                    //xóa username đó ra khỏi đối tượng resultData, đồng thời giảm giá trị length đi 1
                    this.apiAuth.deleteObjectKey(this.resultData.likes, this.ownerData.username);
                    //truyền lại đối tượng resultData cho trang gọi component này
                    this.onClickSub.emit({ action: { next: "LIKE" }, result: this.resultData });
                } else {
                    //thuc hien chon lua like neu chap nhan thi them vao
                    this.showRadioLikes(ev, this.ownerData.username);
                }
            }
        } else {
            this.onClickSub.emit({ action });
        }
    }


    showRadioLikes(ev, username) {

        let menu = [];
        for (let key in this.iconLikes) {
            this.iconLikes[key].value = key;
            menu.push(this.iconLikes[key])
        }

        let popover = this.popoverCtrl.create(PopoverCard, {
            form: {
                type: "icon", //icon/color/tab/item
                menu: menu
            }
        });

        popover.present({ ev }); //truyen su kien de menu dung vi tri

        //this.onClickSub.emit(data);
        popover.onDidDismiss(data => {
            if (data) {
                //console.log(data)
                //thêm cảm xúc cho username vừa thực hiện hành động vào đối tượng resultData, đồng thời tăng giá trị length lên 1
                this.apiAuth.createObjectKey(this.resultData.likes, username, data);
                //thêm thuộc tính cảm xúc đó vào nếu chưa có trong đối tượng resultData
                if (!this.resultData.likes[data]) Object.defineProperty(this.resultData.likes, data, { value: 0, writable: true, enumerable: true, configurable: true })
                //tăng số lượng cảm xúc đó lên 1
                this.resultData.likes[data] += 1;
                //truyền lại đối tượng resultData cho trang gọi component này
                this.onClickSub.emit({ action: { next: "LIKE" }, result: this.resultData });
            }
        })
    }

}