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


export {
  ModalStorage,
};