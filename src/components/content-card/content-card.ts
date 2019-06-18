/**
 * card hien thi thong tin text noi dung
 * đưa vào text có chứa nội dung và url,
 * card này sẽ hiển thị nội dung có link cho phép kích vào
 * hiển thị các ảnh lấy được trong các link để hiển thị trong khung ảnh
 * đồng thời hiển thị các link bên dưới của trang cho phép gọi inappbrowser
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'content-card',
    templateUrl: "content-card.html"
})
export class ContentCard {
    //các biến dữ liệu đầu vào
    @Input() contentData: any; //là nội dung text đơn thuần,
    @Input() urlData: any; //là mãng url_info được máy chủ dịch trước đó rồi giờ hiển thị thôi
    @Input() showDetails: boolean; //biến điều khiển hiển thị nội dung chi tiết (khi bấm chi tiết)
    
    @Input() callback: any; //hàm gọi lại ở cấp root (ở from gốc lấy được toàn bộ sự kiện này)
    
    //sự kiện sinh ra truyền giá trị con cho cấp cha 1 cấp
    @Output() onClickSub = new EventEmitter();
    @Output() onClickImage = new EventEmitter();

    maxCharacter = 500; //số ký tự một lần hiển thị ra
    isReadMore:boolean = false;
    
    constructor() { }

    //khi bấm vào phần tử item (toàn bộ dòng - thuộc tích click=true) 
    //thì sự kiện này được sinh ra
    onClickItem(link){
        this.onClickSub.emit({link:link});
    }
    //khi bấm link của item sẽ cho liênk kết này
    onClickItemHostname(hostname,url){
        this.onClickSub.emit({link:{hostname,url}});
    }

    onClickMedia(urlInfo){
        this.onClickImage.emit({url_info: urlInfo});
    }

    readMore(obj){
        obj.is_readmore = (!obj.is_readmore?this.maxCharacter:obj.is_readmore)+this.maxCharacter;
    }

    readMoreContent(){
        this.isReadMore = true;
    }
}