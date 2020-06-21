/**
 * index.js
 * - All our useful JS goes here, awesome!
 */

"use strict";

// Minimum resizable area
var minWidth = 60;
var minHeight = 40;

// Thresholds
var FULLSCREEN_MARGINS = -10;
var MARGINS = 4;

// End of what's configurable.
var clicked = null;
var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

var rightScreenEdge, bottomScreenEdge;

var preSnapped;

var b, x, y;

var redraw = false;
var currentElement = null;
var count = 0;
var ghostpane = document.getElementById("ghostpane");

var windowElement = document.getElementById('windows');
function setBounds(element, x, y, w, h) {
	element.style.left = x+'px';
	element.style.top = y+'px';
	element.style.width = w+'px';
	element.style.height = h+'px';
}

function hintHide() {
  setBounds(ghostpane, b.left, b.top, b.width, b.height);
  ghostpane.style.opacity = 0;
}

function onTouchDown(e, element) {
  onDown(e.touches[0], element);
  e.preventDefault();
}

function onTouchMove(e, element) {
  onMove(e.touches[0], element);
}

function onTouchEnd(e, element) {
  if (e.touches.length ==0) onUp(e.changedTouches[0], element);
}

function onMouseDown(e, element) {
    onDown(e, element);
    e.preventDefault();
}

function onDown(e, element) {
    currentElement = element;
    Array.prototype.forEach.call(document.getElementsByClassName("pane"), function(el) {
        el.style.zIndex = 2;
    }) ;
    element.style.zIndex = 3;
  calc(e, element);

  var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

  clicked = {
    x: x,
    y: y,
    cx: e.clientX,
    cy: e.clientY,
    w: b.width,
    h: b.height,
    isResizing: isResizing,
    isMoving: !isResizing && canMove(),
    onTopEdge: onTopEdge,
    onLeftEdge: onLeftEdge,
    onRightEdge: onRightEdge,
    onBottomEdge: onBottomEdge
  };
}

function canMove() {
  return x > 0 && x < b.width && y > 0 && y < b.height
  && y < 30;
}

function calc(e, element) {
  b = element.getBoundingClientRect();
  x = e.clientX - b.left;
  y = e.clientY - b.top;

  onTopEdge = y < MARGINS;
  onLeftEdge = x < MARGINS;
  onRightEdge = x >= b.width - MARGINS;
  onBottomEdge = y >= b.height - MARGINS;

  rightScreenEdge = window.innerWidth - MARGINS;
  bottomScreenEdge = window.innerHeight - MARGINS;
}

var e;

function onMove(ee, element) {
    if (!element) return;
  calc(ee, element);

  e = ee;

  redraw = true;

}
animate();

function animate() {

  requestAnimationFrame(animate);

  if (!redraw) return;

  redraw = false;

  if (clicked && clicked.isResizing) {

    if (clicked.onRightEdge) {
        currentElement.style.width = Math.max(x, minWidth) + 'px';
    }
    if (clicked.onBottomEdge) {
        currentElement.style.height = Math.max(y, minHeight) + 'px';
    }

    if (clicked.onLeftEdge) {
      var currentWidth = Math.max(clicked.cx - e.clientX  + clicked.w, minWidth);
      if (currentWidth > minWidth) {
        currentElement.style.width = currentWidth + 'px';
        currentElement.style.left = e.clientX + 'px';
      }
    }

    if (clicked.onTopEdge) {
      var currentHeight = Math.max(clicked.cy - e.clientY  + clicked.h, minHeight);
      if (currentHeight > minHeight) {
        currentElement.style.height = currentHeight + 'px';
        currentElement.style.top = e.clientY + 'px';
      }
    }

    hintHide();

    return;
  }

  if (clicked && clicked.isMoving) {

    if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
      // hintFull();
      setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.top < MARGINS) {
      // hintTop();
      setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
      ghostpane.style.opacity = 0.2;
    } else if (b.left < MARGINS) {
      // hintLeft();
      setBounds(ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.right > rightScreenEdge) {
      // hintRight();
      setBounds(ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
      ghostpane.style.opacity = 0.2;
    } else if (b.bottom > bottomScreenEdge) {
      // hintBottom();
      setBounds(ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
      ghostpane.style.opacity = 0.2;
    } else {
      hintHide();
    }

    if (preSnapped) {
      setBounds(currentElement,
      	e.clientX - preSnapped.width / 2,
      	e.clientY - Math.min(clicked.y, preSnapped.height),
      	preSnapped.width,
      	preSnapped.height
      );
      return;
    }

    // moving
    currentElement.style.top = (e.clientY - clicked.y) + 'px';
    currentElement.style.left = (e.clientX - clicked.x) + 'px';

    return;
  }

  // This code executes when mouse moves without clicking

  // style cursor
  if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
      document.body.style.cursor = 'nwse-resize';
  } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
    document.body.style.cursor = 'nesw-resize';
  } else if (onRightEdge || onLeftEdge) {
    document.body.style.cursor = 'ew-resize';
  } else if (onBottomEdge || onTopEdge) {
    document.body.style.cursor = 'ns-resize';
  } else if (canMove()) {
    document.body.style.cursor = 'move';
  } else {
    document.body.style.cursor = 'default';

  }
}

function onUp(e, element) {
  calc(e, element);

  if (clicked && clicked.isMoving) {
    // Snap
    var snapped = {
      width: b.width,
      height: b.height
    };

    if (x.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
      // hintFull();
      setBounds(element, 0, 0, window.innerWidth, window.innerHeight);
      preSnapped = snapped;
    } else if (b.top < MARGINS) {
      // hintTop();
      setBounds(element, 0, 0, window.innerWidth, window.innerHeight / 2);
      preSnapped = snapped;
    } else if (b.left < MARGINS) {
      // hintLeft();
      setBounds(element, 0, 0, window.innerWidth / 2, window.innerHeight);
      preSnapped = snapped;
    } else if (b.right > rightScreenEdge) {
      // hintRight();
      setBounds(element, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
      preSnapped = snapped;
    } else if (b.bottom > bottomScreenEdge) {
      // hintBottom();
      setBounds(element, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
      preSnapped = snapped;
    } else {
      preSnapped = null;
    }

    hintHide();

  }
  currentElement = null;
  clicked = null;

}

document.addEventListener('mousemove', function(e) {
    onMove(e, currentElement);
});

document.addEventListener("mouseup", function () {
  clicked = null;
  b = undefined, x = undefined, y = undefined;
});

function addWindowModal() {
  
  var newWindow = document.createElement("div");
  var titleDiv = document.createElement("div");
  titleDiv.appendChild(document.createTextNode("Window " + count));
  titleDiv.classList.add("title");
  
  newWindow.appendChild(titleDiv);
  
  newWindow.classList.add("pane");

  newWindow.addEventListener('mousedown', function (e) {
      onMouseDown(e, this);
  });
  newWindow.addEventListener('mousemove', function (e) {
      onMove(e, this);
  });
  newWindow.addEventListener('mouseup', function (e) {
      onUp(e, this);
  });
  newWindow.addEventListener('touchstart', function (e) {
      onTouchDown(e, this);
  });
  newWindow.addEventListener('touchmove', function (e) {
      onTouchMove(e, this);
  });
  newWindow.addEventListener('touchend', function (e) {
      onTouchEnd(e, this);
  })
  windowElement.appendChild(newWindow);
  count++;
}