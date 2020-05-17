var zeroString = String.fromCharCode(0);

function createUtils (lib) {
  'use strict';

  function zeroStringJoinSorted () {
    return Array.prototype.slice.call(arguments).sort().join(zeroString);
  }

  function convhasuser (conv, convid, userid) {
    if (lib.isArray(conv.afu)) {
      return conv.afu.indexOf(userid)>=0;
    }
    return zerojoinedstringhas (convid, userid);
  }

  function zerojoinedstringhas (zjs, str) {
    var sp = zjs.split(zeroString);
    if (!(lib.isArray(sp) && sp.length===2)) {
      return false;
    }
    return sp.indexOf(str)>=0;
  }

  function convisp2p (conv) {
    if (!conv) {
      throw new Error('No conversation given');
    }
    return !lib.isArray(conv.afu);
  }

  function convaffected (conv) {
    if (!(conv && conv.nr)) {
      return [];
    }
    return conv.nr.reduce(nruer, []);
  }
    
  function nruer (result, nr) {
    result.push(nr.u);
    return result;
  }


  function initialnotreader (userid) {
    return {
      u: userid, nr: 0
    };
  }
  function brandNewConversation () {
    var users = Array.prototype.slice.call(arguments);
    return {
      mids: [],
      lastm: null,
      nr: users.map(initialnotreader)
    };
  }

  function bumpNotRead (conv, senderid) {
    var i, c;
    if (!(conv && lib.isArray(conv.nr))) {
      return;
    }
    for (i=0; i<conv.nr.length; i++) {
      c = conv.nr[i];
      if (c.u === senderid) {
        continue;
      }
      c.nr++;
    }
  }

  function userInNotRead (userid, nrs) {
    var i, nr;
    if (!lib.isArray(nrs)) {
      return false;
    }
    for (i=0; i<nrs.length; i++) {
      nr = nrs[i];
      if (nr.u === userid) {
        return true;
      }
    }
    return false;
  }

  function initialnotrcvd (userid) {
    return {
      u: userid, rcvd: null
    };
  }

  function initialnotseen (userid) {
    return {
      u: userid, seen: null
    };
  }

  function rcvseenbyer (result, afu) {
    if (afu !== result.from) {
      result.rcvdby.push(initialnotrcvd(afu));
      result.seenby.push(initialnotseen(afu));
    }
    return result;
  }
  function brandNewP2PMessage(senderid, contents) {
    var ret = {
      from: senderid,
      message: contents,
      created: Date.now(),
      rcvd: null,
      seen: null/*,
      edits: []*/
    };
    return ret;
  }
  function brandNewGroupMessage (conv, senderid, contents) {
    var ret = {
      from: senderid,
      message: contents,
      created: Date.now(),
      rcvdby: [],
      seenby: []/*,
      edits: []*/
    };
    if (!(conv && lib.isArray(conv.afu))) {
      return ret;
    }
    return conv.afu.reduce(rcvseenbyer, ret);
  }

  function markMessageXBy (xname, msg, userid) { //xname === 'seen' || 'rcvd'
    var i, xs, x;
    if (!msg) {
      return false;
    }
    if (xname in msg) { //p2p
      x = msg[xname];
      if (!x) {
        msg[xname] = Date.now();
        return true;
      }
      return false;
    }
    xs = msg[xname+'by'];
    if (!lib.isArray(xs)) {
      return false;
    }
    for (i=0; i<xs.length; i++) {
      x = xs[i];
      if (x.u === userid) {
        if (x[xname] === null) {
          x[xname] = Date.now();
          return true;
        }
        return false;
      }
    }
    return false;
  }
  function markMessageRcvdBy (msg, userid) {
    return markMessageXBy('rcvd', msg, userid);
  }
  function markMessageSeenBy (msg, userid) {
    return markMessageXBy('seen', msg, userid);
  }

  function decNotReadOnConversationFor (conv, userid) {
    var i, nrs, nr;
    if (!conv) {
      return null;
    }
    nrs = conv.nr;
    if (!lib.isArray(nrs)) {
      return null;
    }
    for (i=0; i<nrs.length; i++) {
      nr = nrs[i];
      if (nr.u !== userid) {
        continue;
      }
      nr.nr--;
      if (nr.nr<0) {
        console.error('Not read Counter below zero', conv);
        throw new lib.Error('NOTREAD_COUNTER_BELOW_ZERO', userid)
      }
      return nr.nr;
    }
    return null;
  }

  return {
    zeroStringJoinSorted: zeroStringJoinSorted,
    conversationhasuser: convhasuser,
    conversationisp2p: convisp2p,
    conversationaffected: convaffected,
    initialnotreader: initialnotreader,
    brandNewConversation: brandNewConversation,
    bumpNotRead: bumpNotRead,
    userInNotRead: userInNotRead,
    brandNewP2PMessage: brandNewP2PMessage,
    brandNewGroupMessage: brandNewGroupMessage,
    markMessageRcvdBy: markMessageRcvdBy,
    markMessageSeenBy: markMessageSeenBy,
    decNotReadOnConversationFor: decNotReadOnConversationFor
  };
}

module.exports = createUtils;
