// TODO
// * Compute Boxes and add them to the Overlay
// * Xray.Settings
// * Xray.Bar

(function () {
  if (void (0) !== window.CTrails) {
    console.log("Do not initialize ct_rails multiple times.")
    return;
  }

  const MAX_ZINDEX = 2147483647;

  class CTrails {
    constructor() {
      this.is_mac = navigator.platform.toUpperCase().indexOf('MAC') !== -1;

      this.addListener();
      this.overlay = new Overlay();

      if (typeof console !== "undefined" && console !== null) {
        console.log("Ready to CT. Press " + (this.is_mac ? 'cmd+shift+x' : 'ctrl+shift+x') + " to scan your UI.")
      }
    }

    addListener() {
      window.addEventListener("keydown", (event) => {
        if ((this.is_mac && event.metaKey || !this.is_mac && event.ctrlKey) && event.shiftKey && event.key === 'x') {
          this.overlay.toggle();
        } else if (event.key === 'Escape') {
          this.overlay.hide();
        }
      });

    // add EventListener for Ajax DATA and call this.overlay.reset()
    }
  }

  class Overlay {
    constructor() {
      this.isShowing = false;
      this.overlayUI = void(0);
    }

    toggle() {
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    }

    // Create the Overlay only if it is shown.
    // Memorize the Overlay till the Page changes.
    overlayUiElement() {
      if (void(0) === this.overlayUI) {
        this.overlayUI = document.createElement("div");
        this.overlayUI.appendChild(document.createTextNode("CTrails"));
      }

      return this.overlayUI
    }

    show() {
      if (!this.isShowing) {
        document.body.appendChild(this.overlayUiElement());
        // return Xray.Overlay.instance().show(type);
        this.isShowing = true;
      }
    }

    hide() {
      if (this.isShowing) {
        this.overlayUiElement().remove();
        this.isShowing = false;
      }
    }

    reset() {
      this.hide();
      this.overlayUI = void(0);
    }
  }

  class AllComments {
    constructor() {
      this.allComments = [];
      this.beginCommentPattern = /^ ?BEGIN (.+) ?$/;
      this.parseForMatchingComments(document.childNodes);
    }

    parseForMatchingComments(nodes) {
      let node_count = nodes.length;
      for (let i = 0; i < node_count; i++) {
        if (nodes[i].nodeType === 1) {
          this.parseForMatchingComments(nodes[i].childNodes);
        }
        if (nodes[i].nodeType === 8 && this.beginCommentPattern.test(nodes[i].data)) {
          let endComment = nodes[i].data.replace("BEGIN", "END");
          let commentElements = [];
          for (let j = i + 1; j < node_count; j++) {
            if (nodes[j].nodeType === 1 && nodes[j].tagName !== 'SCRIPT') {
              commentElements.push(nodes[j]);
            }
            if (nodes[j].nodeType === 8 && nodes[j].data === endComment) {
              this.allComments.push(commentElements)
              break;
            }
          }
        }
      }
    }
  }

  window.CTrails = new CTrails();
}).call(this);
