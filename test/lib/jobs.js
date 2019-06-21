function createJobsLib (mylib) {
  'use strict';
  var bankFromName = mylib.bankFromName;

  function pushMessage (message, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.PushMessageJob(bank, message)).go();
  }

  function processNewMessage (message, from, to, togroup, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.ProcessNewMessageJob(bank, from, togroup, to, message)).go();
  }

  function createNewChatGroup (creator, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.NewChatGroupJob(bank, creator)).go();
  }

  function addNewUser2ChatGroup (chatgroupid, changer, newuser, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.AddNewUserToChatGroupJob(bank, chatgroupid, changer, newuser)).go();
  }

  function removeUserFromChatGroup (chatgroupid, changer, toremove, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.RemoveUserFromChatGroupJob(bank, chatgroupid, changer, toremove)).go();
  }

  function allConversationsOfUser (userid, bankname) {
    var bank = bankFromName(bankname);
    return (new bank.Jobs.AllConversationsOfUserJob(bank, userid)).go();
  }
  mylib.jobs = {
    pushMessage: pushMessage,
    processNewMessage: processNewMessage,
    createNewChatGroup: createNewChatGroup,
    addNewUser2ChatGroup: addNewUser2ChatGroup,
    removeUserFromChatGroup: removeUserFromChatGroup,
    allConversationsOfUser: allConversationsOfUser
  };
}

module.exports = createJobsLib;
