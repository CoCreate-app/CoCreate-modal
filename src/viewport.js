import Modal from "./modal.js"

function ModalViewPort(el) {
  this.modals = new Map();
  this.el = el;
  this.modalClass = this.el.getAttribute("data-modal-class");
    
  if (!this.modalClass) {
    this.modalClass = "modal";
  }
  
  this._initModals();
  
}

ModalViewPort.prototype = {

  _initModals : function() {
    var el_children = document.querySelectorAll("." + this.modalClass);
    
    for (var i = 0; i < el_children.length; i++) {
      let modal = new Modal(el_children[i], {}, this)
      this.modals.set(modal.id, modal)

      if (!this.isRoot){
        let modals = window.top.CoCreate.modal.modals
        if (modals) 
          modals.set(modal.id, modal)
      }
    
    }
  },
  
  _createModal : function(attr) {
    var node = document.createElement("div");
    node.classList.add(this.modalClass);
    // node.style.zIndex = this.SELECT_ZINDEX; 
    
    this.el.appendChild(node)
    
    var modal = new Modal(node, attr, this);
    this.modals.set(modal.id, modal)
    if (!this.isRoot) {
      let modals = window.top.CoCreate.modal.modals
      if (modals) 
        modals.set(modal.id, modal)
    }

    return modal
  },
          
  _removeModal: function(modal) {
    modal.viewPort.modals.delete(modal.id)
    modal.viewPort.el.removeChild(modal.el);
    modal.viewPort.el.style.pointerEvents = "none";
    if (!this.isRoot) {
      let modals = window.top.CoCreate.modal.modals
      if (modals) 
        modals.delete(modal.id)
    }
  }

}


export default ModalViewPort;