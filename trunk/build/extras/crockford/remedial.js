/*
Remedial JavaScript Functions recommended by Crockford 
(http://javascript.crockford.com/remedial.html)
*/

Function.prototype.si = function (v) {
      try {
            return v instanceof this;
      } catch (e) {
            return false;
      }
};

Boolean.si = function (v) {
    return typeof v === 'boolean';
};

Number.si = function (v) {
    return typeof v === 'number' && isFinite(v);
};

String.si = function (v) {
    return typeof v === 'string';
};

Array.si = function (v) {
    return v && typeof v === 'object' && typeof v.length === 'number' &&
              !(v.propertyIsEnumerable('length'));
};

function isEmpty(o) {
    var i, v;
    if (Object.si(o)) {
        for (i in o) {
            v = o[i];
            if (v !== undefined && !Function.si(v)) {
                return false;
            }
        }
    }
    return true;
}

String.prototype.entityify = function () {
    return this.replace(/&/g, "&amp;").replace(/</g,
        "&lt;").replace(/>/g, "&gt;");
};

String.prototype.quote = function () {
    var c, i, l = this.length, o = '"';
    for (i = 0; i < l; i += 1) {
        c = this.charAt(i);
        if (c >= ' ') {
            if (c == '\\' || c == '"') {
                o += '\\';
            }
            o += c;
        } else {
            switch (c) {
            case '\b':
                o += '\\b';
                break;
            case '\f':
                o += '\\f';
                break;
            case '\n':
                o += '\\n';
                break;
            case '\r':
                o += '\\r';
                break;
            case '\t':
                o += '\\t';
                break;
            default:
                c = c.charCodeAt();
                o += '\\u00' + Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
                break;
            }
        }
    }
    return o + '"';
};

String.prototype.supplant = function (o) {
    var i, j, s = this, v;
    for (;;) {
        i = s.lastIndexOf('{');
        if (i < 0) {
            break;
        }
        j = s.indexOf('}', i);
        if (i + 1 >= j) {
            break;
        }
        v = o[s.substring(i + 1, j)];
        if (!String.si(v) && !Number.si(v)) {
            break;
        }
        s = s.substring(0, i) + v + s.substring(j + 1);
    }
    return s;
};

String.prototype.trim = function () {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}; 

Object.prototype.later = 
        function (msec, method) {
    var that = this,
        args = Array.prototype.slice.
            apply(arguments, [2]); 
    if (typeof method === 'string') { 
        method = that[method]; 
    } 
    setTimeout(function () { 
        method.apply(that, args); 
    }, msec); 
    return that; 
}; 
