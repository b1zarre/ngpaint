import {
    Component,
    Input,
    ElementRef,
    AfterViewInit,
    ViewChild,
    OnInit,
    SimpleChanges
} from "@angular/core";
import { fromEvent } from "rxjs";
import { switchMap, takeUntil, pairwise } from "rxjs/operators";

@Component({
    selector: "app-canvas",
    templateUrl: "./canvas.component.html",
    styleUrls: ["./canvas.component.scss"]
})
export class CanvasComponent implements AfterViewInit {
    @ViewChild("canvas") public canvas: ElementRef;

    @Input() public width = 400;
    @Input() public height = 400;
    // @Input() public lineWidth = 3;
    @Input("lineWidth") lineWidth: number;
    @Input("figureType") figureType: string;
    @Input("strokeColor") strokeColor: string | CanvasGradient | CanvasPattern;
    @ViewChild("palette") palette: ElementRef;
    private cx: CanvasRenderingContext2D;
    mode = "curve";
    y = 0;
    x = 0;
    lastY = 0;
    lastX = 0;
    firstY = 0;
    firstX = 0;

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext("2d");
        const imageEl = document.querySelector(".canvas");
        this.width = imageEl.clientWidth;
        this.height = imageEl.clientHeight;
        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.cx.lineWidth = this.lineWidth;
        this.cx.lineCap = "round";
        this.cx.strokeStyle = this.palette.nativeElement.value;

        this.captureEvents(canvasEl);
    }
    onColorChange() {
        this.cx.strokeStyle = this.palette.nativeElement.value;
        this.cx.clearRect(0, 5, this.width, 20);
    }
    getRandomColor() {
        let letters = "0123456789ABCDEF";
        let color = "#";
        this.cx.clearRect(0, 5, this.width, 20);
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    onRandomColor() {
        this.palette.nativeElement.value = this.getRandomColor();
        this.cx.strokeStyle = this.palette.nativeElement.value;
    }
    randomGradient() {
        const gradient = this.cx.createLinearGradient(250, 0, 700, 0);
        gradient.addColorStop(0, this.getRandomColor());
        gradient.addColorStop(0.5, this.getRandomColor());
        gradient.addColorStop(1, this.getRandomColor());
        this.cx.strokeStyle = gradient;
        this.cx.fillStyle = gradient;
        if (this.cx.strokeStyle == gradient) {
            this.cx.fillRect(0, 5, this.width, 20);
        } else {
            this.cx.clearRect(0, 5, this.width, 20);
        }
        // if (this.cx.strokeStyle !== gradient) {
        //     this.cx.clearRect(0, 5, this.width, 20);
        // }
    }
    public ngOnChanges(changes: SimpleChanges): void {
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                if (propName === "lineWidth") {
                    const chng = changes[propName];
                    console.log(chng);
                    if (chng.currentValue && !chng.firstChange) {
                        const cur = JSON.stringify(chng.currentValue);
                        const prev = JSON.stringify(chng.previousValue);
                        this.cx.lineWidth = chng.currentValue
                            ? chng.currentValue
                            : this.lineWidth;
                        console.log(
                            `${propName}: currentValue = ${cur}, previousValue = ${prev}`
                        );
                    }
                }
                if (propName === "figureType") {
                    const chng = changes[propName];
                    console.log(chng);
                    if (chng.currentValue && !chng.firstChange) {
                        this.figureType = chng.currentValue
                            ? chng.currentValue
                            : this.figureType;
                    }
                }
                if (propName === "strokeColor") {
                    const chng = changes[propName];
                    console.log(chng);
                    if (chng.currentValue && !chng.firstChange) {
                        this.strokeColor = chng.currentValue
                            ? chng.currentValue
                            : this.strokeColor;
                    }
                }
            }
        }
    }

    private captureEvents(canvasEl: HTMLCanvasElement) {
        fromEvent(canvasEl, "mousedown")
            .pipe(
                switchMap((e) => {
                    return fromEvent(canvasEl, "mousemove").pipe(
                        takeUntil(fromEvent(canvasEl, "mouseup")),
                        takeUntil(fromEvent(canvasEl, "mouseleave")),
                        pairwise()
                    );
                })
            )
            .subscribe((res: [MouseEvent, MouseEvent]) => {
                const rect = canvasEl.getBoundingClientRect();
                const prevPos = {
                    x: res[0].clientX - rect.left,
                    y: res[0].clientY - rect.top,
                    firstX: res[0].offsetX,
                    firstY: res[0].offsetY
                };

                const currentPos = {
                    x: res[1].clientX - rect.left,
                    y: res[1].clientY - rect.top
                };

                this.drawOnCanvas(prevPos, currentPos);
            });
    }

    private drawOnCanvas(
        prevPos: { x: number; y: number; firstY: number; firstX: number },
        currentPos: { x: number; y: number }
    ) {
        if (!this.cx) {
            return;
        }

        this.cx.beginPath();
        console.log(this.figureType);
        if (prevPos) {
            switch (this.figureType) {
                case "pencil": {
                    this.cx.moveTo(prevPos.x, prevPos.y); // from
                    this.cx.lineTo(currentPos.x, currentPos.y);
                    this.cx.stroke();
                    break;
                }
                case "square": {
                    this.y = this.y === 0 ? prevPos.y : this.y;
                    this.x = this.x === 0 ? prevPos.x : this.x;
                    this.firstY =
                        this.firstY === 0 ? prevPos.firstY : this.firstY;
                    this.firstX =
                        this.firstX === 0 ? prevPos.firstX : this.firstX;
                    this.lastY = currentPos.y;
                    this.lastX = currentPos.x;
                    this.cx.moveTo(this.x, this.y);
                    this.cx.lineTo(currentPos.x, this.y);
                    this.cx.moveTo(currentPos.x, this.y);
                    this.cx.lineTo(currentPos.x, currentPos.y);
                    this.cx.moveTo(currentPos.x, currentPos.y);
                    this.cx.lineTo(this.x, currentPos.y);
                    this.cx.moveTo(this.x, currentPos.y);
                    this.cx.lineTo(this.x, this.y);

                    this.cx.stroke();
                }
                case "line": {
                }
                case "circle": {
                }
                default: {
                    this.cx.moveTo(prevPos.x, prevPos.y); // from
                    this.cx.lineTo(currentPos.x, currentPos.y);
                    this.cx.stroke();
                    break;
                }
            }
        }
    }
}
