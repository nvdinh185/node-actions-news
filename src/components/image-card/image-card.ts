/**
 * card hien thi thong tin danh muc anh
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'image-card',
    templateUrl: "image-card.html"
})
export class ImageCard {
    //các biến dữ liệu đầu vào
    @Input() imageData: any; //tập các link của ảnh cần hiển thị
    
    @Input() callback: any; //hàm gọi lại ở cấp root (ở from gốc lấy được toàn bộ sự kiện này)
    
    //sự kiện sinh ra truyền giá trị con cho cấp cha 1 cấp
    @Output() onClickSub = new EventEmitter();
    
    constructor() { }

    onClickMedia(idx,data){
        if (this.callback) this.callback(idx,data);
        this.onClickSub.emit({index:idx,original:data});
    }
}