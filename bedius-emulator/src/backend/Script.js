/*HomeCredit. Version 1.0.0.21*/
function getVersionScript() { return "[version][1.0.0.21]"; }
var start,main,oos,pinEnter,pinMoreTime,menuMain
  ,pinChange
  ,withdrawalMenu,withdrawalSummOther,withdrawalNom,withdrawalCommAlert
  ,depositWait,depositInsert,depositCount,depositReturn,depositMenu
  ,chequeMenu,chequeMenuAskWithoutCheque,request,continueAsk, msgResult, msg_err
  ,screenMoreTime
  ,schetMenu
  ,inkassMenu, inkassAsk;
var m_session = {};
var emulCardInserted;
/*ekassir*/
var menuMainCash, kupiNeKopiType;
var timeoutValue = 60000;
var timeoutValue2 = 25000;
//states of answer 011,120,132,133
//				"ReqStateAuthBalance":{"default":"A32"}, "ReqStateCash":{"default":"A02"}, "ReqStateCash2":{"default":"A11"}
//				"ReqStateAuthBalance":{"default":"008"}, "ReqStateCash":{"default":"008"}, "ReqStateCash2":{"default":"A15"}
function getLangText(textId) {
  if(!!_words_ && !!_words_[textId])
  {
    if(!!_words_[textId][m_session.lang])
      return _words_[textId][m_session.lang];
    else if(!!_words_[textId]['ru'])
      return _words_[textId]['ru'];
  }
  else
    return textId;
}
function onLangSwitch(name){
  m_session.lang = m_session.lang === 'ru' ? 'en' : 'ru';
  m_session.langSwitched = 1;
  if(!!window[scr.name]){
    scr.nextScreen(window[scr.name], scr.args);
  }
}
function getHistory(uid) {
  m_session.moneyHistory = undefined;
  window.external.exchange.wbCustom.receiveCardHolderOperationsInfo(uid);
  var historyGet = function(someArgs){
    if(someArgs !== '')
      m_session.moneyHistory = someArgs;
    alertMsgLog('[history]: '+(m_session.moneyHistory == null? 'null':m_session.moneyHistory));
    try{
      //var helpJSON = JSON.parse(m_MoneyHistory);
      m_session.userData = JSON.parse(m_session.moneyHistory);
      m_session.userDataNew = JSON.parse(m_session.moneyHistory);
      alertMsgLog('[history][JSON] '+m_session.userData);

      if(typeof m_session.userData.operations != "undefined")
        for(var i=0; i<m_session.userData.operations.length; i++){
          if(m_session.userData.operations[i].type ==="cashout"){
            m_session.cashoutHistory.push(new Oper(m_session.userData.operations[i].amount,
              m_session.userData.operations[i].currency,
              m_session.userData.operations[i].count,
              m_session.userData.operations[i].printcheck,
              m_session.userData.operations[i].type));
          }
        }
      //m_session.cashoutHistory.sort(compareOper);
      var logHelpStr = "";
      for(var j = 0; j < m_session.cashoutHistory.length; j++){
        logHelpStr += ", "+m_session.cashoutHistory[j].amount;
      }
      if(m_session.cashoutHistory.length > 0){
        m_session.cashButtons[4].value = m_session.cashoutHistory[m_session.cashoutHistory.length-1].amount;
        m_session.cashButtons[4].text = m_session.cashoutHistory[m_session.cashoutHistory.length-1].amount;
      }
      alertMsgLog('[history][cashoutHistory] '+logHelpStr);
    }catch(e){
      alertMsgLog('[history][JSON] '+e.message);
      m_session.userData = undefined;
      m_session.userDataNew = undefined;
    }
  };
  addRequestHandler('clientHistory', historyGet);
}
function saveToHistory(amnt, curr, check){
  var jsonHelp = {};
  var trueData = new oper(amnt, curr, 1, check, "cashout");
  var dataStr = '';
  try{
    var i, j;
    /*for(i = 0; i < m_session.cashoutHistory.length; ++i)
    {
      if(m_session.cashoutHistory[i]['amount'] == amnt)
      {
        j = m_session.cashoutHistory[i]['count'];
        if(typeof j != 'undefined')
        {
          m_session.cashoutHistory[i]['count']= j+1;
        }
        else
        {
          m_session.cashoutHistory[i]['count'] = 2;
        }
        m_session.cashoutHistory[i]['printcheck'] = check;
        break;
      }
    }*/
    //if(i == m_session.cashoutHistory.length)
    //{
    m_session.cashoutHistory.push(trueData);
    //}
    dataStr = 'some","operations":'+JSON.stringify(m_session.cashoutHistory)+', "printcheck":'+check+', "some":"';
  }
  catch(e){
    alertMsgLog('saveToHistory: '+e.message);
    dataStr = 'some","operations":['+JSON.stringify(trueData)+'], "printcheck":'+check+', "some":"';
  }
  try{
    if(typeof m_session.userData == 'undefined' || typeof m_session.userData['_id'] == 'undefined'){
      alertMsgLog('saveToHistory id: 1111111111111111, data: '+dataStr);
      window.external.exchange.wbCustom.saveCardHolderOperationInfo('1111111111111111', dataStr);
    }
    else{
      alertMsgLog('saveToHistory id: '+m_session.userData['_id']+', data: '+dataStr);
      window.external.exchange.wbCustom.saveCardHolderOperationInfo(m_session.userData['_id'], dataStr);
    }
  }
  catch(e){
    alertMsgLog('saveToHistory: '+e.message);
  }
}
function callSupport(req,callBack){
  if(typeof callBack != 'undefined')
    addRequestHandler(req, callBack);
  if(typeof m_session !== "undefined" && typeof m_session.lang !== "undefined")
    window.external.exchange.loadPage("help","C:/WebIUSBrowser/config/SCRIPT/support.htm?Reload=0&source=script&webius="+req+'&language='+m_session.lang);
  else
    window.external.exchange.loadPage("help","C:/WebIUSBrowser/config/SCRIPT/support.htm?Reload=0&source=script&webius="+req);
}
function onTellMEWrapper(args){
  var dataHelp;
  m_session.cardtype = window.external.exchange.getMemory("cardtype");
  m_session.cardcurrency = window.external.exchange.getMemory("cardcurrency");
  switch(args){
    case 'before_pin':{
      dataHelp = window.external.exchange.getMemory("dataFromNDC");
      if(dataHelp !=''){
        dataHelp = JSON.parse(dataHelp);
        if(typeof dataHelp != "undefined" && typeof dataHelp.PAN != "undefined")
          getHistory(dataHelp.PAN);
        else
          alertMsgLog('[before_pin][dataFromNDC] PAN not found after JSON.parse');
      }
      else
        alertMsgLog('[before_pin][dataFromNDC] not received');
      callSupport('go_to_pin');
      return;
    }
    case 'pin':{
      if(m_session.serviceName == "pin_error")
        scr.nextScreen(pinEnter, "error");
      else
        scr.nextScreen(pinEnter);
      return;
    }
    case 'menu_main':{
      if(m_session.serviceName != 'authorization') {
        m_session.serviceName = 'authorization';
        scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
        m_session.isCard = true;
        callSupport(m_session.serviceName);
        return;
      }
      scr.nextScreen(menuMain);
      return;
    }
    case 'good_read_barcode':{
      m_session.acc_number = window.external.exchange.getNDCBufferValue("C");
      alert(m_session.acc_number)
      scr.nextScreen(credWait);
      return;
    }
    case 'inkass_auth_ok':{
      alertMsgLog(scr.name+'. '+args);
      scr.nextScreen(inkassMenu);
      return;
    }
    case 'wait_request':{
      if(scr.name == 'request' || (scr.name == 'msgResult' && typeof scr.args != 'undefined' && scr.args.constructor === Array && scr.args.length > 0 && scr.args[0] == getLangText("transaction_is_in_progress")))
        return;
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      return;
    }
    case 'request_ok':{
      if(m_session.isCard != checkBit(window.external.exchange.getNDCBufferValue('SessionFlags'), 0)){
        callSupport('cancel');
        if (m_session.serviceName === "credit"){
          var receptStr = receiptTextGen();
          window.external.exchange.PrintReceipt(receptStr);
        }
        //m_session.lang = 'ru';
        scr.nextScreen(msgResult, ['see_you_later_', 'end']);
      }
      else
        scr.nextScreen(continueAsk);
      return;
    }
    case 'request_error':{
      scr.nextScreen(msgResult, [getLangText("request_has_failed"),'end_menu_return']);
      return;
    }
    case 'balance_res_ok':{
      if(m_session.isCard != checkBit(window.external.exchange.getNDCBufferValue('SessionFlags'), 0)){
        callSupport('cancel');
        return;
      }
      if(m_session.serviceName == 'authorization') {
        m_session.serviceName = "";
        scr.nextScreen(menuMain);
        return;
      }
      if(m_session.serviceName == 'balance')
        m_session.balance = parseBalance(window.external.exchange.getMemory("dataFromNDC"));
      //alert('flags:'+window.external.exchange.getNDCBufferValue('SessionFlags'));
      scr.nextScreen(continueAsk);
      return;
    }
    case 'request_inkass_ok':{
      scr.nextScreen(inkassAsk);
      return;
    }
    case 'request_inkass_service':{
      scr.nextScreen(msgResult, ['request_inkass_service', 'end_err']);
      return;
    }
    case 'pre_ekass_cash_authorization_ok':{
      callSupport('ekassir_init');
      return;
    }
    case 'pinchange_first':{
      scr.nextScreen(pinChange, "first");
      return;
    }
    case 'pinchange_second':{
      scr.nextScreen(pinChange, "second");
      return;
    }
    case 'pinchange_error':{
      scr.nextScreen(pinChange, "error");
      return;
    }
    case 'pinchange_ok':{
      scr.nextScreen(continueAsk, "reinit");
      return;
    }
    case 'after_chip_reinit':{
      scr.nextScreen(request);
      return;
    }
    case 'money_wait': {
      if(typeof (m_session.cashin) != 'undefined' && m_session.cashin.step == 'insert' || m_session.cashin.step == 'menu')
        scr.nextScreen(depositWait);
      return;
    }
    case 'money_insert': {
      scr.nextScreen(depositInsert);
      return;
    }
    case 'money_check': {
      scr.nextScreen(depositCount);
      return;
    }
    case 'money_menu': {
      scr.nextScreen(depositMenu);
      return;
    }
    case 'money_return': {
      m_session.cashin = {step:'return'};
      scr.nextScreen(msgResult, [getLangText("please_take_your_money"), 'wait']);
      return;
    }
    case 'money_full': {
      scr.nextScreen(depositMenu, 'full');
      return;
    }
    case 'money_cancel': {
      m_session.cashin = {step:'cancel'};
      if(m_session.serviceName === 'ekassir_cashin' || m_session.serviceName ==='kupiNeKopi_cashin'
        || m_session.serviceName === 'credit'){
        scr.nextScreen(msgResult, ['see_you_later_', 'end']);
        callSupport('cancel');
      } else {
        scr.nextScreen(menuMain);
      }
      return;
    }
    case 'money_ok': {
      m_session.cashin = {step:'ok'};
      if(m_session.serviceName == 'ekassir_cashin' || m_session.serviceName == 'kupiNeKopi_cashin'){
        callSupport(m_session.serviceName+'_req&amount='+m_session.amount.toString());
      }
      else if(m_session.serviceName === 'credit'){
        scr.nextScreen(credPay);
      } else {
        m_session.isCard = true;
        //scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
        //callSupport('deposit_req');
        scr.nextScreen(chequeMenu);
      }
      return;
    }
    case 'money_full_back': {
      m_session.cashin = {step:'full_back'};
      scr.nextScreen(msgResult, [getLangText("too_many_bills__please_take_some_away"), 'wait']);
      return;
    }
    case 'money_error': {
      m_session.cashin = {step:'error'};
      scr.nextScreen(msgResult, [getLangText("bill_acceptor_error"), 'wait']);
      return;
    }
    case 'ask_more_time': {
      scr.nextScreen(pinMoreTime);
      return;
    }
    case 'card_return': {
      scr.nextScreen(msgResult, [getLangText("please_take_your_card"), 'wait']);
      return;
    }
    case 'money_take': {
      if(m_session.serviceName == 'withdrawal'){
        if(m_session.receipt == 'withcheque'){
          saveToHistory(m_session.withdrawal.amount, m_session.currency, true);
          scr.nextScreen(msgResult, [getLangText("please_take_your_money_and_transaction_slip"), 'wait']);
        }else{
          saveToHistory(m_session.withdrawal.amount, m_session.currency, false);
          scr.nextScreen(msgResult, [getLangText("please_take_your_money"), 'wait']);
        }
      }
      else
        scr.nextScreen(msgResult, [getLangText("please_take_your_money"), 'wait']);
      return;
    }
    case 'wait_chip_hard_err':
    case 'wait_chip_work_err':
    case 'wait_card_not_smart':
    case 'wait_no_suit_applic':
    case 'wait_proc_not_perf':{
      scr.nextScreen(msgResult, [getLangText("card_read_error"), 'end_err']);
      return;
    }
    case 'wait_chip_app_err':
      scr.nextScreen(msgResult, ['wait_chip_app_err', 'end_err']);
      return;
    case 'error':
    case 'cancel':
    case 'wait_card_error':
    case 'wait_cheque':
    case 'card_return_print':
    case 'wait_read_error':
    case 'wait_card_captured': {
      scr.nextScreen(msgResult, [args, 'end_err']);
      return;
    }
    case 'wait_pin_error':{
      //if(m_session.serviceName == 'authorization')
      //{
      //scr.nextScreen(msgResult, ['Неверный пин-код<br>Завершение операций','end_menu_cancel']);
      //scr.nextScreen(pinEnter, 'error');
      m_session.serviceName = 'pin_error';
      callSupport("go_to_pin");
      //}
      //else
      //	callSupport('cancel');
      return;
    }
    case 'pin_try_exceeded':{
      scr.nextScreen(msgResult, ['Превышенно количество<br>некорретного ввода ПИН-кода', 'end_menu_cancel']);
      return;
    }
    case 'request_err_weakpin':
      scr.nextScreen(msgResult, [getLangText("pin_is_too_weak"), 'end_menu_return']);
      return;
    case 'request_err_nocheque':
      scr.nextScreen(msgResult, ['request_err_nocheque', 'end_menu_cancel']);
      return;
    case 'request_err_amnt_change':
      scr.nextScreen(withdrawalSummOther, getLangText("unable_to_withdraw_this_amount__please_enter_new_amount"));
      return;
    case 'pre_ekass_cred_authorization_ok':
      m_session.serviceName = "credit";
      scr.nextScreen(credMenu);
      return;
    case 'request_err_amnt':
      scr.nextScreen(msgResult, [getLangText("incorrect_amount_value"), 'end_menu_cancel']);
      return;
    case 'request_err_lesser_amnt':
      scr.nextScreen(msgResult, ['err_lesser_amnt', 'end_menu_cancel']);
      return;
    case 'request_err_need_pin_change':
      scr.nextScreen(msgResult, ['err_need_pin_change', 'end_menu_cancel']);
      return;
    case 'request_err_no_stmt_info':
      scr.nextScreen(msgResult, ['err_no_stmt_info', 'end_menu_cancel']);
      return;
    case 'request_err_no_stmt_avail':
      scr.nextScreen(msgResult, ['err_no_stmt_avail', 'end_menu_cancel']);
      return;
    case 'contact_bank':
      scr.nextScreen(msgResult, ['contact_bank', 'end_menu_cancel']);
      return;
    case 'request_err_unauth_usage':
      scr.nextScreen(msgResult, ['err_unauth_usage', 'end_menu_cancel']);
      return;
    case 'request_err_expired_card':
      scr.nextScreen(msgResult, [getLangText("card_has_expired"), 'end_menu_cancel']);
      return;
    case 'request_err_invalid_card':
      scr.nextScreen(msgResult, ['request_err_invalid_card', 'end_menu_cancel']);
      return;
    case 'request_err_unable':
      scr.nextScreen(msgResult, [getLangText("transaction_is_unavailable"), 'end_menu_cancel']);
      return;
    case 'request_err_invalid_acct':
      scr.nextScreen(msgResult, ['request_err_invalid_acct', 'end_menu_ask']);
      return;
    case 'request_err_invalid_tran':
      scr.nextScreen(msgResult, [getLangText("transaction_is_unavailable"), 'end_menu_cancel']);
      return;
    case 'request_err_insuff_funds':
      scr.nextScreen(msgResult, ['request_err_insuff_funds', 'end_menu_ask']);
      return;
    case 'request_err_withdraw_limit':
      scr.nextScreen(msgResult, [getLangText("withdrawal_limit_exceeded"), 'end_menu_cancel']);
      return;
    case 'request_err_no_sharing':
      scr.nextScreen(msgResult, ['err_no_sharing', 'end_menu_cancel']);
      return;
    case 'request_err_impossible':
      scr.nextScreen(msgResult, [getLangText("unable_to_perform_operation"), 'end_menu_cancel']);
      return;
    case 'request_err_uses_limit':
      scr.nextScreen(msgResult, ['request_err_uses_limit', 'end_menu_ask']);
      return;
    case 'request_err_invalid_cash_back_amnt':
      scr.nextScreen(msgResult, [getLangText("incorrect_amount_value"), 'end_menu_cancel']);
      return;
    case 'switch_lang':
      m_session.lang = m_session.lang == 'ru' ? 'en' : 'ru';
      callSupport("go_to_pin");
      return;
    case 'request_err_amnt_cant_dispence':
      scr.nextScreen(msgResult, ['request_err_amnt_cant_dispence', 'end_menu_ask']);
      return;
    case 'session_end_card_captured':
      scr.nextScreen(msgResult, ['session_end_card_captured', 'end_err']);
      return;
    case 'wait_end_session_money_return':
      scr.nextScreen(msgResult, ['wait_end_session_money_return', 'end']);
      return;
    case 'wait_withdrawl_without_comiss_scr':
      dataHelp = window.external.exchange.getMemory("dataFromNDC");
      if(dataHelp !=''){
        dataHelp = JSON.parse(dataHelp);
        if(typeof dataHelp != "undefined" && typeof dataHelp.amount != "undefined")
        {
          scr.nextScreen(withdrawalCommAlert, dataHelp.amount);
          return;
        }
        else
          alertMsgLog('[wait_withdrawl_without_comiss_scr][dataFromNDC] amount not found after JSON.parse');
      }
      else
        alertMsgLog('[wait_withdrawl_without_comiss_scr][dataFromNDC] not received');
      scr.nextScreen(msgResult, ["", 'end_menu_cancel']);
      return;
    case 'wait_withdrawl_without_comiss_scr2':
      scr.nextScreen(withdrawalCommAlert);
      return;
    default:
      alertMsgLog('unhandled signal, scr.name:'+scr.name+', signal:'+args);
      scr.nextScreen(msgResult, [getLangText("operation_error"), 'end_menu_cancel']);
      return;
  }
}
function onCancel(args){
  callSupport('cancel');
  scr.nextScreen(msgResult, ['see_you_later_', 'end']);
}
function onReturnToMenu(args){
  scr.nextScreen(menuMain);
}
function onReturnToPin(args){
  if(checkBit(window.external.exchange.getNDCBufferValue('SessionFlags'), 0)){//по карте
    m_session.serviceName = "";
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    callSupport('go_to_pin');
  } else {//по налу
    scr.nextScreen(menuMainCash);
  }

  //scr.nextScreen(menuMain);
}
function onStart(args){
  m_session.serviceName = "";
  scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
  callSupport('go_to_start');
  return;
}
function onGoToAuthorize(args){
  if(checkBit(window.external.exchange.getNDCBufferValue('SessionFlags'), 0)){//по карте
    m_session.serviceName = 'authorization';
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    m_session.isCard = true;
    callSupport(m_session.serviceName);
    return;
  } else {//по налу
    scr.nextScreen(menuMainCash);
  }
}
function chequeCenter(str){

  var spaceCount = (40 - str.length)/2;
  var res = '';
  for(var i = 0; i < spaceCount; i++)
    res+=' ';
  return res + str + "\n";
}
function chequeCenterMinus(str){

  // var spaceCount = (40 - str.length)/2;
  // var res = '';
  // for(var i = 0; i < spaceCount; i++)
  // 	res+='-';
  // res = res + str;
  // for(var i = res.length; i < 40; i++)
  // 	res+='-';
  return str + "\n";
}
function chequeUncenter(str){
  var tmp = str.split('|');
  if(tmp.length !== 2)
    return str;
  var spaceCount = 40 - tmp[0].length - tmp[1].length;
  var res = tmp[0];
  for(var i = 0; i < spaceCount; i++)
    res+=' ';
  return res + tmp[1] + "\n";
}
function receiptTextGen(){
  var receiptText = "";
  receiptText += chequeCenterMinus("------------ООО \"ХКФ БАНК\"-------------");
  receiptText += chequeCenterMinus("ЛИЦЕНЗИЯ ЦБ РФ N 316");
  receiptText += chequeCenterMinus("-------------ИНН 7735057951------------");
  receiptText += chequeCenterMinus("ТЕЛ.: 8 495 785-82-22");
  receiptText += chequeCenterMinus("ДАТА/ВРЕМЯ: 02.03.21 14:37:10");

  receiptText += chequeCenterMinus("ВИД ОПЕРАЦИИ:ОПЛАТА УСЛУГ");
  receiptText += chequeCenterMinus("ПОЛУЧАТЕЛЬ:"+m_session.cred_fio);
  receiptText += chequeCenterMinus("ДОГОВОР:"+m_session.acc_number);
  receiptText += chequeCenterMinus("СУММА ПЕРЕВОДА:"+m_session.creditAmount.toString()+" РУБ");
  receiptText += chequeCenterMinus("СУММА КОМИССИИ:0.00 РУБ");
  receiptText += chequeCenterMinus("СУММА ИТОГО:"+m_session.creditAmount.toString()+" РУБ");
  receiptText += chequeCenterMinus("ПРОВЕРЬТЕ ЗАЧИСЛЕНИЕ ПЛАТЕЖА ПО КРЕДИТУ");
  receiptText += chequeCenterMinus("WWW.HOMECREDIT.RU/MYCREDIT");
  receiptText += chequeCenterMinus("С П А С И Б О !");
  receiptText += chequeCenterMinus("СОХРАНЯЙТЕ ЧЕК ДО МОМЕНТА ЗАЧИСЛЕНИЯ");
  receiptText += chequeCenterMinus("ПЕРЕВОДА");
  receiptText += chequeCenterMinus("----------WWW.HOMECREDIT.RU------------");
  return receiptText;
}

