
import Modal from "./modal.js"

function ModalContainer(el) {
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

ModalContainer.prototype = {
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
      this.modals.push(new Modal(el_children[i], {}, this.el));
    }
    
    if (!this.selectedModal) {
      this._selectModal(this.modals[this.modals.length - 1]);
      
    }
  },
  
  _initEvent : function() {
    let _this = this;
    
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
      // e.preventDefault();
      if (_this.selectedModal) {
      _this.selectedModal._onMove(e.touches[0]);
      }
    }, { passive: false })
    
    this.el.addEventListener('touchend', function(e) {
      // e.preventDefault();
      if (_this.selectedModal) {
      _this.selectedModal._onUp(e.touches[0]);
      }
    }, { passive: false })
    
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
    
    var modal = new Modal(node, attr, this.el);
    this.modals.push(modal)
    
    this._selectModal(node);
  },
  
  _releaseSelect: function() {
    if (!this.selectedModal) {
      return;
    }
    this.selectedModal.el.style.zIndex = this.UNSELECT_ZINDEX;
    this.selectedModal.el.classList.remove("modal_selected");
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
      this.selectedModal.el.classList.add('modal_selected');
      this.ghostEl.style.width = 0;
      this.ghostEl.style.height = 0;
    }
  },
  
  _findModalByElement: function(el) {
    
    if (el instanceof Modal) {
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
    this.el.style.pointerEvents = "none";
  }

}


export default ModalContainer;