import {
    AfterViewInit,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";

@Component({
    selector: "app-palette",
    templateUrl: "./palette.component.html",
    styleUrls: ["./palette.component.scss"]
})
export class PaletteComponent implements OnInit {
    @ViewChild("color") color: ElementRef<HTMLInputElement>;
    @Output() colorChange = new EventEmitter<string>();
    actualColor: string;
    constructor() {}
    onColorChange() {
        this.actualColor = this.color.nativeElement.value;
        this.colorChange.emit(this.actualColor);
    }
    ngOnInit(): void {}
}
