export const pjXML = (function () {
  var me = {};
  var node_types = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  };

  function Lexer(xml) {
    this.xml = xml;
    this.entities = {lt:'<', gt:'>', amp:'&', apos:'\'', quot:'"'};
    this.pos = 0;
    this.inDTD = false;
  };

  Lexer.isSpace = function (ch) {
    return ' \t\n\r'.indexOf(ch) >= 0;
  }

  Lexer.isMarkup = function (ch) {
    return '<>?!&='.indexOf(ch) >= 0;
  }

  Lexer.escapeMap = {'<':'lt', '>':'gt', '&':'amp', '\'':'apos', '"':'quot'};
  Lexer.escapeXML = function (s) {
    var lex = this;

    return s.replace(/([<>&'"])/g, function (m, p1) { return '&' + Lexer.escapeMap[p1] + ';'; });
  }

  Lexer.prototype.read = function (cch) {
    return this.pos < this.xml.length ? this.xml[this.pos++] : null;
  }

  Lexer.prototype.peek = function () {
    return this.pos < this.xml.length ? this.xml[this.pos] : null;
  }

  Lexer.prototype.consume = function (ch) {
    return this.peek() == ch ? this.read() : null;
  }

  Lexer.prototype.eof = function () {
    return this.pos >= this.xml.length;
  }

  Lexer.prototype.skip = function (cch) {
    this.pos = Math.min(this.xml.length, this.pos + cch);

    return this.eof();
  }

  Lexer.prototype.getEntity = function (entity) {
    if (entity[0] == '#') {
      var n = entity[1] == 'x' ? parseInt(entity.substring(2), 16) : parseInt(entity.substring(1));

      entity = String.fromCharCode(n);
    } else if (this.entities[entity]) {
      entity = this.entities[entity];
    }

    return entity;
  };

  Lexer.prototype.replaceEntities = function (s) {
    var lex = this;

    return s.replace(/&([^;]*);/g, function (m, p1) { return lex.getEntity(p1); });
  }

  Lexer.prototype.nextChar = function () {
    if (this.pos >= this.xml.length) {
      return null;
    }

    var ch = this.read();
    if (this.inDTD && ch == '%') {
      var er = '';
      while ((ch = this.read()) != ';' && ch) {
        er += ch;
      }

      ch = this.getEntity(er);
    }

    return ch;
  };

  Lexer.prototype.readString = function (cch) {
    var s = '', ch;

    while (s.length < cch && (ch = this.nextChar())) {
      s += ch;
    }

    return s.length > cch ? s.substring(0, cch) : s;
  }

  Lexer.prototype.peekString = function (cch) {
    var ip = this.pos;
    var s = this.readString(cch);
    this.pos = ip;

    return s;
  }

  Lexer.prototype.consumeString = function (s) {
    if (this.peekString(s.length) == s) {
      this.readString(s.length);

      return true;
    }

    return false;
  }

  Lexer.prototype.consumeUntil = function (marker) {
    var s = '', ch;

    while (ch = this.nextChar()) {
      if (ch == marker[0] && this.consumeString(marker.substring(1))) {
        return s;
      }

      s += ch;
    }

    return s;
  }

  Lexer.prototype.skipSpace = function () {
    while (Lexer.isSpace(this.peek())) {
      this.read();
    }
  }

  Lexer.prototype.readName = function () {
    var ch, name = '';

    while ((ch = this.peek()) && !(Lexer.isSpace(ch) || Lexer.isMarkup(ch))) {
      name += this.read();
    }

    return name;
  }

  Lexer.prototype.readQuotedString = function () {
    var ch, sd, s = '';
    sd = this.read();
    while ((ch = this.read()) && ch != sd) {
      s += ch;
    }

    return s;
  }

  Lexer.prototype.parseExternalID = function () {
    if (this.consumeString('SYSTEM')) {
      this.skipSpace();
      this.readString();
    } else if (this.consumeString('PUBLIC')) {
      this.skipSpace();
      this.readQuotedString();
      this.skipSpace();
      this.readQuotedString();
    }
  }

  Lexer.prototype.parseEntityDecl = function () {
    this.skipSpace();
    if (this.peek() == '%') {
      this.read();
    }
    this.skipSpace();
    var n = this.readName();
    this.skipSpace();
    var v = this.replaceEntities(this.readQuotedString());
    this.consumeUntil('>');
    this.entities[n] = v;
  }

  Lexer.prototype.parseDecl = function () {
     this.consumeString('<!');
     if (this.peek() == '[') {
       if (this.consumeString('[INCLUDE[')) {
         this.skipSpace();
         while (!this.consumeString(']]>')) {
           this.parseDecl();
           this.skipSpace();
         }
       } else {
         this.consumeUntil(']]>');
       }
     } else {
       if (this.consumeString('ENTITY')) {
         this.parseEntityDecl();
       } else {
         this.consumeUntil('>');
       }
     }
  }

  Lexer.prototype.parseDTD = function () {
    this.inDTD = true;
    this.skipSpace();
    this.readName();
    this.skipSpace();
    this.parseExternalID();
    this.skipSpace();

    if (this.consumeString('>')) {
      this.inDTD = false;
      return;
    }

    if (!this.consumeString('[')) {
      // !!!LATER!!! report error
      this.consumeUntil('>');

      this.inDTD = false;
      return;
    }

    this.skipSpace()
    while (!this.consumeString(']')) {
      this.parseDecl();
      this.skipSpace();
    }

    this.consumeUntil('>');

    this.inDTD = false;
  }

  function Node(type) {
    this.type = type;
    this.content = [];
  };

  Node.prototype.append = function (o) {
    switch (typeof o) {
      case 'string': {
        if (this.content.length && typeof this.content[this.content.length-1] == 'string') {
          this.content[this.content.length-1] += o;

          return;
        }
      } break;
    }

    this.content.push(o);

    return this;
  }

  Node.prototype.parse = function (lex) {
    var ch;
    var s = '';

    while (ch = lex.nextChar()) {
      if (ch == '<') {
        this.append(lex.replaceEntities(s));
        s = '';
        ch = lex.nextChar();
        switch (ch) {
          case '!': {
            if (lex.consumeString('--')) {
              var cn = new Node(node_types.COMMENT_NODE);
              cn.append(lex.consumeUntil('-->'));
              this.append(cn);
            } else if (lex.consumeString('[CDATA[')) {
              this.append(lex.consumeUntil(']]>'));
            } else if (lex.consumeString('DOCTYPE')) {
              lex.parseDTD();
            }
          } break;

          case '?': {
            var pn = new Node(node_types.PROCESSING_INSTRUCTION_NODE);
            pn.append(lex.consumeUntil('?>'));
            this.append(pn);
          } break;

          case '/': {
            lex.consumeUntil('>');

            return;
          }

          default: {
            var en = new Node(node_types.ELEMENT_NODE);
            en.name = ch + lex.readName();
            en.attributes = {};

            var ch;
            while ((ch = lex.peek()) && (ch != '/' && ch != '>')) {
              lex.skipSpace();
              var an = lex.readName();
              lex.consumeString('=');
              en.attributes[an] = lex.replaceEntities(lex.readQuotedString());
              lex.skipSpace();
            }

            if (ch == '/') {
              lex.consumeString('/>');
            } else if (ch == '>') {
              lex.nextChar();
              en.parse(lex);
            }
            this.append(en);
          } break;
        }
      } else {
        s += ch;
      }
    }

    if (s.length) {
      this.append(lex.replaceEntities(s));
    }
  };

  Node.prototype.selectAll = function (xpath) {
    if (!Array.isArray(xpath)) {
      xpath = xpath.replace('//', '/>').split('/');
      xpath = xpath.reduce(function (a, v) {
        if (v) {
          a.push(v);
        }

        return a;
      }, []);
    }

    if (xpath.length < 1) {
      return [];
    }

    if (xpath[0][0] == '@') {
      return  this.attributes ? [this.attributes[xpath[0].substr(1)]] : [];
    }

    var ra = [];

    var exp = xpath[0];
    var recurse = exp[0] == '>';
    var name = recurse ? exp.substr(1) : exp;

    var ea = this.elements(name);

    if (xpath.length > 1) {
      ea.map(function (el) {
        ra = ra.concat(el.select(xpath.slice(1)));
      });
    } else {
      ra = ra.concat(ea);
    }

    if (recurse) {
      this.elements().map(function (el) {
        ra = ra.concat(el.select(xpath));
      });
    }

    return ra;
  }

  Node.prototype.select = function (xpath) {
      var ra = this.selectAll(xpath);

      return ra.length == 1 ? ra[0] : ra;
  }

  function emitContent(node, func) {
    var s = '';

    for (var i = 0; i < node.content.length; i++) {
      var o = node.content[i];

      if (typeof o == 'string') {
        s += Lexer.escapeXML(o);
      } else {
        s += o[func]();
      }
    }

    return s;
  }

  Node.prototype.firstElement = function () {
    for (var i = 0; i < this.content.length; i++) {
      var o = this.content[i];
      if (o instanceof Node && o.type == node_types.ELEMENT_NODE) {
        return o;
      }
    }

    return null;
  }

  Node.prototype.elements = function (name) {
    return this.content.reduce(function (ea, o) {
      if (o instanceof Node && o.type == node_types.ELEMENT_NODE && (!name || name == '*' || o.name == name)) {
        ea.push(o);
      }

      return ea;
    }, []);
  }

  Node.prototype.text = function () {
    return emitContent(this, 'text');
  }

  Node.prototype.xml = function () {
    var s = '';

    switch (this.type) {
      case node_types.ELEMENT_NODE: {
        s += '<' + this.name;
        if (this.attributes) {
          for (var name in this.attributes) {
            if (this.attributes.hasOwnProperty(name)) {
              s += ' ' + name + '="' + Lexer.escapeXML(this.attributes[name]) + '"';
            }
          }
        }

        if (this.content.length) {
          s += '>';
          s += emitContent(this, 'xml');
          s += '</' + this.name + '>';
        } else {
          s += '/>';
        }
      } break;
      case node_types.PROCESSING_INSTRUCTION_NODE: {
      } break;
      case node_types.COMMENT_NODE: {
      } break;
      default: {
        s = emitContent(this, 'xml');
      } break;
    }

    return s;
  }

  me.parse = function (xml) {
    var lex = new Lexer(xml);

    var doc = new Node(node_types.DOCUMENT_NODE);
    doc.parse(lex);

    return doc;
  }

  return me;
}());