function onTimeout(_objString){
  scr.nextScreen(screenMoreTime, [scr.name, scr.args]);
}
start = function(args){
  var onError =  function (){
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  scr.addCall('TellMEWrapper', onTellMEWrapper);
  alertMsgLog('[SCRIPT] '+scr.name+'. Страница start, параметры: ' + (!!args ? args : "null"));
};
oos = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница OOS, параметры: ' + (!!args ? args : "null"));
  scr.setLabelJson({name:"title", value:getLangText("atm_is_temporarily_out_of_service_")});
  scr.render("wait");
};

main = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  if(!!args) 	{
    var help = "";
    if(args == 'wait_read_error'){
      scr.nextScreen(msgResult, [args,'end_err']);
      return;
    }
    else if(args == 'wait_card_error'){
      scr.nextScreen(msgResult, [args,'end_err']);
      return;
    }
    try{
      getATMMoney();
    }
    catch(e){
      alertMsgLog('main args '+args+'. Exception:'+e.message);
    }
    m_session = new SessionVariables();
    m_session.ATMFunctions = getATMFuncStatus();
    if(args == 'cardless') {
      m_session.isCard = false;
      if(m_session.ATMFunctions.acceptor)
        scr.nextScreen(menuMainCash);
      else
        scr.nextScreen(msgResult, ['payment_cashin_err', 'end_menu_cancel']);
      return;
    }
    else if(args == 'ekassir_cashin' || args == 'kupiNeKopi_cashin') {
      help = window.external.exchange.getMemory("session");
      if(help != "")
      {
        try
        {
          m_session = JSON.parse(help);
        }
        catch(e)
        {
          alertMsgLog('[JSON.parse] session not parsed:'+e.message);
          m_session = new SessionVariables();
        }
      }
      m_session.serviceName = args;
      scr.nextScreen(depositWait);
      callSupport(args + '_open');
      return;
    }
    else if(args == 'ekassir_ok') {
      help = window.external.exchange.getMemory("session");
      if(help != "")
      {
        try
        {
          m_session = JSON.parse(help);
        }
        catch(e)
        {
          alertMsgLog('[JSON.parse] session not parsed:'+e.message);
          m_session = new SessionVariables();
        }
      }
      scr.nextScreen(continueAsk, "pin");
      return;
    }
    else if(args == 'ask_print_nocheque') {
      help = window.external.exchange.getMemory("session");
      if(help != "")
      {
        try
        {
          m_session = JSON.parse(help);
        }
        catch(e)
        {
          alertMsgLog('[JSON.parse] session not parsed:'+e.message);
          m_session = new SessionVariables();
        }
      }
      scr.nextScreen(chequeMenuAskWithoutCheque);
      return;
    }
    else if(args == 'return_from_ekassir') {
      //scr.nextScreen(cardInserted, "ekassir");
      callSupport("cancel");
      return;
    }
    else if(args == 'card_inserted'){
      alertMsgLog('main card_inserted');
    }
    else if(args == 'card_emulated'){
      getHistory("4058703300000009");

      scr.nextScreen(menuMain);
      return;
    }
    else if(args == 'before_pin'){
      alertMsgLog('before_pin');
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      callSupport('go_to_pin');
      return;
    }
    else {
      onTellMEWrapper(args);
      return;
    }
  }
  scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
};
function initSessionParams(){
  getATMMoney();
  m_session = new SessionVariables();
}
emulCardInserted = function(){
  m_session = new SessionVariables();
  m_session.ATMFunctions = getATMFuncStatus();
  scr.nextScreen(menuMain);
  return;
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  initSessionParams();
  m_session.serviceName = "authorization";
  scr.addCall('TellMEWrapper', onTellMEWrapper);
  return;
};

