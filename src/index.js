import ModalViewPort from "./viewport.js"
import uuid from '@cocreate/uuid'
import action from '@cocreate/actions';
import observer from '@cocreate/observer';
import message from '@cocreate/message-client';
import './index.css';

function CoCreateModal(id) {
  this.viewPort = null;
  this.id = id || 'modal-viewport'
  
  this.pageId = uuid.generate();
  this.isRoot = this._checkRoot();
  
  if (this.isRoot) {
    this.viewPorts = new Map();
    this.viewPorts.set(this.pageId, this)
    this.modals = new Map();
    this.rootId = this.pageId;
    this.parentId = this.pageId;
    window.localStorage.setItem('rootId', this.pageId)
  } else {
    this.pageId = window.localStorage.getItem('pageId')
    let viewPort = window.top.CoCreate.modal.viewPorts
    if (viewPort) 
      viewPort.set(this.pageId, this)
    
    // ToDo:  can be depreciated if we find a better way to pass rootid and parentid
    this.parentId = window.localStorage.getItem('parentId')
    this.rootId = window.top.CoCreate.modal.rootId
  } 
  
  this._createViewPort();
  
  this._initSocket();
  
  action.init({
    name: "closeModal",
    endEvent: "closeModal",
    callback: (btn, data) => {
      this.modalAction(btn, 'close');
    },
  });

  action.init({
    name: "minMaxModal",
    endEvent: "minMaxModal",
    callback: (btn, data) => {
      this.modalAction(btn, 'maximize');
    },
  });

  action.init({
    name: "parkModal",
    endEvent: "parkModal",
    callback: (btn, data) => {
      this.modalAction(btn, 'park');
    },
  });
  
}

CoCreateModal.prototype = {
  _checkRoot: function() {
    try {
        return window === window.top;
    } catch (e) {
        return false;
    }
  },

  _createViewPort: function() {
    if (this.viewPort) 
      return true;

    var el = document.getElementById(this.id);
    if (el) {
      this.viewPort = new ModalViewPort(el);
      return true;
    } else {
      return false;
    }
  },
  
  _initSocket: function() {
    var self = this;    
    message.listen('modalAction', function(response) {
        self.runModalAction(response.data)
    })
  },
  
  open: function(aTag) {
    let attributes = [];
    for (let attribute of aTag.attributes)
      attributes[attribute.name] = attribute.value

    let data = {
      url:    aTag.href || aTag.getAttribute('href'),
      x:      aTag.getAttribute('modal-x'),
      y:      aTag.getAttribute('modal-y'),
      width:  aTag.getAttribute('modal-width'),
      height: aTag.getAttribute('modal-height'),
      color:  aTag.getAttribute('modal-color'),
      header: aTag.getAttribute('modal-header'), 
      attributes: attributes
    }
    
    let openIn = aTag.getAttribute('modal-open') || 'root';
        
    let openId;
    switch (openIn) {
      case 'parent':
        openId = this.parentId;
        break;
      case 'page':
        openId = this.pageId;
        break;
      case 'root':
        openId = this.rootId;
        break;
      default:
        openId = openIn;
        break;
    }

    window.localStorage.setItem('parentId', openId)
    
    data.type = 'open';
    data.parentId = openId;

    if (this.isRoot) {
      if (this._createViewPort())
        this.viewPort._createModal(data);  
    } else {
      let viewPort = window.top.CoCreate.modal.viewPorts.get(openId);
      if (viewPort.pageId == data.parentId) {
        viewPort.viewPort._createModal(data);
      } else {
        this.modalAction(btn, 'open', data)
      }
    }
  },

  modalAction: function(btn, type, data) {
    let json = {
      apiKey: CoCreateConfig.apiKey,
      organization_id: CoCreateConfig.organization_id,
      broadcastSender: true,
      message: 'modalAction',
    }

    if (type == 'open') {
      json.data = data
      message.send(json);
    } else {
      let modalEl = btn.closest('.modal')

      let modal
      if (modalEl)
        modal = this.viewPort.modals.get(modalEl.id || this.pageId)
      if (!modal) {
        modal = window.top.CoCreate.modal.modals.get(this.pageId);
      }
      json.data = {
        parentId: this.parentId,
        pageId: this.pageId,
        modal,
        type
      }

      if (modal)
        this.runModalAction(json.data)
      else
        message.send(json);
    }
  },

  runModalAction: function(data) {
    if (data.modal || data.parentId == this.pageId) {
        
      var pageId = data.pageId;
      var type = data.type;
      var modal = data.modal

      if (!modal)
        modal = this.viewPort.modals.get(pageId);
      
      if (modal) {
        switch (type) {
          case 'open':
            if (data.parentId == this.pageId)
              this.viewPort._createModal(data)          
            break;
          case 'close':
            modal.viewPort._removeModal(modal)
            break;
          case 'maximize':
            modal.el.position.minMax();
            break;
          case 'park':
            modal.togglePark();
            break;
          default:
        }          
      }
    }

  }

}

export default new CoCreateModal();