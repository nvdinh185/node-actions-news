/**
 * Card này cho phép người dùng chuyển vào menu chọn lựa
 * kết quả trả cho nơi gọi chức năng đã chọn lựa theo menu
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'popover-card',
    templateUrl: "popover-card.html"
})
export class PopoverCard implements OnInit{
    //dữ liệu vào sẽ truyền bằng tham số
    //dữ liệu ra là kết quả truyền lại cho hành động dismiss

    selectedData:any;

    dynamicForm:any = {
        type:"item", //icon/color/tab/item
        menu:[
            {
                icon:"star",
                color:"star",
                name: "Ngôi sao",
                value: "star"
            }
            ,
            {
                icon:"logo-android",
                color:"secondary",
                name: "Android",
                value: "logo-android"
            }
            ,
            {
                icon:"logo-apple",
                color:"dark",
                name: "Apple",
                value: "logo-apple"
            }
        ]
    }
    
    constructor(private navParams: NavParams
                , private viewCtrl: ViewController
                ) { }

    ngOnInit() {
        this.dynamicForm = this.navParams.data&&this.navParams.data.form? this.navParams.data.form: this.dynamicForm;
    }

    selectedValue(value){
        if (value){
            this.viewCtrl.dismiss(value);
        }
    }
}