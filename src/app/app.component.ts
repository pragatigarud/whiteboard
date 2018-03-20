import { Component, OnInit } from "@angular/core";

import "fabric";
declare const fabric: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent {
  private canvas: any;
  private props: any = {
    canvasFill: "#ffffff",
    canvasImage: "",
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ""
  };

  private textString: string;
  private url: string = "";
  private size: any = {
    width: 500,
    height: 500
  };

  private json: any;
  private globalEditor: boolean = false;
  private textEditor: boolean = false;
  private imageEditor: boolean = false;
  private figureEditor: boolean = false;
  private selected: any;
  private isPencil: boolean = false;

  constructor() {}

  ngOnInit() {
    //setup front side canvas
    this.canvas = new fabric.Canvas("canvas", {
      hoverCursor: "pointer",
      selection: true,
      selectionBorderColor: "blue",
      isDrawingMode: this.isPencil
    });

    this.canvas.on({
      "object:moving": e => {},
      "object:modified": e => {},
      "object:selected": e => {
        let selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;

        this.resetPanels();

        if (selectedObject.type !== "group" && selectedObject) {
          this.getId();
          this.getOpacity();

          switch (selectedObject.type) {
            case "rect":
            case "circle":
            case "triangle":
              this.figureEditor = true;
              this.getFill();
              break;
            case "i-text":
              this.textEditor = true;
              this.getLineHeight();
              this.getCharSpacing();
              this.getBold();
              this.getFontStyle();
              this.getFill();
              this.getTextDecoration();
              this.getTextAlign();
              this.getFontFamily();
              break;
            case "image":
              console.log("image");
              break;
          }
        }
      },
      "selection:cleared": e => {
        this.selected = null;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // get references to the html canvas element & its context
    // this.canvas.on('mouse:down', (e) => {
    // let canvasElement: any = document.getElementById('canvas');
    // console.log(canvasElement)
    // });
  }

  setMode(mode: boolean) {
    this.canvas.isDrawingMode = mode;
  }
  /*------------------------Block elements------------------------*/

  //Block "Add text"

  addText() {
    let textString = this.textString;
    let text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: "helvetica",
      angle: 0,
      fill: "#000000",
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: "",
      hasRotatingPoint: true
    });
    this.extend(text, this.randomId());
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    this.textString = "";
  }

  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = event => {
        this.url = event.target["result"];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  //Block "Add figure"

  addFigure(figure) {
    let add: any;
    switch (figure) {
      case "rectangle":
        add = new fabric.Rect({
          width: 200,
          height: 100,
          left: 10,
          top: 10,
          angle: 0,
          fill: "#3f51b5"
        });
        break;
      case "square":
        add = new fabric.Rect({
          width: 100,
          height: 100,
          left: 10,
          top: 10,
          angle: 0,
          fill: "#4caf50"
        });
        break;
      case "triangle":
        add = new fabric.Triangle({
          width: 100,
          height: 100,
          left: 10,
          top: 10,
          fill: "#2196f3"
        });
        break;
      case "circle":
        add = new fabric.Circle({
          radius: 50,
          left: 10,
          top: 10,
          fill: "#ff5722"
        });
        break;
    }
    this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
  }

  /*Canvas*/

  cleanSelect() {
    this.canvas.deactivateAllWithDispatch().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.deactivateAllWithDispatch().renderAll();
    this.canvas.setActiveObject(obj);
  }

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  extend(obj, id) {
    obj.toObject = (function(toObject) {
      return function() {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  /*------------------------Global actions for element------------------------*/

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return "";

    return object.getSelectionStyles && object.isEditing
      ? object.getSelectionStyles()[styleName] || ""
      : object[styleName] || "";
  }

  setActiveStyle(styleName, value, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) return;

    if (object.setSelectionStyles && object.isEditing) {
      var style = {};
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    } else {
      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
  }

  getActiveProp(name) {
    var object = this.canvas.getActiveObject();
    if (!object) return "";

    return object[name] || "";
  }

  setActiveProp(name, value) {
    var object = this.canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    let val = this.props.id;
    let complete = this.canvas.getActiveObject().toObject();
    console.log(complete);
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle("opacity", null) * 100;
  }

  setOpacity() {
    this.setActiveStyle("opacity", parseInt(this.props.opacity) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle("fill", null);
  }

  setFill() {
    this.setActiveStyle("fill", this.props.fill, null);
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle("lineHeight", null);
  }

  setLineHeight() {
    this.setActiveStyle("lineHeight", parseFloat(this.props.lineHeight), null);
  }

  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle("charSpacing", null);
  }

  setCharSpacing() {
    this.setActiveStyle("charSpacing", this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle("fontSize", null);
  }

  setFontSize() {
    this.setActiveStyle("fontSize", parseInt(this.props.fontSize), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle("fontWeight", null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle(
      "fontWeight",
      this.props.fontWeight ? "bold" : "",
      null
    );
  }

  getFontStyle() {
    this.props.fontStyle = this.getActiveStyle("fontStyle", null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    this.setActiveStyle(
      "fontStyle",
      this.props.fontStyle ? "italic" : "",
      null
    );
  }

  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle("textDecoration", null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, "g"), "");
    } else {
      iclass += ` ${value}`;
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle("textDecoration", this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }

  getTextAlign() {
    this.props.textAlign = this.getActiveProp("textAlign");
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp("textAlign", this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp("fontFamily");
  }

  setFontFamily() {
    this.setActiveProp("fontFamily", this.props.fontFamily);
  }

  confirmClear() {
    if (confirm("Are you sure?")) {
      this.props.canvasFill = "#ffffff";
      this.textString = "";
      this.setMode(false);
      this.canvas.clear();
    }
  }

  rasterize() {
    if (!fabric.Canvas.supports("toDataURL")) {
      alert(
        "This browser doesn't provide means to serialize canvas to an image"
      );
    } else {
      console.log(this.canvas.toDataURL("png"));
      var image = this.canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
      window.open(image);
    }
  }

  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  resetPanels() {
    this.textEditor = false;
    this.imageEditor = false;
    this.figureEditor = false;
  }
}