pinEnter = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onCancel = function(name){
    //scr.nextScreen(main);
    callSupport('cancel');
  }
  var onContinue = function(name){
    if(m_session.pin.value.length < 4){
      alertMsgLog('[SCRIPT] '+scr.name+' pin.length < 4'+'. onContinue: '+name);
      return;
    }
    alertMsgLog('[SCRIPT] '+scr.name+'. onContinue: '+name);
    //scr.nextScreen(menuMain);
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait_ads', "IMG/PIC385(1).jpg"]);
    callSupport('pin_enter&pin_value='+m_session.pin.value);
  }
  var onInput = function(args){
    var pKey = '', help = '';
    alertMsgLog('[SCRIPT] '+scr.name+'. onInput: '+args);
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    m_session.pin.length = controlPinLength(help);
    m_session.pin.value = help;
    if(m_session.pin.value.length < 4)
      scr.setButtonJson({name:"Btn7", text:getLangText("next"), visible:true, enable:false, ext:""}, onContinue);
    else
      scr.setButtonJson({name:"Btn7", text:getLangText("next"), visible:true, enable:true, ext:""}, onContinue);
    scr.setInputJson({name:"value", text:m_session.pin.value, hint:"", type:"pin", maxLength:m_session.maxLength,visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
    window.external.exchange.RefreshScr();
    alertMsgLog('[SCRIPT] '+scr.name+'. onInput pin: '+m_session.pin.value);
  }

  alertMsgLog('[SCRIPT] '+scr.name+'. Ввод пин-кода');
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  if(m_session.langSwitched == 0){
    m_session.pin = {length:4, value:'', maxLength:window.external.exchange.GetModuleVariable('NDC','NDCPINLENGTH')};
    if(!m_session.pin.maxLength || (!!m_session.pin.maxLength && m_session.pin.maxLength.indexOf('ERROR') > -1)) m_session.pin.maxLength = 8;
  }
  m_session.langSwitched = 0;
  if(type == 'error')
    scr.setLabelJson({name:"title", value:getLangText("you_have_entered_incorrect_pin")});
  else
    scr.setLabelJson({name:"title", value:getLangText("enter_your_pin")});
  var nominalString = "";
  if(m_session.ATMFunctions.dispenser && m_session.ATMMoneyInfo.length > 0){
    nominalString = getLangText("available_denominations:");
    for(var i = 0; i < m_session.ATMMoneyInfo.length; i++)
      nominalString+=getNominalText(m_session.ATMMoneyInfo[i]);
    nominalString = nominalString.substr(0,nominalString.length-2);
  }
  scr.setLabelJson({name:"note", value:nominalString});
  scr.setButtonJson({name:"Btn4", text:getLangText("language"), visible:true, enable:true, ext:""}, onLangSwitch);
  scr.setInputJson({name:"value", text:"", hint:"", type:"pin", maxLength:m_session.maxLength,visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
  scr.setButtonJson({name:"Btn7", text:getLangText("next"), visible:true, enable:false, ext:""}, onContinue);
  scr.setButtonJson({name:"Btn8", text:getLangText("cancel"), visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel"), visible:false, enable:true, ext:""}, onCancel);
  scr.render("input_pin");
};

pinChange = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onCancel = function(name){
    callSupport('cancel');
  }
  var onContinue = function(name){
    if(m_session.pin.value.length < 4){
      alertMsgLog('[SCRIPT] '+scr.name+' pin.length < 4'+'. onContinue: '+name);
      return;
    }
    alertMsgLog('[SCRIPT] '+scr.name+'. onContinue: '+name);
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    callSupport('pin_enter&pin_value='+m_session.pin.value);
  }
  var onInput = function(args){
    var pKey = '', help = '';
    alertMsgLog('[SCRIPT] '+scr.name+'. onInput: '+args);
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    m_session.pin.length = controlPinLength(help);
    m_session.pin.value = help;

    if(m_session.pin.value.length < 4)
      scr.setButtonJson({name:"Btn7", text:getLangText("confirm"), visible:true, enable:false, ext:""}, onContinue);
    else
      scr.setButtonJson({name:"Btn7", text:getLangText("confirm"), visible:true, enable:true, ext:""}, onContinue);
    scr.setInputJson({name:"value", text:m_session.pin.value, hint:"", type:"pin", maxLength:m_session.pin.maxLength,visible:true, enable:true, validate:true, state:"", ext:""}, onInput);

    window.external.exchange.RefreshScr();
    alertMsgLog('[SCRIPT] '+scr.name+'. onInput pin: '+m_session.pin.value);
  }

  alertMsgLog('[SCRIPT] '+scr.name+'. Ввод пин-кода');
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  m_session.pin = {length:4, value:'', maxLength:window.external.exchange.GetModuleVariable('NDC','NDCPINLENGTH')};
  if(!m_session.pin.maxLength || (!!m_session.pin.maxLength && m_session.pin.maxLength.indexOf('ERROR') > -1)) m_session.pin.maxLength = 8;

  if(type == 'error')
    scr.setLabelJson({name:"title", value:getLangText("the_new_pin_you_have_re_entered_is_incorrect_")+"<br>"+getLangText("please_repeat_your_new_pin")});
  else if(type == 'first')
    scr.setLabelJson({name:"title", value:getLangText("please_enter_your_new_pin")});
  else if(type == 'second')
    scr.setLabelJson({name:"title", value:getLangText("please_repeat_your_new_pin")});
  scr.setLabelJson({name:"note", value:getLangText("to_cancel_transaction_and_return_the_card_press_cancel")});

  scr.setInputJson({name:"value", text:"", hint:"", type:"pin", maxLength:m_session.pin.maxLength,visible:true, enable:true, validate:true, state:"", ext:""}, onInput);

  scr.setButtonJson({name:"Btn7", text:getLangText("confirm"), visible:true, enable:false, ext:""}, onContinue);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel"), visible:false, enable:true, ext:""}, onCancel);
  scr.render("input_pin");
};
pinMoreTime = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onCancel = function(name){
    //scr.nextScreen(main);
    callSupport("ask_more_time_no");
  }
  var onContinue = function(name){
    //scr.nextScreen(menuMain);
    callSupport("ask_more_time_yes");
  }

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  scr.setLabelJson({name:"title", value:"Вам потребуется<br>больше времени?"});
  scr.setLabelJson({name:"note", value:"Do you need<br>more time?"});
  scr.setButtonJson({name:"Btn5", text:"Да/Yes", visible:true, enable:true, ext:""}, onContinue);
  scr.setButtonJson({name:"Btn6", text:"Нет/No", visible:true, enable:true, ext:""}, onCancel);
  scr.render("menu");
};
screenMoreTime = function(scrArgs){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onCancel = function(name){
    callSupport('cancel');
    scr.nextScreen(msgResult, ['see_you_later_', 'end']);
  };
  var onContinue = function(name)
  {
    alertMsgLog(scr.name+". typeof window[] "+(typeof (window[scrArgs[0]])));
    if(!!window[scrArgs[0]])
    {
      scr.nextScreen(window[scrArgs[0]], scrArgs[1]);
      return;
    }
    onCancel("timeout");
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  scr.setLabelJson({name:"title", value:"Вам потребуется<br>больше времени?"});
  scr.setLabelJson({name:"note", value:"Do you need<br>more time?"});
  scr.setButtonJson({name:"Btn5", text:"Да/Yes", visible:true, enable:true, ext:""}, onContinue);
  scr.setButtonJson({name:"Btn6", text:"Нет/No", visible:true, enable:true, ext:""}, onCancel);
  scr.render("menu");
  scr.setTimeout(timeoutValue2, "", onCancel);
};
menuMain = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onWithdrawal = function(name){
    m_session.serviceName = 'withdrawal';
    scr.nextScreen(showAdvertising);
  };
  var onWithdrawalError = function(name){
    scr.nextScreen(msgResult, ['cashout_err', 'end_menu_return']);
  };
  var onDepositError = function(name){
    scr.nextScreen(msgResult, ['cashin_err', 'end_menu_return']);
  };
  var onBalance = function(name){
    m_session.serviceName = 'balance';
    scr.nextScreen(chequeMenu);
  };
  var onDeposit = function(name){
    m_session.serviceName = 'deposit';
    //callSupport('cashin_open');
    //scr.nextScreen(depositWait);
    scr.nextScreen(showAdvertising);
  };
  var onPayments = function(name){
    m_session.serviceName = 'ekassir';
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait_ads', "IMG/PIC385(5).jpg"]);
    callSupport("ekassir_req");
  };
  var onPinchange = function(name){
    if(!m_session.ATMFunctions.printer)
    {
      scr.nextScreen(msgResult, ['cheque_err', 'end_menu_return_nopin']);
    }
    else
    {
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      callSupport("pinchange");
    }
  };
  var onPinunblock = function(name){
    if(!m_session.ATMFunctions.printer)
    {
      scr.nextScreen(msgResult, ['cheque_err', 'end_menu_return_nopin']);
    }
    else
    {
      m_session.serviceName = "pinunblock";
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      //callSupport("pinunblock");
      callSupport("chip_reinit");
    }
  };
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Выбор услуги');
  m_session.serviceName = '';
  m_session.schet = '';
  m_session.ATMFunctions = getATMFuncStatus();

  if(m_session.cardcurrency !== "")
    scr.setLabelJson({name:"title", value:getLangText("label_cardcurrency")});
  else
    scr.setLabelJson({name:"title", value:getLangText("to_select_a_service__please_press_the_button_as_appropriate")});

  scr.setButtonJson({name:"Btn5", text:getLangText("cash_withdrawal"), visible:true, enable:true, ext: m_session.ATMFunctions.dispenser ? "" : {"state":"disabled"}}, m_session.ATMFunctions.dispenser ? onWithdrawal : onWithdrawalError);
  if(m_session.cardtype === "othermaster"){
    scr.setButtonJson({name:"Btn3", text:getLangText("pin_change"), visible:true, enable:true, ext:""}, onPinchange);
    scr.setButtonJson({name:"Btn4", text:getLangText("pin_unblock"), visible:true, enable:true, ext:""}, onPinunblock);
  }
  if(m_session.cardtype !== "kbk")
    scr.setButtonJson({name:"Btn6", text:getLangText("balance_enquiry"), visible:true, enable:true, ext:""}, onBalance);
  m_session.cardtype = "kbk"
  if(m_session.cardtype === "owncard" || m_session.cardtype === "kbk")
    scr.setButtonJson({name:"Btn7", text:getLangText("cash_deposit"), visible:true, enable:true, ext:m_session.ATMFunctions.acceptor ? "" : {"state":"disabled"}}, m_session.ATMFunctions.acceptor ? onDeposit : onDepositError);

  if((m_session.cardtype === "owncard" || m_session.cardtype === "othermir" || m_session.cardtype === "kbk") && (m_session.cardcurrency === ""))
    scr.setButtonJson({name:"Btn8", text:getLangText("payments"), visible:true, enable:true, ext:""}, onPayments);

  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};
function onAdvMore (someArgs){
  alertMsgLog('[SCRIPT] '+scr.name+'. onAdvMore: ' + (!!someArgs ? someArgs : "null"));
  scr.nextScreen(showAdvFullInfo);
}
function onAdvFinish(someArgs){
  alertMsgLog('[SCRIPT] '+scr.name+'. onAdvFinish: ' + (!!someArgs ? someArgs : "null"));
  if(m_session.serviceName === "deposit"){
    callSupport('cashin_open');
    scr.nextScreen(depositWait);
  }
  else if(m_session.serviceName === "withdrawal"){
    if(m_session.cardtype !== "kbk") {
      m_session.withdrawal = {amount: 0};
      scr.nextScreen(withdrawalMenu);
    }
    else
      scr.nextScreen(withdrawalKBKAlert);
  }
}
var showAdvertising = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Отображения рекламного предложения и кнопки подробно');

  scr.setImageJson({name:"bg", src:"IMG/ADS/1.jpg"});
  scr.setButtonJson({name:"Btn4", text:getLangText("btn_boring"), visible:true, enable:true, ext:""}, onAdvFinish);
  scr.setButtonJson({name:"Btn8", text:getLangText("btn_interting"), visible:true, enable:true, ext:""}, onAdvMore);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);

  scr.render("show_advertising");
};
var showAdvFullInfo = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Отображения рекламного предложения и кнопки подробно');

  scr.setImageJson({name:"bg", src:"IMG/ADS/2.jpg"});
  scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:true, ext:""}, onAdvFinish);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);

  scr.render("show_advertising");
};
var withdrawalKBKAlert = function(){
  var onError =  function (){
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onWithdrawal = function(name){
    m_session.serviceName = 'withdrawal';
    m_session.withdrawal = {amount: 0};
    scr.nextScreen(withdrawalMenu);
    return;
  }
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Сообщение для снятия с карт КБК');

  scr.setButtonJson({name:"Btn4", text:getLangText("say_no"), visible:true, enable:true, ext:""}, onReturnToMenu);
  scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:true, ext:""}, onWithdrawal);
  scr.setButtonJson({name:"cancel", text:getLangText("say_no"), visible:false, enable:true, ext:""}, onReturnToMenu);
  scr.setTimeout(timeoutValue, "", onTimeout);

  scr.setLabelJson({name:"title", value:getLangText("please_note")});
  scr.setLabelJson({name:"message3", value:getLangText("a_fee_will_be_charged")});
  scr.setLabelJson({name:"message4", value:getLangText("according_to_the_bank_rates")});
  scr.render('message');
};
withdrawalMenu = function(){
  var onError =  function (){
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var onButtonSumm = function(name){
    alertMsgLog('screen: '+scr.name+', button: '+name);
    try{
      var btnIndex = parseInt(name[0].substr(3,1), 10);
      alertMsgLog(scr.name+'. btnIndex: ' + btnIndex);
      m_session.withdrawal = {amount: m_session.cashButtons[btnIndex-1].value};
      scr.nextScreen(withdrawalNom);
    }
    catch(e){
      alertMsgLog(scr.name+'. btnIndex not parsed');
      scr.nextScreen(withdrawalSummOther);
    }
  }
  var onButtonSummOther = function(name){
    m_session.withdrawal = {amount: 0};
    scr.nextScreen(withdrawalSummOther);
  }

  alertMsgLog(scr.name+'. Меню выдачи наличных');

  scr.setLabelJson({name:"title", value:getLangText("please_enter_amount_to_be_withdrawn")});


  var noFastCash = true;
  for(var i = 1; i <= m_session.cashButtons.length; i++)
    if(m_session.cashButtons[i-1].value != 0){
      var validAmount = 1;
      /*try{
        validAmount = window.external.wbCassetes.isAmountExist(m_session.cashButtons[i-1].value, m_session.currency);
      }
      catch(e){
        validAmount = 0;
      }
      if(validAmount == 1)
        noFastCash = false;*/
      scr.setButtonJson({name:"Btn"+i.toString(), text:m_session.cashButtons[i-1].text, visible:true, enable:(validAmount == 1 ? true : false), ext:""}, onButtonSumm);
    }
  /*if(noFastCash){
    scr.nextScreen(withdrawalSummOther);
    return;
  }*/

  scr.setButtonJson({name:"Btn8", text:getLangText("other_amount"), visible:true, enable:true, ext:""}, onButtonSummOther);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};
withdrawalSummOther = function(err){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var onContinue = function(name){
    var hintMsg = "";
    var validAmount = 1;
    if(typeof m_session.withdrawal.amount != 'number'){
      hintMsg = getLangText("incorrect_amount_value002");
      m_session.withdrawal.amount = 0;
    }
    else if(m_session.withdrawal.amount > 0)
    {
      if(m_session.withdrawal.amount > m_session.withdrawMax){
        hintMsg = "Превышена максимальная сумма в 1 000 000 ₽";
        m_session.withdrawal.amount = 0;
      } else if(m_session.withdrawal.amount % m_session.withdrawMin != 0){
        hintMsg = getLangText("the_amount_must_be_divisible_by")+m_session.withdrawMin+" ₽";
        m_session.withdrawal.amount = 0;
      }
      else {
        try{
          validAmount = window.external.wbCassetes.isAmountExist(m_session.withdrawal.amount, m_session.currency, false);
        }
        catch(e){
          validAmount = 1;
          alertMsgLog('validAmount exception. Can not check, '+m_session.withdrawal.amount.toString()+': '+validAmount);
        }
        alertMsgLog('valid '+m_session.withdrawal.amount.toString()+': '+validAmount);
        if(validAmount == 1){
          scr.nextScreen(withdrawalNom);
          return;
        }
        else{
          hintMsg = getLangText("atm_cannot_withdraw_this_amount");
          scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:false, ext:""}, onContinue);
          scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
          scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
        }
      }
    }
    else {
      hintMsg = getLangText("incorrect_amount_value002");
    }
    scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:false, ext:""}, onContinue);
    scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
    scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
    scr.setLabelJson({name:"comment", value:hintMsg});
    scr.setInputJson({name:"value", text: m_session.withdrawal.amount == 0 ? '0': m_session.withdrawal.amount.toString(), hint:'', type:"amount",min:m_session.withdrawMin, visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
    window.external.exchange.RefreshScr();
  }
  var onClear = function(name){
    m_session.withdrawal.amount = 0;
    scr.setLabelJson({name:"comment", value:""});
    scr.setInputJson({name:"value", text:"0", hint:"",min:m_session.withdrawMin, type:"amount", visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
    scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:false, ext:""}, onContinue);
    scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
    scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
    window.external.exchange.RefreshScr();
    return;
  }
  var onInput = function(args){
    var pKey = "", pValue = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        pValue = parseInt(args, 10);
      else {
        pKey = args[0];
        pValue = parseInt(args[1], 10);
      }
    }
    if(typeof pValue == 'number' && !isNaN(pValue))
      m_session.withdrawal.amount = pValue;
    else
      m_session.withdrawal.amount = 0;
    var hintMsg = "";
    if(m_session.withdrawal.amount > m_session.withdrawMax){
      hintMsg = getLangText("exceeded_the_threshold_amount_of")+m_session.withdrawMax+" ₽";
      m_session.withdrawal.amount = parseInt(m_session.withdrawal.amount / 10, 10);
    }


    if(m_session.withdrawal.amount < m_session.withdrawMin || window.external.wbCassetes.isAmountExist(m_session.withdrawal.amount,m_session.currency,false) === 0) {
      scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:false, ext:""}, onContinue);
      scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
      scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
    } else {
      scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:true, ext:""}, onContinue);
      scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:true, ext:""}, onContinue);
      scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:true, ext:""}, onContinue);
    }
    scr.setLabelJson({name:"comment", value:hintMsg});
    scr.setInputJson({name:"value", text:m_session.withdrawal.amount.toFixed(0).toString(), hint:"", type:"amount",min:m_session.withdrawMin, visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
    window.external.exchange.RefreshScr();
  }
  alertMsgLog(scr.name+'. Выбор услуги');

  if(typeof err != "undefined")
    scr.setLabelJson({name:"title", value:err});
  else
    scr.setLabelJson({name:"title", value:getLangText("please_enter_amount_in_rubles_to_be_withdrawn")});
  scr.setLabelJson({name:"note", value:getLangText("the_amount_must_be_divisible_by")+m_session.withdrawMin});
  scr.setInputJson({name:"value", text:"", hint:"", type:"amount",min:m_session.withdrawMin, visible:true, enable:true, validate:true, state:"", ext:""}, onInput);
  scr.setButtonJson({name:"Btn4", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onReturnToMenu);
  scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:false, ext:""}, onContinue);
  scr.setButtonJson({name:"Btn7", text:getLangText("edit"), visible:true, enable:true, ext:""}, onClear);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"continue", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
  scr.setButtonJson({name:"enter", text:getLangText("continue"), visible:false, enable:false, ext:""}, onContinue);
  scr.setButtonJson({name:"clear", text:getLangText("edit"), visible:false, enable:true, ext:""}, onClear);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("input_value");
};
withdrawalNom = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var onChange = function(name){
    m_session.withdrawal.nominal = 'change';
    scr.nextScreen(chequeMenu);
  }
  var onBig = function(name){
    m_session.withdrawal.nominal = 'big';
    scr.nextScreen(chequeMenu);
  }
  var onSmall = function(name){
    m_session.withdrawal.nominal = 'small';
    scr.nextScreen(chequeMenu);
  }

  alertMsgLog(scr.name+'. Выбор услуги');

  scr.setLabelJson({name:"title", value:getLangText("please_select_cash_denominations")});
  scr.setButtonJson({name:"Btn5", text:getLangText("in_various_bills"), visible:true, enable:true, ext:""}, onChange);
  scr.setButtonJson({name:"Btn6", text:getLangText("in_large_bills"), visible:true, enable:true, ext:""}, onBig);
  scr.setButtonJson({name:"Btn7", text:getLangText("in_small_bills"), visible:true, enable:true, ext:""}, onSmall);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};
