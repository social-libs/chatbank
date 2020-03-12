function createJobsLib (mylib) {
  'use strict';
  var bankFromName = mylib.bankFromName;

  function processNewMessage (message, from, to, togroup, bankname) {
    return bankFromName(bankname).processNewMessage(from, togroup, to, message);
  }

  function createNewChatGroup (creator, bankname) {
    return bankFromName(bankname).createNewGroup(creator);
  }

  function addNewUser2ChatGroup (chatgroupid, changer, newuser, bankname) {
    return bankFromName(bankname).addUserToGroup(chatgroupid, changer, newuser);
  }

  function removeUserFromChatGroup (chatgroupid, changer, toremove, bankname) {
    return bankFromName(bankname).removeUserFromGroup(chatgroupid, changer, toremove);
  }

  function allConversationsOfUser (userid, bankname) {
    return bankFromName(bankname).allConversationsOfUser(userid);
  }

  function initiateConversationsOfUserForUsers (userid, userids, bankname) {
    return bankFromName(bankname).initiateConversationsOfUserForUsers(userid, userids);
  }

  function messagesOfConversation (userid, conversationid, oldestmessageid, howmany, bankname) {
    return bankFromName(bankname).messagesOfConversation(userid, conversationid, oldestmessageid, howmany);
  }

  function markMessageRcvd (userid, conversationid, messageid, bankname) {
    return bankFromName(bankname).markMessageRcvd(userid, conversationid, messageid);
  }

  function markMessageSeen (userid, conversationid, messageid, bankname) {
    return bankFromName(bankname).markMessageSeen(userid, conversationid, messageid);
  }
  mylib.bank = {
    processNewMessage: processNewMessage,
    createNewChatGroup: createNewChatGroup,
    addNewUser2ChatGroup: addNewUser2ChatGroup,
    removeUserFromChatGroup: removeUserFromChatGroup,
    allConversationsOfUser: allConversationsOfUser,
    initiateConversationsOfUserForUsers: initiateConversationsOfUserForUsers,
    messagesOfConversation: messagesOfConversation,
    markMessageRcvd: markMessageRcvd,
    markMessageSeen: markMessageSeen
  };
}

module.exports = createJobsLib;
