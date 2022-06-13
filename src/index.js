import ModalContainer from "./container.js"
import { ModalStorage } from "./utils.js"
import uuid from '@cocreate/uuid'
import action from '@cocreate/actions';
import observer from '@cocreate/observer';
import utils from '@cocreate/utils';
import message from '@cocreate/message-client';
import './index.css';

function CoCreateWindow(id) {
  let container_id = (id) ? id : 'modal-viewport';
  this.container = null;
  this.id = container_id;
  
  this.pageId = uuid.generate();
  this.isRoot = this._checkRoot();
  this.document = document;
  
  if (!this.isRoot) {
    this.parentId = ModalStorage.parentPageId;
    this.pageId = ModalStorage.pageId;
    this.rootId = ModalStorage.rootPageId;
  } else {
    ModalStorage.rootPageId = this.pageId;
    this.rootId = this.pageId;
    this.parentId = this.pageId;
  }
  
  this._createContainer();
  
  this._initSocket();
  
  //. set parent_id and page_id for test 
  
  var html = document.querySelector("html");
  html.setAttribute("parent_id", this.parentId);
  html.setAttribute("page_id", this.pageId);

  action.init({
    name: "closeModal",
    endEvent: "closeModal",
    callback: (btn, data) => {
      this.sendWindowBtn(btn, 'close');
    },
  });

  action.init({
    name: "minMaxModal",
    endEvent: "minMaxModal",
    callback: (btn, data) => {
      this.sendWindowBtn(btn, 'maximize');
    },
  });

  action.init({
    name: "parkModal",
    endEvent: "parkModal",
    callback: (btn, data) => {
      this.sendWindowBtn(btn, 'park');
    },
  });
  
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
    if (this.container) return true;

    var el = document.getElementById(this.id);
    if (el) {
      this.container = new ModalContainer(el);
      return true;
    } else {
      return false;
    }
  },
  
  sendWindowBtn: function(btn, type) {
    let modalEl = btn.closest('.modal')
    let modal = this.container.getModalById(modalEl && modalEl.id || this.pageId)
    // if (!modal) {
    //   ToDo: reqires function _removeModal directly in modal instance
    //   let frameElement = btn.ownerDocument.defaultView.frameElement
    //   if (frameElement) {
    //     let container = frameElement.ownerDocument.defaultView.CoCreate.modal.container
    //     modal = container.getModalById(modalEl && modalEl.id || this.pageId)
    //   }
    // }
    this.sendWindowBtnEvent(type, modal)
  },

  sendWindowBtnEvent: function(type, modal) {
    var json = {
      apiKey: config.apiKey,
      organization_id: config.organization_id,
      broadcast_sender: true,
      message: 'windowBtnEvent',
      data: {
        "parentId": this.parentId,
        "pageId": this.pageId,
        "modal": modal,
        "type": type
      }
    }
    if (modal)
      this.buttons(json.data)
    else 
      message.send(json);
  },
  
  _initSocket: function() {
    var _this = this;
    message.listen('openWindow', function(response) {
      let data = response.data;
      if (data.parentId == _this.pageId) {
        _this.container._createModal(data);
      }
    }),
    
    message.listen('windowBtnEvent', function(response) {
        _this.buttons(response.data)
    })
  },

  buttons: function(data) {
    if (data.parentId == this.pageId) {
        
      var pageId = data.pageId;
      var type = data.type;
      var modal = data.modal

      if (!modal)
        modal = this.container.getModalById(pageId);
      
      if (modal) {
        switch (type) {
          case 'close':
             this.container._removeModal(modal)
            break;
          case 'maximize':
            modal.minMax();
            break;
          case 'park':
            modal.togglePark();
            break;
          default:
        }          
      }
    }

  },
  
  open: function(aTag) {
    this.openWindow(aTag);
  },
   
  openWindow: function(aTag) {
    
    var attr = {
      url:    aTag.href || aTag.getAttribute('href'),
      x:      aTag.getAttribute('modal-x'),
      y:      aTag.getAttribute('modal-y'),
      width:  aTag.getAttribute('modal-width'),
      height: aTag.getAttribute('modal-height'),
      ajax:   aTag.getAttribute('modal-ajax'),
      color:  aTag.getAttribute('modal-color'),
      header: aTag.getAttribute('modal-header'), 
      
      attributes: utils.getAttributes(aTag)
    }
    
    var open_type = aTag.getAttribute('modal-open');
    open_type = open_type ? open_type : 'root';
    
    ModalStorage.rootPageId = this.rootId;
    
    var open_id = open_type;
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

    ModalStorage.parentPageId = open_id;
    
    attr.parentId = open_id;
    
    if (this.isRoot) {
      if (this._createContainer()) {
        this.container._createModal(attr);  
      }
    } else {
      message.send({
        apiKey: config.apiKey,
        organization_id: config.organization_id,
        broadcast_sender: true,
        message: 'openWindow',
        data: attr
      });
    }
  },
}


let CoCreateModal = new CoCreateWindow();

export default CoCreateModal;