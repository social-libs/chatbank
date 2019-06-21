/*
 * This script floods the bank user
 * with new conversations and messages
 * while he asks for all of his conversations
 */
var testlib = require('./lib'),
  banklib = testlib.bank,
  floods = new lib.Map(),
  zeroString = String.fromCharCode(0),
  flooddescproperties = ['from', 'to', 'template'],
  flooddescs = {
    luka2andra: {
      from: 'luka',
      to: 'andra',
      template: 'test'
    },
    ra2andra: {
      from: 'ra',
      to: 'andra',
      template: 'test'
    }
  };
function p2pmessage (from, to, msg) {
  //console.log('p2pmessage', from , to, msg);
  return banklib.processNewMessage(msg, from, to, null);
}

function Flood (desc) {
  testlib.checkPropertiesOn(desc, flooddescproperties);
  this.from = desc.from;
  this.to = desc.to;
  this.template = desc.template;
  this.index = 0;
  this.floodname = Flood.floodname(this);
}
Flood.prototype.destroy = function () {
  if (floods.get(this.floodname) === this) {
    floods.remove(this.floodname);
  }
  this.floodname = null;
  this.index = null;
  this.template = null;
  this.to = null;
  this.from = null;
};
Flood.prototype.go = function () {
  if (floods.get(this.floodname)) {
    return;
  }
  floods.add(this.floodname, this);
  this.send();
};
Flood.prototype.send = function () {
  var msgobj;
  if (!(
    this.from
    && this.to
    && this.template
    && lib.isNumber(this.index)
  )){
    this.destroy();
    return;
  }
  this.index++;
  msgobj = this.messageObject();
  p2pmessage(msgobj.from, msgobj.to, msgobj.msg).then(
    this.send.bind(this),
    this.destroy.bind(this)
  );
};
Flood.floodname = function (obj) {
  testlib.checkPropertiesOn(obj, flooddescproperties);
  return obj.from+zeroString+obj.to+zeroString+obj.template;
};

function MessageFlood (desc) {
  Flood.call(this, desc);
}
lib.inherit(MessageFlood, Flood);
MessageFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from,
    msg: this.template+':'+this.index
  };
};

function ConversationToFlood (desc) {
  Flood.call(this, desc);
}
lib.inherit(ConversationToFlood, Flood);
ConversationToFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from+':'+this.index,
    msg: this.template
  };
};

function startMessageFlood (obj) {
  return (new MessageFlood(obj)).go();
}
function startConversationToFlood (obj) {
  return (new ConversationToFlood(obj)).go();
}
function stopFlood (obj) {
  var f = floods.remove(Flood.floodname(obj)),
    ret;
  if (f) {
    ret = f.index;
    f.destroy();
  }
  return ret;
}

function checkConversations (convs) {
  //console.log(convs[1]);
  console.log(convs.length, 'conversations');
  console.log(floods.get(Flood.floodname(flooddescs.ra2andra)));
  console.log(LastConversationNotified);
}

describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    return setGlobal('Bank', testlib.createBank('conversationsofuser.db', true));
  });
  it('Initiate P2P conversation to luka', function () {
    return p2pmessage('andra', 'luka', 'blah');
  });
  /*
  it('Initiate P2P conversation to ra', function () {
    return p2pmessage('andra', 'ra', 'blah');
  });
  it('Start luka=>andra flood', function () {
    this.timeout(1e4);
    startMessageFlood('luka', 'andra', 'test#1');
    return q.delay(5000, true);
  });
  it('Stop luka=>andra flood', function () {
    this.timeout(1e4);
    stopFlood('luka', 'andra', 'test#1');
    return q.delay(50, true);
  });
  it('LastConversationNotified?', function () {
    console.log(LastConversationNotified);
  });
  */
  it('Start floods', function () {
    startMessageFlood(flooddescs.ra2andra);
    startConversationToFlood(flooddescs.luka2andra);
    return q.delay(250, true);
  });
  it('All conversations for andra', function () {
    //return qlib.promise2console(banklib.allConversationsOfUser('andra'), 'allConversationsOfUser andra');
    return banklib.allConversationsOfUser('andra').then(
      checkConversations
    );
  });
  it('Stop floods', function () {
    stopFlood(flooddescs.ra2andra);
    stopFlood(flooddescs.luka2andra);
  });
});

