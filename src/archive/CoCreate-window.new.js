"use strict";

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function CoCreateModal(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		return;
	}
  
  /** define constant **/	
	this.MARGIN = 10;
	this.FULLSCREEN_MARGIN = -15;
	this.SNAP_MARGIN = -5;
	
	if (window.mobilecheck()) {
	  this.MARGIN = 10;
	}
	
	/** options **/
	let defaults = {
	  minWidth: 60,
	  minHeight: 40,
	};
	
	this.id = CoCreateWindow.generateUUID(20);
	this.el = el;
	this.clicked = null;
	this.redraw = false;
	
	this.boundStatus = {};
	
	/**
	 * x: mouse x in element
	 * y: mouse y in element
	 * cx: x in document
	 * cy: y in document
	 * */
	this.point = {};
	this.rect = {};
	this.clickedInfo = null;
	this.preSnapped = null;
	this.prevRect = {};
	this.isSnap = false;
	
	this.dragArea = null;
	this.headerArea = null;
	
	this.width = 0;
	this.height = 0;
	this.isParked = false;
	

	this.options = Object.assign(defaults, options);
	
	this.el.setAttribute("id", this.id);
	
	CoCreateStorage.pageId = this.id;

	this._init();
	this._setModalSize();
  this._initEvent();
  this._animate();
  
}

