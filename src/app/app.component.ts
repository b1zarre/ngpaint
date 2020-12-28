import { Component, ElementRef, ViewChild } from "@angular/core";
import { fromEvent } from "rxjs";
import { pairwise, switchMap, takeUntil } from "rxjs/operators";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "paint-app";
    lineWidth = 10;
    figureType = "gesture";
    strokeColor = "#232323";
    constructor() {}
    setNewColor(c) {
        this.strokeColor = c;
        console.log(c);
    }
    figureTypeChange(event: any) {
        console.log(event);
        this.figureType = event.value;
    }
}
