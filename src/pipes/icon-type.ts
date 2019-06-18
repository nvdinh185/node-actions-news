import {Pipe, PipeTransform} from '@angular/core';
/*
 * chuyen doi file type thanh icon
*/
@Pipe({ name: 'iconType' })
export class IconFileTypePipe implements PipeTransform {
    transform(value: string, args: string[]): any {
        if (value===undefined || value === null || typeof value !== 'string' || value ==="") return "assets/imgs/file.png";
        if (value.toLowerCase().indexOf("pdf")>=0) return "assets/imgs/pdf.png";
        if (value.toLowerCase().indexOf("word")>=0) return "assets/imgs/word.png";
        if (value.toLowerCase().indexOf("sheet")>=0 || value.toLowerCase().indexOf("excel")>=0) return "assets/imgs/excel.png";
        return "assets/imgs/file.png";
    }
}