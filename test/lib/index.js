function attachToBank (bank) {
  bank.conversationsDefer.promise.then(null, null, console.log.bind(console, 'New Conversation Notification'));
  bank.messagesDefer.promise.then(null, null, console.log.bind(console, 'New Message Notification'));
}
function createBank (name, initiallyemptydb) {
  var d = q.defer();
  new Lib.Bank({
    path: require('path').join(__dirname, name),
    initiallyemptydb: initiallyemptydb,
    starteddefer: d
  })
  d.promise.then(attachToBank);
  return d.promise;
}

function pushMessage (message, bankname) {
  bankname = bankname || 'Bank';
  var bank = getGlobal(bankname);
  return (new bank.Jobs.PushMessageJob(bank, message)).go();
}

function processNewMessage (message, from, to, togroup, bankname) {
  bankname = bankname || 'Bank';
  var bank = getGlobal(bankname);
  return (new bank.Jobs.ProcessNewMessageJob(bank, from, togroup, to, message)).go();
}

function createNewChatGroup (creator, bankname) {
  bankname = bankname || 'Bank';
  var bank = getGlobal(bankname);
  return (new bank.Jobs.NewChatGroupJob(bank, creator)).go();
}

module.exports = {
  createBank: createBank,
  pushMessage: pushMessage,
  processNewMessage: processNewMessage,
  createNewChatGroup: createNewChatGroup
};
