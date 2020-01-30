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

describe('Basic Test', function () {
  loadMochaIntegration('social_chatbanklib');
  it('Create Bank', function () {
    return createGlobalChatBank('ConversationsOfUser', true);
  });
  it('Initiate P2P conversation to luka', function () {
    return p2pmessage('andra', 'luka', 'blah', 'ConversationsOfUser');
  });
  it('Start floods', function () {
    startP2PMessageFlood(flooddescs.luka2andra);
    startP2PMessageFlood(flooddescs.ra2andra);
    //startP2PConversationFlood(flooddescs.luka2andra);
    startGroupMessageFlood(flooddescs.ra2group);
    //startGroupConversationFlood(flooddescs.ra2manygroups);
    return q.delay(150, true);
  });
  it('All conversations for andra', function () {
    //return qlib.promise2console(banklib.allConversationsOfUser('andra'), 'allConversationsOfUser andra');
    return setGlobal('Conversations', banklib.allConversationsOfUser('andra', 'ConversationsOfUser'));
  });
  it('Messages of random Conversation', function () {
    var cc = Conversations.length,
      randind = Math.floor(cc*Math.random()),
      randcnv = Conversations[randind],
      randcnvid = randcnv[0];

    console.log(cc, 'conversations, random cnv id', randcnvid);
    return qlib.promise2console(banklib.messagesOfConversation('andra', randcnvid, null, 5, 'ConversationsOfUser'), 'messagesOfConversation['+randcnvid+']');
  });

  it('Stop floods', function () {
    stopFlood(flooddescs.luka2andra);
    stopFlood(flooddescs.ra2andra);
    stopFlood(flooddescs.ra2group);
    //stopFlood(flooddescs.ra2manygroups);
  });
});

