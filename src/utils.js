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


const MARGIN = 5
const FULLSCREEN_MARGIN = -60
const NO_SNAP = -100;
const SNAP_MARGIN = -10;
const RIGHT_SCROL = 5;


const betweenCheck = (x, min, max) => {
  return x >= min && x <= max;
}

const getPointInfo = (el, event) => {
  let bound = el.getBoundingClientRect();
  let parentRect = el.parentNode.getBoundingClientRect();
  let x = event.clientX - bound.left;
  let y = event.clientY - bound.top;
  let cx = event.clientX - parentRect.left;
  let cy = event.clientY - parentRect.top;
  return { x, y, cx, cy }
}

const getRectInfo = (el) => {
  let bound = el.getBoundingClientRect();
  let parentRect = el.parentNode.getBoundingClientRect();
  let rect = {}
  
  for (var key in bound) {
    if (typeof bound[key] === 'number') {
      rect[key] = bound[key] - parentRect[key]
    }
  }
  return rect;
}

const setBound = (el, x, y, w, h) => {
  const borderHeight = el.offsetHeight - el.clientHeight;
  const borderWidth = el.offsetWidth - el.clientWidth;
  el.style.left = x;
  el.style.top = y;
  // el.style.width = "calc( " + w + " - " + borderWidth + "px )";
  // el.style.height = "calc( "  + h + " - " + borderHeight + "px )";
  el.style.width = w;
  el.style.height = h;
}

const getBoundStatus = (el, event) =>  {
  let bound = el.getBoundingClientRect();
  let x = event.clientX - bound.left;
  let y = event.clientY - bound.top;

  return {
    isTop : y < MARGIN && y > -MARGIN,
    isLeft : x < MARGIN && x > -MARGIN,
    isRight : x >= bound.width - RIGHT_SCROL && x <= bound.width + MARGIN + (MARGIN - RIGHT_SCROL),
    isBottom: y >= bound.height - MARGIN && y <= bound.height + MARGIN
  }
}



export {
  ModalStorage,
  getPointInfo,
  getRectInfo,
  setBound,
  getBoundStatus,
  
  
  
  MARGIN,
  FULLSCREEN_MARGIN,
  NO_SNAP,
  SNAP_MARGIN,
  RIGHT_SCROL,
};