withdrawalCommAlert = function(limit_amnt){
  var onError =  function (){
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onWithdrawal = function(name){
    m_session.receipt = "commalert";
    scr.nextScreen(request, "IMG/PIC385(3).jpg");
    return;
  }
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Сообщение для снятия суммы, превышающей безкомиссионный лимит');

  scr.setButtonJson({name:"Btn4", text:getLangText("say_no"), visible:true, enable:true, ext:""}, onReturnToMenu);
  scr.setButtonJson({name:"Btn8", text:getLangText("continue"), visible:true, enable:true, ext:""}, onWithdrawal);
  scr.setButtonJson({name:"cancel", text:getLangText("say_no"), visible:false, enable:true, ext:""}, onReturnToMenu);
  scr.setTimeout(timeoutValue, "", onTimeout);

  scr.setLabelJson({name:"title", value:getLangText("please_note")});
  if(typeof limit_amnt !== "undefined") {
    scr.setLabelJson({name:"message3", value:getLangText("availiable_amount")+"<strong style='color: red;'>"+limit_amnt+" ₽</strong><br/>"+getLangText("a_fee_will_be_charged_if_more")});
    scr.setLabelJson({name:"message4", value:getLangText("according_to_the_bank_rates_if_more")});
  } else {
    scr.setLabelJson({name:"message3", value:getLangText("a_fee_will_be_charged_if_more2")});
    scr.setLabelJson({name:"message4", value:getLangText("according_to_the_bank_rates_if_more2")});
  }
  scr.render('message');
};

depositWait = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Обращения к Купюроприемнику');

  m_session.cashin = {step:'wait'};
  scr.setImageJson({name:"bg", src:"IMG/PIC385(2).jpg"});
  // scr.setLabelJson({name:"title", value:getLangText("accessing_bill_acceptor___")});

  scr.render("show_advertising");
  //setTimeout('scr.nextScreen(depositInsert)', 3000);
};
depositInsert = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var onCancel = function(name){
    //scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:false, ext:""}, onCancel);
    //scr.setButtonJson({name:"Btn8", text:getLangText("cancel001"), visible:true, enable:false, ext:""}, onCancel);
    //window.external.exchange.RefreshScr();
    scr.nextScreen(depositWait);
    callSupport('money_insert_return');
  }

  m_session.cashin = {step:'insert'};
  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Инициализации Купюроприемника');
  scr.setLabelJson({name:"title", value:getLangText("atm_can_take_in_no_more_than_50_bills_per_transaction_with_denomination_of")});
  //scr.setLabelJson({name:"title", value:getLangText("no_more_than_50_bills")});
  scr.setLabelJson({name:"notes_list_1", value:"50 ₽"});
  scr.setLabelJson({name:"notes_list_2", value:"100 ₽"});
  scr.setLabelJson({name:"notes_list_3", value:"200 ₽"});
  scr.setLabelJson({name:"notes_list_4", value:"500 ₽"});
  scr.setLabelJson({name:"notes_list_5", value:"1000 ₽"});
  scr.setLabelJson({name:"notes_list_6", value:"2000 ₽"});
  scr.setLabelJson({name:"notes_list_7", value:"5000 ₽"});
  scr.setLabelJson({name:"comment", value:getLangText("atm_cannot_accept_crumpled__tornor_wet_bills__please_make_sure_there_are_no_foreign_items_between_the_bills_")});
  scr.setLabelJson({name:"head", value:getLangText("please_take_note__money_will_be_credited_to_the_account_no_later_than_the_next_business_day_")});
  //scr.setLabelJson({name:"message2", value:""});

  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"Btn8", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("bna_info");
};
depositCount = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Инициализации Купюроприемника');
  m_session.cashin = {step:'count'};
  scr.setLabelJson({name:"title", value:getLangText("checking_contents_of_the_bill_acceptor_")});
  scr.setLabelJson({name:"note", value:getLangText("bills_are_being_recognized_")});

  //scr.setButtonJson({name:"continue", text:getLangText("press"), visible:true, enable:true, ext:""}, onCall);

  scr.render("wait");
};
depositReturn = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Инициализации Купюроприемника');
  m_session.cashin = {step:'return'};
  scr.setLabelJson({name:"title", value:getLangText("please_take_rejected_bills")});

  //scr.setButtonJson({name:"continue", text:getLangText("press"), visible:true, enable:true, ext:""}, onCall);

  scr.render("wait");
  setTimeout('scr.nextScreen(depositMenu)', 3000);
};
depositMenu = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var onAccept = function(name){
    //scr.nextScreen(chequeMenu);
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    callSupport('money_insert_accept');
  }
  var onAdd = function(name){
    scr.nextScreen(depositWait);
    callSupport('money_insert_add');
  }
  var onReturn = function(name){
    scr.nextScreen(depositWait);
    callSupport('money_insert_return');
  }

  m_session.cashin = {step:'menu'};
  var notesAccepted = [];
  var amntAccepted = 0;
  try {
    notesAccepted = JSON.parse('['+window.external.exchange.getAllAcceptedNotes(m_session.currency)+']');
  }
  catch(e){
    alertMsgLog('[notesAccepted]: Exception');
    notesAccepted = [];
  }
  for(var i = 0; i < notesAccepted.length; i++)
    if(notesAccepted[i].quantity > 0)
      amntAccepted += parseInt(notesAccepted[i].quantity, 10) * parseInt(notesAccepted[i].value, 10);
  alertMsgLog('[notesAccepted]: '+notesAccepted);
  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Инициализации Купюроприемника');
  scr.setLabelJson({name:"title", value:getLangText("your_money_has_been_checked")});
  if(amntAccepted != 0){
    scr.setLabelJson({name:"note1", value:getLangText("deposited:") + amntAccepted.toFixed(0).toString() + " ₽"});
    if (m_session.serviceName === "credit")
      m_session.creditAmount = amntAccepted.toFixed(0);
    m_session.amount = (amntAccepted*100).toFixed(0);
  }
  scr.setLabelJson({name:"head", value:getLangText("please_take_note__money_will_be_credited_to_the_account_no_later_than_the_next_business_day_")});

  scr.setButtonJson({name:"Btn6", text:getLangText("confirm___deposit"), visible:true, enable:true, ext:""}, onAccept);
  var allowAdd = true;
  if(!!type)
    allowAdd = false;
  scr.setButtonJson({name:"Btn7", text:getLangText("deposit_more"), visible:true, enable:allowAdd, ext:""}, onAdd);
  scr.setButtonJson({name:"Btn8", text:getLangText("return___cancel"), visible:true, enable:true, ext:""}, onReturn);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel"), visible:false, enable:true, ext:""}, onReturn);
  scr.setTimeout(timeoutValue, "", onAccept);
  scr.render("menu2");
};

