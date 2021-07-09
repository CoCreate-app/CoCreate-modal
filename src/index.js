import ModalContainer from "./container.js"
import { ModalStorage } from "./utils.js"
import uuid from '@cocreate/uuid'
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
    if (this.container) return true;

    var el = document.getElementById(this.id);
    if (el) {
      this.container = new ModalContainer(el);
      return true;
    } else {
      return false;
    }
  },

  _initWndButtons: function() {
    var closeBtns = document.querySelectorAll('.btn-modal-close');
    var minmaxBtn = document.querySelector('.btn-modal-maximize');
    var parkBtn = document.querySelector('.btn-modal-minimize');
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
        _this.sendWindowBtnEvent('maximize');
        // let state = this.getAttribute('data-state');
        
        // if (state == 'min') {
        //   _this.sendWindowBtnEvent('minimize');
        //   this.setAttribute('data-state', 'max');
        // } else {
        //   _this.sendWindowBtnEvent('maximize');
        //   this.setAttribute('data-state', 'min');
        // }
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
      apiKey: config.apiKey,
      securityKey: config.securityKey,
      organization_id: config.organization_Id,
      broadcast_sender: true,
      "emit": {
        message: 'windowBtnEvent',
        data: {
          "parentId": this.parentId,
          "pageId": this.pageId,
          "type": type,
          "author": "jin"
        }
      }
    }

    message.send(json);
  },
  
  _initSocket: function() {
    var _this = this;
    message.listen('openWindow', function(data) {
      if (data.parentId == _this.pageId) {
        _this.container._createModal(data);
      }
      // if (data.parentId == _this.pageId) {
      //   _this.container._createModal(data);
      // }
    }),
    
    message.listen('windowBtnEvent', function(data) {
      if (data.parentId == _this.pageId) {
        
        var pageId = data.pageId;
        var type = data.type;
        
        var modal = _this.container.getModalById(pageId);
        
        if (modal) {
          switch (type) {
            case 'close':
               _this.container._removeModal(modal)
              break;
            case 'maximize':
              // minimizeWindow(w);
              modal._setMaximize();
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
  
  open: function(aTag) {
    this.openWindow(aTag);
  },
   
  openWindow: function(aTag) {
    
    var attr = {
      url:    aTag.href,
      x:      aTag.getAttribute('data-modal_x'),
      y:      aTag.getAttribute('data-modal_y'),
      width:  aTag.getAttribute('data-modal_width'),
      height: aTag.getAttribute('data-modal_height'),
      ajax:   aTag.getAttribute('data-modal_ajax'),
      color:  aTag.getAttribute('data-modal_color'),
      header: aTag.getAttribute('data-modal_header'), 
      
      attributes: utils.getAttributes(aTag)
    }
    
    var open_type = aTag.getAttribute('data-modal_open');
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
        securityKey: config.securityKey,
        organization_id: config.organization_Id,
        broadcast_sender: true,
        "emit": {
          message: 'openWindow',
          data: attr
        }
      });
    }
  },
}

let CoCreateModal = new CoCreateWindow();

export default CoCreateModal;