CoCreateModal.prototype = {
  constructor: CoCreateModal,
  
  _init : function() {
    var opt = this.options;
    
    this.isAjax =   opt.ajax  ? opt.ajax    : this.el.getAttribute("data-modal_ajax")
    var windowURL = opt.url   ? opt.url     : this.el.getAttribute("data-modal_url");
    var width =     opt.width ? opt.width   : this.el.getAttribute("data-modal_width");
    var height =    opt.height? opt.header  : this.el.getAttribute("data-modal_height");
    var color =     opt.color ? opt.color   : this.el.getAttribute("data-modal_color");
    var x =         opt.x     ? opt.x       : this.el.getAttribute("data-modal_x")
    var y =         opt.y     ? opt.y       : this.el.getAttribute("data-modal_y")
    var showHeader= opt.header? opt.header  : this.el.getAttribute("data-modal_header")
    
    //. set default
    // this.el.style.width = "300px";
    // this.el.style.height = "100%";
    // this.el.style.left = 0;
    // this.el.style.right = 0;
    // this.el.style.borderColor = "#888";
    
    if (width && width != "") this.el.style.width = width;
    if (height && height != "") this.el.style.height = height;
    if (x && x != "") this.el.style.left = x;
    if (y && y != "") this.el.style.top = y;
    if (color && color !== "") this.el.style.borderColor = color;
    
    if (showHeader == "true") {
      this._createTitle();
    } else {
      this._createDragArea();
    }
    
        
    if (windowURL && windowURL != "") {
      var iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      if (this.headerArea) {
        console.log(this.headerArea.clientHeight)
        // iframe.style.height = "calc( 100% - " + (this.headerArea.clientHeight + 5) + "px )";
        iframe.style.height = "calc( 100% - 45px)";
      }
      iframe.src = windowURL;
      this.el.appendChild(iframe)
    }
  },
  
  _initEvent : function() {
    let _this = this;

    this.el.addEventListener("click", function(e) {
      var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: _this}});
      _this.el.parentNode.dispatchEvent(event);
    }, true)
    
    this.el.addEventListener("dblclick", function(e) {
      if (_this.isParked) {
        _this.isParked = false;
        _this.el.classList.remove("modal-parked");
      } 
    })
    
    this.el.addEventListener('modal-resizing', function(e) {
      console.log('resizing event trigger')
    })
    this.el.addEventListener('touchstart', function(e) {
      var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: _this}});
      _this.el.parentNode.dispatchEvent(event);
      _this._onDown(e.touches[0]);
        // e.preventDefault();
    })
    
    this.el.addEventListener('mousedown', function(e) {
        var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: _this}});
        _this.el.parentNode.dispatchEvent(event);
        _this._onDown(e);
    })

    this._addButtonEvent()
    this.el.addEventListener("modal-resizeend", function(e) {
      _this._saveFetch();
    });
    
    this.el.addEventListener("modal-moveend", function(e) {
      _this._saveFetch();
    })
  },
  
  _addButtonEvent: function() {
    var _this = this;
    if (this.el.querySelector(".modal-title-area .closeBtn")) {
      this.el.querySelector(".modal-title-area .closeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        _this.el.parentNode.dispatchEvent(new CustomEvent("cocreate-removemodal", {detail: {modal:_this}}));
      })
    }
    
    if (this.el.querySelector(".parked-closeBtn .closeBtn")) {
      this.el.querySelector(".parked-closeBtn .closeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        _this.el.parentNode.dispatchEvent(new CustomEvent("cocreate-removemodal", {detail: {modal:_this}}));
      })
    }
    
    if (this.el.querySelector(".modal-title-area .maximizeBtn")) {
      this.el.querySelector(".modal-title-area .maximizeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        console.log('clicked Maximinze Button')
        _this._setMaximize();
      })
    }
    
    if (this.el.querySelector(".modal-title-area .minimizeBtn")) {
      this.el.querySelector(".modal-title-area .minimizeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        console.log('clicked Minimize Button')
        _this.togglePark()
      })
    }
    
    // if (this.el.querySelector(".modal-title-area .parkBtn")) {
    //   this.el.querySelector(".modal-title-area .parkBtn").addEventListener("click", function(e) {
    //     _this.togglePark()
    //   })
    // }
  },
  
  togglePark: function() {
    
    if (this.isParked) {
      this.isParked = false;
      this.el.classList.remove("modal-parked");
    } else {
      this.isParked = true;
      this.el.classList.add("modal-parked")
    }
  },
  
  _setModalSize: function() {
    let bound = this.el.getBoundingClientRect();
    let parentBound = this.el.parentNode.getBoundingClientRect();
    this.width = bound.width;
    this.height = bound.height;
    
    console.log(bound);
    this.el.style.left = bound.left - parentBound.left;
    this.el.style.top = bound.top - parentBound.top;
  },
  
  _saveFetch: function() {
    if (this.el.classList.contains(saveFetchClass)) {
      saveHtml(this.el);
    }
  },
  
  _onMove : function(e) {
    this._getBoundStatus(e)
    this.redraw = true;
  },
  
  _onDown : function(e) {
    //. set clicked

    this._getBoundStatus(e);

    var isResizing = this.boundStatus.isRight || this.boundStatus.isLeft || this.boundStatus.isTop || this.boundStatus.isBottom;
    
    this.clickedInfo = {
      x: this.point.x,
      y: this.point.y,
      cx: this.point.cx,
      cy: this.point.cy,
      w: this.rect.width,
      h: this.rect.height,
      isResizing: isResizing,
      isMoving: !isResizing && this._isMovable(),
      boundStatus : this.boundStatus,
      isChangeStart: true
    }
  },
  
  _onUp: function(e) {
    if (e) {
      this._getBoundStatus(e);
    }
    if (!this.clickedInfo) {
      return;
    }
    if (this.clickedInfo.isMoving && !this.isParked) {
      let p_w = this.el.parentNode.offsetWidth, p_h = this.el.parentNode.offsetHeight;
      let snap_info = null;
      
      if (this.rect.top < this.FULLSCREEN_MARGIN || this.rect.left < this.FULLSCREEN_MARGIN
        || this.rect.right > p_w - this.FULLSCREEN_MARGIN || this.rect.bottom > p_w - this.FULLSCREEN_MARGIN) {
          snap_info = {x: 0, y: 0, w:'100%', h:'100%'}
      } else if (this.rect.top < this.SNAP_MARGIN) {
          snap_info = {x: 0, y: 0, w:'100%', h:'50%'}
      } else if (this.rect.left < this.SNAP_MARGIN ) {
          snap_info = {x: 0, y: 0, w:'50%', h:'100%'} 
      } else if (this.rect.right > p_w - this.SNAP_MARGIN) {
          snap_info = {x: '50%', y: 0, w: '50%', h:'100%'}
      } else if (this.rect.bottom > p_h - this.SNAP_MARGIN) {
          snap_info = {x: 0, y: '50%', w: '100%', h: '50%'}
      }

      if (snap_info && !this.isSnap) {
        this._setBound(this.el, snap_info.x, snap_info.y, snap_info.w, snap_info.h);
        this.preSnapped = {x: this.rect.x, y: this.rect.y, width: this.rect.width, height: this.rect.height};
        this.isSnap = true;
      } 
      
      var ghost_info = {
        x: this.rect.x,
        y: this.rect.y,
        w: this.rect.width,
        h: this.rect.height
      }
      this.el.parentNode.dispatchEvent(new CustomEvent("cocreate-modalghost", {detail: ghost_info}));
    }

    if (this.clickedInfo.isResizing) {
      this.createModalEvent('modal-resizeend');
      this._setModalSize()
    } else if (this.clickedInfo.isMoving) {
      this.createModalEvent('modal-moveend');
    }
    
    this.clickedInfo = null;
  },
  
  _setBound : function(el, x, y, w, h) {
    var borderHeight = this.el.offsetHeight - this.el.clientHeight;
    var borderWidth = this.el.offsetWidth - this.el.clientWidth;
    el.style.left = x;
    el.style.top = y;
    el.style.width = "calc( " + w + " - " + borderWidth + "px )";
    el.style.height = "calc( "  + h + " - " + borderHeight + "px )";
  },
  
  _setRectInfo: function() {
    let bound = this.el.getBoundingClientRect();
    let parentRect = this.el.parentNode.getBoundingClientRect();
    this.rect = {};
    this.rect.x = bound.x - parentRect.x;
    this.rect.y = bound.y - parentRect.y;
    this.rect.width = bound.width;
    this.rect.height = bound.height;
    this.rect.top = bound.top - parentRect.top;
    this.rect.bottom = bound.bottom - parentRect.top;
    this.rect.left = bound.left - parentRect.left;
    this.rect.right = bound.right - parentRect.left;
  },
  
  _getBoundStatus : function(e) {
    let bound = this.el.getBoundingClientRect();
    let parentRect = this.el.parentNode.getBoundingClientRect();
    let x = e.clientX - bound.left;// - parentRect.left;
    let y = e.clientY - bound.top;// - parentRect.top;

    this._setRectInfo();

    this.point.x = x;
    this.point.y = y;
    this.point.cx = e.clientX - parentRect.left;
    this.point.cy = e.clientY - parentRect.top;

    this.boundStatus = {
      isTop : y < this.MARGIN && y > -this.MARGIN,
      isLeft : x < this.MARGIN && x > -this.MARGIN,
      isRight : x >= bound.width - this.MARGIN && x <= bound.width + this.MARGIN,
      isBottom: y >= bound.height - this.MARGIN && y <= bound.height + this.MARGIN
    }
    
    // console.log(this.boundStatus)
    return this.boundStatus;
  },
  
  _animate : function() {
    let _this = this;
    requestAnimationFrame(function() {
      _this._animate();
    });
    
    if (!this.redraw) {
      return;
    }
    this.redraw = false;
    
    let c_info = this.clickedInfo;
    
    var eventName = null;
    
    /**
     * Resize process
     **/
    if (c_info && c_info.isResizing && !this.isParked) {
      if (c_info.boundStatus.isRight) 
        this.el.style.width = Math.max(this.point.x, this.options.minWidth) + 'px';

      if (c_info.boundStatus.isBottom) {
        this.el.style.height = Math.max(this.point.y, this.options.minHeight) + 'px';
      }
      
      if (c_info.boundStatus.isLeft) {
        var c_width = Math.max(c_info.cx - this.point.cx + c_info.w, this.options.minWidth);
        if (c_width > this.options.minWidth) {
          this.el.style.width = c_width + 'px';
          this.el.style.left = this.point.cx + 'px';
        }
      }
      
      if (c_info.boundStatus.isTop) {
        var c_height = Math.max(c_info.cy - this.point.cy + c_info.h, this.options.minHeight);
        if (c_height > this.options.minHeight) {
          this.el.style.height = c_height + 'px';
          this.el.style.top = this.point.cy + 'px';
        }
      }
      
      eventName = "modal-resizing";
      if (c_info.isChangeStart) {
        this.clickedInfo.isChangeStart = false;
        eventName = "modal-resizestart";
      }
      this.createModalEvent(eventName)
      return;
    }
    
    if (c_info && c_info.isMoving) {
      /** 
       * Ghost Process
       **/
       
      let p_w = this.el.parentNode.offsetWidth, p_h = this.el.parentNode.offsetHeight;
      let ghost_info = null;
      if (this.rect.top < this.FULLSCREEN_MARGIN || this.rect.left < this.FULLSCREEN_MARGIN
        || this.rect.right > p_w - this.FULLSCREEN_MARGIN || this.rect.bottom > p_w - this.FULLSCREEN_MARGIN) {
          ghost_info = {x: 0, y: 0, w:p_w, h:p_h, type: "show"}
      } else if (this.rect.top < this.SNAP_MARGIN ) {
          ghost_info = {x: 0, y: 0, w:p_w, h:p_h / 2, type: "show"}
      } else if (this.rect.left < this.SNAP_MARGIN ) {
          ghost_info = {x: 0, y: 0, w:p_w / 2, h: p_h, type: "show"}
      } else if (this.rect.right > p_w - this.SNAP_MARGIN) {
          ghost_info = {x: p_w / 2, y: 0, w: p_w / 2, h: p_h, type: "show"}
      } else if (this.rect.bottom > p_h - this.SNAP_MARGIN) {
          ghost_info = {x: 0, y: p_h / 2, w:p_w, h:p_h / 2, type: "show"}
      } else {
          ghost_info = {x: this.rect.left, y: this.rect.top, w: this.rect.width, h: this.rect.height, type: "hide"}
      }

      if (ghost_info && !this.isParked && !this.isSnap) {
        this.el.parentNode.dispatchEvent(new CustomEvent("cocreate-modalghost", {detail: ghost_info}));
      }

      if (this.isSnap) {
        // this.el.style.left = (this.point.cx - this.preSnapped.width / 2) + 'px';
        // this.el.style.top = (this.point.cy - Math.min(c_info.y, this.preSnapped.height)) + 'px';
        this.el.style.left = this.point.cx + 'px';
        this.el.style.top = this.point.cy + 'px';
        this.el.style.width = this.preSnapped.width + 'px';
        this.el.style.height =  this.preSnapped.height + 'px';
        this.isSnap = false;
      } else {
        this.el.style.top = (this.point.cy - c_info.y) + 'px';
        this.el.style.left = (this.point.cx - c_info.x) + 'px';
      }
      
      eventName = "modal-moving";
      if (c_info.isChangeStart) {
        this.clickedInfo.isChangeStart = false;
        eventName = "modal-movestart";
      }
      
      this.createModalEvent(eventName)
      return;
    }
    
    this.redraw = false;
    this._setCursor(this.boundStatus);
  },
  
  _setMaximize() {
    if (!this.isSnap) {
      this.isSnap = true;
      this.preSnapped = {x: this.rect.x, y: this.rect.y, width: this.rect.width, height: this.rect.height};
      this._setBound(this.el, 0, 0, "100%", "100%");
    } else {
      this.isSnap = false;
      this.el.style.left = this.preSnapped.x + 'px';
      this.el.style.top = this.preSnapped.y + 'px';
      this.el.style.width = this.preSnapped.width + 'px';
      this.el.style.height =  this.preSnapped.height + 'px';
    }
    
    // this.clickedInfo = null;
  },
  
  _setCursor(bound) {
    let cursor = "default";
    if (!this.isParked && bound.isRight && bound.isBottom || bound.isLeft && bound.isTop) cursor = 'nwse-resize';
    else if (!this.isParked && bound.isRight && bound.isTop || bound.isBottom && bound.left) cursor = 'nwsw-resize';
    else if (!this.isParked && bound.isRight || bound.isLeft) cursor = 'ew-resize';
    else if (!this.isParked && bound.isBottom || bound.isTop) cursor = 'ns-resize';
    else if (this._isMovable()) cursor = "move";
    
    this.el.style.cursor = cursor;
  },
  
  _isMovable() {
    return this.point.x > 0 && this.point.x < this.rect.width && this.point.y > 0 && this.point.y < 40
  },
  
  /**
   * Modal Events
   * resize: modal-resizing, modal-resizeend, modal-resizestart
   * move: modal-moving, modal-moveend, modal-movestart
   **/
  createModalEvent(eventName) {
    var event = new CustomEvent(eventName, {});
    this.el.dispatchEvent(event);
  },
  
  _createTitle: function(n) {
    var header_template = `<div class="nav width:100% bg-light-gray"><ul class="modal-title-area">
          <li><a class="btn-modal-minimize"><i class="far fa-window-minimize"></i></a></li>
          <li><a class="btn-modal-maximize"><i class="far fa-window-restore"></i></a></li>
         <!-- <li><a class="parkBtn"><i class="fas fa-dot-circle "></i></a></li> -->
          <li><a class="btn-modal-close"><i class="fas fa-times"></i></a></li>
      </ul></div>
      <div class="parked-closeBtn"><i class="fas fa-times closeBtn"></i></div>`;
    this.el.innerHTML = header_template + this.el.innerHTML;
    this.headerArea = this.el.querySelector('.modal-title-area');
  },
  
  _createDragArea: function() {
    this.dragArea = document.createElement("div");
    this.dragArea.classList.add("modal-drag-area");
    this.el.appendChild(this.dragArea);
  },
  
  resize: function(dx, dy, width, height) {
    if (this.preSnapped) {
      return;
    }
    
    var borderHeight = this.el.offsetHeight - this.el.clientHeight;
    var borderWidth = this.el.offsetWidth - this.el.clientWidth;
    
    width = width - borderWidth;
    height = height - borderHeight;
    /** left, right **/

    if (dx !== 0) {
      if (this.width + this.rect.left > width && dx < 0) {
        this.el.style.left = Math.max(0, this.rect.left + dx);
      }
      this.el.style.width = Math.min(this.width, width);
    }

    /** top, bottom **/
    if (dy !== 0) {
      if (this.height + this.rect.top > height && dy < 0) {
        this.el.style.top = Math.max(0, this.rect.top + dy);
      }
      this.el.style.height = Math.min(this.height, height);
    }

    this._setRectInfo()
  }
  
}