inkassMenu = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onPrint = function(name){
    m_session.serviceName = 'inkass';
    m_session.receipt = 'print';
    scr.nextScreen(request);
  }
  var onBalance = function(name){
    m_session.serviceName = 'inkass';
    m_session.receipt = 'balance';
    scr.nextScreen(request);
  }

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  alertMsgLog(scr.name+'. Выбор услуги инкассации');

  scr.setLabelJson({name:"title", value:getLangText("welcome")});
  scr.setLabelJson({name:"note", value:getLangText("to_the_cash_collection_main_menu")});
  scr.setButtonJson({name:"Btn5", text:getLangText("print_out_counters"), visible:true, enable:true, ext:""}, onPrint);
  scr.setButtonJson({name:"Btn6", text:getLangText("autobalance"), visible:true, enable:true, ext:""}, onBalance);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu2");
};
inkassAsk = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onReturnToInkass = function(name){
    scr.nextScreen(inkassMenu);
  }

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Выбор продолжения инкассации');

  scr.setLabelJson({name:"title", value:getLangText("administrative_function_completed")});
  scr.setLabelJson({name:"note", value:getLangText("shall_we_proceed_")});
  scr.setLabelJson({name:"note1", value:""});
  scr.setLabelJson({name:"note2", value:""});

  scr.setButtonJson({name:"Btn6", text:getLangText("yes"), visible:true, enable:true, ext:""}, onReturnToInkass);
  scr.setButtonJson({name:"Btn7", text:getLangText("no"), visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu2");
};

chequeMenu = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  if(!m_session.ATMFunctions.printer)
  {
    scr.nextScreen(chequeMenuAskWithoutCheque);
    return;
  }

  var onWith = function(name){
    m_session.receipt = 'withcheque';
    if(m_session.cardtype !== "owncard" && m_session.cardtype !== "kbk" && m_session.cardtype !== "business")
      scr.nextScreen(schetMenu);
    else
      scr.nextScreen(request, "IMG/PIC385(4).jpg");
  };
  var onWithout = function(name){
    m_session.receipt = 'withoutcheque';
    if(m_session.cardtype !== "owncard" && m_session.cardtype !== "kbk" && m_session.cardtype !== "business")
      scr.nextScreen(schetMenu);
    else
      scr.nextScreen(request, "IMG/PIC385(4).jpg");
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  alertMsgLog(scr.name+'. С чеком или без');

  var txtTitle, txtBtnCheque, txtBtnScreen;
  if(m_session.serviceName === 'balance') {
    txtTitle = getLangText("which_way_do_you_prefer_to_see_the_balance_");
    txtBtnCheque = getLangText("on_an_atm_slip");
    txtBtnScreen = getLangText("on_the_screen");
  }
  else {
    txtTitle = getLangText("do_you_want_to_have_the_transaction_slip_printed_");
    txtBtnCheque = getLangText("yes");
    txtBtnScreen = getLangText("no");
  }
  scr.setLabelJson({name:"title", value:txtTitle});
  scr.setLabelJson({name:"note", value:""});
  scr.setButtonJson({name:"Btn6", text:txtBtnCheque, visible:true, enable:true, ext:""}, onWith);
  scr.setButtonJson({name:"Btn7", text:txtBtnScreen, visible:true, enable:true, ext:""}, onWithout);
  scr.setButtonJson({name:"Btn8", text:getLangText("send_it_to_email"), visible:true, enable:false, ext:""}, onWithout);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};
chequeMenuAskWithoutCheque = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onWithout = function(name){
    m_session.receipt = 'withoutcheque';
    if(m_session.serviceName === 'ekassir') {
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      callSupport('withoutcheque');
      return;
    } else if(m_session.serviceName === 'pre_ekass_cash_authorization' ||
      m_session.serviceName === 'pre_ekass_cred_authorization') {
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
      callSupport(m_session.serviceName);

      //scr.nextScreen(credMenu);
      return;
    }
    if(m_session.cardtype !== "owncard" && m_session.cardtype !== "kbk" && m_session.cardtype !== "business")
      scr.nextScreen(schetMenu);
    else
      scr.nextScreen(request);
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  alertMsgLog(scr.name+'. С чеком или без');

  txtTitle = getLangText("atm_slip_printer_is_faulty");
  txtNote = getLangText("shall_we_proceed_without_printing_a_slip_");
  txtBtnScreen = getLangText("yes");
  txtBtnCancel = getLangText("no");

  scr.setLabelJson({name:"title", value:txtTitle});
  scr.setLabelJson({name:"note", value:txtNote});
  scr.setButtonJson({name:"Btn7", text:txtBtnScreen, visible:true, enable:true, ext:""}, onWithout);
  scr.setButtonJson({name:"Btn8", text:txtBtnCancel, visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};
schetMenu = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onChecking = function(name){
    alertMsgLog(scr.name+'. onButton: ' + name);
    m_session.schet = 'checking';
    scr.nextScreen(request);
  };
  var onSaving = function(name){
    alertMsgLog(scr.name+'. onButton: ' + name);
    m_session.schet = 'saving';
    scr.nextScreen(request);
  };
  var onCredit = function(name){
    alertMsgLog(scr.name+'. onButton: ' + name);
    m_session.schet = 'credit';
    scr.nextScreen(request);
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  alertMsgLog(scr.name+'. Выбор счета');

  scr.setLabelJson({name:"title", value:getLangText("please_choose_account_type")});
  scr.setLabelJson({name:"note", value:""});
  scr.setButtonJson({name:"Btn5", text:getLangText("current"), visible:true, enable:true, ext:""}, onChecking);
  scr.setButtonJson({name:"Btn6", text:getLangText("saving"), visible:true, enable:true, ext:""}, onSaving);
  scr.setButtonJson({name:"Btn7", text:getLangText("credit"), visible:true, enable:true, ext:""}, onCredit);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};

request = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  function getTypeAndMessage(text){
    if(typeof text != 'undefined' && text.constructor === Array && text.length > 0){
      img = text[0];
    }
    else
      img = text;
  }
  var img;
  getTypeAndMessage(args);
  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Запроса');
  if (!img) {
    scr.setLabelJson({name:"title", value:getLangText("transaction_is_in_progress")});
    scr.render("wait");
  }
  else{
    scr.setImageJson({name:"bg", src:img});
    scr.render("show_advertising");
  }

  m_session.isCard = true;
  if(m_session.serviceName == 'withdrawal'){
    //var help = JSON.stringify({amount:m_session.withdrawal.amount});
    if(!!m_session.withdrawal.nominal){
      callSupport(m_session.serviceName + ('&nominal=' + m_session.withdrawal.nominal) + ('&receipt=' + m_session.receipt) + '&amount='+m_session.withdrawal.amount + (m_session.schet == '' ? '' : ('&schet='+m_session.schet)));
    } else {
      callSupport(m_session.serviceName + ('&nominal=' + 'change') + ('&receipt=' + m_session.receipt) + '&amount='+m_session.withdrawal.amount + (m_session.schet == '' ? '' : ('&schet='+m_session.schet)));
    }
  } else if(m_session.serviceName == 'authorization'){
    callSupport(m_session.serviceName + (m_session.schet == '' ? '' : ('&schet='+m_session.schet)));
  } else if(m_session.serviceName == 'inkass'){
    callSupport(m_session.serviceName + '_' + m_session.receipt);
  } else if(m_session.serviceName == 'credit'){
    callSupport(m_session.serviceName + ('&acc_num=' + m_session.acc_number)+ '&amount='+m_session.creditAmount);
  } else {
    callSupport(m_session.serviceName + ('&receipt=' + m_session.receipt) + (m_session.schet == '' ? '' : ('&schet='+m_session.schet)));
  }
  //setTimeout('scr.nextScreen(continueAsk)', 3000);
};
continueAsk = function(returnTo){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Выбор услуги');
  if(m_session.serviceName === 'balance' && m_session.receipt === 'withoutcheque'){
    scr.setLabelJson({name:"title", value:getLangText("available_balance")});
    scr.setLabelJson({name:"note", value:""});
    scr.setLabelJson({name:"note1", value:m_session.balance});
    scr.setLabelJson({name:"note2", value:getLangText("do_you_wish_to_proceed_")});
  } else if(m_session.serviceName == 'inkass') {
    scr.setLabelJson({name:"title", value:getLangText("administrative_function_completed")});
    scr.setLabelJson({name:"note", value:getLangText("shall_we_proceed_")});
    scr.setLabelJson({name:"note1", value:""});
    scr.setLabelJson({name:"note2", value:""});
  } else {
    scr.setLabelJson({name:"title", value:""});
    scr.setLabelJson({name:"note", value:getLangText("do_you_want_to_proceed_")});
    scr.setLabelJson({name:"note1", value:""});
    scr.setLabelJson({name:"note2", value:""});
  }
  if(returnTo === "reinit")
    scr.setButtonJson({name:"Btn6", text:getLangText("yes"), visible:true, enable:true, ext:""}, onStart);
  else
    scr.setButtonJson({name:"Btn6", text:getLangText("yes"), visible:true, enable:true, ext:""}, onReturnToPin);
  scr.setButtonJson({name:"Btn7", text:getLangText("no"), visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu2");
};
msgResult = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  function getTypeAndMessage(text){
    if(typeof text != 'undefined' && text.constructor === Array && text.length > 0){
      message = text[0];
      if(text.length > 1)
        type = text[1];
      if (text.length > 2)
        img = text[2];
    }
    else
      message = text;
  }
  var message, message1, message2, type, title, img;
  getTypeAndMessage(args);

  if(!!type){
    switch(type){
      case 'end_err': {
        title = '', message1 = '', message2 = '';
        if(message == 'wait_card_captured') {
          title = getLangText("your_card_is_retained");
          message1 = getLangText("please_contact_your_bank");
        } else if(message == 'card_return_print') {
          title = getLangText("thank_you_");
          message1 = getLangText("please_take_your_card_and_transaction_slip");
          message2 = getLangText("see_you_later_");
        } else if(message == 'wait_cheque') {
          title = getLangText("thank_you_");
          message1 = getLangText("please_take_your_transaction_slip");
        } else if(message == 'wait_card_error') {
          title = getLangText("transaction_cancelled");
          message1 = getLangText("card_read_error");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'error') {
          title = getLangText("transaction_completed");
          message1 = getLangText("operation_error");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'cancel') {
          title = ' ';
          message1 = getLangText("transaction_completed");
          //message1 = ' ';
          if(m_session.isCard)
            message2 = getLangText("please_make_sure_you_take_your_card");
          //message2 = ' ';
          else
            //message2 = getLangText("see_you_later_");
            message2 = '';
        } else if(message == 'wait_chip_hard_err') {
          title = getLangText("transaction_completed");
          message1 = getLangText("card_read_error");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_chip_app_err'){
          title = getLangText("transaction_completed");
          message1 = getLangText("cannot_select_payment_application");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_chip_work_err'){
          title = getLangText("transaction_completed");
          message1 = getLangText("chip_error");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_card_not_smart'){
          title = getLangText("transaction_completed");
          message1 = getLangText("card_has_no_chip");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_no_suit_applic'){
          title = getLangText("transaction_completed");
          message1 = getLangText("there_is_no_eligible_payment_application_on_the_card");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_proc_not_perf'){
          title = getLangText("transaction_completed");
          message1 = getLangText("payment_application_error");
          message2 = getLangText("please_take_your_card003");
        } else if(message == 'wait_read_error'){
          title = getLangText("card_read_error");
          message1 = getLangText('atm_cannot_read_your_card_check_if_the_card_is_inserted_correctly_remove_and_insert_the_card_once_again');
          message2 = '';
        } else if(message == 'request_inkass_service'){
          title = getLangText("attention_");
          message1 = getLangText("atm_turn_oos");
          message2 = getLangText("close_bank");
        } else if(message == 'session_end_card_captured'){
          title = getLangText("operation_is_not_completed_");
          message1 = getLangText("your_card_is_retained");
          message2 = getLangText("please_contact_your_bank");
        } else
          message = getLangText("operation_error");
        if(message1 == '' && message2 == '' && title == ''){
          scr.setLabelJson({name:"title", value:message});
          scr.render('wait');
        } else {
          scr.setLabelJson({name:"title", value:title});
          scr.setLabelJson({name:"message1", value:message1});
          scr.setLabelJson({name:"message2", value:message2});
          scr.render('message');
        }
        alertMsgLog(scr.name+' type end_err, message: ' + message + '. done');
        return;
      }
      case 'end': {
        var textValue;
        if(!message)
          textValue = getLangText("transaction_completed");
        else
          textValue = getLangText(message);

        scr.setLabelJson({name:"title", value:textValue});
        scr.render('wait');
        alertMsgLog(scr.name+' type end, message: ' + message + '. done');
        return;
      }
      case 'end_menu_return_nopin': {
        title = '', message1 = '', message2 = '';
        if(message == 'cashin_err') {
          title = getLangText("cash_in_function_is_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("choose_next_action");
        } else if(message == 'cashout_err') {
          title = getLangText("cash_withdrawal_is_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("choose_next_action");
        } else if(message == 'cheque_err') {
          title = getLangText("transaction_is_currently_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("atm_slip_printer_is_faulty");
        } else if(!message)
          message = getLangText("choose_next_action");

        scr.setButtonJson({name:"Btn7", text:getLangText("continue"), visible:true, enable:true, ext:""}, onReturnToMenu);
        scr.setButtonJson({name:"Btn8", text:getLangText("complete"), visible:true, enable:true, ext:""}, onCancel);
        scr.setButtonJson({name:"cancel", text:getLangText("complete"), visible:false, enable:true, ext:""}, onCancel);
        scr.setTimeout(timeoutValue, "", onTimeout);

        if(message1 == '' && message2 == '' && title == ''){
          scr.setLabelJson({name:"title", value:message});
          scr.render('menu');
        } else {
          scr.setLabelJson({name:"title", value:title});
          scr.setLabelJson({name:"message1", value:message1});
          scr.setLabelJson({name:"message2", value:message2});
          scr.render('message');
        }
        alertMsgLog(scr.name+' type end_menu_return, message: ' + message + '. done');
        return;
      }
      case 'wait_ads':
        alertMsgLog(scr.name+' type unknown, message: ' + (!!message ? message : '""'));
        if (!img)
          scr.setImageJson({name:"bg", src:"IMG/PIC385.jpg"});
        else
          scr.setImageJson({name:"bg", src:img});
        scr.render('show_advertising');
        alertMsgLog(scr.name+' type unknown, message: ' + message + '. done');
        return;
      case 'end_menu_return': {
        title = '', message1 = '', message2 = '';
        if(message == 'cashin_err') {
          title = getLangText("cash_in_function_is_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("choose_next_action");
        } else if(message == 'cashout_err') {
          title = getLangText("cash_withdrawal_is_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("choose_next_action");
        } else if(message == 'cheque_err') {
          title = getLangText("transaction_is_currently_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("atm_slip_printer_is_faulty");
        } else if(!message)
          message = getLangText("choose_next_action");

        scr.setButtonJson({name:"Btn7", text:getLangText("continue"), visible:true, enable:true, ext:""}, onReturnToPin);
        scr.setButtonJson({name:"Btn8", text:getLangText("complete"), visible:true, enable:true, ext:""}, onCancel);
        scr.setButtonJson({name:"cancel", text:getLangText("complete"), visible:false, enable:true, ext:""}, onCancel);
        scr.setTimeout(timeoutValue, "", onTimeout);

        if(message1 == '' && message2 == '' && title == ''){
          scr.setLabelJson({name:"title", value:message});
          scr.render('menu');
        } else {
          scr.setLabelJson({name:"title", value:title});
          scr.setLabelJson({name:"message1", value:message1});
          scr.setLabelJson({name:"message2", value:message2});
          scr.render('message');
        }
        alertMsgLog(scr.name+' type end_menu_return, message: ' + message + '. done');
        return;
      }
      case 'end_menu_cancel': {
        title = '', message1 = '', message2 = '';
        if(message == 'request_err_invalid_card') {
          title = getLangText("card_is_invalid");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("please_take_your_card_and_transaction_slip");
        }
        else if(message == 'payment_cashin_err') {
          title = getLangText("transaction_is_unavailable");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("bill_acceptor_is_inoperable");
        }
        else if(message == 'request_err_nocheque') {
          title = getLangText("operation_is_not_completed_");
          message1 = getLangText("sorry_for_the_inconvenience_");
          message2 = getLangText("atm_slip_printer_is_unavailable");
        }
        else if(!message)
          message = getLangText("request_failed");

        scr.setButtonJson({name:"Btn8", text:getLangText("complete"), visible:true, enable:true, ext:""}, onCancel);
        scr.setButtonJson({name:"cancel", text:getLangText("complete"), visible:false, enable:true, ext:""}, onCancel);
        scr.setTimeout(timeoutValue, "", onTimeout);

        if(message1 == '' && message2 == '' && title == ''){
          if(getLangText(message) !== message)
            message = getLangText(message);
          scr.setLabelJson({name:"title", value:message});
          scr.render('menu');
        }
        else {
          scr.setLabelJson({name:"title", value:title});
          scr.setLabelJson({name:"message1", value:message1});
          scr.setLabelJson({name:"message2", value:message2});
          scr.render('message');
        }
        alertMsgLog(scr.name+' type end_menu_return, message: ' + message + '. done');
        return;
      }
      case 'end_menu_ask': {
        if(message == 'request_err_invalid_acct') {
          scr.setLabelJson({name:"title", value:getLangText("you_have_selectedan_invalid_accountor_unavailable_transaction")});
          scr.setLabelJson({name:"note", value:getLangText("do_you_wish_to_proceed_")});
          scr.setLabelJson({name:"note1", value:""});
          scr.setLabelJson({name:"note2", value:""});
        } else if(message == 'request_err_uses_limit') {
          scr.setLabelJson({name:"title", value:getLangText("you_have_exceededthe_withdrawal_limit")});
          scr.setLabelJson({name:"note", value:getLangText("do_you_wish_to_proceed_")});
          scr.setLabelJson({name:"note1", value:""});
          scr.setLabelJson({name:"note2", value:""});
        } else if(message == 'request_err_insuff_funds') {
          scr.setLabelJson({name:"title", value:getLangText("funds_on_your_accountare_not_sufficientto_complete_the_transaction")});
          scr.setLabelJson({name:"note", value:getLangText("do_you_wish_to_proceed_")});
          scr.setLabelJson({name:"note1", value:""});
          scr.setLabelJson({name:"note2", value:""});
        } else if(message == 'request_err_amnt_cant_dispence') {
          scr.setLabelJson({name:"title", value:getLangText("request_err_amnt_cant_dispence")});
          scr.setLabelJson({name:"note", value:getLangText("do_you_wish_to_proceed_")});
          scr.setLabelJson({name:"note1", value:""});
          scr.setLabelJson({name:"note2", value:""});
        }
        scr.setButtonJson({name:"Btn6", text:getLangText("yes"), visible:true, enable:true, ext:""}, onReturnToPin);
        scr.setButtonJson({name:"Btn7", text:getLangText("no"), visible:true, enable:true, ext:""}, onCancel);
        scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:false, enable:true, ext:""}, onCancel);
        scr.setTimeout(timeoutValue, "", onTimeout);
        scr.render("menu2");
        return;
      }
      case "wait_static": {
        alertMsgLog(scr.name+' type wait_static, message: ' + (!!message ? message : '""'));
        if(!message)
          scr.setImageJson({name:"bg", src:"IMG/PIC390.jpg"});
        else
          scr.setLabelJson({name:"title", value:message});
        scr.render('wait_static');
        alertMsgLog(scr.name+' type unknown, message: ' + message + '. done');
        return;
      }
      default: {
        alertMsgLog(scr.name+' type unknown, message: ' + (!!message ? message : '""'));
        if(!message)
          //message = getLangText("please_wait___");
          scr.setImageJson({name:"bg", src:"IMG/PIC390.jpg"});
        else
          scr.setLabelJson({name:"title", value:message});
        scr.render('wait');
        alertMsgLog(scr.name+' type unknown, message: ' + message + '. done');
        return;
      }
    }
  }
  else{
    if(!message)
      message = getLangText("please_wait___");

    scr.setLabelJson({name:"title", value:message});
    scr.render('wait');
    alertMsgLog(scr.name+' type undefined, message: ' + message + '. done');
    return;
  }
};
msg_err = function(msg){
  scr.addCall('TellMEWrapper', onTellMEWrapper);


  if(!msg)
    msg = getLangText("an_error_was_detected_during_system_operation");
  scr.setLabelJson({name:"title", value:msg});
  scr.render('wait');
  alertMsgLog(scr.name+' type msg_err, message: ' + msg + '. done');
};


kupiNeKopiType = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onNumber = function(name){
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait_static']);
    callSupport(m_session.serviceName);
  };
  var onBarcode = function(name){
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait_static']);
    callSupport('kupiNeKopiBarcode');
  };
  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Тип ввода номера договора');

  scr.setLabelJson({name:"title", value:getLangText("please_select_one_of_the_items")});
  scr.setLabelJson({name:"note", value:""});
  scr.setButtonJson({name:"Btn6", text:getLangText("loan_repayment_by_contract_number"), visible:true, enable:true, ext:""}, onNumber);
  scr.setButtonJson({name:"Btn7", text:getLangText("loan_repayment_by_barcode"), visible:true, enable:true, ext:""}, onBarcode);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};

menuMainCash = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);


  var onTestFreeze = function(name){
    window.external.exchange.setMemory("testInfoAboutClient", '{"clientId": "50005832"}');
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    setTimeout(function(){callSupport("test_freeze");}, 1000);
  };
  var onPayments = function(name){
    if(!m_session.ATMFunctions.printer)
    {
      callSupport("cancel_err_nocheque");
      return;
    }
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    m_session.serviceName = "pre_ekass_cash_authorization";
    //callSupport("ekassir_req");
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    callSupport(m_session.serviceName);
  };
  var onPayCredit = function(name){
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    m_session.serviceName = "pre_ekass_cred_authorization";
    if(!m_session.ATMFunctions.printer)
    {
      scr.nextScreen(chequeMenuAskWithoutCheque);
      return;
    }
    scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    callSupport(m_session.serviceName);

    //scr.nextScreen(credMenu);
  };
  var onPayKupiKopi = function(name){
    m_session.serviceName = "kupiNeKopi";
    //window.external.exchange.setMemory("session", JSON.stringify(m_session));
    //scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait']);
    //callSupport(m_session.serviceName);
    if(!m_session.ATMFunctions.printer)
      callSupport("cancel_err_nocheque");
    else
      scr.nextScreen(kupiNeKopiType);
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Выбор услуги');
  m_session.serviceName = '';
  m_session.isCard = false;
  m_session.ATMFunctions = getATMFuncStatus();

  //scr.setImageJson({name:"bg", src:"IMG/MAIN_MENU.jpg"});
  scr.setLabelJson({name:"title", value:getLangText("to_select_a_service__please_press_the_button_as_appropriate")});
  scr.setLabelJson({name:"note", value:getLangText("payment_in_cash")});
  scr.setButtonJson({name:"Btn6", text:getLangText("loan_repayment"), visible:true, enable:true, ext:""}, onPayCredit);
  scr.setButtonJson({name:"Btn7", text:getLangText("kupi_ne_kopi_llc_loan_repayment"), visible:true, enable:true, ext:""}, onPayKupiKopi);
  scr.setButtonJson({name:"Btn8", text:getLangText("payment_for_services"), visible:true, enable:true, ext:""}, onPayments);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("menu");
};

credMenu = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onContinue = function(){
    if (m_session.CredType === valuesChoose[0])
      scr.nextScreen(credInput);
    else if (m_session.CredType === valuesChoose[2]) {
      m_session.cred_type = "passport";
      scr.nextScreen(credInput);
    }
    else if (m_session.CredType === valuesChoose[1]) {
      window.external.exchange.setMemory("session", JSON.stringify(m_session));
      scr.nextScreen(msgResult, [getLangText("transaction_is_in_progress"), 'wait_static']);
      callSupport('credit_barcode');
    }
  };

  var onInput = function(args){
    var pValue = '';
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        pValue = args;
      else {
        pValue = args[1];
      }
    }
    m_session.CredType = pValue;
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Тип оплаты кредита');
  var valuesChoose = [
    getLangText('credType1'),
    getLangText('credType2'),
    getLangText('credType3')
  ];
  m_session.CredType = valuesChoose[0];
  m_session.serviceName = "credit";
  scr.setInputJson({name:"pay", visible:true, enable:true, text:"", type:"lst", state:0,
    ext: {value:valuesChoose}}, onInput);

  //scr.setImageJson({name:"bg", src:"IMG/MAIN_MENU.jpg"});
  // scr.setLabelJson({name:"title", value:getLangText("acc_number")});
  // scr.setLabelJson({name:"note", value:getLangText("payment_in_cash")});
  scr.setButtonJson({name:"Btn4", text:getLangText("back_btn"), visible:true, enable:true, ext:""}, onCancel);
  scr.setButtonJson({name:"Btn8", text:getLangText("next"), visible:true, enable:true, ext:""}, onContinue);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("list");
};
credInput = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onContinue = function(){
    // if (!!m_session.acc_number && m_session.acc_number.length === 10){
    scr.nextScreen(credWait);
    // }

  };
  var onBack = function(){
    // if (!!m_session.acc_number && m_session.acc_number.length === 10){
    scr.nextScreen(credMenu);
    // }

  };

  var onInput = function(args){
    var pValue = '';
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        pValue = args;
      else {
        pValue = args[1];
      }
    }
    m_session.acc_number = pValue;
  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Тип оплаты кредита');
  scr.setInputJson({name:"value", visible:true, enable:true, text:"", type:"number"} , onInput);

  //scr.setImageJson({name:"bg", src:"IMG/MAIN_MENU.jpg"});
  if (m_session.cred_type === "passport")
    scr.setLabelJson({name:"title", value:getLangText("acc_number")});
  else
    scr.setLabelJson({name:"title", value:getLangText("pass_number")});
  scr.setButtonJson({name:"Btn4", text:getLangText("back_btn"), visible:true, enable:true, ext:""}, onBack);
  scr.setButtonJson({name:"Btn8", text:getLangText("next"), visible:true, enable:true, ext:""}, onContinue);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("input_with_keyboard");
};
credWait = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall('TellMEWrapper', onTellMEWrapper);
  var data = "";
  function getFio(id){
    var tmp = window.external.PluginLoaderAsync.CallPluginAsync("HomeCreditWebIUSPlugin", "GetFullNameByUserId", "https://osb-srv-rp.test.homecredit.ru:20443/ConsumerSystem/HCFB/PaymentHub/Product/ProxyService/CrossSaleWSProxy", "osbru_for_paymenthub", "osbru_for_paymenthub", "20000", id);
    var counter = 1;
    var data = "";
    var _interval1 = setInterval(function(){
      counter += 1
      data = window.external.exchange.getMemory(tmp);
      if (data !== ""){
        data = JSON.parse(data);
        m_session.cred_fio = data.FirstName + " " + data.LastName + " " + data.Patronymic;
        scr.nextScreen(credInfo);
        clearInterval(_interval1)
      }
      if (counter > 30){
        callSupport('cancel_err_nocheque')
        clearInterval(_interval)
      }
    },1000)
  }
  var tmp;
  if (!!m_session.cred_type && m_session.cred_type === "passport"){
    tmp = window.external.PluginLoaderAsync.CallPluginAsync("HomeCreditWebIUSPlugin", "GetCreditsByPassport", "https://osb-srv-rp.test.homecredit.ru:20443/ConsumerSystem/HCFB/PaymentHub/Credit/ProxyService/CreditWSProxy", "osbru_for_paymenthub", "osbru_for_paymenthub", "20000", "2800", m_session.acc_number.toString());
  }
  else
    tmp = window.external.PluginLoaderAsync.CallPluginAsync("HomeCreditWebIUSPlugin", "GetCreditsByContract", "https://osb-srv-rp.test.homecredit.ru:20443/ConsumerSystem/HCFB/PaymentHub/Credit/ProxyService/CreditWSProxy", "osbru_for_paymenthub", "osbru_for_paymenthub", "20000", m_session.acc_number.toString());
  var counter = 1;
  var _interval = setInterval(function(){
    counter += 1
    data = window.external.exchange.getMemory(tmp);
    alert(data)
    if (data !== ""){
      data = JSON.parse(data);
      if (!!data.Body.getCreditsByPassportResponse || data.Body.getCreditsByContractResponse) {
        if (!!m_session.cred_type && m_session.cred_type === "passport" && !!data.Body.getCreditsByPassportResponse) {
          m_session.cred_data = data.Body.getCreditsByPassportResponse.creditList.creditList1;
          m_session.cred_scet = data.Body.getCreditsByPassportResponse.creditList.creditList1.accountNumber.accountNumber
          m_session.cred_cuid = data.Body.getCreditsByPassportResponse.CUID;
          m_session.acc_number = m_session.cred_data.contractNumber;
        } else {
          m_session.cred_data = data.Body.getCreditsByContractResponse.creditList.creditList1;
          m_session.cred_scet = data.Body.getCreditsByContractResponse.creditList.creditList1.accountNumber.accountNumber
          m_session.cred_cuid = data.Body.getCreditsByContractResponse.CUID;
        }

        if (!!m_session.cred_cuid)
          getFio(m_session.cred_cuid)
        else
          scr.nextScreen(credInfo);
        clearInterval(_interval)
      }
      else {
        callSupport('cancel_err_nocheque')
        clearInterval(_interval)
      }
    }
    if (counter > 30){
      callSupport('cancel_err_nocheque')
      clearInterval(_interval)
    }
  },1000)

  alertMsgLog('[SCRIPT] '+scr.name+'. Страница Обращения к Купюроприемнику');

  m_session.cashin = {step:'wait'};
  scr.setImageJson({name:"bg", src:"IMG/PIC385(2).jpg"});
  // scr.setLabelJson({name:"title", value:getLangText("accessing_bill_acceptor___")});

  scr.render("show_advertising");
  //setTimeout('scr.nextScreen(depositInsert)', 3000);
};
credInfo = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onContinue = function() {
    callSupport('credit_cashin_open'+ ('&acc_num=' + m_session.acc_number));
    scr.nextScreen(depositWait);
  }
  var onBack = function(){
    // if (!!m_session.acc_number && m_session.acc_number.length === 10){
    scr.nextScreen(credInput);
    // }

  };

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  alertMsgLog(scr.name+'. Информация оплаты кредита');
  //scr.setImageJson({name:"bg", src:"IMG/MAIN_MENU.jpg"});
  scr.setLabelJson({name:"title", value:getLangText("check_data")});
  scr.setLabelJson({name:"name", value:getLangText("cred_name") + m_session.cred_fio});
  scr.setLabelJson({name:"card", value:getLangText("cred_acc") + m_session.acc_number});
  scr.setLabelJson({name:"pay", value:getLangText("cred_pay") + m_session.cred_data.nextInstalmentAmount});
  scr.setLabelJson({name:"info", value:getLangText("cred_info")});

  scr.setButtonJson({name:"Btn4", text:getLangText("back_btn"), visible:true, enable:true, ext:""}, onBack);
  scr.setButtonJson({name:"Btn8", text:getLangText("next"), visible:true, enable:true, ext:""}, onContinue);
  scr.setButtonJson({name:"cancel", text:getLangText("cancel001"), visible:true, enable:true, ext:""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("choose_info_credit");
};

credPay = function () {
  var onError = function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onContinue = function () {

    scr.nextScreen(request, "IMG/PIC385(4).jpg");
  }

  scr.addCall('TellMEWrapper', onTellMEWrapper);

  var credOst = parseInt(m_session.cred_data.creditAmount) - parseInt(m_session.creditAmount);

  alertMsgLog(scr.name + '. Информация оплаты кредита');

  //scr.setImageJson({name:"bg", src:"IMG/MAIN_MENU.jpg"});
  scr.setLabelJson({name: "title", value: getLangText("check_data")});

  scr.setLabelJson({name: "sum", value: getLangText("cred_pay_sum")});
  scr.setLabelJson({name: "trans", value: getLangText("cred_pay_trans")});
  scr.setLabelJson({name: "com", value: getLangText("cred_pay_com")});
  scr.setLabelJson({name: "ost", value: getLangText("cred_pay_ost")});

  if (!!m_session.creditAmount) {
    scr.setLabelJson({name: "sumR", value: m_session.creditAmount.toString()});
    scr.setLabelJson({name: "transR", value: m_session.creditAmount.toString()});
  }
  else {
    scr.setLabelJson({name: "sumR", value: ""});
    scr.setLabelJson({name: "transR", value: ""});
  }
  scr.setLabelJson({name: "comR", value: "00,0"});
  scr.setLabelJson({name: "ostR", value: credOst});
  scr.setLabelJson({name: "credSum", value: getLangText("credSum")+m_session.creditAmount.toString()});
  scr.setLabelJson({name: "credCom", value: getLangText("credCom")+"00,0"});
  scr.setLabelJson({name: "credAcc", value: getLangText("credAcc")+m_session.acc_number});

  //scr.setButtonJson({name: "Btn4", text: getLangText("back_btn"), visible: true, enable: true, ext: ""}, onCancel);
  scr.setButtonJson({name: "Btn8", text: getLangText("next"), visible: true, enable: true, ext: ""}, onContinue);
  //scr.setButtonJson({name: "cancel", text: getLangText("cancel001"), visible: true, enable: true, ext: ""}, onCancel);
  scr.setTimeout(timeoutValue, "", onTimeout);
  scr.render("pay");
};

function initScreens() {
  scr = new Screen(start, "");
  start = new Screen(start, "start");
  main = new Screen(main, "main");
  oos = new Screen(oos, "oos");
  pinEnter = new Screen(pinEnter, "pinEnter");
  pinChange = new Screen(pinChange, "pinChange");
  pinMoreTime = new Screen(pinMoreTime, "pinMoreTime");
  menuMain = new Screen(menuMain, "menuMain");
  withdrawalMenu = new Screen(withdrawalMenu, "withdrawalMenu");
  withdrawalSummOther = new Screen(withdrawalSummOther, "withdrawalSummOther");
  withdrawalNom = new Screen(withdrawalNom, "withdrawalNom");
  withdrawalCommAlert = new Screen(withdrawalCommAlert, "withdrawalCommAlert");
  depositWait = new Screen(depositWait, "depositWait");
  depositInsert = new Screen(depositInsert, "depositInsert");
  depositCount = new Screen(depositCount, "depositCount");
  depositReturn = new Screen(depositReturn, "depositReturn");
  depositMenu = new Screen(depositMenu, "depositMenu");
  schetMenu = new Screen(schetMenu, "schetMenu");
  chequeMenu = new Screen(chequeMenu, "chequeMenu");
  chequeMenuAskWithoutCheque = new Screen(chequeMenuAskWithoutCheque, "chequeMenuAskWithoutCheque");
  request = new Screen(request, "request");
  continueAsk = new Screen(continueAsk, "continueAsk");
  msgResult = new Screen(msgResult, "msgResult");
  msg_err = new Screen(msg_err, "msg_err");
  screenMoreTime = new Screen(screenMoreTime, "screenMoreTime");
  emulCardInserted = new Screen(emulCardInserted, "emulCardInserted");

  inkassAsk = new Screen(inkassAsk, "inkassAsk");
  inkassMenu = new Screen(inkassMenu, "inkassMenu");

  kupiNeKopiType = new Screen(kupiNeKopiType, "kupiNeKopiType");
  menuMainCash = new Screen(menuMainCash, "menuMainCash");

  withdrawalKBKAlert = new Screen(withdrawalKBKAlert, "withdrawalKBKAlert");
  showAdvertising = new Screen(showAdvertising, "showAdvertising");
  showAdvFullInfo = new Screen(showAdvFullInfo, "showAdvFullInfo");

  credInput = new Screen(credInput, "credInput");
  credMenu = new Screen(credMenu, "credMenu");
  credInfo = new Screen(credInfo, "credInfo");
  credPay = new Screen(credPay, "credPay");
  credWait = new Screen(credWait, "credWait");
}
