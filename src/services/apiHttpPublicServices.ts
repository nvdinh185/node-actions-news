/**
 * Thực hiện các hàm chuyển đổi và các chức năng lấy thông tin trên mạng công cộng
 * version 2.0
 * 18.05/2019 by cuong.dq
 * 
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class ApiHttpPublicService {

    constructor(private httpClient: HttpClient) { }

    /**
     * Các hàm chuyển đổi của đối tượng và mãng
     * Như util/array-object
     * 
     */
    createObjectKey = (obj, key, value) => {
        Object.defineProperty(obj, key, { value: value, writable: true, enumerable: true, configurable: true });
        obj.length = obj.length ? obj.length + 1 : 1;
        return obj;
    }

    deleteObjectKey = (obj, key) => {
        if (delete obj[key]) obj.length = obj.length ? obj.length - 1 : undefined;
        return obj;
    }

    /**
     * clone đối tượng thành đối tượng mới (sử dụng để gán đối tượng mới)
     * @param {*} obj 
     */
    cloneObject = (obj) => {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    /**
 * treeOrder sap xep mang nhu oracle
 */
    createTreeOrder = (arrIn, idKey, parentKey, startWith, level, arrOut) => {
        let myLevel = level ? level : 1;
        if (arrIn && arrOut && arrIn.length > arrOut.length) {
            let parents = arrIn.filter(obj => (obj[parentKey] === startWith)
                || (startWith == null && obj[parentKey] == undefined)
                || (startWith == undefined && obj[parentKey] == null)
            )
            if (parents) {
                parents.forEach(el => {
                    el.$level = myLevel;
                    arrOut.push(el);
                    this.createTreeOrder(arrIn, idKey, parentKey, el[idKey], myLevel + 1, arrOut)
                });
            }
        }
    }


    /**
     * Chuyen doi cay co cau truc parent-subs/$children...->root:$id,$parent_id,$level
     * @param {*} treeIn 
     * @param {*} idSub 
     * @param {*} level 
     */
    convertTree2Order = (treeIn, idSub, id?, parent_id?, level?) => {

        let myId = id ? id : 1;
        let myLevel = level ? level : 1;
        var roots = [];

        treeIn.forEach((el, idx) => {
            el.$id = myId;
            el.$parent_id = parent_id;
            roots.push(el);
            if (el[idSub]) {
                roots = roots.concat(this.convertTree2Order(el[idSub], idSub, (myId + 1), myId, (myLevel + 1)))
            }
            myId = roots.length + 1;
        });

        return roots;
    }

    /**
     * tao cay co children
     * @param {*} arrIn 
     * @param {*} idKey 
     * @param {*} parentKey 
     * @param {*} startWith 
     * @param {*} level 
     */
    createTree = (arrIn, idKey, parentKey, startWith, level) => {
        let myLevel = level ? level : 1;
        var roots = arrIn.filter(x =>
            (x[parentKey] === startWith)
            || (startWith == null && x[parentKey] == undefined)
            || (startWith == undefined && x[parentKey] == null)
        );
        if (roots && roots.length > 0) {
            roots.forEach(el => {
                el.$level = myLevel;
                el.$children = this.createTree(arrIn, idKey, parentKey, el[idKey], myLevel + 1)
            })
            return roots;
        } else {
            let leafChildren = arrIn.find(x => x[idKey] === startWith);
            if (leafChildren) {
                leafChildren.$is_leaf = 1;
            }
            return undefined;
        }
    }


    /**
     * Lay danh sach cac quoc gia ve Ma so dien thoai, co, ten, ngon ngu, tien...
     */
    getAllCoutries() {
        return this.httpClient.get('https://restcountries.eu/rest/v2/all')
            .toPromise()                 //kieu chuyen ve promise
            .then(countries => {
                return countries;
            })
            .catch(err => {
                throw err;
            })
    }

    /**
     * Lay danh sach user demo phuc vu so lieu demo
     */
    getRandomUser(nRecord: number) {
        return this.httpClient.get('https://randomuser.me/api/?results=' + nRecord)
            .map(res => res['results']) //kieu chuyen ve observable
    }


    getMyIp() {
        return this.httpClient.get('https://ipinfo.io/json')
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    getMyDevice(id?: string) {
        return this.httpClient.get('https://c3.mobifone.vn/api/ext-public/your-device' + (id ? "?id=" + id : ""))
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }


    getDataForm(form: string) {
        return this.httpClient.get('assets/data/' + form)
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    getUserInfoForm() {
        return this.httpClient.get('assets/data/form-register.json')
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }


    /**
     * =>req.json_data
     * @param url 
     * @param json_data 
     */
    postDynamicForm(url: string, json_data: any) {
        return this.httpClient.post(url, JSON.stringify(json_data))
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    /**
     * => req.form_data
     * @param url 
     * @param form_data 
     */
    postDynamicFormData(url: string, form_data: any) {
        return this.httpClient.post(url, form_data)
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    /**
     * =>req.paramS --> return json
     * @param url 
     * @param httpOptions 
     */
    getDynamicForm(url: string, httpOptions?: any) {
        return this.httpClient.get(url, httpOptions)
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    /**
     * =>req.paramS
     * return binary file
     * @param url 
     */
    getDynamicFile(url: string) {
        return this.httpClient.get(url, { 'responseType': 'blob' as 'json' })
            .toPromise()
            .then(data => {
                let rtn: any;
                rtn = data;
                return rtn;
            });
    }

    /**
     * dua vao la text,
     * tim kiem chuyen doi tra ve
     * text gan the
     * @param text 
     */
    getHtmlLinkify(plainText: string) {
        let valueLinkify = plainText;
        let links = [];

        //replace enter to break of html
        valueLinkify = valueLinkify.replace(/(?:\r\n|\r|\n)/g, '<br />');

        //URLs starting with http://, https://, or ftp://    
        valueLinkify = valueLinkify.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
            , function (url) {
                links.push(url);
                return "<a href='" + url + "' target='_blank'>" + url + "</a>";
            }
        );

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        valueLinkify = valueLinkify.replace(/([ ])([\w-]+\.[\S]+(\b|$))/gim
            , function (url) {
                links.push('http://' + url.trim());
                return " <a href='http://" + url.trim() + "' target='_blank'>" + url.trim() + "</a>";
            }
        );

        //Change email addresses to mailto:: links.
        valueLinkify = valueLinkify.replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
            ,
            function (url) {
                links.push('mailto:' + url);
                return "<a href='mailto:" + url + "' target='_blank'>" + url + "</a>";
            }
        );


        //check alive links?
        //neu cac link con hien luc thi get no        

        return { content: valueLinkify, urls: links };
    }
}