/**
 * CoCreateModalContainer Object
 * 
 **/
function CoCreateModalContainer(el) {
  this.modals = [];
  
  this.el = el;
  this.modalClass = this.el.getAttribute("data-modal-class");
  this.SELECT_ZINDEX = 10;
  this.UNSELECT_ZINDEX = 2;
  this.ghostEl = null;
  this.width = 0;
  this.height = 0;
  
  this.selectedModal = null;
  
  if (!this.modalClass) {
    this.modalClass = "modal";
  }
  
  this._createGhost(this.el.getAttribute("data-ghost-class"));
  this._initModals();
  this._initEvent();
  
}

CoCreateModalContainer.prototype = {
  _createGhost: function(ghostClass) {
    var node = document.createElement("div");
    if (!ghostClass) {
      ghostClass = "modal-ghost";
    }
    
    node.classList.add(ghostClass);
    this.el.appendChild(node);
    this.ghostEl = node;
  },
  _initModals : function() {
    var el_children = document.querySelectorAll("." + this.modalClass);
    
    for (var i = 0; i < el_children.length; i++) {
      this.modals.push(new CoCreateModal(el_children[i], {}));
    }
    
    if (!this.selectedModal) {
      this._selectModal(this.modals[this.modals.length - 1]);
      
    }
  },
  
  _initEvent : function() {
    let _this = this;
    console.log(this.el)
    this.el.addEventListener('mousemove', function(e) {
      e.preventDefault();
      if (_this.selectedModal) {
        _this.selectedModal._onMove(e);
      }
    });
    
    this.el.addEventListener('mouseup', function(e) {
      if (_this.selectedModal) {
        _this.selectedModal._onUp(e);
      }
      e.preventDefault();
    }, true);

    this.el.addEventListener('touchmove', function(e) {
      if (_this.selectedModal) {
      _this.selectedModal._onMove(e.touches[0]);
      }
      e.preventDefault();
    })
    
    this.el.addEventListener('touchend', function(e) {
      if (_this.selectedModal) {
      _this.selectedModal._onUp(e.touches[0]);
      }
    })
    
    this.el.addEventListener('cocreate-selectmodal', function(e) {
      if (_this.selectedModal) {
        _this._selectModal(e.detail.modal);
      }
    })
    
    this.el.addEventListener('cocreate-modalghost', function(e) {
      if (_this.selectedModal) {
        _this._ghostProcess(e.detail)
      }
    })
    
    this.el.addEventListener('cocreate-removemodal', function(e) {
      if (_this.selectedModal) {
        _this._removeModal(e.detail.modal)
      }
    })
    this._initResizeEvent()
  },
  
  _initResizeEvent: function() {
    var _this = this;
    var bound = this.el.getBoundingClientRect();
    this.width = bound.width;
    this.height = bound.height;
    let ro = new ResizeObserver((entries, observer) => {
      let contentRect = entries[0].contentRect;
      _this._resizeProcess(_this.width, _this.height, contentRect.width, contentRect.height);
    })
    
    ro.observe(this.el)
  },
  
  _resizeProcess(prevWidth, prevHeight, width, height) {
    this.width = width;
    this.height = height;
    
    if (prevWidth == width && prevHeight == height) {
      return;
    }
    
    let dx = width - prevWidth;
    let dy = height - prevHeight;
    for (var  i = 0; i < this.modals.length; i++) {
      this.modals[i].resize(dx, dy, width, height);
    }
    
  },
  
  _createModal : function(attr) {
    var node = document.createElement("div");
    node.classList.add(this.modalClass);
    node.style.zIndex = this.SELECT_ZINDEX; 
    
    this.el.appendChild(node)
    
    var modal = new CoCreateModal(node, attr);
    this.modals.push(modal)
    
    this._selectModal(node);
  },
  
  _releaseSelect: function() {
    if (!this.selectedModal) {
      return;
    }
    this.selectedModal.el.style.zIndex = this.UNSELECT_ZINDEX;
    this.selectedModal.el.classList.remove("selected");
    this.selectedModal = null;
  },
  
  _selectModal: function(el) {
    
    let modal = this._findModalByElement(el);
    if (modal == this.selectedModal) {
      return;
    }
    this._releaseSelect();
    
    this.selectedModal = modal;
    
    if (this.selectedModal) {
      this.selectedModal.el.style.zIndex = this.SELECT_ZINDEX;
      this.selectedModal.el.classList.add('selected');
      this.ghostEl.style.width = 0;
      this.ghostEl.style.height = 0;
    }
  },
  
  _findModalByElement: function(el) {
    
    if (el instanceof CoCreateModal) {
      return el;
    }
    for (var i = 0; i < this.modals.length; i ++) {
      if (this.modals[i].el.isEqualNode(el) ) {
        return this.modals[i];
      }
    }
    
    return null;
  },
  
  getModalById: function(id) {
    for (var i = 0; i < this.modals.length; i++) {
      if (this.modals[i].id == id) {
        return this.modals[i];
      }
    }
    
    return null;
  },
  
  _ghostProcess: function(info) {
    this.ghostEl.style.left = info.x + 'px';
    this.ghostEl.style.top = info.y + 'px';
    this.ghostEl.style.width = info.w + 'px';
    this.ghostEl.style.height = info.h + 'px';
    
    if (info.type === "show") {
      if (this.ghostEl.style.display === 'none') {
        this.ghostEl.style.display = 'block'
      }
      this.ghostEl.style.opacity = 0.2;  
    } else {
      this.ghostEl.style.opacity = 0;
      if (this.ghostEl.style.display !== 'none') {
        this.ghostEl.style.display = 'none'
      }
    }
    return;
  },
  
  _removeModal: function(modal) {
    for (var i = 0; i < this.modals.length; i ++) {
      if (this.modals[i] === modal ) {
        this.el.removeChild(modal.el);
        this.modals.splice(i, 1);
        break;
      }
    }
    if (this.modals.length > 0 ) {
      this._selectModal(this.modals[this.modals.length - 1]);
    } else {
      this.selectedModal = null;
    }
  }

}

