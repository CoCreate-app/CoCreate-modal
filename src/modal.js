import uuid from '@cocreate/uuid'


function Modal(el, options, container) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		return;
	}
  
  /** define constant **/	
	this.MARGIN = 5;
	this.FULLSCREEN_MARGIN = -60;
	this.NO_SNAP = -100;
	this.SNAP_MARGIN = -10;

	this.RIGHT_SCROL = 5;
	
// 	if (window.mobilecheck()) {
// 	  this.MARGIN = 20;
// 	}
	
	/** options **/
	let defaults = {
	  minWidth: 60,
	  minHeight: 40,
	};
	
	this.id = uuid.generate();
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
	this.isHeader = true;
	
	this.dragArea = null;
	this.headerArea = null;
	
	this.width = 0;
	this.height = 0;
	this.isParked = false;
	
	this.iframe = null;
	this.container = container;
	

	this.options = Object.assign(defaults, options);
	
	this.el.setAttribute("id", this.id);
	
  window.localStorage.setItem('page_id', this.id)
  
	this._init();
	this._setModalSize();
  this._initEvent();
  this.__animate();
  
}

Modal.prototype = {
  constructor: Modal,
  
  _init : function() {
    var opt = this.options;
    
    this.isAjax =   opt.ajax  ? opt.ajax    : this.el.getAttribute("data-modal_ajax")
    var windowURL = opt.url   ? opt.url     : this.el.getAttribute("href");
    var width =     opt.width ? opt.width   : this.el.getAttribute("data-modal_width");
    var height =    opt.height? opt.height  : this.el.getAttribute("data-modal_height");
    var color =     opt.color ? opt.color   : this.el.getAttribute("data-modal_color");
    var x =         opt.x     ? opt.x       : this.el.getAttribute("data-modal_x")
    var y =         opt.y     ? opt.y       : this.el.getAttribute("data-modal_y")
    var showHeader= opt.header? opt.header  : this.el.getAttribute("data-modal_header")
    
    var attributes = opt.attributes;
    
    //. set default
    // this.el.style.width = "300px";
    // this.el.style.height = "100%";
    // this.el.style.left = 0;
    // this.el.style.right = 0;
    // this.el.style.borderColor = "#888";
    
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
      iframe = this.__createContainer(this.headerArea, attributes['data-modal_iframe'] === "false" ? "div" : "iframe");
      if (attributes['data-pass_to']) {
        iframe.setAttribute('data-pass_id', attributes['data-pass_to']);
        iframe.setAttribute('collection', "");
        iframe.setAttribute('document_id', "");
        // iframe.setAttribute('data-request_id', uuid.generate());
      }
      if (attributes['data-pass_name']) {
        iframe.setAttribute('name', attributes['data-pass_name']);
      }
    } else {
      return;
    }
    
    this.el.appendChild(iframe)
    this.iframe = iframe;
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
  
  _initEvent : function() {
    let self = this;
    
    if (this.iframe) {
      this.iframe.addEventListener('load', function() {
        console.log(self.iframe.contentDocument);
        const iframeContent = self.iframe.contentDocument;
        const nav = iframeContent.querySelector('.nav');
        
        iframeContent.addEventListener('click', function() {
           var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: self}});
          self.el.parentNode.dispatchEvent(event);
        })
      });
    }

    this.el.addEventListener("click", function(e) {
      var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: self}});
      self.el.parentNode.dispatchEvent(event);
    }, true)
    
    this.el.addEventListener("dblclick", function(e) {
      if (self.isParked) {
        self.isParked = false;
        self.el.classList.remove("modal-parked");
      } 
    })
    
    this.el.addEventListener('modal-resizing', function(e) {
      console.log('resizing event trigger')
    })
    this.el.addEventListener('touchstart', function(e) {
      self.changeRightDragEl(true);
      var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: self}});
      self.el.parentNode.dispatchEvent(event);
      self._onDown(e.touches[0]);
    })
    
    this.el.addEventListener('mousemove', function(e) {
        self.changeRightDragEl(false);
    })
    
    this.el.addEventListener('mousedown', function(e) {
      
      var event = new CustomEvent("cocreate-selectmodal", {detail: {modal: self}});
      self.el.parentNode.dispatchEvent(event);
      self._onDown(e);
    })
    
    this.el.addEventListener('mouseup', function(e) {
        // self.changeRightDragEl(true);
    })

    this._addButtonEvent()
    this.el.addEventListener("modal-resizeend", function(e) {
      self._saveFetch();
      // self.changeRightDragEl(true);

    });
    
    this.el.addEventListener("modal-moveend", function(e) {
      self._saveFetch();
      // self.changeRightDragEl(true);

    })
  },
  
  changeRightDragEl: function(isRevert = true) {
      const right_el = this.el.querySelector('.modal-drag-area-right')
      
      const size = isRevert ? "0px" : "-10px"
      if (right_el) {
        right_el.style.right = size;
      }
      this.RIGHT_SCROL = !isRevert ? 0 : 5;
      
  },
  
  _addButtonEvent: function() {
    var self = this;
    if (this.el.querySelector(".modal-title-area .closeBtn")) {
      this.el.querySelector(".modal-title-area .closeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        self.el.parentNode.dispatchEvent(new CustomEvent("cocreate-removemodal", {detail: {modal:self}}));
      })
    }
    
    if (this.el.querySelector(".parked-closeBtn .closeBtn")) {
      this.el.querySelector(".parked-closeBtn .closeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        self.el.parentNode.dispatchEvent(new CustomEvent("cocreate-removemodal", {detail: {modal:self}}));
      })
    }
    
    if (this.el.querySelector(".modal-title-area .maximizeBtn")) {
      this.el.querySelector(".modal-title-area .maximizeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        self._setMaximize();
      })
    }
    
    if (this.el.querySelector(".modal-title-area .minimizeBtn")) {
      this.el.querySelector(".modal-title-area .minimizeBtn").addEventListener("click", function(e) {
        e.preventDefault();
        self.togglePark()
      })
    }
    
    // if (this.el.querySelector(".modal-title-area .parkBtn")) {
    //   this.el.querySelector(".modal-title-area .parkBtn").addEventListener("click", function(e) {
    //     self.togglePark()
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
    
    this.el.style.left = bound.left - parentBound.left;
    this.el.style.top = bound.top - parentBound.top;
  },
  
  _saveFetch: function() {
    if (this.el.classList.contains("domEditor")) {
      CoCreateHtmlTags.save(this.el);
    }
  },
  
  _onMove : function(e) {
    const data = this.__getBoundStatus(e)
    this.redraw = true;
  },
  
  _onDown : function(e) {
    //. set clicked

    this.__getBoundStatus(e);

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
      this.__getBoundStatus(e);
    }
    if (!this.clickedInfo) {
      return;
    }
    if (this.clickedInfo.isMoving && !this.isParked) {
      let p_w = this.el.parentNode.offsetWidth, p_h = this.el.parentNode.offsetHeight;
      let snap_info = null;
      
      if (this.__between(this.rect.top, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(this.rect.left, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(p_w - this.rect.right, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(p_h - this.rect.bottom, this.NO_SNAP, this.FULLSCREEN_MARGIN)) {
          snap_info = {x: 0, y: 0, w:'100%', h:'100%'}
      } else if (this.__between(this.rect.top, this.NO_SNAP, this.SNAP_MARGIN)) {
          snap_info = {x: 0, y: 0, w:'100%', h:'50%'}
      } else if (this.__between(this.rect.left, this.NO_SNAP, this.SNAP_MARGIN)) {
          snap_info = {x: 0, y: 0, w:'50%', h:'100%'} 
      } else if (this.__between(p_w - this.rect.right, this.NO_SNAP, this.SNAP_MARGIN)) {
          snap_info = {x: '50%', y: 0, w: '50%', h:'100%'}
      } else if (this.__between(p_h - this.rect.bottom, this.NO_SNAP, this.SNAP_MARGIN)) {
          snap_info = {x: 0, y: '50%', w: '100%', h: '50%'}
      }

      if (snap_info && !this.isSnap) {
        this.__setBound(this.el, snap_info.x, snap_info.y, snap_info.w, snap_info.h);
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
      this.isSnap = false;
    } else if (this.clickedInfo.isMoving) {
      this.createModalEvent('modal-moveend');
    }
    
    
    this.clickedInfo = null;
  },
  
  __setBound : function(el, x, y, w, h) {
    var borderHeight = this.el.offsetHeight - this.el.clientHeight;
    var borderWidth = this.el.offsetWidth - this.el.clientWidth;
    el.style.left = x;
    el.style.top = y;
    // el.style.width = "calc( " + w + " - " + borderWidth + "px )";
    // el.style.height = "calc( "  + h + " - " + borderHeight + "px )";
    el.style.width = w;
    el.style.height = h;
  },
  
  __setRectInfo: function() {
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
  
  __getBoundStatus : function(e) {
    let bound = this.el.getBoundingClientRect();
    let parentRect = this.el.parentNode.getBoundingClientRect();
    let x = e.clientX - bound.left;// - parentRect.left;
    let y = e.clientY - bound.top;// - parentRect.top;

    this.__setRectInfo();

    this.point.x = x;
    this.point.y = y;
    this.point.cx = e.clientX - parentRect.left;
    this.point.cy = e.clientY - parentRect.top;

    this.boundStatus = {
      isTop : y < this.MARGIN && y > -this.MARGIN,
      isLeft : x < this.MARGIN && x > -this.MARGIN,
      isRight : x >= bound.width - this.RIGHT_SCROL && x <= bound.width + this.MARGIN + (this.MARGIN - this.RIGHT_SCROL),
      isBottom: y >= bound.height - this.MARGIN && y <= bound.height + this.MARGIN
    }
    
    return this.boundStatus;
  },
  
  __between: function(x, min, max) {
    return x >= min && x <= max;
  },
  
  __animate : function() {
    let self = this;
    requestAnimationFrame(function() {
      self.__animate();
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

      if (this.__between(this.rect.top, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(this.rect.left, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(p_w - this.rect.right, this.NO_SNAP, this.FULLSCREEN_MARGIN) ||
          this.__between(p_h - this.rect.bottom, this.NO_SNAP, this.FULLSCREEN_MARGIN)) {
          ghost_info = {x: 0, y: 0, w:p_w, h:p_h, type: "show"}
      } else if (this.__between(this.rect.top, this.NO_SNAP, this.SNAP_MARGIN)) {
          ghost_info = {x: 0, y: 0, w:p_w, h:p_h / 2, type: "show"}
      } else if (this.__between(this.rect.left, this.NO_SNAP, this.SNAP_MARGIN)) {
          ghost_info = {x: 0, y: 0, w:p_w / 2, h: p_h, type: "show"}
      } else if (this.__between(p_w - this.rect.right, this.NO_SNAP, this.SNAP_MARGIN)) {
          ghost_info = {x: p_w / 2, y: 0, w: p_w / 2, h: p_h, type: "show"}
      } else if (this.__between(p_h - this.rect.bottom, this.NO_SNAP, this.SNAP_MARGIN)) {
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
      this.__setBound(this.el, 0, 0, "100%", "100%");
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
    this.setContainerEvent(cursor);
    
    
  },
  
  //. setParent Event
  setContainerEvent(status) {
    console.log(status)
    if (!this.container) return;
    if (status != 'default') {
      
      this.container.style.pointerEvents = "auto";
    } else {
      this.container.style.pointerEvents = "none";
    }
  },
  
  _isMovable() {
    var width = this.rect.width;
    if (this.isHeader) {
      width -= 120;
    }
    return this.point.x > 0 && this.point.x < width && this.point.y > 0 && this.point.y < 50
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
    this.dragArea = document.createElement("div");
    this.dragArea.classList.add("modal-drag-area");
    
    let left_area = document.createElement("div");
    left_area.classList.add("modal-drag-area-left");

    let right_area = document.createElement("div");
    right_area.classList.add("modal-drag-area-right");

    let bottom_area = document.createElement("div");
    bottom_area.classList.add("modal-drag-area-bottom");
    
    this.el.appendChild(this.dragArea);
    this.el.appendChild(left_area);
    this.el.appendChild(right_area);
    this.el.appendChild(bottom_area);
  },
  
  resize: function(dx, dy, width, height) {
    if (this.isSnap) {
      return;
    }
    
    var borderHeight = this.el.offsetHeight - this.el.clientHeight;
    var borderWidth = this.el.offsetWidth - this.el.clientWidth;
    
    width = width - borderWidth;
    height = height - borderHeight;
    /** left, right **/
    if (dx !== 0 && !this.isPercentDimesion(this.el.style.width)) {
      var el_width = this.el.offsetWidth;
      if (el_width + this.rect.left > width && dx < 0) {
        this.el.style.left = this._setDimension(Math.max(0, this.rect.left + dx));
      }
      this.el.style.width = this._setDimension(Math.min(el_width, width));
    }
    
    /** top, bottom **/
    if (dy !== 0 && !this.isPercentDimesion(this.el.style.height)) {
      var el_height = this.el.offsetHeight;
      if (el_height + this.rect.top > height && dy < 0) {
        this.el.style.top = this._setDimension(Math.max(0, this.rect.top + dy));
      }
      this.el.style.height = this._setDimension(Math.min(el_height, height));
    }

    this.__setRectInfo()
  },
  
  _setDimension: function(data, isPercent) {
    if (isPercent) {
      return data + "%";
    } else {
      return data + "px";
    }
  },
  
  isPercentDimesion: function (dimension) {
    if (!dimension) return false;
    if (typeof dimension === 'string' && dimension.substr(-1, 1) === "%") {
      return true;
    } 
    return false;
  }
  
}

export default Modal;