var $, MAX_ZINDEX, util,
  hasProp = {}.hasOwnProperty,
  bind = function (fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  },
  extend = function (child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  };

MAX_ZINDEX = 2147483647;

Xray.specimens = function () {
  return Xray.ViewSpecimen.all.concat(Xray.TemplateSpecimen.all);
};

Xray.constructorInfo = function (constructor) {
  var func, info, ref;
  if (window.XrayPaths) {
    ref = window.XrayPaths;
    for (info in ref) {
      if (!hasProp.call(ref, info)) continue;
      func = ref[info];
      if (func === constructor) {
        return JSON.parse(info);
      }
    }
  }
  return null;
};

Xray.open = function (path) {
  return $.ajax({
    url: "/_xray/open?path=" + path
  });
};

Xray.Specimen = (function () {
  Specimen.add = function (el, info) {
    if (info == null) {
      info = {};
    }
    return this.all.push(new this(el, info));
  };

  Specimen.remove = function (el) {
    var ref;
    return (ref = this.find(el)) != null ? ref.remove() : void 0;
  };

  Specimen.find = function (el) {
    var i, len, ref, specimen;
    if (el instanceof jQuery) {
      el = el[0];
    }
    ref = this.all;
    for (i = 0, len = ref.length; i < len; i++) {
      specimen = ref[i];
      if (specimen.el === el) {
        return specimen;
      }
    }
    return null;
  };

  Specimen.reset = function () {
    return this.all = [];
  };

  function Specimen(contents, info) {
    if (info == null) {
      info = {};
    }
    this.makeLabel = bind(this.makeLabel, this);
    this.el = contents instanceof jQuery ? contents[0] : contents;
    this.$contents = $(contents);
    this.name = info.name;
    this.path = info.path;
  }

  Specimen.prototype.remove = function () {
    var idx;
    idx = this.constructor.all.indexOf(this);
    if (idx !== -1) {
      return this.constructor.all.splice(idx, 1);
    }
  };

  Specimen.prototype.isVisible = function () {
    return this.$contents.length && this.$contents.is(':visible');
  };

  Specimen.prototype.makeBox = function () {
    this.bounds = util.computeBoundingBox(this.$contents);
    this.$box = $("<div class='xray-specimen " + this.constructor.name + "'>").css(this.bounds).attr('title', this.path);
    if (this.$contents.css('position') === 'fixed') {
      this.$box.css({
        position: 'fixed',
        top: this.$contents.css('top'),
        left: this.$contents.css('left')
      });
    }
    this.$box.click((function (_this) {
      return function () {
        return Xray.open(_this.path);
      };
    })(this));
    return this.$box.append(this.makeLabel);
  };

  Specimen.prototype.makeLabel = function () {
    return $("<div class='xray-specimen-handle " + this.constructor.name + "'>").append(this.name);
  };

  return Specimen;

})();

Xray.ViewSpecimen = (function (superClass) {
  extend(ViewSpecimen, superClass);

  function ViewSpecimen() {
    return ViewSpecimen.__super__.constructor.apply(this, arguments);
  }

  ViewSpecimen.all = [];

  return ViewSpecimen;

})(Xray.Specimen);

Xray.TemplateSpecimen = (function (superClass) {
  extend(TemplateSpecimen, superClass);

  function TemplateSpecimen() {
    return TemplateSpecimen.__super__.constructor.apply(this, arguments);
  }

  TemplateSpecimen.all = [];

  return TemplateSpecimen;

})(Xray.Specimen);

Xray.Overlay = (function () {
  function Overlay() {
    Xray.Overlay.singletonInstance = this;
    this.shownBoxes = [];
    this.$overlay = $('<div id="xray-overlay">');
    this.$overlay.click((function (_this) {
      return function () {
        return _this.hide();
      };
    })(this));
  }

  Overlay.show = function (type) {
    var element, i, len, results, specimens;
    results = [];
    for (i = 0, len = specimens.length; i < len; i++) {
      element = specimens[i];
      if (!element.isVisible()) {
        continue;
      }
      element.makeBox();
      element.$box.css({
        zIndex: Math.ceil(MAX_ZINDEX * 0.9 + element.bounds.top + element.bounds.left)
      });
      _this.shownBoxes.push(element.$box);
      results.push($('body').append(element.$box));
    }
    return results;
  }

  return Overlay;

})();

util = {
  computeBoundingBox: function ($contents) {
    var $el, boxFrame, el, frame, i, len;
    if ($contents.length === 1 && $contents.height() <= 0) {
      return util.computeBoundingBox($contents.children());
    }
    boxFrame = {
      top: Number.POSITIVE_INFINITY,
      left: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY
    };
    for (i = 0, len = $contents.length; i < len; i++) {
      el = $contents[i];
      $el = $(el);
      if (!$el.is(':visible')) {
        continue;
      }
      frame = $el.offset();
      frame.right = frame.left + $el.outerWidth();
      frame.bottom = frame.top + $el.outerHeight();
      if (frame.top < boxFrame.top) {
        boxFrame.top = frame.top;
      }
      if (frame.left < boxFrame.left) {
        boxFrame.left = frame.left;
      }
      if (frame.right > boxFrame.right) {
        boxFrame.right = frame.right;
      }
      if (frame.bottom > boxFrame.bottom) {
        boxFrame.bottom = frame.bottom;
      }
    }
    return {
      left: boxFrame.left,
      top: boxFrame.top,
      width: boxFrame.right - boxFrame.left,
      height: boxFrame.bottom - boxFrame.top
    };
  }
};