/* ========================================================================= */

function CoCreateWindow(id) {
  let container_id = (id) ? id : 'modal-viewport';
  this.container = null;
  this.id = container_id;
  
  this.pageId = CoCreateWindow.generateUUID(20);
  this.isRoot = this._checkRoot();
  
  
  if (!this.isRoot) {
    this.parentId = CoCreateStorage.parentPageId;
    this.pageId = CoCreateStorage.pageId;
    this.rootId = CoCreateStorage.rootPageId;
  } else {
    CoCreateStorage.rootPageId = this.pageId;
    this.rootId = this.pageId;
    this.parentId = this.pageId;
  }
  
  this._createContainer();
  this._initButtons();
  this._initWndButtons();
  
  this._initSocket();
  
  //. set parent_id and page_id for test 
  
  var html = document.querySelector("html");
  html.setAttribute("test-parent_id", this.parentId);
  html.setAttribute("test-page_id", this.pageId);
}

CoCreateWindow.prototype = {
  _checkRoot: function() {
    try {
        return window.self === window.top;
    } catch (e) {
        return false;
    }
  },
  _createContainer: function() {
    if (this.container) {
      return true
    }
    
    
    var el = document.getElementById(this.id);
    
    if (el) {
      this.container = new CoCreateModalContainer(el);
      return true;
    } else {
      return false;
    }
  },
  _initButtons: function() {
    let btns = document.querySelectorAll('[data-modal_url]');
    var wnd_container = this.container;
    console.log(btns, wnd_container)
    var _this = this;
    
    for (var i = 0; i < btns.length; i++) {
      
      btns[i].addEventListener('click', function() {
    	  storePassData(this);
        if (!_this.container) {
          return;
        }
        
        _this.openWindow(this);
      });
    }    
  },
  
  _initWndButtons: function() {
    var closeBtns = document.querySelectorAll('.btn-modal-close');
    var minmaxBtn = document.querySelector('.btn-wnd-min-max');
    var parkBtn = document.querySelector('.btn-wnd-park');
    var _this = this;
    
    if (closeBtns.length > 0) {
      for (var i=0; i < closeBtns.length; i++) {
        var closeBtn = closeBtns[i];
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          
          _this.sendWindowBtnEvent('close');
        })  
      }
    }
    
    if (minmaxBtn) {
      minmaxBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        let state = this.getAttribute('data-state');
        
        if (state == 'min') {
          _this.sendWindowBtnEvent('minimize');
          this.setAttribute('data-state', 'max');
        } else {
          _this.sendWindowBtnEvent('maximize');
          this.setAttribute('data-state', 'min');
        }
      })
    }
    
    if (parkBtn) {
      parkBtn.addEventListener('click', function(e) {
        e.preventDefault();
        _this.sendWindowBtnEvent('park');
      })
    }
  },
  
  sendWindowBtnEvent: function(type) {
    var json = {
      "apiKey": config.apiKey,
      "securityKey": config.securityKey,
      "organization_id": config.organization_Id,
      "data": {
        "parentId": this.parentId,
        "pageId": this.pageId,
        "type": type,
        "author": "brenda"
      }
    }

    CoCreateSocket.send('windowBtnEvent', json);
  },
  
  _initSocket: function() {
    var _this = this;
    CoCreateSocket.listen('openWindow', function(data) {
      if (data.parentId == _this.pageId) {
        _this.container._createModal(data);
      }
      // if (data.parentId == _this.pageId) {
      //   _this.container._createModal(data);
      // }
    }),
    
    CoCreateSocket.listen('windowBtnEvent', function(data) {
      if (data.parentId == _this.pageId) {
        
        var pageId = data.pageId;
        var type = data.type;
        
        var modal = _this.container.getModalById(pageId);
        
        if (modal) {
          switch (type) {
            case 'close':
               _this.container._removeModal(modal)
              break;
            case 'minimize':
              // minimizeWindow(w);
              break;
            case 'maximize':
              // maximizeWindow(w);
              break;
            case 'park':
              modal.togglePark();
              break;
            default:
          }          
        }
      }
    })
  },
   
  openWindow: function(aTag) {

    var attr = {
      url:    aTag.getAttribute('data-modal_url'),
      x:      aTag.getAttribute('data-modal_x'),
      y:      aTag.getAttribute('data-modal_y'),
      width:  aTag.getAttribute('data-modal_width'),
      height: aTag.getAttribute('data-modal_height'),
      ajax:   aTag.getAttribute('data-modal_ajax'),
      color:  aTag.getAttribute('data-modal_color'),
      header: aTag.getAttribute('data-modal_header'), 

    }
    
    var open_type = aTag.getAttribute('data-open_in');
    open_type = open_type ? open_type : 'root';
    
    CoCreateStorage.rootPageId = this.rootId;
    
    var open_id = open_type;
    // if (this.isRoot) {
    //   CoCreateStorage.parentPageId = this.pageId;
    // } else {
      switch (open_type) {
        case 'parent':
          open_id = this.parentId;
          break;
        case 'page':
          open_id = this.pageId;
          break;
        case 'root':
          open_id = this.rootId;
          break;
        default:
          open_id = open_type;
          break;
          // code
      }
    CoCreateStorage.parentPageId = open_id;
    
    attr.parentId = open_id;
    // }
    
    if (this.isRoot) {
      if (this._createContainer()) {
        this.container._createModal(attr);  
      }
    } else {
      // attr.parentId = this.parentId;
      CoCreateSocket.send('openWindow', {
        "apiKey": config.apiKey,
        "securityKey": config.securityKey,
        "organization_id": config.organization_Id,
         data: attr
      })
    }
  },
}

CoCreateWindow.generateUUID = function(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  var d = new Date().toTimeString();
  var random = d.replace(/[\W_]+/g, "").substr(0,6);
  result += random;
  return result;
}

var CoCreateStorage = {};

Object.defineProperty(CoCreateStorage, "rootPageId", {
  get: function() { return localStorage.getItem('page_rootId');},
  set: function(id) { localStorage.setItem('page_rootId', id); }
})

Object.defineProperty(CoCreateStorage, "parentPageId", {
  get: function() { return localStorage.getItem('page_parentId');},
  set: function(id) { localStorage.setItem('page_parentId', id); }
})

Object.defineProperty(CoCreateStorage, "pageId", {
  get: function() { return localStorage.getItem('page_id');},
  set: function(id) { localStorage.setItem('page_id', id); }
})



var g_cocreateWindow = new CoCreateWindow();