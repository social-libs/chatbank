/*
 * This script floods the bank user
 * with new conversations and messages
 * while he asks for all of his conversations
 */
var testlib = require('./lib'),
  banklib = testlib.bank,
  flooddescs = {
    luka2andra: {
      bankname: 'ConversationsOfUser',
      from: 'luka',
      to: 'andra',
      template: 'test'
    },
    ra2andra: {
      bankname: 'ConversationsOfUser',
      from: 'ra',
      to: 'andra',
      template: 'test'
    },
    ra2group: {
      bankname: 'ConversationsOfUser',
      from: 'ra',
      to: {
        groupname: 'raG',
        members: ['andra', 'luka_110', 'luka_73']
      },
      template: 'grouptest'
    },
    ra2manygroups: {
      bankname: 'ConversationsOfUser',
      from: 'ra',
      to: {
        groupname: 'virtualraG',
        members: ['andra', 'luka_110', 'luka_71']
      },
      template: 'grouptest'
    }
  };

function checkConversations (convs) {
  //console.log(convs[1]);
  console.log(convs.length, 'conversations');
  console.log('first one', convs[0]);
  console.log('last one', convs[convs.length-1]);
  console.log(floodFromDescriptor(flooddescs.ra2andra));
  console.log(ConversationsOfUser_LastConversationNotified);
}

describe('Basic Test', function () {
  loadMochaIntegration('social_chatbanklib');
  it('Create Bank', function () {
    return createGlobalChatBank('ConversationsOfUser', true);
  });
  it('Initiate P2P conversation to luka', function () {
    return p2pmessage('andra', 'luka', 'blah', 'ConversationsOfUser');
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
    //startP2PMessageFlood(flooddescs.ra2andra);
    //startP2PConversationFlood(flooddescs.luka2andra);
    //startGroupMessageFlood(flooddescs.ra2group);
    startGroupConversationFlood(flooddescs.ra2manygroups);
    return q.delay(250, true);
  });
  it('All conversations for andra', function () {
    //return qlib.promise2console(banklib.allConversationsOfUser('andra'), 'allConversationsOfUser andra');
    return banklib.allConversationsOfUser('andra', 'ConversationsOfUser').then(
      checkConversations
    );
  });
  it('Stop floods', function () {
    //stopFlood(flooddescs.ra2andra);
    //stopFlood(flooddescs.luka2andra);
    //stopFlood(flooddescs.ra2group);
    stopFlood(flooddescs.ra2manygroups);
  });
});

