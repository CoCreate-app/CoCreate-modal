/**
 * Moving modal and snap functions
 */
 
import uuid from '@cocreate/uuid'
import { 
	getPointInfo, 
	getRectInfo, 
	setBound, 
	getBoundStatus,
	MARGIN,
  FULLSCREEN_MARGIN,
  NO_SNAP,
  SNAP_MARGIN,
  RIGHT_SCROL,
	
} from './utils.js'

function Movable(el, options, container) {

	this.el = el;
	this.clicked = null;
	this.redraw = false;
	
	this.boundStatus = {};
	
	this.point = {};
	this.rect = {};
	this.clickedInfo = null;
	this.preSnapped = null;
	this.prevRect = {};
	this.isSnap = false;

	this.__setModalSize();
	this.__animate();
	
}

Movable.prototype = {
	constructor: Movable,

	__setModalSize: function() {
		let bound = this.el.getBoundingClientRect();
		let parentBound = this.el.parentNode.getBoundingClientRect();
		this.width = bound.width;
		this.height = bound.height;
		
		this.el.style.left = bound.left - parentBound.left;
		this.el.style.top = bound.top - parentBound.top;
	},

	__onMove : function(e) {
		const data = this.__getBoundStatus(e)
		this.redraw = true;
	},
	
	__onDown : function(e) {
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
			
			if (this.__between(this.rect.top, NO_SNAP, FULLSCREEN_MARGIN) ||
					this.__between(this.rect.left, NO_SNAP, FULLSCREEN_MARGIN) ||
					this.__between(p_w - this.rect.right, NO_SNAP, FULLSCREEN_MARGIN) ||
					this.__between(p_h - this.rect.bottom, NO_SNAP, FULLSCREEN_MARGIN)) {
					snap_info = {x: 0, y: 0, w:'100%', h:'100%'}
			} else if (this.__between(this.rect.top, NO_SNAP, SNAP_MARGIN)) {
					snap_info = {x: 0, y: 0, w:'100%', h:'50%'}
			} else if (this.__between(this.rect.left, NO_SNAP, SNAP_MARGIN)) {
					snap_info = {x: 0, y: 0, w:'50%', h:'100%'} 
			} else if (this.__between(p_w - this.rect.right, NO_SNAP, SNAP_MARGIN)) {
					snap_info = {x: '50%', y: 0, w: '50%', h:'100%'}
			} else if (this.__between(p_h - this.rect.bottom, NO_SNAP, SNAP_MARGIN)) {
					snap_info = {x: 0, y: '50%', w: '100%', h: '50%'}
			}

			if (snap_info && !this.isSnap) {
				setBound(this.el, snap_info.x, snap_info.y, snap_info.w, snap_info.h);
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
			this.__setModalSize()
			this.isSnap = false;
		} else if (this.clickedInfo.isMoving) {
			this.createModalEvent('modal-moveend');
		}
		
		
		this.clickedInfo = null;
	},
	
	__getBoundStatus : function(e) {
		this.point = getPointInfo(this.el, e)
		this.rect = getRectInfo(this.el)
		this.boundStatus = getBoundStatus(this.el, e)
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
			setBound(this.el, 0, 0, "100%", "100%");
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
		
		this.rect = getRectInfo(this.el)
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

export default Movable;