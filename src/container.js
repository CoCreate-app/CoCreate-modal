import Modal from "./modal.js"

function ModalContainer(el) {
  this.modals = [];
  this.el = el;
  this.modalClass = this.el.getAttribute("data-modal-class");
    
  if (!this.modalClass) {
    this.modalClass = "modal";
  }
  
  this._initModals();
  this._initEvent();
  
}

ModalContainer.prototype = {

  _initModals : function() {
    var el_children = document.querySelectorAll("." + this.modalClass);
    
    for (var i = 0; i < el_children.length; i++) {
      this.modals.push(new Modal(el_children[i], {}, this.el));
    }
  },
  
  _initEvent : function() {
    let _this = this;
                
    this.el.addEventListener('cocreate-removemodal', function(e) {
        _this._removeModal(e.detail.modal)
    })
  },
  
  
  _createModal : function(attr) {
    var node = document.createElement("div");
    node.classList.add(this.modalClass);
    node.style.zIndex = this.SELECT_ZINDEX; 
    
    this.el.appendChild(node)
    
    var modal = new Modal(node, attr, this.el);
    this.modals.push(modal)  
    
    return modal
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
    
  _removeModal: function(modal) {
    for (var i = 0; i < this.modals.length; i ++) {
      if (this.modals[i] === modal ) {
        this.el.removeChild(modal.el);
        this.modals.splice(i, 1);
        break;
      }
    }
    this.el.style.pointerEvents = "none";
  }

}


export default ModalContainer;