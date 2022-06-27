import uuid from '@cocreate/uuid'
import positioning from '@cocreate/position'


function Modal(el, options, container) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		return;
	}
		
	/** options **/
	let defaults = {
	  minWidth: 60,
	  minHeight: 40,
	};
	
	this.id = uuid.generate();
  this.container = container;
	this.el = el;

	this.isHeader = true;
	this.headerArea = null;
  this.isParked = false;	

	this.width = 0;
	this.height = 0;
	
	this.iframe = null;

	this.options = Object.assign(defaults, options);
	
	this.el.setAttribute("id", this.id);
	
  window.localStorage.setItem('page_id', this.id)
  
	this._init();
	this._setModalSize();
  this.position = new positioning(this.el, this.container);
}

Modal.prototype = {
  constructor: Modal,
  
  _init : function() {
    var opt = this.options;
    
    var windowURL = opt.url   ? opt.url     : this.el.getAttribute("href");
    var width =     opt.width ? opt.width   : this.el.getAttribute("modal-width");
    var height =    opt.height? opt.height  : this.el.getAttribute("modal-height");
    var color =     opt.color ? opt.color   : this.el.getAttribute("modal-color");
    var x =         opt.x     ? opt.x       : this.el.getAttribute("modal-x")
    var y =         opt.y     ? opt.y       : this.el.getAttribute("modal-y")
    var showHeader= opt.header? opt.header  : this.el.getAttribute("modal-header")
    
    var attributes = opt.attributes;
        
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
    if (color && color !== "") this.el.style.borderColor = color;
    
    if (showHeader == "true") {
      this.isHeader = true;
      this._createTitle();
    } else {
      this.isHeader = false;
      this._createDragArea();
    }
    
    this.el.innerHTML = this.el.innerHTML + `<div class="parked-closeBtn"><i class="fas fa-times closeBtn"></i></div>`;
    
    let iframe = null;
    if (windowURL && windowURL != "") {
      iframe = this.__createContainer(this.headerArea);
      iframe.src = windowURL;
    } else if (attributes) {
      iframe = this.__createContainer(this.headerArea, "div");
      iframe.classList.add('overflow:auto')
      iframe.classList.add('height:100vh')
      if (attributes['pass_to']) {
        iframe.setAttribute('pass_id', attributes['pass_to'].value);
        iframe.setAttribute('collection', "");
        iframe.setAttribute('document_id', "");
      }
      if (attributes['pass-name']) {
        iframe.setAttribute('name', attributes['pass-name'].value);
      }
      if (attributes['pass-src']) {
        iframe.setAttribute('src', attributes['pass-src'].value);
      }
    } else {
      return;
    }
    
    this.el.appendChild(iframe)
    this.iframe = iframe;

    let self = this;
    this.el.addEventListener("dblclick", function(e) {
      if (self.isParked) {
        self.isParked = false;
        self.el.classList.remove("modal-parked");
      } 
    })

  },
  
  __createContainer: function(isHeader, type) {
    const tag = type || "iframe";
    
    let container = document.createElement(tag);
    container.style.width = "100%";
    container.style.height = "100%";
    if (isHeader) {
      container.style.height = "calc(100% - 45px)";
    }
    
    if (type != "iframe") {
      container.setAttribute('class', 'domEditor');
    }
    return container;
  },
    
  
  _setModalSize: function() {
    let bound = this.el.getBoundingClientRect();
    let parentBound = this.el.parentNode.getBoundingClientRect();
    this.width = bound.width;
    this.height = bound.height;
    
    this.el.style.left = bound.left - parentBound.left;
    this.el.style.top = bound.top - parentBound.top;
  },
    
  _createTitle: function(n) {
    var header_template = `<div class="nav bg-light-gray"><ul class="modal-title-area">
          <li><a class="minimizeBtn"><i class="far fa-window-minimize"></i></a></li>
          <li><a class="maximizeBtn"><i class="far fa-window-restore"></i></a></li>
         <!-- <li><a class="parkBtn"><i class="fas fa-dot-circle "></i></a></li> -->
          <li><a class="closeBtn"><i class="fas fa-times"></i></a></li>
      </ul></div>`;
    this.el.innerHTML = header_template + this.el.innerHTML;
    this.headerArea = this.el.querySelector('.modal-title-area');
  },
  
  _createDragArea: function() {
    let dragArea = document.createElement("div");
    dragArea.classList.add("modal-drag-area");
    
    let top_area = document.createElement("div");
    top_area.setAttribute("resize", "top");

    let left_area = document.createElement("div");
    left_area.setAttribute("resize", "left");

    let right_area = document.createElement("div");
    right_area.setAttribute("resize", "right");
    right_area.classList.add("right:-5px!important");

    let bottom_area = document.createElement("div");
    bottom_area.setAttribute("resize", "bottom");

    this.el.setAttribute("resizable", "");
    this.el.appendChild(dragArea);
    this.el.appendChild(top_area);
    this.el.appendChild(left_area);
    this.el.appendChild(right_area);
    this.el.appendChild(bottom_area);
  },

  togglePark: function() {
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