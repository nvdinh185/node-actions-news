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
export class SocialCard implements OnInit{
    //các biến dữ liệu đầu vào
    @Input() ownerData: any;
    @Input() resultData: any; //Là đối tượng kết quả hành động like, comment, share ở dưới
    @Input() actionData: any; //Là đối tượng hành động like, comment, share
    
    //sự kiện truyền các hành động thực hiện trên card này ra 
    @Output() onClickSub = new EventEmitter();
 
    iconLikes:any = {
        like:   { name:"Thích", color:"primary",icon:"md-thumbs-up"},
        love:   { name:"Đáng yêu", color:"danger",icon:"heart"},
        unlike: { name:"Không thích", color:"dark",icon:"md-thumbs-down"},
        sad:    { name:"Buồn", color:"sad",icon:"ios-sad-outline"},
        angery: { name:"Giận sôi", color:"angery",icon:"ios-sad"}
    }

    constructor(
                private apiAuth: ApiAuthService,
                private popoverCtrl: PopoverController
                ) {}

    ngOnInit() {
        if (this.actionData){
            if (this.actionData["like"]) this.actionData["like"] = {name:"Thích", unname:"Bỏ thích", color:"gray", icon: "thumbs-up", unicon: "ios-notifications-off-outline", next:"LIKE"};
            if (this.actionData["comment"]) this.actionData["comment"] = {name:"Góp ý", color:"gray", icon: "chatbubbles", next:"COMMENT"};
            if (this.actionData["share"]) this.actionData["share"] = {name:"Chia sẻ", color:"gray", icon: "share-alt", next:"SHARE"};
        }
    }
    //khi bấm vào phần tử item (toàn bộ dòng - thuộc tích click=true) 
    //thì sự kiện này được sinh ra
    onClickActions(ev,action){
        //console.log('action',action);
        if (action.next==="LIKE"){
            console.log("this.ownerData: ", !this.ownerData)
            if (!this.resultData) this.resultData = {};
            if (!this.resultData["likes"]) Object.defineProperty(this.resultData, "likes", { value: {}, writable: true, enumerable: true, configurable: true })
            if (this.ownerData) {
                console.log("a: ", this.resultData)
                if (this.resultData.likes[this.ownerData.username]&&this.resultData.likes[this.resultData.likes[this.ownerData.username]]){
                    //da like truoc do roi, nen bam lan nay la unlike
                    this.resultData.likes[this.resultData.likes[this.ownerData.username]] -= 1;
                    this.apiAuth.deleteObjectKey(this.resultData.likes,this.ownerData.username);
                    this.onClickSub.emit({action:{next:"LIKE"},result:this.resultData});
                }else{
                    //thuc hien chon lua like neu chap nhan thi them vao
                    this.showRadioLikes(ev,this.ownerData.username);
                }
                
            }   
        } else {
            this.onClickSub.emit({action});
        }
    }


    showRadioLikes(ev,username) {

        let menu = [];
        for (let key in this.iconLikes){
            this.iconLikes[key].value=key;
            menu.push(this.iconLikes[key])
        }

        let popover = this.popoverCtrl.create(PopoverCard, {form: {
            type: "icon", //icon/color/tab/item
            menu: menu
        }});
      
        popover.present({ev}); //truyen su kien de menu dung vi tri

        //this.onClickSub.emit(data);
        popover.onDidDismiss(data => {
            if (data){
                console.log(data)
                this.apiAuth.createObjectKey(this.resultData.likes,username,data);
                console.log(this.resultData.likes)
                if (!this.resultData.likes[data]) Object.defineProperty(this.resultData.likes, data, { value: 0, writable: true, enumerable: true, configurable: true })
                this.resultData.likes[data] += 1;
                console.log(this.resultData.likes)
                this.onClickSub.emit({action:{next:"LIKE"},result:this.resultData});
            }
        })
      }
    
}