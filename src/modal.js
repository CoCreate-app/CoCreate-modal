import uuid from '@cocreate/uuid'
import '@cocreate/position'
import '@cocreate/element-prototype'

function Modal(el, options, viewPort) {
    if (!(el && el.nodeType && el.nodeType === 1))
        return;

    /** options **/
    let defaults = {
        minWidth: 60,
        minHeight: 40,
    };

    this.id = uuid.generate();
    this.viewPort = viewPort;
    this.el = el;

    this.hasHeader = true;
    this.header = null;
    this.isParked = false;

    this.width = 0;
    this.height = 0;

    this.frame = null;
    this.options = Object.assign(defaults, options);

    this.el.setAttribute("id", this.id);

    localStorage.setItem('pageId', this.id)

    this._init();
    this._setModalSize();
}

Modal.prototype = {
    constructor: Modal,

    _init: function () {
        let opt = this.options;
        let src = opt.src ? opt.src : this.el.getAttribute("modal-src");
        let width = opt.width ? opt.width : this.el.getAttribute("modal-width");
        let height = opt.height ? opt.height : this.el.getAttribute("modal-height");
        let color = opt.color ? opt.color : this.el.getAttribute("modal-color");
        let x = opt.x ? opt.x : this.el.getAttribute("modal-x")
        let y = opt.y ? opt.y : this.el.getAttribute("modal-y")
        let moveable = opt.moveable ? opt.moveable : this.el.getAttribute("modal-moveable")
        let header = opt.header ? opt.header : this.el.getAttribute("modal-header")
        let iframe = opt.iframe ? opt.iframe : this.el.getAttribute("modal-iframe")

        if (moveable !== 'false')
            this.el.setAttribute("moveable", '');
        this.viewPort.el.appendChild(this.el)

        let attributes = opt.attributes;

        if (width && width != "") {
            this.el.style.width = width;
        } else {
            this.el.style.width = "100%";
        }
        if (height && height != "") {
            this.el.style.height = height;
        } else {
            this.el.style.height = "100%";
        }

        if (this.el.parentElement.clientWidth < this.el.clientWidth) {
            this.el.style.width = "100%"
        }
        if (this.el.parentElement.clientHeight < this.el.clientHeight) {
            this.el.style.width = "100%"
        }

        if (x && x != "") {
            this.el.style.left = x;
        } else {
            let hX = (this.el.parentElement.clientWidth - this.el.offsetWidth) / 2;
            hX = hX > 0 ? hX : 0;
            this.el.style.left = hX + "px";
        }
        if (y && y != "") {
            this.el.style.top = y;
        } else {
            let hY = (this.el.parentElement.clientHeight - this.el.offsetHeight) / 2
            hY = hY > 0 ? hY : 0
            this.el.style.top = hY + "px";
        }
        if (color && color !== "")
            this.el.style.borderColor = color;

        let frame = null;
        if (iframe && iframe != 'false' || iframe == '') {
            frame = document.createElement('iframe')
            if (src)
                frame.src = src;
        } else {
            frame = document.createElement('modal-container');
            if (src)
                frame.setAttribute('src', src);
        }

        if (attributes) {
            if (attributes['state_to']) {
                frame.setAttribute('state_id', attributes['state_to'].value);
            }
            for (let attribute of attributes) {
                if (attribute.name.startsWith('state-')) {
                    if (attribute.name == 'state-value')
                        frame.setValue(attribute.value)
                    else
                        frame.setAttribute(`${attribute.name.substring(5)}`, attribute.value);
                }
            }
        }

        if (header && header != "false" || header == '') {
            this.hasHeader = true;
            frame.classList.add('has-modal-header')
            this._createHeader(header);
        } else {
            this.hasHeader = false;
            this._createDragArea();
        }

        this.el.appendChild(frame)
        this.frame = frame;

        let self = this;
        this.el.addEventListener("dblclick", function (e) {
            if (self.isParked) {
                self.isParked = false;
                self.el.classList.remove("modal-parked");
            }
        })

    },

    _createHeader: function (header) {
        let headerTemplate
        if (/<\/?[a-z][\s\S]*>/i.test(header))
            headerTemplate = header
        else
            headerTemplate = `<div class="nav bg-light-gray"><ul class="modal-header">
                <li><a class="minimizeBtn"><i class="height:18px fill:#505050" src="/assets/svg/window-minimize.svg"></i></a></li>
                <li><a class="maximizeBtn"><i class="far fa-window-restore"></i></a></li>
                <!-- <li><a class="parkBtn"><i class="fas fa-dot-circle "></i></a></li> -->
                <li><a class="closeBtn"><i class="height:18px fill:#505050" src="/assets/svg/times.svg"></i></a></li>
                </ul></div>`;

        this.el.innerHTML = headerTemplate + this.el.innerHTML;
        this.header = this.el.querySelector('.modal-header');
    },

    _createDragArea: function () {
        let dragArea = document.createElement("div");
        dragArea.setAttribute("drag-handle", "");

        let topResize = document.createElement("div");
        topResize.setAttribute("resize", "top");

        let leftResize = document.createElement("div");
        leftResize.setAttribute("resize", "left");

        let rightResize = document.createElement("div");
        rightResize.setAttribute("resize", "right");

        let bottomResize = document.createElement("div");
        bottomResize.setAttribute("resize", "bottom");

        // this.el.setAttribute("resizable", "");
        this.el.appendChild(dragArea);
        this.el.appendChild(topResize);
        this.el.appendChild(leftResize);
        this.el.appendChild(rightResize);
        this.el.appendChild(bottomResize);
    },

    _setModalSize: function () {
        let bound = this.el.getBoundingClientRect();
        let parentBound = this.el.parentNode.getBoundingClientRect();
        this.width = bound.width;
        this.height = bound.height;

        this.el.style.left = bound.left - parentBound.left;
        this.el.style.top = bound.top - parentBound.top;
    },

    togglePark: function () {
        if (this.isParked) {
            this.isParked = false;
            this.el.classList.remove("modal-parked");
        } else {
            this.isParked = true;
            this.el.classList.add("modal-parked")
        }
    }

}

export default Modal;