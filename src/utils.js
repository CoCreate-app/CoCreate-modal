function generateUUID(length) {
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

var ModalStorage = {};

Object.defineProperty(ModalStorage, "rootPageId", {
  get: function() { return window.localStorage.getItem('page_rootId');},
  set: function(id) { window.localStorage.setItem('page_rootId', id); }
})

Object.defineProperty(ModalStorage, "parentPageId", {
  get: function() { return window.localStorage.getItem('page_parentId');},
  set: function(id) { window.localStorage.setItem('page_parentId', id); }
})

Object.defineProperty(ModalStorage, "pageId", {
  get: function() { return window.localStorage.getItem('page_id');},
  set: function(id) { window.localStorage.setItem('page_id', id); }
})


export {generateUUID, ModalStorage};