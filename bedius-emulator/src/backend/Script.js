/*Version 1.0.0.73*/
function getVersionScript() { return "[version][1.0.0.73]"; }
/*SCREENS*/
/*service*/
var start,oos,main,historyCheque,specCancelWait,cashin, timeoutScreen;
var giveMoney,continueOrExit;
/*support.htm*/
var cardInserted;
/*cardless*/
var cardlessMoneyInit, cardlessMoneyInsert, cardlessMoneyCheck, cardlessMoneyMenu, cardlessMoneyBack, cardlessMoneyFullBack;
/*cashin*/
var depositSelectAdjunctionFrom,depositSelectAdjunctionCurrency,depositSelectAdjunctionMyCard,depositSelectAdjunctionAnotherCard;
/*nukk*/
var nukk_destination_select;
/*help*/
var helpMenu;
/*settings*/
var settingsChangePin,settingsInternetBank,settingsCardRequisites,settingsCardLimits;
/*transfer*/
var transferToSchet,transferChooseIdType,transferToCard,transferToCompany,transferRequisitesInput,transferCardInput,transferInputAmount,
  transferSend,transferToCardRecipient;
/*cashout*/
var cashoutInputAmount;
/*Incass*/
var incass;
/*var cardless*/
var inputPhoneForEkassir,inputAccountForCharity,serviceSelectCash,emulCardInserted;
/*var easter egg*/
var consoleScreen;
/* SCREENS*/
var langToShow = 'rus';
var balance = '';
var balanceShow = false, balanceShowReq = false, balancePrintNeed = false, balancePrintReq = false;
var serviceName = '';
var m_HostServiceName, m_HostServiceState = "error",
  m_HostScreen, m_HostScreenText, m_HostData, m_HostAmount,
  m_CheckFlag,
  m_MoneyHistory, m_ATMMoneyInfo, m_FastCash, m_CheckSum,
  m_OpenOwnCard, m_BalanceCommissionAllow, m_Currency;

var m_UserData, m_UserDataNew;
var m_session = new SessionVariables();

var m_CardIcon = {value:'*0000',ext:'{"icon":"../../graphics/cards/another-noname.svg"}',iconSrc:'../../graphics/cards/another-noname.svg', our:false};
var m_ATMFunctions = {acceptor:true, dispenser:true, printer:true};


function callSupport(req,callBack) {
  if(typeof callBack != 'undefined')
    addRequestHandler(req, callBack);
  window.external.exchange.loadPage("help","C:/WebIUSBrowser/config/SCRIPT/support.htm?Reload=0&source=script&webius="+req);
}
function requestCount() {
  var value = m_session.reqCount;
  //var value = parseInt(getLocationParam("reqCount"), 10);
  //var value = parseInt(window.external.exchange.getMemory("requestCount"), 10);
  if(isNaN(value))
    return 0;
  else
    return value;
}

function showButtonRefresh(){
  if(m_session.serviceName != "pin_balance" && scr.buttonExists("showremains")){
    //if(scr.scrElementExists("wait") || scr.scrElementExists("modalMessage"))
    //	scr.render(scr.type);
    //else
    if(!scr.scrWaitShown() && !scr.scrModalMessageShown() && scr.type != "card_settings_menu")
      window.external.exchange.refreshScr();
    //else
    //	scr.render(scr.type);
  }
}
function printButtonRefresh(value){
  //if(scr.buttonExists("print") && !scr.scrElementExists("wait") && !scr.scrElementExists("modalMessage")) {
  if(scr.buttonExists("print")) {
    scr.setButton("print", "", m_ATMFunctions.printer, !value, (!value)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', (!value)? onBalancePrintCheckAndGoToNfc : onBalancePrintButton);
    if(!scr.scrWaitShown() && !scr.scrModalMessageShown() && scr.type != "card_settings_menu")
      window.external.exchange.refreshScr();
    //else
    //	scr.render(scr.type);
  }
}
function printButtonRefreshSpec(value){
  if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    if(!value && balanceShowReq)
    {
      balanceShowReq = false;
      balanceShow = false;
      scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
    }
    m_session.mini_statement = miniStatementEnabled();
    miniStatementAddButton();
  }
  if(scr.buttonExists("print")){
    scr.setButton("print", "", m_ATMFunctions.printer, !value, (!value)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', (!value)? onBalancePrintCheckAndGoToNfc : onBalancePrintButton);
    window.external.exchange.refreshScr();
  }
}
function setBalanceAndPrintButtons(_balanceReqFlag, _printReqFlag,visible){
  if(!!m_session.fitObj && m_session.fitObj.formfactor === /*"nfc"*/"nfctoken") {
    scr.setButton("print", "", true, false, '{"icon": "../../graphics/print-balance.svg"}', onButtonEmpty);
    scr.setButton("showremains", getLangText("showremains"), true, false, '{"icon": "","state":""}', onButtonEmpty);
    return;
  }
  if(visible !== false)
    visible = true;
  var enable = visible;
  scr.setButton("print", "", visible?m_ATMFunctions.printer:false, !_printReqFlag, (!_printReqFlag)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', (!_printReqFlag)? onBalancePrintCheckAndGoToNfc : onBalancePrintButton);

  if(balanceShow && !isNaN(m_session.balance))
    scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
  else
    scr.setButton("showremains", getLangText("showremains"), balanceShowReq ? '{"icon": "","state":"wait"}' : '{"icon": "","state":""}', balanceShowReq ? onBalanceShowButton : onBalanceShowCheckAndGoToNfc);
}

var onButtonEmpty = function(args){};

function onTimeout(_objString){
  if(balanceShowReq || balancePrintNeed)
    return;
  if(m_session.serviceName == 'card_seized') {
    callSupport("cancel");
    return;
  }
  /*if(typeof m_session.fitObj !== "undefined"
	  && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")) {
		callSupport("cancelnfc");
		return;
	}*/
  if(m_session.timeout == 0){
    try{
      m_session.timeoutObj = JSON.parse(_objString);
    }
    catch(e){
      delete m_session.timeoutObj;
    }
  }
  scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
  scr.nextScreen(timeoutScreen, [scr.name, scr.args]);
}
timeoutScreen = function(scrArgs){
  alertMsgLog(scr.name+' onTimeout');
  var onCancel = function(name){
    onCancelGlobal();
  };
  var onTimeoutButton = function (args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onTimeoutButton, value: '+_args);
    if(_args == 1){
      m_session.timeout = 0;
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      if(!!window[scrArgs[0]]){
        scr.nextScreen(window[scrArgs[0]], scrArgs[1]);
        return;
      }
      scr.nextScreen(serviceSelect);
      //window.external.exchange.RefreshScr();
    }
    else if(_args == 0){
      m_session.timeout = 0;
      onCancelGlobal();
    }
  }

  var trantype = window.external.exchange.getMemory("trantype");
  if(m_session.timeout == 0) {
    alertMsgLog(scr.name+' onTimeout with '+m_session.timeout);
    m_session.timeout = 1;
    {
      setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
      scr.setButton("deposit", getLangText("button_deposit"),true, m_ATMFunctions.acceptor && m_session.ownCard, '{"icon": ""}', onButtonEmpty);
      scr.setButton("withdrawal", getLangText("button_withdrawal"),true, true, '{"icon": ""}', onButtonEmpty);

      scr.setButton("pay", getLangText("button_pay"), true, false, '{"icon": ""}', onButtonEmpty);
      scr.setButton("send", getLangText("button_send"), true, true, '{"icon": ""}', onButtonEmpty);
      if(m_session.isCard)
      {
        setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
        scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
        scr.setButton("settings", getLangText("button_mini_statement"),
          true, false,
          '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
        scr.setButton("receipt", getLangText("button_settings"), true, true/*m_CardIcon.our*/, '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
      }
      scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);

      scr.setImage("bg","../../graphics/BG_blur.jpg","");

      if(!!m_CardIcon.value && !!m_CardIcon.ext)
        scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);


      scr.setLabel("balance", getLangText('main_your_balance'), "");
      scr.setLabel("title", "Выберите услугу", "");
      scr.setLabel("note", "Select service", "");

      scr.setTimeout(m_session.timeMoreTimePeriod.toString(), "", onTimeout);

      scr.setModalMessageJson(m_session.jsonObj.modalMessageAskMoreTime.elementObject, onTimeoutButton);
      scr.render("main_menu");
    }
    if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc"
      || m_session.fitObj.formfactor === "nfctoken"))
      checkSecondPINEnterFlag();
  } else {
    alertMsgLog(scr.name+' onTimeout with '+m_session.timeout);
    m_session.timeout = 0;
    scr.nextScreen(msgResult,["", "end"]);
    onCancelGlobal();
  }
};

function getLangText(textId){
  if(!!_words_ && !!_words_[textId] && !!_words_[textId][m_session.lang])
    return _words_[textId][m_session.lang]
  else
    return textId;
}
var onLangNotReady = ['Close'];
function addLangSwitch() {
  if(!!m_session.fitObj && m_session.fitObj.fitType !== "incass")
  {
    m_session.langSwitched = 0;
    scr.setLabel("switch_lang_l", getLangText('switch_lang_label'), "");
    scr.setButton("switch_lang", getLangText("switch_lang_button"), '{"icon": "", "display_group":"bottom_line"}', onLangSwitch);
  }
}
function onLangSwitch(name){
  m_session.lang = m_session.lang == 'ru' ? 'en' : 'ru';
  m_session.langSwitched = 1;
  //if(m_session.serviceName == 'pin_error')
  //	addElements('err');
  //else
  //	addElements();
  //scr.setModalMessage('English version of the interface is in its preparatory phase. We are sorry for the inconvenience.', onLangNotReady.join(), -1, true, '{"loader":"ellipse", "icon": "../../graphics/icon-smile-2.svg","options_settings":[{"name":"logout","icon":""}]}', onLangNotReadyCall);

  //window.external.exchange.RefreshScr();
  if(!!window[scr.name]){
    scr.nextScreen(window[scr.name], scr.args);
    return;
  }
  //scr.render("pin_code");
}
function onLangNotReadyCall(args) {
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onLangNotReadyCall, value: '+_args);
  scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
  if(scr.name == 'pin')
    //scr.render("pin_code");
    scr.nextScreen(pin, scr.args);
  else
    window.external.exchange.RefreshScr();
  return;
}

function parseBalance(data){

  var res = parseFloat(data);
  if(!isNaN(res))
    return res.toFixed(2);
  s = data;
  var charHelp = '';
  var PosArr = new Array();
  for (var i=0; i < s.length; i++)
  {
    charHelp = s.charAt(i);
    if (charHelp == '' || charHelp == '|')
      PosArr.push(i);
  }
  var z;
  var StrArr = new Array();
  for (var i=0; i < PosArr.length - 1; i++)
  {
    z = s.substring(PosArr[i] + 1, PosArr[i + 1]);
    StrArr.push(z);
  }
  z = s.substring(PosArr[PosArr.length - 1] + 1);
  StrArr.push(z);
  if (typeof StrArr[0] != 'undefined')
  {
    var temp = StrArr[0].substring(2);
    while (temp.substring(0,1) == ' ')
    {
      temp = temp.substring(1);
    }
    //temp = temp.split(' ')[0];
    temp = temp.replace(' RUR', '');

    //document.getElementById('ds').innerHTML = temp;
  }
  else
    temp = 0;
  return temp;
}

function onBalancePrintButton(args) {
  if(!balancePrintReq) {
    balancePrintReq = true;
    balancePrintNeed = true;
    alertMsgLog('onBalancePrintButton addCall');
    m_session.serviceName = "balance_print";
    callSupport("balance_receipt_req",onBalancePrintService);
    printButtonRefresh(balancePrintNeed);
  }
  else if(!balancePrintNeed) {
    balancePrintNeed = true;
    printButtonRefresh(balancePrintNeed);
  }
}
function onBalancePrintService(args) {
  m_HostScreen = args;

  alertMsgLog('onBalancePrintService, Service '+m_HostServiceName+', HostScreen '+m_HostScreen+'.');
  switch(args){
    case 'wait':
    case 'wait_request': {
      return 'ok';
    }
    case 'request_error': {
      balancePrintReq = false;
      balancePrintNeed = false;
      if(!m_session.ownCard && requestCount() <= 1){
        m_session.serviceName = "pin_balance";
        scr.nextScreen(requestResult, [args]);
      } else {
        printButtonRefreshSpec(balancePrintNeed);
      }
      return 'ok';
    }
    case 'end_304_pin_try_exceeded':{
      m_session.serviceName = "pin_balance";
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    case 'request_ok':
    case 'balance_res_ok': {
      balancePrintReq = false;
      balancePrintNeed = false;
      printButtonRefreshSpec(balancePrintNeed);
      return 'ok';
    }
    case 'wait_pin_error': {
      if(requestCount() <= 1) {
        balanceShowReq = false;
        balanceShow = false;
        balancePrintReq = false;
        balancePrintNeed = false;
        //m_session.serviceName = "pin_balance";
        //scr.nextScreen(requestResult, [args]);
        if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")) {
          m_session.serviceName = 'balance_print';
          m_session.pinerror = true;
          m_session.nfc_taped = 0;
          callSupport("reinit_nfc_or_card");
        } else {
          m_session.serviceName = 'pin_error';
          callSupport("go_to_pin");
          scr.nextScreen(pin, 'err');
        }
      } else {
        balancePrintReq = false;
        balancePrintNeed = false;
        printButtonRefreshSpec(balancePrintNeed);
        alertMsgLog('onBalancePrintService, wait_pin_error, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'end_session_nfc_print':
    case 'end_session_nfc':
    case 'wait_card_captured':
    case 'card_return_print':
    case 'card_return_cashout':
    case 'card_return':
    case 'wait_end_timeout':
    case 'wait_end_session':
    case 'wait_card_error':
    case 'end_136_card_seized':
    case 'end_137_card_expired':
    case 'end_148_card_not_serviced':
    case 'end_149_no_account_found':
    case 'wait_card_notprocess':
    case 'wait_card_hold':{
      balancePrintReq = false;
      balancePrintNeed = false;
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    default: {
      balancePrintReq = false;
      balancePrintNeed = false;
      if(requestCount() <= 1)
      {
        if(!m_session.ownCard)
        {
          m_session.serviceName = "pin_balance";
          scr.nextScreen(requestResult, [args]);
        }
        else
        {
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
          {
            if(balanceShowReq)
            {
              balanceShow = false;
              balanceShowReq = false;
              scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
            }
          }
          printButtonRefreshSpec(balancePrintNeed);
        }
      }
      else
      {
        if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
        {
          if(balancePrintReq)
          {
            balanceShow = false;
            balanceShowReq = false;
            scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
          }
        }
        scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
        alertMsgLog('onBalancePrintService, '+args+', requestCount > 1, do nothing');
      }
      return 'ok';
    }
  }
  return 'ok';
}

function onBalanceShowButton(args) {

  alertMsgLog('onBalanceShowButton called');

  if(!balanceShow) {
    if(isNaN(m_session.balance)) {
      alertMsgLog(' onBalanceShowButton addCall');
      if(!balanceShowReq){
//was used to test
//if(m_session.serviceName == "pin_balance")
//	callSupport("balance_req_auth",onBalanceShowService);
//else
        if(m_session.serviceName !== 'pin_balance')
          m_session.serviceName = "balance_show";
        callSupport("balance_req",onBalanceShowService);
        balanceShowReq = true;
      }
      if(m_session.serviceName !== 'pin_balance'){
        scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":"wait"}', onBalanceShowButton);
        //window.external.exchange.refreshScr();
        //scr.render(scr.type);
        showButtonRefresh();
      } else
        alertMsgLog(' onBalanceShowButton pin_balance request');
    } else {
      scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
      balanceShow = true;
      setTimeout('if(balanceShow) onBalanceShowButton("showremains");',2000);
      //window.external.exchange.refreshScr();
      //scr.render(scr.type);
      showButtonRefresh();
    }
  }
  else {
    alertMsgLog('onBalanceShowButton balanceShow true, reverse button');
    scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
    balanceShow = false;
    /*if(scr.name == 'transferMenu' && scr.args != 0)
		{
			try{
				if(!!args && args.constructor === Array && args.length > 1){
					m_session.timeoutObj = JSON.parse(args[1]);
					m_session.balanceButtonObj = JSON.parse(args[1]);
				}
				else
					delete m_session.timeoutObj;
			}
			catch(e){
				delete m_session.timeoutObj;
			}
			scr.nextScreen(transferMenu, scr.args);
			return;
		}
		else*/
    //window.external.exchange.refreshScr();
    //scr.render(scr.type);
    showButtonRefresh();
  }
}
function onBalanceShowService(args) {
  m_HostServiceState = 'ok';
  m_HostScreen = args;
  m_HostScreenText = window.external.exchange.getMemory("dataFromNDC");
  alertMsgLog(' onBalanceShowService, Service '+m_HostServiceName+', HostScreen: '+m_HostScreen+'.');
  switch(args) {
    case 'wait':
    case 'wait_request': {
      return 'ok';
    }
    case 'request_error': {
      balanceShowReq = false;
      balanceShow = false;
      if(requestCount() <= 1) {
        if(!m_session.ownCard || m_session.serviceName === 'pin_balance'){
          m_session.serviceName = "pin_balance";
          scr.nextScreen(requestResult, [args]);
        } else {
          m_session.balance = NaN;
          scr.setLabel("balance", getLangText('main_balance_unavailable'), "");
          scr.setButton("showremains", getLangText('main_balance_unavailable'), '{"icon": "","state":"show"}', onBalanceShowButton);
          balanceShow = true;
          setTimeout('if(balanceShow) onBalanceShowButton("showremains");',2000);
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")){
            if(balancePrintReq) {
              balancePrintReq = false;
              balancePrintNeed = false;
              scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
            }
          }
          //window.external.exchange.refreshScr();
          //scr.render(scr.type);
          showButtonRefresh();
        }
      } else {
        alertMsgLog('onBalanceShowService, request_error, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'end_304_pin_try_exceeded':{
      m_session.serviceName = "pin_balance";
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    case 'wait_pin_error': {
      scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
      balanceShowReq = false;
      balanceShow = false;
      if(requestCount() <= 1) {
        balancePrintReq = false;
        balancePrintNeed = false;
        if(m_session.serviceName === 'pin_balance')
        {
          m_session.serviceName = 'pin_error';
          callSupport("go_to_pin");
          scr.nextScreen(pin, 'err_on_pin');
        }
        else
        {
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")) {
            m_session.serviceName = 'balance_show';
            m_session.pinerror = true;
            m_session.nfc_taped = 0;
            callSupport("reinit_nfc_or_card");
          } else {
            m_session.serviceName = 'pin_error';
            callSupport("go_to_pin");
            scr.nextScreen(pin, 'err');
          }
        }
      } else {
        alertMsgLog('onBalanceShowService, wait_pin_error, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'balance_res_ok': {
      balanceShowReq = false;
      m_session.balance = parseFloat(parseBalance(m_HostScreenText));
//was used to test
//m_session.balance = 0;
      //alert("m_session.serviceName: "+m_session.serviceName);
      //alert("requestCount: "+requestCount().toString());
      var requestCountValue = requestCount();
      if(requestCountValue <= 1)
      {
        if(m_session.serviceName !== 'pin_balance')
        {
          scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
          balanceShow = true;
          setTimeout('if(balanceShow) onBalanceShowButton("showremains");',2000);
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
          {
            if(balancePrintReq)
            {
              balancePrintReq = false;
              balancePrintNeed = false;
              scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
            }
            m_session.mini_statement = miniStatementEnabled();
            miniStatementAddButton();
          }
          showButtonRefresh();
        }
        else
        {
//was used to test
//m_session.balance = NaN;
          scr.nextScreen(serviceSelect);
          return;
        }
      }
      else
      {
        balanceShow = false;
        scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
        alertMsgLog('onBalanceShowService, balance_res_ok, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'end_session_nfc_print':
    case 'end_session_nfc':
    case 'wait_card_captured':
    case 'card_return_print':
    case 'card_return_cashout':
    case 'card_return':
    case 'wait_end_timeout':
    case 'wait_end_session':
    case 'wait_card_error':
    case 'end_136_card_seized':
    case 'end_137_card_expired':
    case 'end_148_card_not_serviced':
    case 'end_149_no_account_found':
    case 'wait_card_notprocess':
    case 'wait_card_hold':{
      balancePrintReq = false;
      balancePrintNeed = false;
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    default: {
      balanceShowReq = false;
      balanceShow = false;
      if(m_session.serviceName === 'pin_balance')
      {
        scr.nextScreen(requestResult, [args]);
        return 'ok';
      }
      else if(requestCount() <= 1)
      {
        if(!m_session.ownCard)
        {
          m_session.serviceName = "pin_balance";
          scr.nextScreen(requestResult, [args]);
        }
        else
        {
          //scr.nextScreen(requestResult, [args]);
          m_session.balance = NaN;
          scr.setLabel("balance", getLangText('main_balance_unavailable'), "");
          scr.setButton("showremains", getLangText("main_balance_unavailable"), '{"icon": "","state":"show"}', onBalanceShowButton);
          balanceShow = true;
          setTimeout('if(balanceShow) onBalanceShowButton("showremains");',2000);
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
          {
            if(balancePrintReq)
            {
              balancePrintReq = false;
              balancePrintNeed = false;
              scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
            }
          }
          //window.external.exchange.refreshScr();
          scr.render(scr.type);
        }
      }
      else
      {
        if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
        {
          if(balancePrintReq)
          {
            balancePrintReq = false;
            balancePrintNeed = false;
            scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
          }
        }
        scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
        alertMsgLog('onBalanceShowService, '+args+', requestCount > 1, do nothing');
      }
      return 'ok';
    }
  }
}

function getPaySystem(someInfo) {
  var iconPath = '';
  var resObj = {};
  resObj.paysys = "noname";
  if(typeof someInfo.PAN === "undefined")
    someInfo.PAN = "XXXXXXXXXXXXXXXX";
  var someSymbs = someInfo.PAN;
  if(someSymbs.length < 6){
    iconPath =  "another-noname.svg";
    resObj.value = "*0000";
    resObj.our = !!someInfo.fitType &&
      (someInfo.fitType === "own" || someInfo.fitType === "friend" || someInfo.fitType === "gru");
  }
  else {
    resObj.value = '*'+someSymbs.substr(someSymbs.length-4);
    var intBin = parseInt(someSymbs.substr(0,4), 10);
    if(isNaN(intBin)){
      iconPath =  "another-noname.svg";
      resObj.our = !!someInfo.fitType && (someInfo.fitType === "own" || someInfo.fitType === "friend" || someInfo.fitType === "gru");
    }
    else{
      if(isOpenCard(someInfo)){
        resObj.our = true;
        iconPath = 'our';
      }
      else{
        resObj.our = false;
        iconPath = 'another';
      }
      if(intBin >= 4000 && intBin <= 4999){
        iconPath +=  "-visa.svg";
        resObj.paysys = "visa";
      }
      else if(intBin >= 2200 && intBin <= 2204){
        iconPath +=  "-mir.svg";
        resObj.paysys = "mir";
      }
      else if(intBin >= 5100 && intBin <= 5599){
        iconPath +=  "-mastercard.svg";
        resObj.paysys = "mastercard";
      }
      else{
        iconPath +=  "-noname.svg";
      }
    }
  }
  resObj.ext = '{"icon":"../../graphics/cards/'+iconPath+'"}';
  resObj.iconSrc = "../../graphics/cards/"+iconPath;
  return resObj;
}

function isOpenCard(someInfo) {
  var ownCard = [220029,429037,429038,429039,429040,404586,484800,405870,446065,458493,413307,407178,414076,467485,467486,467487,405869,544218,544962,532301,531674,670518,530403,530183,539714,676231,558620,549025,549024,472840,472841,472842,472843,472844,532837,548106,670587,411900,424553,424554,424555,456515,456516,490986,494343,410323,437540,437541,467033,486031,531318,557808,557809,558298,676642,516906,523510,525932,529034,529047,530175,554521,536114,406790,406791,409755,409701,409756,425656,426896,437351,464843,479302,676968,552681,520634,515758,518803,515668,416038,479716,479777,479715,479718,420574,427856,425184,425181,425185,425182,425183,428165,428166,430291,676951,520349,552671,518796,552219,522459,539896,548764,520324,434146,434147,434148,485649,535108,544499,544573,547449,549848,676697,428228,443884,443885,514017,515243,529260,532130];
  if(typeof someInfo.PAN === "undefined")
    someInfo.PAN = "XXXXXXXXXXXXXXXX";
  var binInt = parseInt(someInfo.PAN.substr(0,6), 10);
  var result = false;
  if(!isNaN(binInt))
  {
    for(var i=0;i<ownCard.length;++i)
      if(ownCard[i] == binInt)
      {
        result = true;
      }
  }
  if(!!someInfo.fitType && (someInfo.fitType === "own" || someInfo.fitType === "friend" || someInfo.fitType === "gru"))
  {
    result = true;
  }
  return result;
}

function getFastCashButtons(moneyATM, history){
  var amntMass = [];
  var i,j,k,help;
  if(typeof moneyATM == 'string' && moneyATM != '')
    moneyATM = JSON.parse(moneyATM);
  if(typeof history == 'string' && history != '')
    history = JSON.parse(history);
  if(typeof moneyATM != 'undefined' && moneyATM != '')
    for(i = 0; i < moneyATM.length; ++i){
      if(moneyATM[i].count > 0){
        help = parseInt(moneyATM[i].denomination);
        for(j = 0; j < i; ++j)
          if(help < amntMass[j]){
            if(j == 0 || help != amntMass[j-1]){
              amntMass.splice(j, 0, help);
            }
            break;
          }
        if(j == i){
          amntMass.push(help);
        }
      }
    }

  if(typeof history != 'undefined' && history != ''){
    if(amntMass.length > 4){
      amntMass.splice(4, amntMass.length - 4);
      //amntMass.length = 4;
    }
    i = 0;
    while(amntMass.length < 7 && i < history.operations.length){
      help = parseInt(history.operations[i].amount);
      for(j = 0; j < amntMass.length; ++j)
        if(help < amntMass[j]){
          if(j == 0 || (help != amntMass[j-1])){
            //проверка, можно ли выдать данную сумму
            amntMass.splice(j, 0, help);
          }
          break;
        }
      if(j == amntMass.length && (help != amntMass[j-1])){
        //проверка, можно ли выдать данную сумму
        amntMass.push(help);
      }
      i++;
    }
  }
  if(typeof moneyATM != 'undefined' && moneyATM != ''){
    i = 0;
    j = 0;
    k = 2;
    while(amntMass.length < 7 && k < 7){
      for(i = 0; (i < moneyATM.length) && (amntMass.length < 7); ++i){
        if(moneyATM[i].count >= k){
          help = parseInt(moneyATM[i].denomination) * k;
          for(j = 0; j < amntMass.length; ++j)
            if(help < amntMass[j]){
              if(j == 0 || (help != amntMass[j-1])){
                amntMass.splice(j, 0, help);
              }
              break;
            }
          if(j == amntMass.length && (help != amntMass[j-1])){
            amntMass.push(help);
          }
        }
      }
      k++;
    }
  }
  if(typeof moneyATM == 'undefined' || moneyATM == '')
    amntMass = [500, 900, 1000, 1500, 3000, 4000, 5000];

  var fastCashHelp = '';
  if(typeof amntMass != 'undefined' && amntMass.constructor === Array && amntMass.length > 0)
    for(var i = 0; i < amntMass.length; ++i)
      fastCashHelp += (fastCashHelp == '' ? '' : ',')+'{\"text\":\"'+amntMass[i]
        +'\",\"value\":'+amntMass[i]+'}';
  return fastCashHelp;
}

var historyGet = function(){
  m_MoneyHistory = window.external.exchange.getMemory('clienthistory');
  alertMsgLog('[history]: '+(m_MoneyHistory == null ? 'null':m_MoneyHistory));
  try{
    m_UserData = JSON.parse(m_MoneyHistory);
    m_UserData.data = JSON.parse(m_UserData.data);
    m_UserDataNew = iterationCopy(m_UserData);//JSON.parse(m_MoneyHistory);
    alertMsgLog('JSON  ok: '+m_UserData);
  }
  catch(e){
    alertMsgLog('JSON err: '+e.message);
    m_MoneyHistory = JSON.stringify({data:JSON.stringify({operations:[]})});
    m_UserData = {data:'{operations[]}'};
    m_UserDataNew = {data:'{operations[]}'};
  }
}
function getCurrencyList(atmMoney){
  var i, j;
  var money = [];
  try{
    var casStr = window.external.wbCassetes.getCashUnitsString().split(';');
    //var casStr = ".001/64311:840:10:8:WARNING;002/64351:643:50:11:OK;003/84011:840:10:8:WARNING;004/97811:978:10:10:WARNING;".split(';');
    for(let i = 0; i < casStr.length-1; i++)
    {
      let tmpAr = casStr[i].split(':');
      money[i] = {};
      money[i].currency = tmpAr[1];
      money[i].nominal = tmpAr[2];
      money[i].state = tmpAr[4] === "OK" || tmpAr[4] === "WARNING";
      if(money[i].state)
        money[i].state = parseInt(tmpAr[3], 10) > 0;
    }
    //money = JSON.parse(atmMoney);
  }
  catch(e){
    alertMsgLog('getCurrencyList JSON error: '+e.message);
    return ['rub'];
  }
  var currencyList = [];
  for (i = 0; i < money.length; i++)
  {
    var new_cur = true;
    for (j = 0; j < currencyList.length; j++)
    {
      if(money[i].currency == currencyList[j].currency)
      {
        new_cur = false;
        break;
      }
    }
//#@работа только с рублями!
//if(new_cur && (money[i].currency == '643' || money[i].currency == '810'))
//#@работа со всеми валютами
    if(new_cur) {
      if(money[i].currency == '643' || money[i].currency == '810')
        currencyList.unshift({currency: money[i].currency, enabled: false});
      else
        currencyList.push({currency: money[i].currency, enabled: false});
    }
  }
  for(i = 0; i < currencyList.length; ++i) {
    for(j = 0; j < money.length; ++j)
      if(currencyList[i].currency == money[j].currency && money[j].state)
        currencyList[i].enabled = true;
  }
  alertMsgLog('getCurrencyList: '+currencyList.map(function(elem){
    return elem.currency + "-"+elem.enabled.toString();
  }).join());
  return currencyList;
}
function getUserDataField(fieldName){
  if(typeof m_UserDataNew != 'undefined' && typeof m_UserDataNew.data != 'undefined' && typeof (m_UserDataNew.data[fieldName]) != 'undefined')
    return m_UserDataNew.data[fieldName];
  else
    return '';
}
function saveToHistory(amnt, curr, check){
  var jsonHelp = {};
  var trueData = {"type":"cashout", "amount": amnt, "currency":curr, "printcheck":check, "count":1};
  var dataStr = '';
  try{
    historyGet();
    jsonHelp = m_UserDataNew;
    if(!jsonHelp)
      jsonHelp = {data: {operations:[], printcheck:false}};
    alertMsgLog('saveToHistory history: '+m_MoneyHistory);
    alertMsgLog('saveToHistory history: '+jsonHelp.data['operations']);
    if(typeof jsonHelp.data['operations'] == 'undefined'){
      jsonHelp.data['operations'] = [];
      jsonHelp.data['operations'].push(trueData);
    }
    else {
      var i, j;
      for(i = 0; i < jsonHelp.data['operations'].length; ++i){
        if(jsonHelp.data['operations'][i]['amount'] == amnt){
          j = jsonHelp.data['operations'][i]['count'];
          if(typeof j != 'undefined'){
            jsonHelp.data['operations'][i]['count']= j+1;
          }
          else{
            jsonHelp.data['operations'][i]['count'] = 2;
          }
          jsonHelp.data['operations'][i]['printcheck'] = check;
          break;
        }
      }
      if(i == jsonHelp.data['operations'].length){
        jsonHelp.data['operations'].push(trueData);
      }
    }
    jsonHelp.data['printcheck'] = check;
    dataStr = JSON.stringify(jsonHelp.data);
  }
  catch(e){
    alertMsgLog('saveToHistory: '+e.message);
    jsonHelp = {};
    dataStr = '{"operations":['+JSON.stringify(trueData)+'], "printcheck":'+check+'}';
  }
  if(typeof jsonHelp['_id'] == 'undefined'){
    alertMsgLog('saveToHistory id: 1111111111111111, data: '+dataStr);
    window.external.exchange.wbCustom.saveCardHolderOperationInfo('1111111111111111', dataStr);
  }
  else{
    alertMsgLog('saveToHistory id: '+jsonHelp['_id']+', data: '+dataStr);
    window.external.exchange.wbCustom.saveCardHolderOperationInfo(jsonHelp['_id'], dataStr);
  }
}
function getATMMoney(){
  m_ATMMoneyInfo = window.external.wbCassetes.getMoneyList();
  //m_ATMMoneyInfo = window.external.wbCassetes.getMoneyList("");
  //m_ATMMoneyInfo = window.external.wbCassetes.getMoneyList("CU");
  alertMsgLog('MoneyInfo type: '+(typeof m_ATMMoneyInfo));
  alertMsgLog('MoneyInfo: '+ m_ATMMoneyInfo);

  if(typeof m_ATMMoneyInfo != 'string' || m_ATMMoneyInfo == '[]' || m_ATMMoneyInfo == ''){
    m_ATMMoneyInfo = "[{\"cassette\":0,\"currency\":\"643\",\"denomination\":\"100\",\"count\":100},{\"cassette\":1,\"currency\":\"643\",\"denomination\":\"200\",\"count\":100},{\"cassette\":2,\"currency\":\"643\",\"denomination\":\"200\",\"count\":100},{\"cassette\":3,\"currency\":\"643\",\"denomination\":\"500\",\"count\":100},{\"cassette\":4,\"currency\":\"643\",\"denomination\":\"1000\",\"count\":100},{\"cassette\":5,\"currency\":\"643\",\"denomination\":\"2000\",\"count\":100},{\"cassette\":6,\"currency\":\"643\",\"denomination\":\"5000\",\"count\":100},"
      +"{\"cassette\":7,\"currency\":\"978\",\"denomination\":\"10\",\"count\":100}]";
    m_CheckSum = undefined;
  }
  else
    m_CheckSum = window.external.wbCassetes;
  //m_CheckSum = undefined;
  m_Currency = new CurrencyClass(getCurrencyList(m_ATMMoneyInfo));
  alertMsgLog('MoneyInfo: '+m_ATMMoneyInfo);
}
function getATMFuncStatus(){
  var resObj = {};
  try{
    help = window.external.wbCassetes.getCashDispenserState();
    if(help == 'OK' || help == "WARNING")
      resObj.dispenser = true;
    else
      resObj.dispenser = false;
    alertMsgLog('getATMFuncStatus|Dispenser|'+help);
  }
  catch(e){
    alertMsgLog('getATMFuncStatus|Dispenser|'+e.message);
    resObj.dispenser = false;
  }
  try{
    help = window.external.wbCassetes.getBanknoteAcceptorState();
    if(help == 'OK' || help == "WARNING")
      resObj.acceptor = true;
    else
      resObj.acceptor = false;
    alertMsgLog('getATMFuncStatus|Acceptor|'+help);
  }
  catch(e){
    alertMsgLog('getATMFuncStatus|Acceptor|'+e.message);
    resObj.acceptor = false;
  }
  try{
    help = window.external.wbCassetes.getPaperState();
    if(help == 'OK' || help == "WARNING" || help == 'LOW' || help == 'FULL'){
      help = window.external.wbCassetes.getReceiptPrinterState();
      if(help == 'OK' || help == "WARNING"){
        resObj.printer = true;
      }
      else
        resObj.printer = false;
    }
    else
      resObj.printer = false;
    alertMsgLog('getATMFuncStatus|Printer|'+help);
  }
  catch(e){
    alertMsgLog('getATMFuncStatus|Printer|'+e.message);
    resObj.printer = false;
  }
  return resObj;
}
//m_ATMFunctions = {deposit:true, withdraw:true, print:true};
//acceptor:true, dispenser:true, printer:true
//------------------------------------------------------------------------------
var onEnterPinSecond = function(args){
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onMoreTime, value: '+_args);

  if(_args == 0) {
    if(m_session.pinEnterPinOptionsPinSecond[0] === getLangText("button_logout_card")
      || m_session.pinEnterPinOptionsPinSecond[0] === getLangText("button_logout_cash")){
      alertMsgLog(' '+scr.name+', ' + name + ', .Вернуть карту на Вводе пин-кода.');
      onCancelButton();
      return;
    } else {
      alertMsgLog(' '+scr.name+', ' + name + ', .Продолжить на Вводе пин-кода.');
      var help = {};
      help['pinValue'] = m_session.pin.value;
      callSupport("pin_enter&pinValue="+help.pinValue);
    }
  } else if(_args == 1) {
    alertMsgLog(' '+scr.name+', ' + name + ', .Продолжить на Вводе пин-кода.');
    var help = {};
    help['pinValue'] = m_session.pin.value;
    callSupport("pin_enter&pinValue="+help.pinValue);
  }
  //else
  //{
  //	callSupport("cancel");
  //}
};
var onTapMore = function(args){
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onMoreTime, value: '+_args);

  if(_args == 0) {
    alertMsgLog(' '+scr.name+', ' + name + ', Больше не прикладывать карту');
    onCancelButton();
    return;
  } else if(_args == 1) {
    alertMsgLog(' '+scr.name+', ' + name + ', .Приложить карту ещё раз');
    checkAndGoToPinOrNcf();
    return;
  }
};
var onMoreTimeCallCashin = function(args){
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onMoreTime, value: '+_args);

  scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
  callSupport("ask_more_time_yes");
  serviceName = "moretime";
};
var onMoreTimeCallPinSecond = function(args){
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onMoreTime, value: '+_args);

  //if(_args == onMoreTimeButtons[1])
  if(_args == 1){
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    callSupport("ask_more_time_yes");
    serviceName = "moretime";
  } else if(_args == 0) {
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    callSupport("ask_more_time_no");
    serviceName = "return";
  }
};
var onInputPinSecond = function(args){
  var pKey = "";
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    var help;
    if(typeof args[1] == 'undefined')
      help = args;
    else {
      pKey = args[0];
      help = args[1];
    }
  }
  m_session.pin.length = controlPinLength(help);
  m_session.pin.value = help;
  scr.setInput("pin_code", "", "","",false,true,'{"pin_code2": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInputPinSecond);
  if(m_session.pin.maxlength !== 4)
  {
    if(m_session.pin.value.length < 4)
      m_session.jsonObj.objHelp.ext.options_settings[1].enable = false;
    //scr.setModalMessage(getLangText('pin_second_time'), m_session.pinEnterPinOptionsPinSecond, 0, true, '{"icon": "", "options_settings":[{"name":"action","icon":"../../graphics/icon-pick-card-red.svg","theme":"btn-white-red","enable":true}, {"name":"logout","icon":"","theme":"btn-green","enable":false}]}', onEnterPinSecond);
    else if(m_session.pin.value.length >= 4){
      m_session.jsonObj.objHelp.ext.options_settings[1].enable = true;
    }
    //scr.setModalMessage(getLangText('pin_second_time'), m_session.pinEnterPinOptionsPinSecond, 0, true, '{"icon": "", "options_settings":[{"name":"action","icon":"../../graphics/icon-pick-card-red.svg","theme":"btn-white-red","enable":true}, {"name":"logout","icon":"","theme":"btn-green","enable":true}]}', onEnterPinSecond);
    scr.setModalMessageJson(m_session.jsonObj.objHelp, onEnterPinSecond);
    window.external.exchange.RefreshScr();
  }
};
var onCancelButton = function(){
  var requestCount = window.external.exchange.getMemory("requestCount");
  callSupport("cancel");
  if(requestCount <= 1 || name === "empty")
    scr.nextScreen(msgResult,["", "end"]);
  else
  {
    if(m_session.serviceName === "balance_print")
      scr.nextScreen(msgResult,['session_end_wait_cheque', "wait"]);
    else
      scr.nextScreen(msgResult,['session_end_wait_response', "wait"]);
  }
};
var onCancel = function(name){
  onCancelGlobal();
};
var onCancelGlobal = function(name){
  var requestCount = window.external.exchange.getMemory("requestCount");
  if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    callSupport("cancelnfc");
  }
  else
    callSupport("cancel");
  if(requestCount < 1 || name === "empty")
    scr.nextScreen(msgResult,["", "end"]);
  else
  {
    if(m_session.serviceName === "balance_print")
      scr.nextScreen(msgResult,['session_end_wait_cheque', "wait"]);
    else
      scr.nextScreen(msgResult,['session_end_wait_response', "wait"]);
  }
};
var onCancelTimeout = function(name){
  if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    callSupport("cancelnfc");
  }
  else
    callSupport("canceltimeout");
};
var onButtonPINCancel = function(name){
  scr.nextScreen(msgResult,["","card_return"]);
  callSupport("cancel");
};
var onButtonPINContinue = function(name) {
  alertMsgLog(' '+scr.name+', ' + name + ', .продолжить на Вводе пин-кода.');
  var help = {};
  help['pinValue'] = m_session.pin.value;
  callSupport("pin_enter&pinValue="+help.pinValue);
};
var onTapAnother = function(args){
  var _name, _args;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    _name = args[0];
    if(args.length > 1)
      _args = args[1];
    else
      _args = "";
  }
  else {
    _name = "";
    _args = args;
  }
  alertMsgLog(scr.name+' onTapAnother, value: '+_args);

  //if(_args == onMoreTimeButtons[1])
  if(_args == 1)
  {
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    callSupport("reinit_nfc_or_card");
  }
  else if(_args == 0)
  {
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    onCancelGlobal("empty");
  }
};
var onTellMEWrapperSecondPINProcess = function(args) {
  var text2SecondPin, text3SecondPin, text4SecondPin;
  switch(args) {
    case 'end_pin_timeout':
      onCancelTimeout();
      return "ok";
    case 'end_pin_cancel':
      onCancelGlobal();
      return "ok";
    case "ekassir_nfc_ok":
    case "nfc_read_ok":
    case "before_pin": {
      try
      {
        var helpFitObj = JSON.parse(window.external.exchange.getMemory("dataFromNDC"));
      }
      catch(e)
      {
        helpFitObj ={PAN:"", fitType:"other", formfactor:"card"};
      }
      if(m_session.fitObj.PAN != helpFitObj.PAN)
      {
        m_session.tapmessage = m_session.jsonObj.modalMessageNfcAnotherTap.elementObject.text;
        if(m_session.fitObj.formfactor != helpFitObj.formfactor)
          m_session.tapmessage = m_session.fitObj.formfactor === "nfc" ? getLangText("nfc_read_error_not_card") : getLangText("nfc_read_error_not_token");
        checkAndGoToPinOrNcf();
        return "ok";
      }
      if(m_session.pinerror || !!m_session.pin && m_session.pin.needToEnter && args !== 'ekassir_nfc_ok')
      {
        callSupport("go_to_pin");
        return "ok";
      }
      if(args === 'ekassir_nfc_ok')
      {
        scr.nextScreen(ekassir, 4);
        return "ok";
      }
    }
    case "menu_main": {
      m_session.pin.needToEnter = false;
      if(m_session.serviceName === "balance_print")
      {
        m_session.pinerror = false;
        scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code2":false}}, onButtonEmpty);
        scr.setWait(false, "", '{"icon": ""}');
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        if(scr.name === "transferMenu")//transferMenu "transfer_card_input");"transfer_amount_input"
          scr.nextScreen(transferMenu, scr.args);
        else if(scr.name === "depositSelectAdjunctionCurrency" || scr.name === "settingsMenu")
          scr.nextScreen(serviceSelect);
        onBalancePrintButton(true);
        return "ok";
      }
      else if (m_session.serviceName === "balance_show")
      {
        m_session.pinerror = false;
        scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code2":false}}, onButtonEmpty);
        scr.setWait(false, "", '{"icon": ""}');
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        if(scr.name === "transferMenu")//transferMenu "transfer_card_input");"transfer_amount_input"
          scr.nextScreen(transferMenu, scr.args);
        else if(scr.name === "depositSelectAdjunctionCurrency" || scr.name === "settingsMenu")
          scr.nextScreen(serviceSelect);
        onBalanceShowButton(true);
        return "ok";
      }
      else if (m_session.serviceName === "mini_statement")
      {
        m_session.pinerror = false;
        scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code2":false}}, onButtonEmpty);
        scr.setWait(false, "", '{"icon": ""}');
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        m_session.mini_statement = miniStatementEnabled();
        onButtonMiniStatement();
        return "ok";
      }
      if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.formfactor === "card"
        || m_session.pinerror || m_session.pin.needToEnter)
      {
        m_session.pinerror = false;
        m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessagePINSecond.elementObject);
        scr.setInputJson({name:"pin_code",text:'', visible:false,validate:true,state:'Wait',ext:{pin_code2:true,length:m_session.pin.length,filledCount:m_session.pin.value.length}}, onButtonEmpty);
        m_session.jsonObj.objHelp.text2 = getLangText('wait_please_wait');
        if(m_session.serviceName === "cashout" || m_session.serviceName === "transfer_c2c")
          m_session.jsonObj.objHelp.text2 = getLangText('wait_please_request');
        else if(m_session.serviceName === "addsim")
          m_session.jsonObj.objHelp.text2 = getLangText('simcard_info_progress');
        else if(m_session.serviceName === "smsinfo"){
          if(m_session.sim.type === "add")
            m_session.jsonObj.objHelp.text2 = getLangText('smsinfo_progress');
          else
            m_session.jsonObj.objHelp.text2 = getLangText('smsinfo_delete_progress');
        }
        else if(m_session.serviceName === "pinchange" ||
          m_session.serviceName === "cashin" || m_session.serviceName === "cashin_nukk")
          m_session.jsonObj.objHelp.text2 = getLangText('wait_oper_init');
        else if(m_session.serviceName === "ekassir")
          m_session.jsonObj.objHelp.text2 = getLangText('wait_please_wait');
        else if(m_session.serviceName === "zsfcredit" || m_session.serviceName === "zsfdeposit")
          m_session.jsonObj.objHelp.text2 = getLangText('zsf_req_pay');
      }
      else
      {
        m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessageNfcTapWait.elementObject);
        scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code2":false}}, onButtonEmpty);
        m_session.jsonObj.objHelp.text = getLangText('wait_please_wait');
        if(m_session.serviceName === "cashout" || m_session.serviceName === "transfer_c2c")
          m_session.jsonObj.objHelp.text = getLangText('wait_please_request_circle');
        else if(m_session.serviceName === "addsim")
          m_session.jsonObj.objHelp.text = getLangText('simcard_info_progress');
        else if(m_session.serviceName === "smsinfo") {
          if(m_session.sim.type === "add")
            m_session.jsonObj.objHelp.text = getLangText('smsinfo_progress');
          else
            m_session.jsonObj.objHelp.text = getLangText('smsinfo_delete_progress');
        }
        else if(m_session.serviceName === "pinchange" ||
          m_session.serviceName === "cashin" || m_session.serviceName === "cashin_nukk")
          m_session.jsonObj.objHelp.text = getLangText('wait_oper_init');
        else if(m_session.serviceName === "ekassir")
          m_session.jsonObj.objHelp.text = getLangText('wait_please_wait');
        else if(m_session.serviceName === "zsfcredit" || m_session.serviceName === "zsfdeposit")
          m_session.jsonObj.objHelp.text2 = getLangText('zsf_req_pay');
      }

      for(var settI = 0; settI < m_session.jsonObj.objHelp.ext.options_settings.length; settI++)
        m_session.jsonObj.objHelp.ext.options_settings[settI].enable = false;

      scr.setModalMessageJson(m_session.jsonObj.objHelp, onEnterPinSecond);

      window.external.exchange.RefreshScr();

      if(m_session.serviceName === "cashout")
        scr.nextScreen(giveMoney,[m_session.cashout.amount, 2]);
      else if(m_session.serviceName === "transfer_c2c")
        scr.nextScreen(transferMenu, 3);
      else if(m_session.serviceName === "addsim"||m_session.serviceName === "smsinfo")
        scr.nextScreen(settingsSIM, 3);
      else if(m_session.serviceName === "pinchange")
      {
        //callSupport('pin_change_input');
        scr.nextScreen(settingsChangePin,7);
      }
      else if(m_session.serviceName === "ekassir")
        scr.nextScreen(ekassir,2);
      else if(m_session.serviceName === "cashin")
        scr.nextScreen(cashin, "opening");
      else if(m_session.serviceName === "cashin_nukk")
        scr.nextScreen(cashin, "opening_nukk");
      else if(m_session.serviceName === "zsfcredit")
        scr.nextScreen(zsfCreditRequestPay, "afterpin");
      else if(m_session.serviceName === "zsfdeposit")
        scr.nextScreen(zsfDepositRequestPay, "afterpin");
      return "ok";
    }
    case "pin": {
      m_session.pin.value = '';
      m_session.pin.length = controlPinLength('', 4);
      var maxPinHelp = parseInt(window.external.exchange.GetModuleVariable('NDC','NDCPINLENGTH'), 10);
      if(isNaN(maxPinHelp))
        m_session.pin.maxlength = 6;
      else
        m_session.pin.maxlength = maxPinHelp;
      m_session.setNecessaryParameters(m_CardIcon);

      if(m_session.pinerror)
      {
        if(typeof m_session.fitObj !== "undefined"
          && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
        {
          text2SecondPin = '';
          scr.setInput("pin_code", "", "","",false,true,'{"pin_code2": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInputPinSecond);
        }
        else
        {
          text2SecondPin = getLangText('pin_second_error_text2');
          scr.setInput("pin_code", "", "","",false,true,'{"pin_code2": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInputPinSecond, "Error");
        }
        if(!!m_session.fitObj && (m_session.fitObj.fitType === "own" || m_session.fitObj.fitType === "gru"))
        {
          text3SecondPin = getLangText('pin_second_error_text3');
          text4SecondPin = getLangText('pin_second_error_text4');
        }
        else
        {
          text3SecondPin = getLangText('pin_second_error_text3');
          text4SecondPin = getLangText('pin_second_error_other_text4');
        }
      }
      else
      {
        text2SecondPin = getLangText('pin_second_time');
        text3SecondPin = '';
        text4SecondPin = '';
        scr.setInput("pin_code", "", "","",false,true,'{"pin_code2": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInputPinSecond);
      }
      m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessagePINSecond.elementObject);
      m_session.jsonObj.objHelp.text = "";
      m_session.jsonObj.objHelp.text2 = text2SecondPin;
      m_session.jsonObj.objHelp.text3 = text3SecondPin;
      m_session.jsonObj.objHelp.text4 = text4SecondPin;
      scr.setModalMessageJson(m_session.jsonObj.objHelp, onEnterPinSecond);
      //scr.setModalMessage(text2SecondPin, m_session.pinEnterPinOptionsPinSecond, 0, true, m_session.pin.maxlength > 4 ? '{"icon": "", "options_settings":[{"name":"action","icon":"../../graphics/icon-pick-card-red.svg","theme":"btn-white-red","enable":true}, {"name":"logout","icon":"","theme":"btn-green","enable":false}]}' : '{"icon": "", "options_settings":[{"name":"action","icon":"../../graphics/icon-pick-card-red.svg","theme":"btn-white-red","enable":true}]}', onEnterPinSecond);

      scr.setWait(false, "", '{"icon": ""}');
      scr.setTimeout("0", "", onTimeout);
      delete m_session.timeoutObj;
      if(m_session.serviceName === "cashout")
        m_session.askmoretime ? scr.render("cashout_amount") : window.external.exchange.RefreshScr();
      else if(m_session.serviceName === "transfer_c2c")
        scr.render("cashout_amount");
      else if(m_session.serviceName === "addsim" || m_session.serviceName === "pinchange"
        || m_session.serviceName === "smsinfo"
        || m_session.serviceName === "ekassir" || m_session.serviceName === "ekassir_nfc"
        || m_session.serviceName === "zsfcredit" || m_session.serviceName === "zsfdeposit")
      {
        //m_session.askmoretime || m_session.pinerror ? window.external.exchange.RefreshScr() : scr.render("main_menu");
        window.external.exchange.RefreshScr();
      }
      else if(m_session.serviceName === "balance_print"
        || m_session.serviceName === "balance_show"
        || m_session.serviceName === "mini_statement")
        scr.type === "cashout_amount" ? (m_session.askmoretime ? scr.render("cashout_amount") : window.external.exchange.RefreshScr()) : window.external.exchange.RefreshScr();
      else if (m_session.serviceName === "cashin")
        scr.render("deposit_select_currency");
      else if (m_session.serviceName === "cashin_nukk")
        scr.render("nukk_select");
      else
        scr.render("main_menu");
      m_session.askmoretime = false;
      return "ok";
    }
    case 'ask_more_time': {
      m_session.askmoretime = true;
      scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code":false}}, onButtonEmpty);

      m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessagePINSecondAskMoreTime.elementObject);
      scr.setModalMessageJson(m_session.jsonObj.objHelp, onMoreTimeCallPinSecond);

      scr.setTimeout("0", "", onTimeout);
      window.external.exchange.RefreshScr();
      return "ok";
    }
    case 'wait_pin_error': {
      m_session.pinerror = true;
      checkAndGoToPinOrNcf();
      return "ok";
    }
    case "nfc_read": {
      if(m_session.nfc_taped === 3)
      {
        m_session.nfc_taped = 0;
        callSupport("canceltap");
        return "ok";
      }
      else
        m_session.nfc_taped++;
      m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessageNfcTap.elementObject);
      //alert("tapmessage: '"+m_session.tapmessage+"'");
      //alert("true: '"+m_session.tapmessage != "");
      if(m_session.tapmessage !== "")
      {
        //alert("tapped msg: " + m_session.tapmessage);
        m_session.jsonObj.objHelp.text = m_session.tapmessage;
        m_session.jsonObj.objHelp.ext.state = "Error";
        m_session.tapmessage = "";
      }
      else if(m_session.pinerror)
      {
        //m_session.pinerror = false;
        m_session.jsonObj.objHelp.text = getLangText("pin_attempts_left") + "\r\n" + (m_session.fitObj.formfactor === "nfc" ? getLangText("nfc_read_one_more_time_card") : getLangText("nfc_read_one_more_time_token"));
        m_session.jsonObj.objHelp.ext.state = "Error";
      }
      scr.setWait(false, "", '{"icon": ""}');
      scr.setModalMessageJson(m_session.jsonObj.objHelp, onCancelTap);
      scr.setTimeout("0", "", onButtonEmpty);
      delete m_session.timeoutObj;
      if(m_session.serviceName === "transfer_c2c")
        scr.render("cashout_amount");
      else if(m_session.serviceName === "cashout")
        m_session.askmoretime ? scr.render("cashout_amount") : window.external.exchange.RefreshScr();
      else if(m_session.serviceName === "addsim" || m_session.serviceName === "pinchange"
        || m_session.serviceName === "smsinfo"
        || m_session.serviceName === "ekassir" || m_session.serviceName === "ekassir_nfc")
      {
        window.external.exchange.RefreshScr();
      }
      else if(m_session.serviceName === "balance_print"
        || m_session.serviceName === "balance_show"
        || m_session.serviceName === "mini_statement")
        scr.type === "cashout_amount" ? (m_session.askmoretime ? scr.render("cashout_amount") : window.external.exchange.RefreshScr()) : (scr.type === "deposit_select_currency" ? scr.render("deposit_select_currency") : (scr.type === "nukk_select" ? scr.render("nukk_select") :scr.render("main_menu")));
      else if (m_session.serviceName === "cashin")
        scr.render("deposit_select_currency");
      else if (m_session.serviceName === "cashin_nukk")
        scr.render("nukk_select");
      else
        scr.render("main_menu");
      m_session.askmoretime = false;
      return "ok";
    }
    case "nfc_read_cancel": {
      onCancelGlobal();
      return "ok";
    }
    case "nfc_read_error": {
      m_session.jsonObj.objHelp = iterationCopy(m_session.jsonObj.modalMessageNfcTap.elementObject);
      m_session.jsonObj.objHelp.text = m_session.fitObj.formfactor === "nfc" ? getLangText("nfc_read_error_card") : getLangText("nfc_read_error_token");
      m_session.jsonObj.objHelp.options = [];
      m_session.jsonObj.objHelp.ext.options_settings = [];
      //m_session.jsonObj.objHelp.ext.icon = "../../graphics/icon-smile-2.svg";
      m_session.jsonObj.objHelp.ext.rotate = false;
      m_session.jsonObj.objHelp.ext.loader = "ellipse";
      m_session.jsonObj.objHelp.ext.state = "Error";
      scr.setModalMessageJson(m_session.jsonObj.objHelp, onButtonEmpty);

      window.external.exchange.RefreshScr();
      return "ok";
    }
    case "nfc_take_and_wait": {
      scr.setWait(true, getLangText('main_wait_init'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      if(m_session.serviceName === "transfer_c2c" || m_session.serviceName === "cashout")
        scr.render("cashout_amount");
      else if(m_session.serviceName === "addsim" || m_session.serviceName === "pinchange"
        || m_session.serviceName === "smsinfo"
        || m_session.serviceName === "ekassir" || m_session.serviceName === "ekassir_nfc")
        scr.render("main_menu");
      else if(m_session.serviceName === "balance_print"
        || m_session.serviceName === "balance_show"
        || m_session.serviceName === "mini_statement")
        window.external.exchange.RefreshScr();
      else
        scr.render("main_menu");
      return "ok";
    }
    case "nfc_read_hwerror":
    default: {
      return "bad";
    }
  }
};
var onCancelTap = function(name){
  callSupport("canceltap");
};
function checkAndGoToPinOrNcf(){
  if(typeof m_session.fitObj !== "undefined"
    && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")){
    m_session.nfc_taped = 0;
    if(m_session.serviceName === "ekassir_nfc")
      callSupport("reinit_ekassir_nfc");
    else
      callSupport("reinit_nfc_or_card");
  }
  else
    callSupport("go_to_pin");
}
function checkSecondPINEnterFlag(){
  //if(m_CardIcon.paysys == "visa")
  //if(m_CardIcon.paysys == "mastercard")
  m_session.second = true;
}
var onBalancePrintCheckAndGoToNfc = function(){
  alertMsgLog('onBalancePrintCheckAndGoToNfc called');
  if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    if(balancePrintReq || balanceShowReq || !m_session.mini_statement)
    {
      balancePrintNeed = true;
      balancePrintReq = true;
      printButtonRefresh(balancePrintNeed);
      return;
    }
    else if(m_session.second)
    {
      m_session.serviceName = "balance_print";
      m_session.nfc_taped = 0;
      balancePrintNeed = true;
      printButtonRefresh(balancePrintNeed);
      callSupport("reinit_nfc_or_card");
    }
    else
    {
      checkSecondPINEnterFlag();
      onBalancePrintButton();
    }
  }
  else if(!!m_session.pin && m_session.pin.needToEnter)
  {
    m_session.serviceName = "balance_print";
    callSupport("go_to_pin");
  }
  else
    onBalancePrintButton();
};
var onBalanceShowCheckAndGoToNfc = function(){
  alertMsgLog('onBalanceShowCheckAndGoToNfc called');
  //alert('here');
  if(typeof m_session.fitObj !== "undefined" &&
    (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    if(isNaN(m_session.balance))
    {
      if(balancePrintReq || balanceShowReq || !m_session.mini_statement)
      {
        balanceShowReq = true;
        scr.setButton("showremains", getLangText("showremains"), balanceShowReq ? '{"icon": "","state":"wait"}' : '{"icon": "","state":""}', balanceShowReq ? onBalanceShowButton : onBalanceShowCheckAndGoToNfc);
        showButtonRefresh(balancePrintNeed);
      }
      else if(m_session.second)
      {
        m_session.serviceName = "balance_show";
        m_session.nfc_taped = 0;
        //onBalanceShowButton();
        callSupport("reinit_nfc_or_card");
      }
      else
      {
        checkSecondPINEnterFlag();
        onBalanceShowButton();
      }
    }
    else{
      onBalanceShowButton();
    }
  }
  else if(!!m_session.pin && m_session.pin.needToEnter)
  {
    m_session.serviceName = "balance_show";
    callSupport("go_to_pin");
  }
  else
    onBalanceShowButton();
};
var onMiniStatementCheckAndGoToNfc = function(){
  alertMsgLog('onMiniStatementCheckAndGoToNfc called');
  if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
  {
    if(balancePrintReq || balanceShowReq || !m_session.mini_statement)
    {
      m_session.mini_statement = false;
      miniStatementRefresh();
      return;
    }
    else if(m_session.second)
    {
      m_session.serviceName = "mini_statement";
      m_session.nfc_taped = 0;
      miniStatementRefresh(false);
      callSupport("reinit_nfc_or_card");
    }
    else
    {
      checkSecondPINEnterFlag();
      onButtonMiniStatement();
    }
  }
  else if(!!m_session.pin && m_session.pin.needToEnter)
  {
    m_session.serviceName = "mini_statement";
    callSupport("go_to_pin");
  }
  else
    onButtonMiniStatement();
};
//------------------------------------------------------------------------------
var onDepositTestReq = function(args) {
  m_HostScreenText = window.external.exchange.getMemory("dataFromNDC");
  alertMsgLog(' onDepositTestReq, HostScreen: '+args+', add.info: '+m_HostScreenText);
  var helpInfo;
  switch(args) {
    case 'wait':
    case 'wait_request': {
      return 'ok';
    }
    case 'request_error': {
      m_session.serviceName = "pin_balance";
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    case 'ask_144_req_not_allowed':
    case 'end_304_pin_try_exceeded':{
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    case 'wait_pin_error': {
      scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
      balanceShowReq = false;
      balanceShow = false;
      if(requestCount() <= 1) {
        balancePrintReq = false;
        balancePrintNeed = false;
        if(m_session.serviceName === 'pin_balance')
        {
          m_session.serviceName = 'pin_error';
          callSupport("go_to_pin");
          scr.nextScreen(pin, 'err_on_pin');
        }
        else
        {
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")) {
            m_session.serviceName = 'balance_show';
            m_session.pinerror = true;
            m_session.nfc_taped = 0;
            callSupport("reinit_nfc_or_card");
          }
          else {
            m_session.serviceName = 'pin_error';
            callSupport("go_to_pin");
            scr.nextScreen(pin, 'err');
          }
        }
      }
      else {
        alertMsgLog('onDepositTestReq, wait_pin_error, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'balance_res_ok': {
      balanceShowReq = false;
      m_session.balance = parseFloat(parseBalance(m_HostScreenText));
      //was used to test
      //m_session.balance = 0;
      //alert("m_session.serviceName: "+m_session.serviceName);
      //alert("requestCount: "+requestCount().toString());
      var requestCountValue = requestCount();
      if(requestCountValue <= 1) {
        if(m_session.serviceName !== 'pin_balance'){
          scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
          balanceShow = true;
          setTimeout('if(balanceShow) onBalanceShowButton("showremains");',2000);
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken")){
            if(balancePrintReq) {
              balancePrintReq = false;
              balancePrintNeed = false;
              scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
            }
          }
          showButtonRefresh();
        }
        else {
          //was used to test
          //m_session.balance = NaN;
          scr.nextScreen(serviceSelect);
          return;
        }
      }
      else {
        balanceShow = false;
        scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
        alertMsgLog('onDepositTestReq, balance_res_ok, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'end_session_nfc_print':
    case 'end_session_nfc':
    case 'wait_card_captured':
    case 'card_return_print':
    case 'card_return_cashout':
    case 'card_return':
    case 'wait_end_timeout':
    case 'wait_end_session':
    case 'wait_card_error':
    case 'end_136_card_seized':
    case 'end_137_card_expired':
    case 'end_148_card_not_serviced':
    case 'end_149_no_account_found':
    case 'wait_card_notprocess':
    case 'wait_card_hold':{
      balancePrintReq = false;
      balancePrintNeed = false;
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
    case "ask_132_thx":{
      try {
        m_session.comminfo = JSON.parse(window.external.exchange.getMemory("comminfo"));
        m_session.comminfo.mincomm = parseFloat(m_session.comminfo.mincomm, 10);
        m_session.comminfo.maxdeposit = parseFloat(m_session.comminfo.maxdeposit, 10);
        m_session.comminfo.percent = parseFloat(m_session.comminfo.percent, 10);
      }
      catch(ex) {
        alertMsgLog(' onDepositTestReq, Exception: '+ex.message);
        //m_session.comminfo = {};
      }
      if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.formfactor === "nfc")
        checkSecondPINEnterFlag();
      //window.external.exchange.setMemory("comminfo", "{}");
      scr.nextScreen(serviceSelect);
      return "ok";
    }
    case "deposit_without_nukk": {
      m_session.comminfo = {};
      scr.nextScreen(serviceSelect);
      return "ok";
    }
    case "deposit_nukk_err":
      try{
        helpInfo = window.external.exchange.getMemory("comminfo");
        m_session.comminfo = JSON.parse(helpInfo);
      }
      catch(ex) {
        alertMsgLog(' cashin, Exception: '+ex.message);
        m_session.comminfo.cashinoff = true;
      }
      scr.nextScreen(serviceSelect);
      return "ok";
    case "deposit_nukk_contract":
      try{
        helpInfo = window.external.exchange.getMemory("comminfo");
        m_session.comminfo = JSON.parse(helpInfo);
      }
      catch(ex) {
        alertMsgLog(' cashin, Exception: '+ex.message);
        m_session.comminfo.contract = true;
      }
      scr.nextScreen(serviceSelect);
      return "ok";
    case "deposit_nukk_destination_select": {
      try{
        helpInfo = window.external.exchange.getMemory("comminfo");
        m_session.comminfo = JSON.parse(helpInfo);
      }
      catch(ex) {
        alertMsgLog(' cashin, Exception: '+ex.message);
        //m_session.comminfo = {};
      }
      scr.nextScreen(serviceSelect);
      return "ok";
    }
    default: {
      balanceShowReq = false;
      balanceShow = false;
      scr.nextScreen(requestResult, [args]);
      return 'ok';
    }
  }
};
function allowToReturnToMenu(_ServiceName){
  var trantypeTellME = window.external.exchange.getMemory("trantype");
  var result = true;
  if(_ServiceName === "pin_balance")
    result = false;
  else if(_ServiceName === "deposit_nukk_check")
    result = false;
  else if(_ServiceName === "card_seized")
    result = false;
  else if(m_session.fitObj.formfactor === "card" && trantypeTellME == "0")
    result = false;
  return result;
}
//------------------------------------------------------------------------------
function onButtonMiniStatement(someArgs) {
  if(m_session.mini_statement)
  {
    m_session.mini_statement = !m_session.mini_statement;
    scr.setButtonJson({
        name: "settings", text: getLangText("button_mini_statement"), visible: true,
        enable: m_session.mini_statement, disabled:!m_session.mini_statement,
        ext: m_session.mini_statement ? {"icon": "../../graphics/mini-statement.svg"} : {
          "icon": "../../graphics/mini-statement.svg",
          "themes": ["wait"]
        }
      }
      , onMiniStatementCheckAndGoToNfc);
    window.external.exchange.refreshScr();
    if(requestCount() <= 1)
      m_session.serviceName = "mini_statement";
    callSupport("mini_statement", onMiniStatementService);
  }
  else
    alertMsgLog('onButtonMiniStatement while already requested.');
}
function miniStatementRefresh(someArgs){
  if(scr.buttonExists("settings"))
  {
    miniStatementAddButton(someArgs);
    if(!scr.scrWaitShown() && !scr.scrModalMessageShown() && scr.type !== "card_settings_menu")
      window.external.exchange.refreshScr();
  }
}
function miniStatementAddButton(someArgs){
  var flag = typeof someArgs !== "undefined" ? someArgs : m_session.mini_statement;
  scr.setButtonJson({
      name: "settings", text: getLangText("button_mini_statement"), visible: true,
      enable: m_ATMFunctions.printer&&flag&&miniStatementEnabled(), disabled: !flag&&miniStatementEnabled(),
      ext: flag ? {"icon": "../../graphics/mini-statement.svg"} :
        (miniStatementEnabled() ?
          {"icon": "../../graphics/mini-statement.svg","themes": ["wait"]} :
          {"icon": "../../graphics/mini-statement.svg"})
    }
    , onMiniStatementCheckAndGoToNfc);
}
function onMiniStatementService(someArgs) {
  alertMsgLog('onMiniStatementService, args '+someArgs+'.');
  switch(someArgs){
    case 'wait':
    case 'wait_request': {
      return 'ok';
    }
    case 'request_error': {
      m_session.mini_statement = miniStatementEnabled();
      if(!m_session.ownCard && requestCount() <= 1){
        m_session.serviceName = "mini_statement";
        scr.nextScreen(requestResult, [someArgs]);
      } else {
        miniStatementRefresh();
      }
      return 'ok';
    }
    case 'end_304_pin_try_exceeded':{
      m_session.serviceName = "mini_statement";
      scr.nextScreen(requestResult, [someArgs]);
      return 'ok';
    }
    case 'ask_132_thx':
    case 'request_ok':
    case 'balance_res_ok': {
      if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
      {
        if(balancePrintReq || balancePrintNeed)
        {
          balancePrintReq = false;
          balancePrintNeed = false;
          scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
        }
        if(balanceShowReq || balanceShow)
        {
          balanceShow = false;
          balanceShowReq = false;
          scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
        }
      }
      m_session.mini_statement = miniStatementEnabled();
      miniStatementRefresh();
      return 'ok';
    }
    case 'wait_pin_error': {
      if(requestCount() <= 1)
      {
        if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
        {
          m_session.serviceName = 'mini_statement';
          m_session.pinerror = true;
          m_session.nfc_taped = 0;
          callSupport("reinit_nfc_or_card");
        }
        else
        {
          m_session.serviceName = 'pin_error';
          callSupport("go_to_pin");
          scr.nextScreen(pin, 'err');
        }
      }
      else
      {
        m_session.mini_statement = miniStatementEnabled();
        miniStatementRefresh();
        alertMsgLog('onMiniStatementService, wait_pin_error, requestCount > 1, do nothing');
      }
      return 'ok';
    }
    case 'end_session_nfc_print':
    case 'end_session_nfc':
    case 'wait_card_captured':
    case 'card_return_print':
    case 'card_return_cashout':
    case 'card_return':
    case 'wait_end_timeout':
    case 'wait_end_session':
    case 'wait_card_error':
    case 'end_136_card_seized':
    case 'end_137_card_expired':
    case 'end_148_card_not_serviced':
    case 'end_149_no_account_found':
    case 'wait_card_notprocess':
    case 'wait_card_hold':{
      m_session.mini_statement = miniStatementEnabled();
      scr.nextScreen(requestResult, [someArgs]);
      return 'ok';
    }
    default: {
      m_session.mini_statement = miniStatementEnabled();
      if(requestCount() <= 1)
      {
        if(!m_session.ownCard)
        {
          m_session.serviceName = "pin_balance";
          scr.nextScreen(requestResult, [someArgs]);
        }
        else
        {
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
          {
            if(balancePrintReq || balancePrintNeed)
            {
              balancePrintReq = false;
              balancePrintNeed = false;
              scr.setButton("print", "", m_ATMFunctions.printer, true, '{"icon": "../../graphics/print-balance.svg"}', onBalancePrintCheckAndGoToNfc);
            }
            if(balanceShowReq || balanceShow)
            {
              balanceShow = false;
              balanceShowReq = false;
              scr.setButton("showremains", getLangText("showremains"), '{"icon": "","state":""}', onBalanceShowCheckAndGoToNfc);
            }
          }
          m_session.mini_statement = miniStatementEnabled();
          miniStatementRefresh();
        }
      }
      else
      {
        alertMsgLog('onMiniStatementService, '+someArgs+', requestCount > 1, do nothing');
      }
    }
  }
  return 'ok';
}
function miniStatementEnabled(){
  return typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "own"
    && m_session.fitObj.formfactor !== "nfctoken";
}
function nfcOrNfctokenUsed(){
  return typeof m_session.fitObj !== "undefined" &&
    (m_session.fitObj.formfactor === "nfctoken" || m_session.fitObj.formfactor === "nfc");
}
//------------------------------------------------------------------------------
function isOurTokenVisa(){
  return typeof m_session.fitObj !== "undefined" && m_session.fitObj.formfactor === "nfctoken" &&
    m_CardIcon.paysys === "visa";
}
function isTransferAvailableForTest(){
  return m_session.tagOnATMExists("#test_p2p");
}
function isTransferAvailableForCardType(){
  return typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "own" && !isOurTokenVisa() ||
    isTransferAvailableForTest();
}
//------------------------------------------------------------------------------
start = function(args) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);
  return;


  alertMsgLog(' '+scr.name+'. Экран инициализации');
  m_session = new SessionVariables();
  window.external.exchange.SetPartialRefresh();
  if(typeof args == 'undefined'){
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.render("wait_message");
  }
  else {
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.render("wait_message");
  }
  //window.external.exchange.ExecNdcService2("startCardless", "");
};
oos = function() {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  alertMsgLog(' oos');

  scr.setLabel("text", getLangText('wait_oos'), "");
  //scr.setLabel("loader","60", '{"loader":"loader"}');
  scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-3.svg"}');
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.render("wait_message");
  alertMsgLog(' '+scr.name+'. Страница OOS');
};
main = function(args) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  window.external.exchange.SetPartialRefresh();
  var onTellMEWrapper = function(funcArgs) {
    switch(funcArgs) {
      case "pin":
        scr.nextScreen(pin);
        break;
      default:
        scr.nextScreen(requestResult, [funcArgs]);
        break;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var sessionHelp;
  if(!!args) {
    var helpArgs = window.external.exchange.getMemory("dataFromNDC");
    var trantype = window.external.exchange.getMemory("trantype");
    switch(args) {
      case 'cardless': {
        scr.nextScreen(serviceSelectCash);
        return;
      }
      case 'card_inserted': {
        initSessionParams();
        scr.nextScreen(cardInserted);
        return;
      }
      case "menu_chip_app": {
        initSessionParams();
        scr.nextScreen(cardInserted, args);
        return;
      }
      case 'return_from_ekassir': {
        try{
          m_session = JSON.parse(window.external.exchange.getMemory("session"));
          m_CardIcon = JSON.parse(window.external.exchange.getMemory("cardIcon"));
          m_session.balance = NaN;
          if(!!m_session.fitObj && m_session.fitObj.formfactor === "cash")
            trantype = 0;
          else
            trantype = 1;
        } catch(e) {
          m_session = new SessionVariables();
          m_session.fitObj = {formfactor: "cash"};
        }
        if(m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"){
          if(trantype == 1) {
            try {
              getATMMoney();
            } catch(e) {
              alertMsgLog('main errMessageEkass getMemory'+e.message);
              callSupport("cancel");
              return;
            }
          }
          scr.nextScreen(cardInserted, "ekassir");
        }
        else
          scr.nextScreen(cardInserted, "wait_please_wait");
        return;
      }
      case 'advertising_response': {
        scr.nextScreen(cardInserted, "ekassir");
        return;
      }
      case 'errMessageEkass': {
        try{
          m_session = new SessionVariables();
          sessionHelp = window.external.exchange.getMemory("session");
          sessionHelp = JSON.parse(sessionHelp);
          simpleCopy(m_session, sessionHelp);
          if(!!m_session.fitObj && m_session.fitObj.formfactor === "cash")
            trantype = 0;
          else
            trantype = 1;
        } catch(e) {
          m_session = new SessionVariables();
          m_session.fitObj = {formfactor: "cash"};
        }
        if(trantype == 1) {
          try {
            m_CardIcon = JSON.parse(window.external.exchange.getMemory("cardIcon"));
            m_session.balance = NaN;
            getATMMoney();
          } catch(e) {
            alertMsgLog('main errMessageEkass getMemory'+e.message);
            callSupport("cancel");
            return;
          }
        }
        scr.nextScreen(requestResult, [helpArgs]);
        return;
      }
      case 'nfc_ekassir':{
        try{
          m_session = JSON.parse(window.external.exchange.getMemory("session"));
          if(!!m_session.fitObj && m_session.fitObj.formfactor === "cash")
            trantype = 0;
          else
            trantype = 1;
        } catch(e) {
          m_session = new SessionVariables();
          m_session.fitObj = {formfactor: "cash"};
        }
        if(trantype == 1) {
          try {
            m_CardIcon = JSON.parse(window.external.exchange.getMemory("cardIcon"));
            m_session.balance = NaN;
          } catch(e) {
            alertMsgLog('main nfc_ekassir getMemory'+e.message);
            callSupport("cancel");
            return;
          }
        }
        m_session.serviceName = "ekassir_nfc";
        scr.nextScreen(ekassir, 3);
        return;
      }
      case 'before_pin':
        initSessionParams();
      case 'before_pin_incass': {
        if(args === "before_pin_incass")
          m_session.incass = true;
        try {
          m_session.fitObj = JSON.parse(window.external.exchange.getMemory("dataFromNDC"));
          var help = window.external.exchange.getMemory("comminfo");
          if(!!help)
          {
            m_session.comminfo = JSON.parse(help);
            m_session.comminfo.mincomm = parseFloat(m_session.comminfo.mincomm);
            m_session.comminfo.maxdeposit = parseFloat(m_session.comminfo.maxdeposit);
            m_session.comminfo.percent = parseFloat(m_session.comminfo.percent);
          }
        }
        catch(e) {
          alertMsgLog("exception " + e + ", scr: "+scr.name);
          callSupport("cancel");
          return;
        }
        m_CardIcon = getPaySystem(m_session.fitObj);
        if(m_CardIcon.paysys === "mir" && !!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken"){
          if(!m_session.tagOnATMExists("#testMIRtoken")) {
            scr.nextScreen(msgResult,["card_not_serviced_nfc_mir", "end"]);
            //callSupport("cancelnfc");
            return;
          }
        }
        if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken" &&
          m_session.fitObj.cancel === true){
          scr.nextScreen(msgResult,[m_session.fitObj.canceltext, "end"]);
          //callSupport("cancelnfc");
          return;
        }
        m_session.ownCard = isOpenCard(m_session.fitObj);
        m_session.setNecessaryParameters(m_CardIcon);
        scr.addCall("TellMEWrapper", onTellMEWrapper);
        callSupport("go_to_pin");
        return;
      }
      case "cancelerror": {
        scr.nextScreen(msgResult,['nfc_read_error_card', "error_card_read"]);
        callSupport("cancel")
        return;
      }
      default: {
        scr.nextScreen(requestResult, [args]);
        return;
      }
    }
  }

  //scr.render("insert_card");
  //scr.render("insert_card_advertising");


  /*if(typeof m_CheckSum != 'undefined')
		alertMsgLog('Ожидание клиента testAmount: 1000 is '+m_CheckSum.isAmountExist(1000, m_Currency.getSelectedCode(), true));	*/
  alertMsgLog(scr.name+'. Стартовый экран, agrs: '+ !!args?args:"null" );
  scr.setLabel("text", getLangText('main_wait_init'), "");
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("loader","60", '{"loader":"loader"}');
  //scr.setImage("smile","../../graphics/icon-smile-2.svg","");
  scr.render("wait_message");
  //scr.nextScreen(msgResult,['main_wait_init','wait_init']);
};
function initSessionParams(){
  getATMMoney();
  balanceShow = false;
  balanceShowReq = false;
  balancePrintNeed = false;
  balancePrintReq = false;
  m_session = new SessionVariables();
}
cardInserted = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onMoreTimeCall = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoreTime, value: '+_args);

    //if(_args == onMoreTimeButtons[1])
    if(_args == 1)
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_yes");
      serviceName = "moretime";
    }
    else
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_no");
      serviceName = "return";
    }
  }
  var onChipApp = function(args)
  {
    var fdkCode = "27";
    alertMsgLog(' '+scr.name+' onChipApp args '+args);
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0)
      pKey = args[0];
    else
      pKey = args;
    alertMsgLog(' '+scr.name+' onChipApp btn: '+pKey);
    switch(cardAppList[parseInt(pKey.charAt(3),10) - 1])
    {//["0", "1", "5", "2", "6", "3", "7", "4", "8"]
      case "btn1":
        fdkCode = "116";
        break;
      case "btn2":
        fdkCode = "120";
        break;
      case "btn3":
        fdkCode = "115";
        break;
      case "btn4":
        fdkCode = "119";
        break;
      case "btn5":
        fdkCode = "114";
        break;
      case "btn6":
        fdkCode = "118";
        break;
      case "btn7":
        fdkCode = "113";
        break;
      case "Btn8":
        fdkCode = "117";
        break;
      default:
        fdkCode = "27";
        break;
    }
    scr.nextScreen(cardInserted, "wait_read_chip");
    callSupport("fdk_button_push&fdk="+fdkCode);
    return;
  }
  var onTellMEWrapper = function(funcArgs) {
    tmpData = "";
    switch(funcArgs) {
      case 'cardless': {
        m_session.isCard = false;
        m_CardIcon.value = "";
        m_session.setNecessaryParameters();
        scr.nextScreen(serviceSelectCash);
        break;
      }
      case 'before_pin_incass':
        m_session.incass = true;
      case 'before_pin': {
        try {
          m_session.fitObj = JSON.parse(window.external.exchange.getMemory("dataFromNDC"));
          var help = window.external.exchange.getMemory("comminfo");
          if(!!help) {
            m_session.comminfo = JSON.parse(help);
            m_session.comminfo.mincomm = parseFloat(m_session.comminfo.mincomm);
            m_session.comminfo.maxdeposit = parseFloat(m_session.comminfo.maxdeposit);
            m_session.comminfo.percent = parseFloat(m_session.comminfo.percent);
          }
        } catch(e) {
          alertMsgLog("exception " + e + ", scr: "+scr.name);
          callSupport("cancel");
          return;
        }
        m_CardIcon = getPaySystem(m_session.fitObj);
        if(m_CardIcon.paysys === "mir" && !!m_session.fitObj &&
          m_session.fitObj.formfactor === "nfctoken") {
          if(!m_session.tagOnATMExists("#testMIRtoken")) {
            scr.nextScreen(msgResult,["card_not_serviced_nfc_mir", "end"]);
            //callSupport("cancelnfc");
            return;
          }
        }
        if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken" &&
          m_session.fitObj.cancel === true) {
          scr.nextScreen(msgResult,[m_session.fitObj.canceltext, "end"]);
          //callSupport("cancelnfc");
          return;
        }
        m_session.ownCard = isOpenCard(m_session.fitObj);
        m_session.setNecessaryParameters(m_CardIcon);
        callSupport("go_to_pin");
        break;
      }
      case "pin": {
        scr.nextScreen(pin);
        break;
      }
      case "wait_read_chip": {
        scr.nextScreen(cardInserted, "wait_read_chip");
        return;
      }
      case "menu_chip_app": {
        scr.nextScreen(cardInserted, "menu_chip_app");
        return;
      }
      case "wait":
      case "wait_request": break;
      case 'ask_more_time': {
        onMoreTimeButtons = [getLangText(m_session.isCard ? 'button_logout_card' : 'button_logout_cash'), getLangText('button_continue')];
        scr.setModalMessage(getLangText('need_more_time'), onMoreTimeButtons, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 25,"options_settings":[{"name":"cancel","icon":'+(m_session.isCard ? '"../../graphics/icon-pick-card-red.svg"' : '"../../graphics/icon-logout.svg"') +',"theme":"btn-white-red"},{"name":"logout","icon":""}]}', onMoreTimeCall);
        window.external.exchange.RefreshScr();
        return;
      }
      default:
        scr.nextScreen(requestResult, [funcArgs]);
        break;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var onMoreTimeButtons = [];
  var cardAppList = [];
  var preLang = window.external.exchange.getMemory("preLang");
  if(preLang !== '')
  {
    m_session.lang = preLang === 'ru' ? 'ru' : 'en';
    window.external.exchange.setMemory("preLang", "");
  }

  if(typeof args != 'undefined')
  {
    if(args === 'ekassir')
    {
      try
      {
        m_CardIcon = JSON.parse(window.external.exchange.getMemory("cardIcon"));
        m_session = new SessionVariables();
        var sessionHelp = window.external.exchange.getMemory("session");
        alertMsgLog('getMemory: '+sessionHelp);
        sessionHelp = JSON.parse(sessionHelp);
        alertMsgLog('getMemory: '+typeof sessionHelp);
        simpleCopy(m_session, sessionHelp);
        alertMsgLog('getMemory m_session: '+JSON.stringify(m_session));
        m_session.balance = NaN;
        getATMMoney();
        scr.nextScreen(serviceSelect);
      }
      catch(e)
      {
        alertMsgLog('getMemory'+e.message);
        callSupport("cancel");
      }
      return;
    }
    else if (args === 'wait_read_chip')
    {
      scr.setLabel("text", getLangText('main_wait_init'), "");
      scr.setImage("bg","../.2./graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"loader"}');
      addLangSwitch();
      scr.render("wait_message");
      //window.external.exchange.refreshScr();
      return;
    }
    else if (args === 'wait_please_wait')
    {
      scr.setLabel("text", getLangText('wait_please_wait'), "");
      scr.setImage("bg","../.2./graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"loader"}');
      scr.render("wait_message");
      //window.external.exchange.refreshScr();
      return;
    }
    else if(args === "menu_chip_app")
    {
      var helpName, indx, fdkArr = ["0", "1", "5", "2", "6", "3", "7", "4", "8"];
      scr.setLabelJson({name:"header", value:getLangText('main_header1')+"<br>"+getLangText('chip_app_ask')});
      //scr.setLabelJson({name:"title02", value:getLangText('chip_app_ask')});
      scr.setLabelJson({name:"note", value:getLangText('chip_app_sub1')});
      addLangSwitch();
      for(indx = 1; indx <= 8; indx++)
      {
        helpName = checkChipApp(indx);
        if(helpName !== "")
        {
          cardAppList.push("btn"+indx);
          var iconHelp = "";
          if(helpName.toLowerCase().indexOf("мир") !== -1 || helpName.toLowerCase().indexOf("mir") !== -1)
            iconHelp = "img/mir.png";
          else if(helpName.toLowerCase().indexOf("visa") !== -1 || helpName.toLowerCase().indexOf("виза") !== -1)
            iconHelp = "";
          else if(helpName.toLowerCase().indexOf("master") !== -1 || helpName.toLowerCase().indexOf("мастер") !== -1)
            iconHelp = "";
          scr.setButtonJson({name:"btn"+cardAppList.length, text:helpName, visible:true, enable:true, ext:{icon:iconHelp}}, onChipApp);
        }
      }
      if(m_session.isCard)
        scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onCancel);
      else
        scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
      scr.render("application_choose");
      return;
    }
  }



  //scr.setLabel("text", getLangText('main_wait_init'), "");
  var cashOperation = window.external.exchange.getMemory("cashOperation");
  if(cashOperation == "1")
  {
    scr.setLabel("text", getLangText('msgResult_wait_before_cardless'), "");
    window.external.exchange.setMemory("cashOperation", "");
  }
  else
  {
    addLangSwitch();
    scr.setLabel("text", getLangText('msgResult_wait_read_chip'), "");
  }
  scr.setImage("bg","../.2./graphics/BG_blur.jpg","");
  scr.setLabel("loader","60", '{"loader":"loader"}');
  //scr.setImage("smile","../../graphics/icon-smile-2.svg","");
  scr.render("wait_message");
  alertMsgLog(scr.name+'. Проверка оборудования');
};
emulCardInserted = function() {
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  initSessionParams();
  m_session.fitObj = {PAN:"123456789012345", fitType:"own", formfactor:"card"};
  m_CardIcon = getPaySystem(m_session.fitObj);
  m_session.setNecessaryParameters(m_CardIcon);
  m_session.serviceName = "pin_balance";
  balanceShowReq = false;
  balanceShow = false;
  //scr.addCall("TellMEWrapper", onBalanceShowService);
  //onBalanceShowButton("");
  scr.nextScreen(serviceSelect);
  return;
};
var pin = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onCancel = onCancelLocal = function(name){
    scr.nextScreen(msgResult,["", "end"]);
    callSupport("cancel");
  };
  var onContinue = function(name) {
    alertMsgLog(' '+scr.name+', ' + name + ', .продолжить на Вводе пин-кода.');
    var help = {};
    help['pinValue'] = m_session.pin.value;
    callSupport("pin_enter&pinValue="+help.pinValue);
  };

  var onMoreTimeCall = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoreTime, value: '+_args);

    //if(_args == onMoreTimeButtons[1])
    if(_args == 1)
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_yes");
      serviceName = "moretime";
    }
    else
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_no");
      serviceName = "return";
    }
  };
  var onInput = function(args)
  {
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0)
    {
      var help;
      if(typeof args[1] == 'undefined')
        help = args;
      else
      {
        pKey = args[0];
        help = args[1];
      }
    }
    m_session.pin.length = controlPinLength(help);
    m_session.pin.value = help;
    scr.setInput("pin_code", "", "","",false,true,'{"pin_code": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput);
    if(m_session.pin.maxlength !== 4)
    {
      buttonHelp = iterationCopy(m_session.jsonObj.buttonPINContinue.elementObject);
      buttonHelp.enable = m_session.pin.value.length >= 4;
      scr.setButtonJson(buttonHelp, onContinue);
      window.external.exchange.RefreshScr();
    }
  };
  var onUnknownCard = function (args)
  {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0)
    {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else
    {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onUnknownCard, value: '+_args);

    if(_args == 1)
    {
      scr.nextScreen(serviceSelect);
    }
    else
    {
      onCancelGlobal();
    }
  };

  var onTellMEWrapper = function(pinResult){
    switch (pinResult){
      case 'end_pin_timeout':
        onCancelTimeout();
        return;
      case 'end_pin_cancel':
        onCancelGlobal();
        return;
      case 'menu_main': {
        if(m_session.ownCard && (typeof m_session.fitObj === "undefined" ||
          (m_session.fitObj.formfactor !== "nfc" && m_session.fitObj.formfactor !== "nfctoken"
            && m_session.fitObj.fitType !== "friend")))
        {
          if (type === "second") {
            if (m_session.serviceName === 'cashout') {
              scr.nextScreen(giveMoney, [m_session.cashout.amount, 1]);
            }
            else if (m_session.serviceName === 'transfer_c2c') {

              scr.nextScreen(transferMenu, 3);
            }
            else if (m_session.serviceName === 'ekassir') {
              scr.nextScreen(ekassir, 1);
            }
            return;
          }
          scr.setInputJson({ name: "pin_code", text: '', visible: false, validate: true, state: 'Wait',
            ext: {pin_code: true, length: m_session.pin.length, filledCount: m_session.pin.value.length}
          }, onInput);
          scr.setButton("switch_lang", getLangText("switch_lang_button"), true, false, '{"icon": "", "display_group":"bottom_line"}', onError);

          buttonHelp = iterationCopy(m_session.jsonObj.buttonPINContinue.elementObject);
          if (m_session.pin.maxlength !== 4)
            buttonHelp.enable = false;
          scr.setButtonJson(buttonHelp, onContinue);

          buttonHelp = iterationCopy(m_session.jsonObj.buttonPINCancel.elementObject);
          buttonHelp.enable = false;
          scr.setButtonJson(buttonHelp, onCancelLocal);

          window.external.exchange.RefreshScr();
          //scr.render("pin_code");
          //if(!corpCardPAN(m_session.fitObj.PAN) || m_session.lang === "en")
          if(!m_session.comminfo || m_session.comminfo.corpcard !== true || m_session.lang === "en") {
            m_session.pin.needToEnter = false;
            balanceShowReq = false;
            balanceShow = false;
            m_session.serviceName = "pin_balance";
            onBalanceShowButton(name);
          }
          else {
            m_session.serviceName = "deposit_nukk_check";
            callSupport("deposit_nukk_check", onDepositTestReq);
          }
        }
        else if(typeof m_session.fitObj !== "undefined" &&
          (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken") &&
          //(corpCardPAN(m_session.fitObj.PAN) || corpCardPANforDI(m_session.fitObj.PAN) ||corpCardOnlyByCard(m_session.fitObj.PAN)) &&
          !!m_session.comminfo && m_session.comminfo.corpcard === true &&
          m_session.lang !== "en")
        {
          //if(corpCardPANforDI(m_session.fitObj.PAN))
          if(m_session.comminfo.corpcard_di === true)
          {
            //m_session.comminfo = {percent:0.0, mincomm: 0.0, nukk:true};
            scr.nextScreen(serviceSelect);
          }
          //else if(corpCardOnlyByCard(m_session.fitObj.PAN))
          else if(m_session.comminfo.onlybycard === true)
          {
            //m_session.comminfo = {percent:0.0, mincomm: 0.0, onlybycard:true, cashinoff:true};
            scr.nextScreen(serviceSelect);
          }
          //else if(corpCardPAN(m_session.fitObj.PAN))
          else if(m_session.comminfo.corpcard === true)
          {
            scr.setInputJson({ name: "pin_code", text: '', visible: false, validate: true, state: 'Wait',
              ext: {pin_code: true, length: m_session.pin.length, filledCount: m_session.pin.value.length}
            }, onInput);
            scr.setButton("switch_lang", getLangText("switch_lang_button"), true, false, '{"icon": "", "display_group":"bottom_line"}', onError);

            buttonHelp = iterationCopy(m_session.jsonObj.buttonPINContinue.elementObject);
            if (m_session.pin.maxlength !== 4)
              buttonHelp.enable = false;
            scr.setButtonJson(buttonHelp, onContinue);

            buttonHelp = iterationCopy(m_session.jsonObj.buttonPINCancel.elementObject);
            buttonHelp.enable = false;
            scr.setButtonJson(buttonHelp, onCancelLocal);

            window.external.exchange.RefreshScr();
            checkSecondPINEnterFlag();
            m_session.serviceName = "deposit_nukk_check";
            callSupport("deposit_nukk_check",onDepositTestReq);
          }
        }
        else if(m_session.ownCard && (typeof m_session.fitObj === "undefined" ||
          (m_session.fitObj.formfactor === "card" && m_session.fitObj.fitType === "friend"))
          && (!!m_session.comminfo && m_session.comminfo.corpcard === true && m_session.lang !== "en")){
          scr.setInputJson({ name: "pin_code", text: '', visible: false, validate: true, state: 'Wait',
            ext: {pin_code: true, length: m_session.pin.length, filledCount: m_session.pin.value.length}
          }, onInput);
          scr.setButton("switch_lang", getLangText("switch_lang_button"), true, false, '{"icon": "", "display_group":"bottom_line"}', onError);

          buttonHelp = iterationCopy(m_session.jsonObj.buttonPINContinue.elementObject);
          if (m_session.pin.maxlength !== 4)
            buttonHelp.enable = false;
          scr.setButtonJson(buttonHelp, onContinue);

          buttonHelp = iterationCopy(m_session.jsonObj.buttonPINCancel.elementObject);
          buttonHelp.enable = false;
          scr.setButtonJson(buttonHelp, onCancelLocal);

          window.external.exchange.RefreshScr();
          checkSecondPINEnterFlag();
          m_session.serviceName = "deposit_nukk_check";
          callSupport("deposit_nukk_check",onDepositTestReq);
        }
        else if(m_session.incass)
          scr.nextScreen(incass, 'menu');
        else
          scr.nextScreen(serviceSelect);
        return;
      }
      case 'ask_more_time': {
        //scr.setModalMessage(getLangText('need_more_time'), onMoreTimeButtons, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 25,"options_settings":[{"name":"cancel","icon":'+(m_session.isCard ? '"../../graphics/icon-pick-card-red.svg"' : '"../../graphics/icon-logout.svg"') +',"theme":"btn-white-red"},{"name":"logout","icon":""}]}', onMoreTimeCall);
        scr.setModalMessageJson(m_session.jsonObj.modalMessagePINAskMoreTime.elementObject, onMoreTimeCall);
        window.external.exchange.RefreshScr();
        return;
      }
      case 'pin': {
        if(m_session.serviceName === 'pin_error')
          scr.nextScreen(pin, type);
        else
          scr.nextScreen(pin);
        return;
      }
      default: {
        scr.nextScreen(requestResult,[pinResult]);
        return;
      }
    }
  };
  var onMoreTimeButtons = [getLangText(m_session.isCard ? 'button_logout_card' : 'button_logout_cash'), getLangText('button_continue')];

  alertMsgLog(' '+scr.name+'. Ввод пин-кода. HostScreen' + m_HostScreen);

  if(m_session.langSwitched === 0){
    m_session.pin.value = '';
    m_session.pin.length = controlPinLength('', 4);
  }
  m_session.setNecessaryParameters(m_CardIcon);
  alertMsgLog('[PIN] maxlength: '+m_session.pin.maxlength);
  if(typeof type == 'undefined')
  {
    addLangSwitch();
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    //if(atmIdIsEven())
    scr.setLabel("attempts_left",getLangText('pin_enter_welcome'), "");
    //else
    //	scr.setLabel("attempts_left",getLangText('pin_enter_welcome'), "");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    m_session.onMoreTimeButtonsPinSecond = [getLangText(m_session.isCard ? 'button_logout_card' : 'button_logout_cash'), getLangText('button_continue')];
    if(m_session.pin.maxlength !== 4)
      m_session.pinEnterPinOptionsPinSecond = [getLangText("button_logout_card"), getLangText("button_continue")];
    else
      m_session.pinEnterPinOptionsPinSecond = [getLangText("button_logout_card")];

    scr.setInput("pin_code", "", "","",false,true,'{"pin_code": true,"length": '+m_session.pin.length+', "maxlength": '+m_session.pin.maxlength+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput);
  }
  else if(type === 'second')
  {
    //addLangSwitch();
    scr.setImage("bg","../../graphics/BG_blur.jpg","");

    scr.setLabel("attempts_left",getLangText('Еще раз'), "");
    scr.setLabel("forgot_pin",getLangText(''), "");
    scr.setLabel("change_pin_text","", "");
    scr.setLabel("change_pin_text2","", "");
    scr.setLabel("change_pin_phone","", "");

    scr.setInput("pin_code", "", "","",false,true,'{"pin_code": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput, m_session.pin.value.length === 0 ? "Error" : "");

  }
  else if(type === 'err')
  {
    addLangSwitch();
    scr.setImage("bg","../../graphics/BG_blur.jpg","");

    scr.setLabel("attempts_left",getLangText('pin_attempts_left'), "");
    scr.setLabel("forgot_pin",getLangText('pin_forgot_pin'), "");
    if(!!m_session.fitObj && (m_session.fitObj.fitType === "own" || m_session.fitObj.fitType === "gru"))
    {
      scr.setLabel("change_pin_text",getLangText('pin_change_pin_text'), "");
      scr.setLabel("change_pin_text2",getLangText('pin_change_pin_text2'), "");
      scr.setLabel("change_pin_phone",getLangText('pin_change_pin_phone'), "");
    }
    else
    {
      scr.setLabel("change_pin_text",getLangText('pin_err_text'), "");
      scr.setLabel("change_pin_text2",getLangText('pin_err_text2'), "");
    }
    scr.setInput("pin_code", "", "","",false,true,'{"pin_code": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput, m_session.pin.value.length === 0 ? "Error" : "");

  }
  else if(type === 'err_on_pin')
  {
    addLangSwitch();
    scr.setImage("bg","../../graphics/BG_blur.jpg","");

    //scr.setLabel("attempts_left",getLangText('pin_attempts_left'), "");
    scr.setLabel("forgot_pin",getLangText('pin_forgot_pin'), "");
    if(!!m_session.fitObj && (m_session.fitObj.fitType === "own" || m_session.fitObj.fitType === "gru"))
    {
      scr.setLabel("change_pin_text",getLangText('pin_change_pin_text'), "");
      scr.setLabel("change_pin_text2",getLangText('pin_change_pin_text2'), "");
      scr.setLabel("change_pin_phone",getLangText('pin_change_pin_phone'), "");
    }
    else
    {
      scr.setLabel("change_pin_text",getLangText('pin_err_text'), "");
      scr.setLabel("change_pin_text2",getLangText('pin_err_text2'), "");
    }
    scr.setInput("pin_code", "", "","",false,true,'{"pin_code": true,"length": '+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput, m_session.pin.value.length === 0 ? "Error" : "");

  }
  var buttonHelp = iterationCopy(m_session.jsonObj.buttonPINContinue.elementObject);
  buttonHelp.enable = m_session.pin.value.length >= 4;
  scr.setButtonJson(buttonHelp, onContinue);
  scr.setButtonJson(m_session.jsonObj.buttonPINCancel.elementObject, onCancelLocal);

  m_session.second = false;
  m_session.balance = NaN;
  scr.addCall("TellMEWrapper", onTellMEWrapper);
  if(scr.type !== "pin_code")
    scr.render("pin_code");
  else
    window.external.exchange.RefreshScr();
};

consoleScreen = function()
{

  var currnetOperation;
  var onMoneyCallOptions = ["Y","N"];
  var bimType = window.external.exchange.bimModuleManyNotes();
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  var onCancel = function(name){
    scr.setLabel("cmd","Bye!", "");
    window.external.exchange.refreshScr();
    callSupport("cancel");
  }
  var onDeposit = function(name){
    currnetOperation = "deposit";
    scr.setLabel("cmd","preparing atm", "");
    //scr.setLabel("wait","preparing atm", "");
    scr.setLabel("inputConsole","0", "");
    window.external.exchange.refreshScr();
    callSupport('cashin_open');
  }
  var onWithdrawal = function(name){
    currnetOperation = "Withdrawal";
    scr.setLabel("cmd","preparing atm", "");
    //scr.setLabel("wait","preparing atm", "");
    scr.setLabel("inputConsole","0", "");
    window.external.exchange.refreshScr();
    callSupport("cashoutprint_req&amount=10");
  }
  var onBalance = function(name){

    currnetOperation = "balance";
    scr.setLabel("cmd",m_session.balance, "");

    scr.setLabel("inputConsole","1", "");
    window.external.exchange.refreshScr();

  }
  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onAmount args '+args);
    var pKey = "";
    var amountLast = amount;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
        //if(typeof args[2] != 'undefined' && args[2] == 'fast_btns')
        //{
        //	alertMsgLog('m_FastButtonFlag!');
        //	m_FastButtonFlag = true;
        //}
      }
      if(typeof help == 'number' && !isNaN(help))
        amount = help;
      else
        amount = 0;
    }
    else
      amount = 0;

    alertMsgLog('amountLast: '+amountLast+', amount: '+amount);
    if(m_FastButtonFlag && (amountLast.toString().length == amount.toString().length+1)){
      amount = 0;
    }
    if(amount != amountLast)
    {
      m_FastButtonFlag = false;
      inpObj = {name:"sum", text:amount, mask:"", hint:"0", visible:true, enable:true, validate:true, type:"amount", state:"None", ext: {maxsum: 100000, maxlength: 9, empty: "0",display_group: "sum_place"}};
      scr.setInputJson(inpObj, onInput);
      //scr.setInput("sum", amount, "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onInput, "None");
      m_session.fashCash = m_FastCash.getGeneral(m_Currency.getSelectedCode(),amount);
      checkboxShow = m_FastCash.validAmount(m_Currency.getSelectedCode(),amount);
      if(!checkboxShow)
        setPopularAmounts();
      else
        deletePopularAmounts();

      fastCashHelp = [];
      //for(var j = 1; j < 10; ++j)
      //	fastCashHelp += (fastCashHelp==''?'{':',{')+'"text":"'+j+'","type":"digit"'+((!m_FastCash.button[j])?',"disabled": true':'')+'}';
      //scr.setLabel("keyboard", "", '{"values": ['+fastCashHelp+',{"text": "'+getLangText('fastcash_change')+'","type": "bynotes","disabled": true},{"text": "0","type": "digit"'+(!m_FastCash.button[0]?',"disabled": true':'')+'},{"text": "'+getLangText('button_delete')+'","type": "delete"}],"display_group": "fast_btns"}');
      for(var j = 0; j < 10; ++j)
        if(m_FastCash.button[j])
          fastCashHelp.push(j);
      scr.setKeyboard({ type:"digit", numbers: fastCashHelp, leftBtn:{text:getLangText('fastcash_change'),type:"bynotes", disabled:true}, rightBtn:{text:getLangText('button_delete'), type:"delete"}, visible:true});

      //scr.setLabel("currencyLabel", getLangText('cash_withdrawal_curr'), '');
      //scr.setList("currency", m_Currency.getNames(m_session.lang), m_Currency.selected, m_Currency.getJSON(), onList);

      if(amount != 0){
        scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
        //scr.setButton("back", getLangText("button_menu_return"), false, false, '{"icon": ""}', onButton7);
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      else{
        checkboxShow = false;
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        scr.setButton("take", getLangText("button_withdrawal"), true, false, '{"icon": ""}', onButton3);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      deleteInfoLabels();
      window.external.exchange.RefreshScr();
    }
  }

  var onTellMEWrapper = function(args)
  {
    switch(args){
      case "money_check": {
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        if(step == "money_return")
          scr.setLabel("cmd",getLangText('cashin_closing'), "");
        else
          scr.setLabel("cmd",getLangText('cashin_counting'), "");
        window.external.exchange.refreshScr();
        return;
      }
      case "money_insert": {
        step = "money_insert";
        var amntStr = window.external.exchange.getMemory("dataFromNDC"), amnt = 0;
        try {
          amnt = parseInt(amntStr, 10);
        }
        catch(e) {
          amnt = 0;
        }

        if(bimType != "0"){//пачечник
          scr.setLabel("modal_text2",getLangText('cashin_deposit_money2'), "");
          //scr.setModalMessage(getLangText('cashin_deposit_money1'), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 90,"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);
          scr.setLabel("cmd",getLangText('cashin_deposit_money2'), "");
          window.external.exchange.refreshScr();
        }
        else if(isNaN(amnt) || amnt == 0){//покупюрник, начальное внесение
          scr.setLabel("modal_text2", getLangText('cashin_deposit_money3'), "");
          //scr.setModalMessage(getLangText('cashin_deposit_money1'), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 90,"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);
          scr.setLabel("cmd",getLangText('cashin_deposit_money3'), "");
          window.external.exchange.refreshScr();
        }
        else {//покупюрник, очередное внесение
          var help = [getLangText('cashin_accept')];
          //scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyCall);
          scr.setLabel("cmd",getLangText('cashin_deposit_money1')+"inserted:"+amnt+' ₽'+"Continue [Y]/[N]", "");
          window.external.exchange.refreshScr();
        }
        return;
      }
      case "money_menu": {
        step = "money_menu";
        var amntStr = window.external.exchange.getMemory("dataFromNDC"), amnt = 0;
        try
        {
          amnt = parseInt(amntStr, 10);
        }catch(e)
        {
          amnt = 0;
        }

        scr.setLabel("cmd","inserted: "+amnt+' ₽', "");
        window.external.exchange.refreshScr();
        return;
      }
      case "money_return": {
        scr.setLabel("cmd",getLangText('cashin_take_notaccepted3'), "");
        window.external.exchange.RefreshScr();
        return;
      }
      case "money_error": {
        step = "money_error";
        scr.setLabel("cmd","Error", "");
        window.external.exchange.RefreshScr();

        return;
      }
      case "money_full_back": {
        scr.setLabel("cmd",getLangText('cashin_full_text1'), "");
        window.external.exchange.RefreshScr();

        return;
      }
      case "money_full": {
        step = "money_full";

        var amntStr = window.external.exchange.getMemory("dataFromNDC"), amnt = 0;
        try {
          amnt = parseInt(amntStr, 10);
        }
        catch(e) {
          amnt = 0;
        }
        //scr.render("deposit_select_currency");
        scr.setLabel("cmd","Money full inserted:"+amnt+' ₽' +"Continue [Y]/[N]", "");
        var help = [getLangText('cashin_return'), getLangText('cashin_accept')];
        //scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyFullCall);
        //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        //window.external.exchange.RefreshScr();
        window.external.exchange.RefreshScr();
        return;
      }
      case "money_ok": {
        if(m_session.serviceName == "ekassir_cashin")
          callSupport("ekassir_cashin_ok");
        else
        {
          callSupport("deposit_req");
          scr.setLabel("cmd","Send information", "");
          window.external.exchange.RefreshScr();
        }
        return;
      }
      case "money_cancel": {
        if(m_session.serviceName == "ekassir_cashin")
          scr.nextScreen(serviceSelectCash);
        else
        {
          scr.nextScreen(serviceSelect);
          scr.setLabel("cmd","Canceling", "");
          window.external.exchange.RefreshScr();
        }
        return;
      }
      case "wait_request": {

        //scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        if(currnetOperation == "deposit")
        {
          //scr.setWait(true, getLangText('cashin_processing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
          scr.setLabel("cmd",getLangText('cashin_processing'), "");
          scr.setLabel("inputConsole",'0', "");
          window.external.exchange.RefreshScr();
          return;
        }else
        {
          //scr.setWait(true, getLangText('cashin_processing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
          scr.setLabel("cmd","send request", "");
          scr.setLabel("inputConsole",'0', "");
          window.external.exchange.RefreshScr();
          return;
        }
      }
      case "card_return": {
        scr.setLabel("cmd",'take your card', "");
        scr.setLabel("inputConsole",'0', "");
        window.external.exchange.RefreshScr();
        return;
      }
      case "wait_end_timeout":
      case "wait_end_session":
      case "end_session": {
        scr.setLabel("cmd",'Bye!', "");
        scr.setLabel("inputConsole",'0', "");
        window.external.exchange.RefreshScr();
        return;
      }
      case "menu_main": {
        scr.nextScreen(serviceSelect);
        return;
      }
      case "ask_more_time": {

        //scr.setModalMessage(getLangText('need_more_time'), _words_[m_session.isCard ? "button_logout_card" : "button_logout_cash"][m_session.lang]+","+_words_["button_continue"][m_session.lang], -1, true, '{"icon": "","loader":"countdown","count": 25,"options_settings":[{"name":"cancel","icon":'+(m_session.isCard ? '"../../graphics/icon-pick-card-red.svg"' : '"../../graphics/icon-logout.svg"') +',"theme":"btn-white-red"},{"name":"logout","icon":""}]}', onMoreTimeCall);
        //scr.setModalMessage(getLangText('need_more_time'), onMoreTimeButtons, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 25,"options_settings":[{"name":"cancel","icon":'+(m_session.isCard ? '"../../graphics/icon-pick-card-red.svg"' : '"../../graphics/icon-logout.svg"') +',"theme":"btn-white-red"},{"name":"logout","icon":""}]}', onMoreTimeCall);
        scr.setLabel("cmd",getLangText('need_more_time'), "");
        window.external.exchange.RefreshScr();
        return;
      }
      case "request_ok": {
        m_session.balance = NaN;
        var amntStr = window.external.exchange.getMemory("dataFromNDC"), amnt = 0;
        try
        {
          amnt = parseInt(amntStr, 10);
        }catch(e)
        {
          amnt = 0;
        }
        if(isNaN(amnt))
          amnt = 0;
        scr.setLabel("cmd",getLangText('cashin_success') + AddSpace(amnt) + ' ₽', "");
        window.external.exchange.RefreshScr();
        return;
      }
      /*cashout*/
      case 'card_return_cashout':
        scr.setLabel("cmd",'Query successfully processed<br>Take your card', "");
        scr.setLabel("inputConsole",'0', "");
        window.external.exchange.RefreshScr();
        return;
      case 'money_take':
        window.external.exchange.scrData.flush();
        scr.setLabel("cmd",'Take your cash', "");
        scr.setLabel("inputConsole",'0', "");
        window.external.exchange.RefreshScr();
        m_session.balance = NaN;
        return;
      case 'wait_end_session':
      case 'end_session':
        alertMsgLog('[Print]: '+m_CheckFlag);
        saveToHistory(amount, m_Currency.getSelectedCode(), m_CheckFlag);
        scr.setLabel("cmd",'Take your receipt<br>Bye', "");
        window.external.exchange.RefreshScr();
        return;
      case 'card_return':
        scr.setLabel("cmd",'Query successfully processed', "");
        scr.setLabel("inputConsole",'0', "");
        window.external.exchange.RefreshScr();
        return;
      case 'wait_request':
        return;
      case 'request_error':
        scr.setLabel("cmd",'request_error', "");
        window.external.exchange.RefreshScr();
        return;
      default:
      {
        break;
      }
    }
    //scr.nextScreen(serviceSelect);
    return;
  }
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  scr.setButton("cancel", "",false, true, onCancel);
  scr.setButton("balance", "",false, true, onBalance);
  scr.setButton("deposit", "",false, true, onDeposit);
  scr.setButton("withdrawal", "",false, true, onWithdrawal);
  scr.setLabel("cmd",'WebIUS Console start', "");
  window.external.exchange.StartPlay("MissionImpossible");
  scr.render("console");
};

var serviceSelect = function() {

  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onButton2 = function(name){
    scr.nextScreen(consoleScreen);
  };

  var onButtonDeposit = function(name){
    m_session.serviceName = 'cashin';
    if(!!m_session.comminfo && m_session.comminfo.nukk === true)
      //scr.nextScreen(nukk_destination_select, "checkNfc");
      scr.nextScreen(nukk_destination_select, "select");
    else
      scr.nextScreen(depositSelectAdjunctionCurrency);
  };
  var onButton4 = function(name){
    m_session.serviceName = 'cashout';
    scr.nextScreen(cashoutInputAmount);
  };

  var onButton5 = function(someArgs){
    m_session.serviceName = 'ekassir';
    m_session.ekassir = "";
    if(someArgs[0] === "Btn5")
      m_session.ekassir={insurance:"1"};
    else if(someArgs[0] === "Btn6")
      m_session.ekassir={insurance:"2"};
    if(typeof m_session.second != "undefined" && m_session.second){
      scr.setWait(true, getLangText('wait_please_wait'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      scr.setTimeout("0", "", onButtonEmpty);
      scr.render(scr.type);
      checkAndGoToPinOrNcf();
    }
    else{
      checkSecondPINEnterFlag();
      scr.nextScreen(ekassir,1);
    }
  };
  var onButtonTransfer = function(name){
    scr.nextScreen(transferMenu, 0);
  };
  var onButton7 = function(name){
    scr.nextScreen(helpMenu);
  };
  var onSettings = function(name){
    m_session.serviceName = 'main_menu';
    scr.nextScreen(settingsMenu, 0);
  };
  var onZSFCredits = function(someArgs){
    if(nfcOrNfctokenUsed()){
      scr.nextScreen(zsfCreditError, "zsf_by_card");
      return;
    }
    m_session.serviceName = "zsfcredit";
    m_session.zsfcredit = {};
    scr.nextScreen(zsfAccountInput);
  };
  var onZSFContribs = function(someArgs){
    if(nfcOrNfctokenUsed()){
      scr.nextScreen(zsfCreditError, "zsf_by_card");
      return;
    }
    m_session.serviceName = "zsfdeposit";
    m_session.zsfcredit = {};
    scr.nextScreen(zsfDepositInput);
  };
  var onCancel = function(name){
    onCancelGlobal();
  };
  function setDepositButton(){
    var enableButton = m_ATMFunctions.acceptor;
    //var enableButton = true;
    var extButton = {icon:""};
    var maxDeposit = "";
    if(!!m_session.comminfo)
      window.external.exchange.writeLogTrace('[Script.js]', "comminfo: " + JSON.stringify(m_session.comminfo));
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken"
      //&& !corpCardPANforDI(m_session.fitObj.PAN) && !corpCardOnlyByCard(m_session.fitObj.PAN)
      && !!m_session.comminfo
      && m_session.comminfo.corpcard !== true
      && m_session.comminfo.corpcard_di !== true && m_session.comminfo.onlybycard !== true
      && m_session.comminfo.cashinoff === true)
      enableButton = false;
    //else if((corpCardPAN(m_session.fitObj.PAN) || corpCardPANforDI(m_session.fitObj.PAN))
    else if(!!m_session.comminfo && m_session.comminfo.corpcard === true
      && m_session.lang === "en")
      enableButton = false;
    else if(!m_session.ownCard)
    {
      /*#hardcode 1%*/
      if(!!m_session.comminfo && !isNaN(m_session.comminfo.maxdeposit) && m_session.comminfo.maxdeposit > 0)
        maxDeposit = "; "+getLangText("maxdepositinfo") +AddSpace(m_session.comminfo.maxdeposit) + " ₽";
      if(!!m_session.comminfo && !isNaN(m_session.comminfo.percent) && m_session.comminfo.percent > 0) {
        if (!isNaN(m_session.comminfo.mincomm) && m_session.comminfo.mincomm > 0)
          extButton.text=getLangText("comminfo") + '1%,' + getLangText("comminfo2") +
            AddSpace(m_session.comminfo.mincomm) + ' ₽'+maxDeposit;
        else
          extButton.text=getLangText("comminfo")+'1%'+maxDeposit;
      }
      else
        extButton.text=getLangText("nocomminfo")+maxDeposit;
    }
    else
    {
      if (!!m_session.comminfo)
      {
        if (m_session.comminfo.contract === true)
          extButton.text=getLangText("label_nukk_contract");
        else if (m_session.comminfo.nukk === true)
        {
          if (!isNaN(m_session.comminfo.percent) && m_session.comminfo.percent > 0.0)
          {
            if (!isNaN(m_session.comminfo.mincomm) && m_session.comminfo.mincomm > 0.0)
              extButton.text=getLangText("comminfo") + AddSpace(m_session.comminfo.percent, true) + "%" + getLangText("comminfo2") + AddSpace(m_session.comminfo.mincomm) + " ₽";
            else
              extButton.text=getLangText("comminfo") + AddSpace(m_session.comminfo.percent, true) + "%";
          }
          else
            extButton.text=getLangText("nocomminfo");
        }
        else if (m_session.comminfo.nukk === false)
        {
          extButton.text=getLangText("noserviceconnected");
          enableButton = false;
        }
        if (m_session.comminfo.onlybycard === true)
        {
          extButton.text=getLangText("nukkonlybycard");
          enableButton = false;
        }
        if (m_session.comminfo.cashinoff === true)
          enableButton = false;
      }
    }
    if(m_session.tagOnATMExists("#RGS")) {
      var changedExt = {icon:""};
      if(extButton.text)
        changedExt.subText = extButton.text;
      scr.setButtonJson({ name: "Btn1", text: getLangText("button_deposit"),
        visible:true, enable: enableButton, ext: changedExt }, onButtonDeposit);
    }
    else
      scr.setButtonJson({name:"deposit", text:getLangText("button_deposit"),visible:true, enable:enableButton, ext:extButton}, onButtonDeposit);
  }

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request": break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
    }
  };

  scr.addCall("TellMEWrapper", onTellMEWrapper);

  m_ATMFunctions = getATMFuncStatus();
  m_session.serviceName = '';
  //#@проверка повторного ввода пин-кода
  //m_session.second = true;

  setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);

  //scr.setButton("deposit", getLangText("button_deposit"),true, true||m_ATMFunctions.acceptor && m_session.ownCard, '{"icon": ""}', onButton3);
  scr.setButton("console", "",false, false, onButtonEmpty);
  setDepositButton();
  if(m_session.tagOnATMExists("#RGS")){

    scr.setButton("Btn2", getLangText("button_withdrawal"),true,
      m_ATMFunctions.dispenser&&m_Currency.activeCurrExists(), '{"icon": ""}', onButton4);
    setDepositButton();

    scr.setButton("Btn3", getLangText("button_pay"), true, typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType !== "gru", '{"icon": ""}', onButton5);
    scr.setButton("Btn4", getLangText("button_send"), true,
      isTransferAvailableForCardType(), '{"icon": ""}', onButtonTransfer);
    scr.setButton("Btn5", getLangText("btn_insurance_vtb"), true, typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType !== "gru", '{"icon": ""}', onButton5);
    scr.setButton("Btn6", getLangText("btn_insurance_rgs"), true, typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType !== "gru", '{"icon": ""}', onButton5);
  }
  else {//normal
    scr.setButton("withdrawal", getLangText("button_withdrawal"),true,
      m_ATMFunctions.dispenser&&m_Currency.activeCurrExists(), '{"icon": ""}', onButton4);
    setDepositButton();

    scr.setButton("pay", getLangText("button_pay"), true, typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType !== "gru", '{"icon": ""}', onButton5);

    scr.setButton("send", getLangText("button_send"), true,
      isTransferAvailableForCardType(), '{"icon": ""}', onButtonTransfer);
  }

  if(m_session.tagOnATMExists("#ZSF") && m_session.lang === "ru"){
    scr.setButton("credit", getLangText("button_zsf_credit"), true,
      !nfcOrNfctokenUsed(), '{"icon": "../../graphics/icon_credit.svg"}', onZSFCredits);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true,
      !nfcOrNfctokenUsed(), '{"icon": "../../graphics/icon_deposit.svg"}', onZSFContribs);
  }


  scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);

  var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
  if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
    flagPinChange = false;
  if(!m_session.ownCard)
    flagPhoneChange = false;
  else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
    flagPhoneChange = false;
  settingsFlag = flagPinChange || flagPhoneChange;

  /*scr.setButton("settings", getLangText("button_mini_statement"),
		true, miniStatementEnabled(),
		'{"icon": "../../graphics/mini-statement.svg"}', onMiniStatementCheckAndGoToNfc);
	*/
  miniStatementAddButton();
  scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag, '{"icon": "../../graphics/icon_settings.svg"}', onSettings);

  scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);

  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);


  scr.setLabel("balance", getLangText('main_your_balance'), "");

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("main_menu");
  alertMsgLog(' '+scr.name+'. Выбор услуги.');
};

serviceSelectCash = function() {

  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);




  var onButton4 = function(name){
    scr.nextScreen(inputAccountForCharity);
  }

  var onButton3 = function(someArgs){
    m_session.ekassir = "";
    if(someArgs[0] === "btn3")//vtb
      m_session.ekassir={insurance:"1"};
    else if(someArgs[0] === "btn2")//rgs
      m_session.ekassir={insurance:"2"};
    window.external.exchange.setMemory("session", JSON.stringify(m_session));
    scr.nextScreen(savePhoneForEkassir,"");
  }

  var onButton7 = function(name){
    scr.nextScreen(helpMenu);
  }

  var onCancel = function(name){
    onCancelGlobal();
  }
  m_session.isCard = false;
  m_CardIcon.value = "";
  m_session.setNecessaryParameters(m_CardIcon);
  m_ATMFunctions = getATMFuncStatus();


  //alert(window.external.exchange.getNDCBufferValue("ActiveDeviceCDM"));
  //alert(window.external.exchange.getNDCBufferValue("SessionFlagCardIn"));

  scr.setButton("btn1", "Оплатить услуги",true, m_ATMFunctions.acceptor, '{"icon": "../../graphics/qsl-icon-3.svg"}', onButton3);
  if(m_session.tagOnATMExists("#RGS")){
    scr.setButton("btn2", getLangText("btn_insurance_rgs"), true, m_ATMFunctions.acceptor, '{"icon": "../../graphics/btn-rgs-icon.svg"}', onButton3);
    scr.setButton("btn3", getLangText("btn_insurance_vtb"), true, m_ATMFunctions.acceptor, '{"icon": "../../graphics/btn-vtb-icon.svg"}', onButton3);
  }
  scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout-red.svg", "themes":["btn-white-red"]}', onCancel);
  //scr.setButton("switch_lang", "Switch to English", true,false,'{"icon": ""}', onError);

  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("header","Операции без карты", "");
  //scr.setLabel("lang_switch","EN", "");
  //addLangSwitch();

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);

  scr.render("main_menu_cash");
  alertMsgLog(' '+scr.name+'. Выбор услуги.');
};
inputPhoneForEkassir = function()
{
  var phoneNum = "";
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    //scr.setTimeout('0', "", onButtonEmpty);
    scr.nextScreen(savePhoneForEkassir,phoneNum);
    //scr.nextScreen(ekassir,1);
    return;
  }
  var onReturn = function(name){
    scr.nextScreen(serviceSelectCash);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }
  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onInput args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    else
      help = "";
    phoneNum = help;
  }

  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("deleteBtn", getLangText('button_delete'), '');
  scr.setLabel("title", "Введите номер телефона для обратной связи", "");
  scr.setInput("phone", phoneNum, "+7 (___) ___-__-__", "", "", onInput);

  scr.setButton("continue", getLangText("button_continue"), true, true, "", onButton1);
  scr.setButton("cancel", getLangText("button_menu_return"), "", onReturn);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  delete m_session.timeoutObj;
  scr.render("modal_phone_input");
};
var savePhoneForEkassir=function(phoneNumber)
{
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request":
        break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case 'wait': return;
      default:
        scr.nextScreen(requestResult,[args]);
        return;
    }
  }
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  scr.setLabel("text", getLangText('wait_please_wait'), "");
  //scr.setImage("smile","../../graphics/icon-loader.svg","");
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("loader","60", '{"loader":"loader"}');
  scr.render("wait_message");
  callSupport("savePhoneForEkassir&phone="+phoneNumber+
    (m_session.ekassir?("&insurance="+m_session.ekassir.insurance):""));
};
inputAccountForCharity	 = function()
{
  var phoneNum = "";
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    //addServiceSelectElements();
    scr.setTimeout('0', "", onButtonEmpty);
    //scr.setWait(true, getLangText('simcard_info_progress'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
    //scr.render("deposit_select_source");
    var help = {phoneNumber : phoneNum};
    //window.external.exchange.ExecNdcService(m_session.serviceName, JSON.stringify(help));
    scr.nextScreen(cashin, "opening");
    return;
  }
  var onReturn = function(name){
    scr.nextScreen(serviceSelect);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }
  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onInput args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    else
      help = "";
    phoneNum = help;
  }

  scr.setLabel("deleteBtn", getLangText('button_delete'), '');
  scr.setLabel("title", "Введите номер карты", "");
  scr.setInput("phone", phoneNum, "", "", "", onInput);
  if(phoneNum.length == 10)
    scr.setButton("continue", getLangText("button_continue"), true, true, "", onButton1);
  else
    scr.setButton("continue", getLangText("button_continue"), true, false, "", onButton1);
  scr.setButton("cancel", getLangText("button_menu_return"), "", onReturn);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  delete m_session.timeoutObj;
  scr.render("modal_phone_input");
};

function onTellMEWrapperCashin(args)
{
  switch(args)
  {
    case 'money_insert':
      scr.nextScreen(cardlessMoneyInsert);
      break;
    case 'money_full':
      scr.nextScreen(cardlessMoneyMenu, false);
      break;
    case 'money_full_back':
      scr.nextScreen(cardlessMoneyFullBack);
      break;
    case 'money_error_back':
      scr.nextScreen(cardlessMoneyBack);
      break;
    case 'money_menu':
      scr.nextScreen(cardlessMoneyMenu, true);
      break;
    case 'money_check':
      scr.nextScreen(cardlessMoneyCheck);
      break;
    default:
      break;
  }
}
function addElementsOnPodlozhka(){//кнопки на верхней части подложки
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onButtonEmpty);
  scr.setButton("roubles", getLangText("curr_rub_text"), true, false, '{"icon": ""}', onButtonEmpty);
  scr.setButton("dollars", getLangText("curr_doll_text"),true,false, '{"icon": ""}',"", onButtonEmpty);
  scr.setButton("euro", getLangText("curr_euro_text"), true,false,'{"icon": ""}',"",onButtonEmpty);
}

var cardlessMoneyInit = function(){

  scr.nextScreen(cashin, "ekassir_cashin");
  return;
};
var cardlessMoneyInsert = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onMoneyCall = function(args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoneyCall, value: '+_args);

    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setLabel("modal_text2", "", "");
    callSupport("money_insert_cancel");
  }

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  addElementsOnPodlozhka();
  scr.setLabel("modal_text2",getLangText('cashin_deposit_money2'), "");
  var onMoneyCallOptions = [getLangText('cashin_cancel_operation')];
  scr.setModalMessage(getLangText('cashin_deposit_money1'), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 90,"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);
  //window.external.exchange.RefreshScr();
  scr.render("deposit_select_currency");
};
var cardlessMoneyCheck = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  addElementsOnPodlozhka();
  scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
  scr.render("deposit_select_currency");
};
var cardlessMoneyBack = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  var countOnScreen = window.external.exchange.getTimer(78);
  if(isNaN(countOnScreen) || typeof countOnScreen == "string" || countOnScreen == 0)
    countOnScreen = 55;
  else if(countOnScreen > 5000)
    countOnScreen = countOnScreen/1000 - 5;
  else
    countOnScreen = 5;

  addElementsOnPodlozhka();
  scr.setLabel("wait_text2", getLangText('cashin_take_notaccepted3'), "");
  scr.setWait(true, getLangText('cashin_take_notaccepted1'), '{"icon": "","rotate":true,"loader":"countdown","count":'+countOnScreen+'}');
  scr.render("deposit_select_currency");
};
var cardlessMoneyFullBack = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  addElementsOnPodlozhka();
  scr.setLabel("wait_text2", 'Кассета переполнена', "");
  scr.setWait(true, getLangText('cashin_take_notaccepted1'), '{"icon": "","rotate":true,"loader":"countdown","count":60}');
  scr.render("deposit_select_currency");
};
function getNotes(){
  return JSON.stringify({
    values: [
      {
        text: '5000 ₽',
        value: 5000,
        left: 50,
        quantity: 4
      },
      {
        text: '200 ₽',
        value: 200,
        left: 0,
        quantity: 0
      },
      {
        text: '2000 ₽',
        value: 2000,
        left: 20,
        quantity: 2
      },
      {
        text: '100 ₽',
        value: 100,
        left: 0,
        quantity: 0
      },
      {
        text: '1000 ₽',
        value: 1000,
        left: 500,
        quantity: 200
      },
      {
        text: '50 ₽',
        value: 50,
        left: 0,
        quantity: 0
      },
      {
        text: '500 ₽',
        value: 500,
        left: 100,
        quantity: 1
      },
      {
        text: '10 ₽',
        value: 10,
        left: 100,
        quantity: 3
      }
    ],
    display_group: 'bynotes'}
  );
}
var cardlessMoneyMenu = function(addMore){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onMoneyAccept = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoneyAccept, value: '+_args);

    //if(_args == onMoneyAcceptOptions[0])
    if(_args == 0)
    {
      callSupport("money_menu_return");
    }
    //else if(_args == onMoneyAcceptOptions[1])
    else if(_args == 1)
    {
      if(addMore)
        callSupport("money_menu_add");
      else
        callSupport("money_menu_accept");
    }
    else{
      scr.setLabel("popup_text", "", "");
      scr.setLabel("popup_sum", "", "");
      scr.setLabel("popup_title_sum", "", "");
      scr.setLabel("popup_comission", "", "");
      scr.setLabel("bynotes", "", "");
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_get_data'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      callSupport("money_menu_accept");
      window.external.exchange.RefreshScr();
    }
  }


  scr.addCall("TellMEWrapper", onTellMEWrapperCashin);

  addElementsOnPodlozhka();
  scr.setLabel("popup_text", getLangText('cashin_deposit_title1'), "");
  scr.setLabel("popup_sum", '1 234'+' ₽', "");
  scr.setLabel("popup_title_sum", getLangText('cashin_deposit_title2')+'1 234'+' ₽', "");
  scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+'0 ₽', "");
  //scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+'],"display_group": "bynotes"}');
  scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), getNotes());
  if(addMore){
    var onMoneyAcceptOptions = [getLangText('cashin_return'),getLangText('cashin_add'),getLangText('cashin_accept')];
    scr.setModalMessage('', onMoneyAcceptOptions, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"add","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyAccept);
  }else{
    var onMoneyAcceptOptions = [getLangText('cashin_return'),getLangText('cashin_accept')];
    scr.setModalMessage('', onMoneyAcceptOptions, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyAccept);
  }
  //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  //window.external.exchange.RefreshScr();
  scr.render("deposit_select_currency");
};

var ekassir = function(step){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request":
        break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) != "ok")
          scr.nextScreen(requestResult,[args]);
        return;
    }
  }

  scr.addCall("TellMEWrapper", onTellMEWrapper);

  if(step == 1){
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.render("wait_message");
  }
  else if(step == 3){//возврат на считывание nfc
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("deposit", getLangText("button_deposit"),true, m_ATMFunctions.acceptor && m_session.ownCard, '{"icon": ""}', null);
    scr.setButton("withdrawal", getLangText("button_withdrawal"),true, m_ATMFunctions.dispenser, '{"icon": ""}', null);
    scr.setButton("pay", getLangText("button_pay"), true, false, '{"icon": ""}', null);
    scr.setButton("send", getLangText("button_send"), true, false, '{"icon": ""}', null);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', null);
    scr.setButton("settings", getLangText("button_mini_statement"),
      true, false,
      '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, true/*m_CardIcon.our*/, '{"icon": "../../graphics/icon_settings.svg"}', null);
    if(m_session.isCard)
      scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', null);
    else
      scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', null);
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setTimeout('0', "", onButtonEmpty);
    scr.setWait(true, getLangText('wait_please_wait'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
    scr.render("main_menu");
    checkAndGoToPinOrNcf();
    return;
  }
  else if(step == 4){
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.render("wait_message");
    callSupport("ekassir_after_nfc");
    return;
  }
  m_session.pin.needToEnter = true;
  window.external.exchange.setMemory("cardIcon", JSON.stringify(m_CardIcon));
  window.external.exchange.setMemory("session", JSON.stringify(m_session));
  callSupport("ekassir_req" +
    (m_session.ekassir&&m_session.ekassir.insurance?("&insurance="+m_session.ekassir.insurance):""));
};

var helpMenu = function() {
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.nextScreen(msgResult,['wait_service_not_done', "return_menu"]);
  }
  var onButton2 = function(name){
    scr.nextScreen(msgResult,['wait_service_not_done', "return_menu"]);
  }

  var onButton3 = function(name){
    scr.nextScreen(serviceSelect);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }


  //setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
  scr.setButton("next_bankomat", getLangText("helpMenu_next_bankomat"), '{"icon": "img/icon-5-1.svg"}', onButton1);
  scr.setButton("next_office", getLangText("helpMenu_next_office"), '{"icon": "img/icon-5-2.svg"}', onButton2);
  //scr.setButton("popup_cancel", "button_menu_return", '{"icon": ""}', onButton3);
  scr.setButton("popup_exit", getLangText("button_close"), '{"icon": ""}', onButton3);
  //scr.setButton("cancel", getLangText("button_cancel"), '{"icon": ""}', onCancel);
  scr.addCall("cancel", onCancel);

  //if(m_session.isCard)
  //	scr.setButton("popup_exit", getLangText("button_logout_card"), '{"icon": ""}', onCancel);
  //else
  //	scr.setButton("popup_exit", getLangText("button_logout_cash"), '{"icon": ""}', onCancel);
  //if(m_session.isCard)
  //	scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  //else
  //	scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);


  scr.setLabel("phone_text", getLangText('helpMenu_phone_text'), "");
  scr.setLabel("phone_number", getLangText('pin_change_pin_phone'), "");
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("help_menu");
};

var depositSelectAdjunctionFrom = function() {
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }
  var onButton5 = function(name){
    scr.nextScreen(depositSelectAdjunctionMyCard,0);
  }
  var onButton4 = function(name){
    scr.nextScreen(depositSelectAdjunctionCurrency);
  }

  var onButton6 = function(name){
    scr.nextScreen(depositSelectAdjunctionAnotherCard);
  }
  var onButton3 = function(name){
    m_session.serviceName = 'depositFrom';
    scr.nextScreen(settingsMenu, 0);
  }
  var onButton7 = function(name){
    scr.nextScreen(helpMenu);
  }
  var onMainMenu = function(name){
    scr.nextScreen(serviceSelect);
  }

  var onCancel = function(name){
    onCancelGlobal();
  }



  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setButton("back", getLangText("button_menu_return"), '{"icon": ""}', onMainMenu);

  scr.setButton("cash", getLangText("deposit_source_cash"), '{"icon": "img/icon-4-1.svg"}', onButton4);
  scr.setButton("ourcard", getLangText("deposit_source_ourcard"),true,false, '{"icon": "img/icon-4-2.svg"}', onButton5);
  scr.setButton("extcard", getLangText("deposit_source_extcard"),true,false, '{"icon": "img/icon-4-3.svg"}', onButton6);

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("deposit_select_source");
};
depositSelectAdjunctionCurrency = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);


  var onButton1 = function(name){
    alertMsgLog(' '+scr.name+'. Balance on screen ' + name);
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  };
  var onButton8 = function(name){
    m_session.serviceName = "cashin";
    scr.nextScreen(cashin, "opening");
  };
  var onCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    serviceName = 'cancel';
    onCancelGlobal();
  };

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case 'wait_request':
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  //if(m_Currency.length <= 1)
  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);

  scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);

  {
    m_session.serviceName = "cashin";
    if(!m_session.cashin) m_session.cashin = {};
    m_session.cashin.amount = 0;
    if(typeof m_session.fitObj !== "undefined" &&
      (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken") &&
      m_session.second)
    {
      scr.setWait(true, getLangText('wait_before_next_step'), '{"icon": "", "rotate": true, "loader":"loader"}');
      scr.setLabel("balance", getLangText('main_your_balance'), "");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
      setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
      scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);

      /*scr.setButton("roubles", getLangText("curr_rub_text"), '{"icon": ""}', onButton8);
			scr.setButton("dollars", getLangText("curr_doll_text"),true,false, '{"icon": ""}',"", onError);
			scr.setButton("euro", getLangText("curr_euro_text"), true,false,'{"icon": ""}',"",onError);*/

      scr.setTimeout("0", "", onButtonEmpty);
      scr.render("deposit_select_currency");
      checkAndGoToPinOrNcf();
    }
    else
    {
      checkSecondPINEnterFlag();
      scr.nextScreen(cashin, "opening");
    }
  }

  /*scr.setButton("roubles", getLangText("curr_rub_text"), '{"icon": ""}', onButton8);
	scr.setButton("dollars", getLangText("curr_doll_text"),true,false, '{"icon": ""}',"", onError);
	scr.setButton("euro", getLangText("curr_euro_text"), true,false,'{"icon": ""}',"",onError);

	scr.setLabel("dollar", getLangText('curr_course_doll')+" 1$ = 67 Руб.", "");
	scr.setLabel("euro", getLangText('curr_course_euro')+" 1E = 70 Руб.", "");

	//scr.setLabel("conversion", "Текст под кнопками, краткое объяснение про конвертации 15 слов максимум. Ещё пара слов для объёма", "");
	scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
	scr.render("deposit_select_currency");*/
};
var depositSelectAdjunctionMyCard = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var onButton1 = function(name){
    alertMsgLog(' '+scr.name+'. Balance on screen ' + name);
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
    //scr.nextScreen(historyCheque, 1);
    //window.external.exchange.ExecNdcService("history", "");
  }

  var onButton8 = function(name){
    scr.nextScreen(msgResult, "Успешно зачисленно "+amount+" Руб");
  }
  var onCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    serviceName = 'cancel';
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onAmount = function(args){
    alertMsgLog(' '+scr.name+' onAmount args '+args);
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = parseFloat(arg);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help == 'number')
        amount = help;
      else
        amount = 0;
    }
    else
      amount = 0;
  }

  var amount = 0;
  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), '{"icon": "","pair":"showremainson"}', onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setList("mbkList", "1234567890,0987654321,5555555565", 0, "", onList);
  scr.setInput("amount", "", "", getLangText('cash_withdrawal_amnt'), "", onAmount);
  scr.setLabel("note", getLangText('transferMenu_label1'), "");
  scr.setLabel("comment", "Комиссия за перевод не взымается", "");
  scr.setButton("button3", getLangText("button_deposit"), "", onButton8);
  if(type == 1)
  {
    scr.setLabel("peny", "комиссия за перевод составит 2%", "");
    scr.setLabel("label1", getLangText('cashin_deposit_title1'), "");
    scr.setLabel("toAdjunct", "12312 250 Руб", "");
  }

  scr.render("test");
};
var depositSelectAdjunctionAnotherCard = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var onButton1 = function(name){
    alertMsgLog(' '+scr.name+'. Balance on screen ' + name);
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
    //scr.nextScreen(historyCheque, 1);
    //window.external.exchange.ExecNdcService("history", "");
  }
  var onButton8 = function(name){
    scr.nextScreen(depositSelectAdjunctionMyCard,1);
  }
  var onCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    serviceName = 'cancel';
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onAmount = function(args){
    alertMsgLog(' '+scr.name+' onAmount args '+args);
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = parseFloat(arg);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help == 'number')
        amount = help;
      else
        amount = 0;
    }
    else
      amount = 0;
  }

  var amount = 0;
  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

  scr.setInput("pan", "", "", getLangText('card_number_label'), "", onAmount);
  scr.setInput("expire", "", "", "Месяц и год", "", onAmount);
  scr.setInput("cvc", "", "", "CVC", "", onAmount);

  scr.setLabel("comment", "Приложите карту чтобы считать её номер", "");
  scr.setButton("button3", getLangText("button_deposit"), "", onButton8);

  scr.render("test");

};

var cashoutInputAmount = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  function deleteInfoLabels(){
    scr.deleteLabel('comission');
    scr.deleteLabel('max_sum_text');
    scr.deleteLabel('error_text1');
    scr.deleteLabel('error_text2');
  }
  function deletePopularAmounts() {
    for(var j = 0; j < 6; ++j)
      scr.setButton("fast_cash_"+(j+1).toString(), "", false, false, '', onButtonEmpty);
  }
  function setPopularAmounts() {
    //var fastCashHelp = '';
    //for(var j = 0; j < m_session.fashCash.length; ++j)
    //	fastCashHelp += (fastCashHelp==''?'':',')+AddSpace(m_session.fashCash[j])+' '+m_Currency.getSelectedSymbol();
    var j;
    if(m_session.fashCash.length > 0){
      for(j = 0; j < m_session.fashCash.length; ++j)
        scr.setButton("fast_cash_"+(j+1).toString(), AddSpace(m_session.fashCash[j])+' '+m_Currency.getSelectedSymbol(), true, true, '', onFastCash);
      for(j = m_session.fashCash.length; j < 6; ++j)
        scr.setButton("fast_cash_"+(j+1).toString(), ' '+m_Currency.getSelectedSymbol(), false, false, '', onButtonEmpty);
    }
    else
      deletePopularAmounts();
  }
  function addKeyboard(enableFlag){
    //Активная кнопка Размен OB-101
    fastCashHelp = [];

    for(var j = 0; j < 10; ++j)
      if(m_FastCash.button[j])
        fastCashHelp.push(j);
    if(enableFlag) {
      fastCashHelp.push(10);
      scr.setKeyboard({ type: "digit", numbers: fastCashHelp,
        leftBtn: {text: getLangText('fastcash_change'), type: "bynotes", disabled: false},
        rightBtn: {text: getLangText('button_delete'), type: "delete"},
        visible: true
      });
    }
    else
      scr.setKeyboard({ type:"digit", numbers: fastCashHelp,
        leftBtn:{text:getLangText('fastcash_change'),type:"bynotes", disabled:true},
        rightBtn:{text:getLangText('button_delete'), type:"delete"},
        visible:true
      });
  }
  var onByNotes = function(name){
    alertMsgLog(scr.name+' onByNotes args '+name);
    scr.nextScreen(giveMoney,[200, 100]);
  };
  var onButton3 = function(name){//снять
    m_session.serviceName = "cashout";
    if(typeof m_session.second != "undefined" && m_session.second){
      m_session.cashout = {amount:amount};
      scr.setWait(true, getLangText('wait_before_next_step'), '{"icon": "", "rotate": true, "loader":"loader"}');
      window.external.exchange.RefreshScr();
      checkAndGoToPinOrNcf();
    } else {
      scr.nextScreen(giveMoney,[amount, 1]);
    }
  };
  var onButton4 = function(name){
    scr.nextScreen(giveMoney,4900);
  };
  var onButton5 = function(name){
    scr.nextScreen(giveMoney,500);
  };
  var onButton6 = function(name){
    scr.nextScreen(giveMoney,10000);
  };
  var onButton7 = function(name){//Вернуться в меню
    scr.nextScreen(serviceSelect);
  };
  var onCancel = function(name){
    onCancelGlobal();
  };
  var check_withdrawal = function (bynotes) {
    if (bynotes == 'small'){
      //alert(bynotes+'101')
      scr.setButton("take", getLangText("button_withdrawal_small"), true, checkboxShow, '{"icon": ""}', onButton3);
    }
    else if (bynotes === 'big'){
      //alert(bynotes+'102')
      scr.setButton("take", getLangText("button_withdrawal_big"), true, checkboxShow, '{"icon": ""}', onButton3);
    }
    else if (bynotes === 'change'){
      //alert(bynotes+'103')
      scr.setButton("take", getLangText("button_withdrawal_change"), true, checkboxShow, '{"icon": ""}', onButton3);
    }
    else{
      //alert(bynotes+'104')
      scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
    }
  };
  var onList = function(args){
    alertMsgLog(scr.name+' onList args '+args);
    var pKey = "", help = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
      if(typeof args[1] == 'undefined')
        help = args;
      else{
        pKey = args[0];
        help = args[1];
        if(typeof args[2] != 'undefined' && args[2] == 'fast_btns'){
          alertMsgLog('m_FastButtonFlag!');
          m_FastButtonFlag = true;
        }
      }
    }

    if(m_Currency.getSelectedCode() != help) {
      m_Currency.setSelected(help);
      alertMsgLog(' '+scr.name+'onList, currency selected '+m_Currency.getSelectedCode());
      checkboxShow = m_FastCash.validAmount(m_Currency.getSelectedCode(),amount, true);
      inpObj = {name:"sum", text:amount, mask:"", hint:"0", visible:true, enable:true, validate:true, type:"amount", state:"None", ext: {maxsum: 100000, maxlength: 9, empty: "0",display_group: "sum_place"}};
      scr.setInputJson(inpObj, onInput);
      //scr.setInput("sum", amount, "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onInput, "None");
      m_session.fashCash = m_FastCash.getGeneral(m_Currency.getSelectedCode(),amount);
      if(!checkboxShow)
        setPopularAmounts();
      else
        deletePopularAmounts();

      alertMsgLog('currency: '+m_Currency.getSelectedCode()+', amount: '+amount);
      scr.setLabel("currencyLabel", getLangText('cash_withdrawal_curr'), '');
      scr.setList("currency", m_Currency.getNamesArr(m_session.lang), m_Currency.selected, m_Currency.getJSON(), onList);
      if(amount != 0){
        if (m_session.bynotes)
          check_withdrawal(m_session.bynotes)
        else
          scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
        //scr.setButton("back", getLangText("button_menu_return"), false, false, '{"icon": ""}', onButton7);
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      else {
        checkboxShow = false;
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        if (m_session.bynotes)
          check_withdrawal(m_session.bynotes)
        else
          scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow&&true, '{"icon": ""}', onButton3);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      addKeyboard(checkboxShow);
      deleteInfoLabels();

      window.external.exchange.RefreshScr();
    }
    else
      alertMsgLog(' '+scr.name+'onList, currency is the same '+m_Currency.getSelectedCode());
  };
  var onListNotes = function(args){
    alertMsgLog(scr.name+' onList args '+args);
    var pKey = "", help = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
      if(typeof args[1] == 'undefined')
        help = args;
      else{
        pKey = args[0];
        help = args[1];
      }
    }
    m_session.bynotes = help;
    check_withdrawal(m_session.bynotes);
    //alert(help+'help')

    alertMsgLog(' '+scr.name+' onListNotes, notes selected '+help);
    window.external.exchange.refreshScr();
  };
  var onFastCash = function(args){
    alertMsgLog(scr.name+' onFastCash args '+args);
    var pKey = "", help = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0)
    {
      if(typeof args[1] == 'undefined')
        help = args;
      else
      {
        pKey = args[0];
        help = args[1];
      }
    }
    if(help.indexOf('fast_cash_') > -1){
      var fast_cash_i;
      try{
        fast_cash_i = parseInt(help.substr(help.indexOf('fast_cash_') + 10)) - 1;
      }
      catch(e){
        alertMsgLog(scr.name+' onFastCash exception');
        return;
      }
      m_FastButtonFlag = true;
      deletePopularAmounts();
      amount = m_session.fashCash[fast_cash_i];
      inpObj = {name:"sum", text:amount, mask:"", hint:"0", visible:true, enable:true, validate:true, type:"amount", state:"None", ext: {maxsum: 100000, maxlength: 9, empty: "0",display_group: "sum_place"}};
      scr.setInputJson(inpObj, onInput);
      //scr.setInput("sum", amount, "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onInput, "None");
      alertMsgLog(scr.name+' onFastCash CODE: '+m_Currency.getSelectedCode());
      m_session.fashCash = m_FastCash.getGeneral(m_Currency.getSelectedCode(),amount);
      alertMsgLog(scr.name+' onFastCash AFTER GETGENERAL');
      checkboxShow = m_FastCash.validAmount(m_Currency.getSelectedCode(),amount);

      addKeyboard(checkboxShow);
      if (m_session.bynotes)
        check_withdrawal(m_session.bynotes)
      else
        scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
      scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
      scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      window.external.exchange.refreshScr();
    }
  };

  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onAmount args '+args);
    var pKey = "";
    var amountLast = amount;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
        //if(typeof args[2] != 'undefined' && args[2] == 'fast_btns')
        //{
        //	alertMsgLog('m_FastButtonFlag!');
        //	m_FastButtonFlag = true;
        //}
      }
      if(typeof help == 'number' && !isNaN(help))
        amount = help;
      else
        amount = 0;
    }
    else
      amount = 0;

    alertMsgLog('amountLast: '+amountLast+', amount: '+amount);
    if(m_FastButtonFlag && (amountLast.toString().length == amount.toString().length+1)){
      amount = 0;
    }
    if(amount != amountLast)
    {
      m_FastButtonFlag = false;
      inpObj = {name:"sum", text:amount, mask:"", hint:"0", visible:true, enable:true, validate:true, type:"amount", state:"None", ext: {maxsum: 100000, maxlength: 9, empty: "0",display_group: "sum_place"}};
      scr.setInputJson(inpObj, onInput);
      //scr.setInput("sum", amount, "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onInput, "None");
      m_session.fashCash = m_FastCash.getGeneral(m_Currency.getSelectedCode(),amount);
      checkboxShow = m_FastCash.validAmount(m_Currency.getSelectedCode(),amount);
      if(!checkboxShow)
        setPopularAmounts();
      else
        deletePopularAmounts();

      fastCashHelp = [];
      //for(var j = 1; j < 10; ++j)
      //	fastCashHelp += (fastCashHelp==''?'{':',{')+'"text":"'+j+'","type":"digit"'+((!m_FastCash.button[j])?',"disabled": true':'')+'}';
      //scr.setLabel("keyboard", "", '{"values": ['+fastCashHelp+',{"text": "'+getLangText('fastcash_change')+'","type": "bynotes","disabled": true},{"text": "0","type": "digit"'+(!m_FastCash.button[0]?',"disabled": true':'')+'},{"text": "'+getLangText('button_delete')+'","type": "delete"}],"display_group": "fast_btns"}');
      addKeyboard(checkboxShow);
      //scr.setLabel("currencyLabel", getLangText('cash_withdrawal_curr'), '');
      //scr.setList("currency", m_Currency.getNames(m_session.lang), m_Currency.selected, m_Currency.getJSON(), onList);
      //alert(typeof amount);
      if(amount != 0)
      {
        if (m_session.bynotes)
          check_withdrawal(m_session.bynotes)
        else
          scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
        //scr.setButton("back", getLangText("button_menu_return"), false, false, '{"icon": ""}', onButton7);
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      else{
        checkboxShow = false;
        scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
        if (m_session.bynotes)
          check_withdrawal(m_session.bynotes)
        else
          scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);
        scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
      }
      deleteInfoLabels();
      window.external.exchange.RefreshScr();
    }
  };
  var onCheckBox = function(args){
    alertMsgLog(' '+scr.name+' onCheckBox args: '+args);
    var checkHelp;
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
      help = help.toLowerCase();
      if(help == 'true')
        checkHelp = true;
      else
        checkHelp = false;
    }
    else
      checkHelp = false;
    alertMsgLog('[Print]: '+checkHelp);
    m_CheckFlag = checkHelp;
    scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", m_CheckFlag);
  };

  var onTellMEWrapper = function(args){
    alertMsgLog(scr.name+' onTellMEWrapper args: '+args);
    switch(args) {
      case "wait_request": return;
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) != "ok")
          scr.nextScreen(requestResult,[args]);
        return;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);
  var bynotes_enum = {
    small:0,
    change:1,
    big:2
  };
  historyGet();
  var _message = [], _type = 'info';
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
    _type = args[0];
    if(args.length > 1)
      for(var j = 1; j < args.length; ++j)
        _message[j-1] = args[j];
  }
  else if(typeof args != 'undefined')
    _message[0] = args;
  if(_message.length > 0){
    if(_type == 'info'){
      if(_message.length > 1){
        scr.setLabel('error_text1',_message[0],'{"display_group":"sum_error", "themes":["blue"]}');
        scr.setLabel('error_text2',_message[1],'{"display_group":"sum_error", "themes":["blue"]}');
      }
      else{
        scr.setLabel('error_text1',' ','{"display_group":"sum_error", "themes":["blue"]}');
        scr.setLabel('error_text2',_message[0],'{"display_group":"sum_error", "themes":["blue"]}');
      }
      scr.setImage("error","../../graphics/mes-info.svg","");
    }
    else if (_type == "err"){
      if(_message.length > 1){
        scr.setLabel('error_text1',_message[0],'{"display_group":"sum_error"}');
        scr.setLabel('error_text2',_message[1],'{"display_group":"sum_error"}');
      }
      else{
        scr.setLabel('error_text1',' ','{"display_group":"sum_error"}');
        scr.setLabel('error_text2',_message[0],'{"display_group":"sum_error"}');
      }
      scr.setImage("error","../../graphics/mes-error.svg","");
    }
    else {
      if(_message.length > 1){
        scr.setLabel('error_text1',_message[0],'{"display_group":"sum_error", "themes":["grey"]}');
        scr.setLabel('error_text2',_message[1],'{"display_group":"sum_error", "themes":["grey"]}');
      }
      else{
        scr.setLabel('error_text1',' ','{"display_group":"sum_error", "themes":["grey"]}');
        scr.setLabel('error_text2',_message[0],'{"display_group":"sum_error", "themes":["grey"]}');
      }
    }
  }

  var amount = 0;
  var m_FastButtonFlag = false;
  var checkboxShow = false;
  m_CheckFlag = false;
  setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);


  scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);

  if(!!m_session.fitObj && m_session.fitObj.fitType === "other")
    m_Currency.setOnlyRoublesAvailable();
  m_FastCash = new FastCash(m_ATMMoneyInfo, m_MoneyHistory, m_session.balance, m_session.ownCard);
  //m_Currency = new CurrencyClass(m_FastCash.getCurrencyList());//['rub', 'euro', 'dollar']

  if(!!m_session.timeoutObj && !!m_session.timeoutObj.input && !!m_session.timeoutObj.input['sum'])
    amount = m_session.timeoutObj.input['sum'];

  var inpObj = {name:"sum", text:amount, mask:"", hint:"0", visible:true, enable:true, validate:true, type:"amount", state:"None", ext: {maxsum: 100000, maxlength: 9, empty: "0",display_group: "sum_place"}};
  scr.setInputJson(inpObj, onInput);
  //scr.setInput("sum", amount, "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onInput, "None");

  m_session.fashCash = m_FastCash.getGeneral(m_Currency.getSelectedCode(),amount);
  alertMsgLog('fastcash: ' + m_session.fashCash.join());

  if(amount != 0)
    checkboxShow = m_FastCash.validAmount(m_Currency.getSelectedCode(),amount);
  if(!checkboxShow)
    setPopularAmounts();
  else
    deletePopularAmounts();

  scr.setLabel("currencyLabel", getLangText('cash_withdrawal_curr'), '');

  if(!!m_session.timeoutObj && !!m_session.timeoutObj.list && !!m_session.timeoutObj.list['currency'])
    m_Currency.setSelected(m_session.timeoutObj.list['currency']);

  scr.setList("currency", m_Currency.getNamesArr(m_session.lang), m_Currency.selected, m_Currency.getJSON(), onList);

  m_session.bynotes = 'def';
  addKeyboard(checkboxShow);
  //	fastCashHelp += (fastCashHelp==''?'{':',{')+'"text":"'+j+'","type":"digit"'+((!m_FastCash.button[j])?',"disabled": true':'')+'}';
  //scr.setLabel("keyboard", "", '{"values": ['+fastCashHelp+',{"text": "'+getLangText('fastcash_change')+'","type": "bynotes","disabled": true},{"text": "0","type": "digit"'+((!m_FastCash.button[0])?',"disabled": true':'')+'},{"text": "'+getLangText('button_delete')+'","type": "delete"}],"display_group": "fast_btns"}');

  scr.setButton("back", getLangText("button_menu_return"), true, true, '{"icon": ""}', onButton7);
  scr.setButton("cancel", getLangText("button_cancel"), true, true, '{"icon": ""}', onCancel);
  scr.setButton("take", getLangText("button_withdrawal"), true, checkboxShow, '{"icon": ""}', onButton3);

  scr.setLabel("print_receipt", getLangText('print_after_receipt'), '{"display_group": "print_receipt"}');
  scr.setInput("checkbox_print", "true", "", "", checkboxShow, checkboxShow, "", "checkbox", onCheckBox, "", getUserDataField('printcheck'));
  scr.setList("nominal", [getLangText("change_small"),getLangText("change_change"),
    getLangText("change_big")], 5, '{ "display_group": "nominal-list",'+
    '"type": "select",'+
    ' "values": ["small","change","big"],'+
    ' "enabled": ["true","true","true"]'+
    '}', onListNotes);

  scr.setButton("receipt", getLangText("receipt"), '{"icon": "../../graphics/icon_check.png"}', onButton6);

  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  scr.setLabel("deleteBtn", getLangText('button_delete'), '');
  scr.setImage("error","../../graphics/mes-error.svg","");
  scr.setImage("offer","../../graphics/offer-icon.png","");

  scr.setLabel("title_sum", getLangText('amount_enter'), "");

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  delete m_session.timeoutObj;
  scr.render("cashout_amount");
};

var settingsMenu = function(type) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onButton1 = function(name){
    if(type == 0){
      m_session.serviceName = 'pinchange';
      if(typeof m_session.second != "undefined" && m_session.second){
        window.external.exchange.scrData.flush();
        scr.setWait(true, getLangText('wait_please_wait'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        scr.setTimeout("0", "", onButtonEmpty);
        scr.render("main_menu");
        checkAndGoToPinOrNcf();
      }
      else{
        checkSecondPINEnterFlag();
        scr.nextScreen(settingsChangePin,1);
      }
    }
    else
      scr.nextScreen(settingsInternetBank);
  };
  var onButton2 = function(name){
    if(type == 0){
      m_session.serviceName = "addsim";
      scr.nextScreen(settingsSIM,1);
    }
    else
      scr.nextScreen(settingsCardRequisites,1);
  };

  var onButton3 = function(name){
    scr.nextScreen(msgResult,['wait_service_not_done', "return_menu"]);
  };

  var onButtonSmsInfo = function(name){
    m_session.serviceName = "smsinfo";
    scr.nextScreen(settingsSIM,1);
  };

  var onCancel = function(name){
    onCancelGlobal();
  };
  var onButton5 = function(name){
    if(m_session.serviceName == 'depositFrom') {
      //scr.nextScreen(depositSelectAdjunctionFrom);
      scr.nextScreen(depositSelectAdjunctionCurrency);
    }
    else
      scr.nextScreen(serviceSelect);
  };
  var onList = function(name){
    type = type == 0?1:0;
    //scr.nextScreen(settingsMenu,type);
  };
  var onButtonHistory = function(name){
    scr.nextScreen(historyCheque, 1);
  };

  var onTellMEWrapper = function(args){
    switch(args) {
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) != "ok")
          scr.nextScreen(requestResult,[args]);
        return;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var flagPinChange = true, flagPhoneChange = true;
  if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
    flagPinChange = false;
  if(!m_session.ownCard)
    flagPhoneChange = false;
  else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
    flagPhoneChange = false;

  scr.setButton("tab_security", getLangText("settingMenu_safety"), '{"icon": ""}', onList);
  scr.setButton("tab_services", getLangText("settingMenu_services"), '{"icon": ""}', onList);
  scr.setButton("change_pin", getLangText("settingMenu_changepin"), true, flagPinChange, '{"icon": "img/ml-icon-1.svg","group": "tablist1"}', onButton1);
  scr.setButton("link_sim", getLangText("settingMenu_bindsim"), true, flagPhoneChange, '{"icon": "img/ml-icon-2.svg","group": "tablist1"}', onButton2);
  scr.setButton("secure3d", getLangText("settingMenu_3DSecure"), true, false, '{"icon": "img/ml-icon-3.svg","group": "tablist1"}', onButtonEmpty);
  scr.setButton("sms_info", getLangText("settingMenu_smsinfo"),
    true, flagPhoneChange&&!nfcOrNfctokenUsed(),
    '{"icon": "img/ml-icon-4.svg","group": "tablist1"}', onButtonSmsInfo);
  scr.setButton("internet_bank", getLangText("settingMenu_inetbank"), true, false, '{"icon": "img/ml-icon-5.svg","group": "tablist2"}', onButtonEmpty);
  scr.setButton("bank_params", getLangText("settingMenu_bankinfo"), true, false, '{"icon": "img/ml-icon-6.svg","group": "tablist2"}', onButtonEmpty);
  scr.setButton("limits", getLangText("settingMenu_limits"), true, false, '{"icon": "img/ml-icon-7.svg","group": "tablist2"}', onButtonEmpty);

  scr.setButton("logout2", getLangText("button_close"), '{"icon": ""}', onButton5);
  scr.addCall("cancel", onCancel);


  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("card_settings_menu");
};
var settingsChangePin = function(step){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButtonEmpty = function(name){
  }
  var onButton1 = function(name){
    alertMsgLog(scr.name+' onButton1 '+name);
    serviceName = 'return';
    callSupport("cancel");
  }
  var onButton2 = function(name){
    alertMsgLog(scr.name+' onButton2 '+name);
    serviceName = 'cancel';
    onCancelGlobal();
  }
  var onButton3 = function(name){
    alertMsgLog(scr.name+' onButton3 '+name);
    window.external.exchange.ExecNdcService("pin", "");
    serviceName = "return";
  }
  var onButton4 = function(name){
    alertMsgLog(scr.name+' onButton4 '+name);
    window.external.exchange.ExecNdcService("main_menu", "");
    serviceName = "return";
  }
  var onButton5 = function(name){
    alertMsgLog(scr.name+' onButton5 '+name);
    serviceName = 'cancel';
    window.external.exchange.ExecNdcService("cancelspec", "");
  }
  var onContinue = function(name) {
    alertMsgLog(' '+scr.name+', ' + name + ', Продолжаем на serviceSelect.');
    scr.nextScreen(serviceSelect);
  }
  var onEnter = function(name){
    alertMsgLog(' '+scr.name+'. Enter ' + name);
    serviceName = 'enter';
    var help = {};
    help['pinValue'] = m_session.pin.value;
    //window.external.exchange.ExecNdcService("enter", JSON.stringify(help));
    callSupport("pin_enter&pinValue="+help.pinValue);
  }
  var onMainMenu = function(name) {
    alertMsgLog(' '+scr.name+', ' + name + ', Продолжаем на serviceSelect.');
    window.external.exchange.ExecNdcService("pin", "");
  }
  var onCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    serviceName = 'cancel';
    window.external.exchange.ExecNdcService("cancelspec", "");
    //scr.cancel();
  }
  var onInput = function(args){
    var pKey = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      var help;
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    m_session.pin.length = controlPinLength(help);
    m_session.pin.value = help;
    if(m_session.pin.maxlength != 4)
    {
      if(m_session.pin.value.length < 4)
        scr.setButton("logout", getLangText("button_continue"), true, false, '{"icon": "", "themes":["btn-green"], "display_group":"bottom_line"}', onEnter);
      else if(m_session.pin.value.length >= 4)
        scr.setButton("logout", getLangText("button_continue"), true, true, '{"icon": "", "themes":["btn-green"], "display_group":"bottom_line"}', onEnter);
      window.external.exchange.RefreshScr();
    }

  }
  var onCall = function(args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onCall, value: '+_args);

    if(_args == callOptions[0]){
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      window.external.exchange.ExecNdcService("main_menu", "");
      serviceName = "return";
    }
    else{
      window.external.exchange.ExecNdcService("cancelspec", "");
      serviceName = "cancel";
    }
  }
  var onGoodCall = function(args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onCall, value: '+_args);

    if(_args == goodCallOptions[0]){
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      window.external.exchange.ExecNdcService("pin", "");
      serviceName = "return";
    }
    else{
      window.external.exchange.ExecNdcService("cancelspec", "");
      serviceName = "cancel";
    }
  }
  var onMoreTimeCall = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoreTime, value: '+_args);

    //if(_args == onMoreTimeButtons[1])
    if(_args == 1)
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      //window.external.exchange.ExecNdcService("moretime", "");
      callSupport("ask_more_time_yes");
      serviceName = "moretime";
    }
    else{
      m_session.timeout = 0;
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      //window.external.exchange.ExecNdcService("nomoretime", "");
      callSupport("ask_more_time_no");
      serviceName = "return";
    }
  }

  var onTellMEWrapper = function(args)
  {
    switch(args)
    {
      case 'ask_more_time': {
        scr.setInputJson({name:"pin_code",text:'', enable:false, visible:false,validate:false,state:'',ext:{"pin_code":false}}, onButtonEmpty);
        scr.setModalMessageJson(m_session.jsonObj.modalMessagePINAskMoreTime.elementObject, onMoreTimeCall);
        //scr.setModalMessage(getLangText('need_more_time'), onMoreTimeButtons, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": 25,"options_settings":[{"name":"cancel","icon":"../../graphics/icon-pick-card-red.svg","theme":"btn-white-red"},{"name":"logout","icon":""}]}', onMoreTimeCall);
        window.external.exchange.RefreshScr();
        return;
      }
      case 'pin_new': {
        scr.nextScreen(settingsChangePin,2);
        return;
      }
      case 'pin_new_second': {
        scr.nextScreen(settingsChangePin,3);
        return;
      }
      case 'pin_new_menu_main': {
        scr.setWait(true, getLangText('pinchange_progress'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        window.external.exchange.RefreshScr();
        callSupport('pin_change_req');
        return;
      }
      case 'pin_new_error': {
        scr.nextScreen(settingsChangePin,4);
        return;
      }
      case 'pin_new_cancel': {
        scr.nextScreen(serviceSelect);
        return;
      }
      case 'wait_request': {
        scr.setWait(true, getLangText('pinchange_progress'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        window.external.exchange.RefreshScr();
        return;
      }
      case 'request_ok': {
        scr.nextScreen(msgResult,['pinchange_ok', "end"]);
        return;
      }
      case 'wait': return;
      case 'wait_pin_error': {
        scr.nextScreen(requestResult,['pinchange_pin_error']);
        break;
      }
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) != "ok")
          scr.nextScreen(requestResult,[args]);
        return;
    }

  };
  var onMoreTimeButtons = [getLangText('button_logout_card'), getLangText('button_continue')];

  {//общий набор элементов на экране
    scr.setButton("back", getLangText("button_menu_return"), '{"icon": "","display_group": "bottom_line"}', onButton1);
    //scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "display_group":"bottom_line"}', onButton2);
    //scr.setButton("logout", getLangText("button_continue"), '{"icon": "", "themes":["btn-white-grey"], "display_group":"bottom_line"}', onEnter);
    if(m_session.pin.maxlength != 4)
      //scr.setButton("logout", getLangText("button_continue"), '{"icon": "", "themes":["btn-green"], "display_group":"bottom_line"}', onEnter);
      scr.setButton("logout", getLangText("button_continue"), true, false, '{"icon": "", "themes":["btn-green"], "display_group":"bottom_line"}', onEnter);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);

    m_session.pin.length = controlPinLength('', 4);
    m_session.pin.value = '';
    scr.setInput("pin_code", "", "","",false,true,"{\"pin_code\": true,\"length\": "+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+"}","text" ,onInput);
  }
  scr.addCall("TellMEWrapper", onTellMEWrapper);
  if(step == 1){
    /*if(typeof m_session.second != "undefined" && m_session.second){
			window.external.exchange.scrData.flush();
			scr.setLabel("text", getLangText('wait_for_answer'), "");
			scr.setImage("bg","../../graphics/BG_blur.jpg","");
			scr.setLabel("loader","60", '{"loader":"loader"}');
			scr.deleteInput("pin_code");
			scr.render("wait_message");
			checkAndGoToPinOrNcf();
			return;
		}*/

    window.external.exchange.scrData.flush();
    scr.setLabel("text", getLangText('wait_oper_init'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.deleteInput("pin_code");
    scr.render("wait_message");

    callSupport('pin_change_input');
    //window.external.exchange.ExecNdcService("pinchange","");
  }
  else if(step ==  2){
    scr.setLabel("title", getLangText('pinchange_enter_new'), "");
    scr.setLabel("safety_pin_text", getLangText('pinchange_dont_tell'), "");
    scr.setLabel("safety_pin_text2", getLangText('pinchange_notsafe'), "");

    scr.render("pin_code");
  }
  else if(step ==  3){
    scr.setLabel("title", getLangText('pinchange_second'), "");
    scr.setLabel("safety_pin_text", getLangText('pinchange_dont_tell'), "");
    scr.setLabel("safety_pin_text2", getLangText('pinchange_notsafe'), "");

    scr.render("pin_code");
  }
  else if(step == 4){
    scr.setLabel("title", getLangText('pinchange_enter_new'), "");
    scr.setLabel("safety_pin_text", getLangText('pinchange_not_match'), "");
    scr.setLabel("safety_pin_text2", getLangText('pinchange_new_again'), "");
    //scr.setInput("pin_code", "", "","",false,true,"{\"pin_code\": true,\"length\": "+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+"}","text" ,onInput, "Error");
    //scr.setInputJson({name:"pin_code",text:'', visible:false,validate:true,state:'Error',ext:{pin_code:true,length:m_session.pin.length,filledCount:m_session.pin.value.length}}, onInput);
    scr.setInput("pin_code", "", "","",false,true,"{\"pin_code\": true,\"length\": "+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+'}',"text" ,onInput, "Error");

    scr.render("pin_code");
  }
  else if(step == 5){
    scr.setButton("logout", getLangText("button_logout_card"), true, false, '{"icon": "../../graphics/icon-pick-card-red.svg", "display_group":"bottom_line"}', onButton2);
    scr.setButton("back", getLangText("button_menu_return"), true, false, '{"icon": "","display_group": "bottom_line"}', onButton1);
    //scr.setInput("pin_code", "", "","",false,true,"{\"pin_code\": true,\"length\": "+m_session.pin.length+', "filledCount":'+m_session.pin.value.length+"}","text" ,onInput, "Wait");
    scr.setInputJson({name:"pin_code",text:'', visible:false,validate:true,state:'Wait',ext:{pin_code:true,length:m_session.pin.length,filledCount:m_session.pin.value.length}}, onInput);

    scr.render("pin_code");
  }
  else if(step == 6){
    scr.deleteButton("back");
    scr.deleteButton("logout");
    scr.deleteInput("pin_code");
    scr.setLabel("text", getLangText('wait_impos_complete'), "");
    scr.setLabel("loader", "60", '{"loader":"ellipse", "icon": "../../graphics/icon-smile-3.svg"}');
    scr.render("wait_message");
  }
  else if(step == 7){
    window.external.exchange.scrData.flush();
    scr.setLabel("text", getLangText('wait_oper_init'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.deleteInput("pin_code");
    scr.render("wait_message");

    callSupport('pin_change_input');
  }
};
var settingsSIM = function(step){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var addServiceSelectElements = function(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("deposit", getLangText("button_deposit"),true, m_ATMFunctions.acceptor && m_session.ownCard, '{"icon": ""}', null);
    scr.setButton("withdrawal", getLangText("button_withdrawal"),true, m_ATMFunctions.dispenser, '{"icon": ""}', null);
    scr.setButton("pay", getLangText("button_pay"), true, false, '{"icon": ""}', null);
    scr.setButton("send", getLangText("button_send"), true, false, '{"icon": ""}', null);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', null);
    scr.setButton("settings", getLangText("button_mini_statement"),
      true, false,
      '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, true/*m_CardIcon.our*/, '{"icon": "../../graphics/icon_settings.svg"}', null);
    if(m_session.isCard)
      scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', null);
    else
      scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', null);
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }
  var onButton1 = function(name){
    m_session.sim = {"phoneNum":phoneNum};
    scr.nextScreen(settingsSIM,2);
  };
  var onButtonSMSInfoAdd = function(name){
    m_session.sim = {"phoneNum":phoneNum, type:"add"};
    scr.nextScreen(settingsSIM,2);
  };
  var onButtonSMSInfoDelete = function(name){
    m_session.sim = {"phoneNum":phoneNum, type:"delete"};
    scr.nextScreen(settingsSIM,2);
  };

  var onTellMEWrapper = function(args){
    switch(args) {
      case "wait_request": {
        checkSecondPINEnterFlag();
        break;
      }
      case "request_ok": {
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      }
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) != "ok") {
          if(m_session.serviceName === "smsinfo")
            scr.nextScreen(zsfCreditError, args);
          else
            scr.nextScreen(requestResult, [args]);
        }
        return;
      }
    }
  };
  var onReturn = function(name){
    scr.nextScreen(serviceSelect);
  };
  var onCancel = function(name){
    onCancelGlobal();
  };
  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onInput args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    else
      help = "";
    phoneNum = help;
  };
  var onInputSMSInfo = function(args){
    alertMsgLog(' '+scr.name+' onInput args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    else
      help = "";
    inpObj.text = phoneNum = help;
    if(phoneNum.length === 10) {
      buttonObjSMSInfoAdd.enable = true;
      scr.setButtonJson(buttonObjSMSInfoAdd, onButtonSMSInfoAdd);
      buttonObjSMSInfoDelete.enable = true;
      scr.setButtonJson(buttonObjSMSInfoDelete, onButtonSMSInfoDelete);
      window.external.exchange.RefreshScr();
    }
    else {
      buttonObjSMSInfoAdd.enable = false;
      scr.setButtonJson(buttonObjSMSInfoAdd, onButtonSMSInfoAdd);
      buttonObjSMSInfoDelete.enable = false;
      scr.setButtonJson(buttonObjSMSInfoDelete, onButtonSMSInfoDelete);
      window.external.exchange.RefreshScr();
    }
  };
  var onButtonClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    phoneNum = "";
    inpObj.text = "";
    scr.setInputJson(inpObj, onInput);
  };

  scr.addCall("TellMEWrapper", onTellMEWrapper);
  var phoneNum = "";
  if(!!m_session.timeoutObj && !!m_session.timeoutObj.input && !!m_session.timeoutObj.input['phone'])
    phoneNum = m_session.timeoutObj.input['phone'];
  var waitObj = {enable:true, text:getLangText('simcard_info_progress'),
    ext:{icon: "../../graphics/icon-loader.svg",loader:"loader"}};
  switch(step) {
    case 1: {
      if(m_session.serviceName === "addsim"){
        //здесь нужно добавлять все элементы с основного меню для затененной подложки
        scr.setLabel("deleteBtn", getLangText('button_delete'), '');
        if(m_session.serviceName === "addsim")
          scr.setLabel("title", getLangText('simcard_info'), "");
        else
          scr.setLabel("title", getLangText('smsinfo_title'), "");
        scr.setInput("phone", phoneNum, "+7 (___) ___-__-__", "", "", onInput);
        if(phoneNum.length === 10)
          scr.setButton("continue", getLangText("button_continue"), true, true, "", onButton1);
        else
          scr.setButton("continue", getLangText("button_continue"), true, false, "", onButton1);
        scr.setButton("cancel", getLangText("button_menu_return"), "", onReturn);
        /*			if(m_session.isCard)
					scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
				else
					scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);				*/
        scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        delete m_session.timeoutObj;
        scr.render("modal_phone_input");
      }
      else if(m_session.serviceName === "smsinfo"){
        var inpObj = {name:"phone", text:phoneNum, mask:"+7 (___) ___-__-__", hint:"",
          type:"text", state:"None", validate:true, visible: true, enable: true,
          value:phoneNum};
        scr.setInputJson(inpObj, onInputSMSInfo);
        scr.setLabelJson({name:"title", value: getLangText("smsinfo_title")});
        //scr.setLabelJson({name:"placeholder", value: "+7 (___) ___-__-__"});
        scr.setLabelJson({name:"comment1", value: getLangText("smsinfo_comment1")});
        scr.setLabelJson({name:"comment2", value: getLangText("smsinfo_comment2")});
        if(!m_ATMFunctions.printer) {
          scr.setLabelJson({name: "warning_l", value: getLangText("zsf_no_receipt")});
          scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
        }
        scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
        scr.setImage("info", "../../graphics/icon_information.svg", "");

        scr.setButtonJson({name:"card_return", text:getLangText("button_menu_return"),
          enable:true,visible:true, ext:{icon:""}}, onCancel);
        scr.setButtonJson({name:"cancel", text:getLangText("cashin_cancel_operation"),
          enable:true,visible:true, ext:{icon:""}}, onReturn);
        scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
          enable:true,visible:true, ext:{icon:""}}, onButtonClear);
        var buttonObjSMSInfoAdd = {name:"continue", text:getLangText("smsinfo_add_btn"),
          enable:phoneNum.length===10,visible:true, ext:{icon:"",themes:['blue']}};
        scr.setButtonJson(buttonObjSMSInfoAdd, onButtonSMSInfoAdd);
        var buttonObjSMSInfoDelete = {name:"middle", text:getLangText("smsinfo_delete_btn"),
          enable:false,visible:true, ext:{icon:""}};
        scr.setButtonJson(buttonObjSMSInfoDelete, onButtonSMSInfoDelete);
        scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        delete m_session.timeoutObj;
        scr.render("sms_popup");

      }
      break;
    }
    case 2: {
      //здесь нужно добавлять все элементы с основного меню для затененной подложки
      addServiceSelectElements();
      //scr.setTimeout('0', "", onButtonEmpty);
      //scr.setWaitJson(waitObj);
      //scr.render("main_menu");
      //window.external.exchange.ExecNdcService(m_session.serviceName, JSON.stringify(help));
      if(typeof m_session.second !="undefined" && m_session.second){
        if(m_session.serviceName === "smsinfo"){
          if(m_session.sim.type === "add")
            waitObj.text = getLangText('smsinfo_progress');
          else
            waitObj.text = getLangText('smsinfo_delete_progress');
        }
        scr.setTimeout('0', "", onButtonEmpty);
        waitObj.text = getLangText('wait_for_answer');
        scr.setWaitJson(waitObj);
        scr.render("main_menu");
        checkAndGoToPinOrNcf();
      } else
        scr.nextScreen(settingsSIM,3);
      break;
    }
    case 3: {
      if(typeof m_session.second === "undefined" || !m_session.second){
        if(m_session.serviceName === "smsinfo"){
          if(m_session.sim.type === "add")
            waitObj.text = getLangText('smsinfo_progress');
          else
            waitObj.text = getLangText('smsinfo_delete_progress');
        }
        addServiceSelectElements();
        scr.setTimeout('0', "", onButtonEmpty);
        scr.setWaitJson(waitObj);
        scr.render("main_menu");
      }
      var help = {phoneNumber : m_session.sim.phoneNum};
      if(m_session.serviceName === "smsinfo")
        callSupport('smsinfo_req&phone='+m_session.sim.phoneNum+'&type='+m_session.sim.type);
      else
        callSupport('link_sim_req&phone='+m_session.sim.phoneNum);
      return;
    }
    default: {
      scr.nextScreen(msgResult,'simcard_add_err');
      return;
    }
  }
};
var settingsInternetBank = function(){
  scr.nextScreen(msgResult,'banking_activated');
};
var settingsCardRequisites = function(step){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var onButton1 = function(name){
    if(step == 2)
      scr.nextScreen(msgResult,'wait_info_sent');
  }
  var onButton2 = function(name){
    scr.nextScreen(settingsCardRequisites,2);
  }
  var onButton3 = function(name){
    scr.nextScreen(settingsMenu,1);
  }

  var onInput = function(args){
  }

  switch(step)
  {
    case 1:

      scr.setLabel("requisites1", getLangText('settingMenu_bankreceive')+"ФК Открытие", "{\"group\": \"requisites\",\"title\": \"Банк получатель\"}");
      scr.setLabel("requisites2", "3010282619288172928", "{\"group\": \"requisites\",\"title\": \"Корр. счет\"}");
      scr.setLabel("requisites3", "029273628", "{\"group\": \"requisites\",\"title\": \"БИК\"}");
      scr.setLabel("requisites4", "Константин Джон", "{\"group\": \"requisites\",\"title\": \"Получатель\"}");
      scr.setLabel("requisites5", "1029171888881728918", "{\"group\": \"requisites\",\"title\": \"Счет получателя платежа\"}");
      scr.setButton("print_page", getLangText("settingMenu_printinfo"), '{"icon": ""}', onButton1);
      scr.setButton("forward", getLangText("settingMenu_sendinfo"), '{"icon": ""}', onButton2);
      scr.setButton("return", getLangText("button_logout_cash"), '{"icon": ""}', onButton3);
      scr.render("requisites");
      return;
      break;
    case 2:
      scr.setLabel("title", getLangText('settingMenu_phoneinfo'), "");
      scr.setInput("phone", "+7 (___)___-__-__", "+7 (___)___-__-__", "Номер", true, true, "", "phone", onInput);
      scr.setButton("continue", getLangText("settingMenu_sendinfo"), '{"icon": ""}', onButton1);
      scr.setButton("return", getLangText("settingMenu_return"), '{"icon": ""}', onButton1);
      scr.render("ipnut_phone");
      return;
      break;
    default:
      scr.nextScreen(msgResult,'wait_info_send_err');
      return;
      break;
  }
  scr.render("test");

};


var requestResult = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onButtonCancel = function(name){
    alertMsgLog(scr.name+' onButtonCancel '+name);
    serviceName = 'cancel';
    onCancelGlobal();
    //window.external.exchange.ExecNdcService("cancelspec", "");
  };
  var onButtonMainMenu = function(name){
    alertMsgLog(scr.name+' onButtonMainMenu '+name);
    {
      serviceName = 'webius_menu';
      scr.nextScreen(serviceSelect);
    }
  };
  var onButtonMainMenuCash = function(name){
    alertMsgLog(scr.name+' onButtonMainMenuCash '+name);
    {
      serviceName = 'cash';
      scr.nextScreen(serviceSelectCash);
    }
  };
  var onButtonToPin = function(name){
    alertMsgLog(scr.name+' onButtonToPin '+name);
    serviceName = '';
    callSupport("go_to_pin");
  };
  var onButtonFlashEkass = function(name){
    alertMsgLog(scr.name+' onButtonToPin '+name);
    serviceName = '';
    callSupport("advertising");
  };
  var onButtonSMSInfo = function(name){
    m_session.serviceName = "smsinfo";
    scr.nextScreen(settingsSIM,1);
  };


  var onTellMEWrapper = function(args)
  {
    switch(args)
    {
      case 'pin': {
        scr.nextScreen(pin);
        return;
      }
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        scr.nextScreen(requestResult,[args]);
        break;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);
  var _state, _servName = '';

  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
    _state = args[0];
    if(args.length > 1)
      _servName = args[1];
    if(args.length > 2)
      _msgId = args[2];
  }
  else
    _state = args;

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  var trantype = 1, nominalHelp;
  if(!!m_session.fitObj && m_session.fitObj.formfactor === "cash")
    trantype = 0;
  if(_servName === ''){
    //var trantype = window.external.exchange.getMemory("trantype");
    switch(_state){
      case 'ask_085_selfincass_impossible': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_no_incass'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_132_thx': {

        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        if(trantype == 1)
        {
          onCancelGlobal();
          return;
        }
        else
        {
          scr.setButton("cancel", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenuCash);
        }
        scr.setLabel("text", getLangText('Хотите продолжить работу?'), "");
        scr.setLabel("loader",(m_session.timePeriod / 1000).toString(), '{"loader":"countdown"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");

        break;
      }
      case 'end_133_req_impossible': {
        //if(m_session.serviceName !== 'pin_balance' && trantype == 1)
        //	scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);

        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);

        scr.setLabel("warning", getLangText('wait_oper_imposs'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'request_error': {
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_impos_complete'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_135_req_cant_perform': {
        if(m_session.serviceName === "card_seized"){
          callSupport("cancel");
          return;
        }
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_impos_complete'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'end_136_card_seized': {
        scr.setLabel("text", getLangText('card_seized'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case 'end_137_card_expired': {
        scr.setLabel("text", getLangText('card_expired'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setTimeout("0", "", onTimeout);
        scr.render("wait_message");
        break;
      }
      case 'pin_138_req_not_made':
      case 'ask_139_req_not_made': {
        if (m_session.serviceName !== 'cashin') {
          if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
            scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        }
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('req_not_done'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'amt_140_not_enough_money': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_not_enogth'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        return;
      }
      case 'ask_144_req_not_allowed': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_not_perm'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_145_incorrect_amount': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        nominalHelp  = window.external.exchange.getMemory("dataFromNDC");
        if(nominalHelp === "")
          scr.setLabel("warning", getLangText('wait_amount_incorr'), "");
        else {
          nominalHelp = nominalHelp.trim().replace(/RUR/g, "₽").replace(/USD/g, "$").replace(/EUR/g, "€");
          scr.setLabel("warning", getLangText('wait_amount_select2') + nominalHelp, "");
        }

        scr.setImage("smile","../../graphics/lapki.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_146_incorrect_amount': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        nominalHelp = window.external.exchange.getMemory("dataFromNDC");
        if(nominalHelp === "")
          scr.setLabel("warning", getLangText('wait_amount_select'), "");
        else{
          nominalHelp = nominalHelp.trim().replace(/RUR/g, "₽").replace(/USD/g, "$").replace(/EUR/g, "€");
          scr.setLabel("warning", getLangText('wait_amount_select2') + nominalHelp, "");
        }

        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'end_148_card_not_serviced': {
        scr.setLabel("text", getLangText('card_not_serviced'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case 'end_149_no_account_found': {
        scr.setLabel("text", getLangText('no_account'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case 'wait_pin_error': {
        //scr.setLabel("text", getLangText('pin_incorrect'), "");
        //scr.setImage("bg","../../graphics/BG_blur.jpg","");
        //scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        //scr.render("wait_message");

        //if(m_session.serviceName != 'pin_balance' && trantype == 1)
        //	scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('pin_incorrect'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'pinchange_pin_error': {
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('pinchange_pin_incorrect'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_303_limit_exceeded': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_limit_ex'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'end_304_pin_try_exceeded': {
        scr.setLabel("text", getLangText('pin_try_exceeded'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case 'amt_305_amount_to_big': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        nominalHelp  = window.external.exchange.getMemory("dataFromNDC");
        if(nominalHelp === "")
          scr.setLabel("warning", getLangText('wait_pl_small1')+'<br>'+getLangText('wait_pl_small2'), "");
        else {
          nominalHelp = nominalHelp.trim().replace(/RUR/g, "₽").replace(/USD/g, "$").replace(/EUR/g, "€");
          scr.setLabel("warning", getLangText('wait_pl_small1')+'<br>'+getLangText('wait_pl_small3') + nominalHelp, "");
        }

        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
      case 'ask_618_pinchange_not_allowed': {
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_no_pinchange'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        return;
      }
      case 'money_check': {
        scr.nextScreen(cashin, "closing");
        return;
      }
      case 'money_error': {
        scr.setLabel("text", getLangText('cashin_error_text1'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        return;
      }
      case 'wait_money_take':{
        scr.setTimeout(0, "", null);
        scr.setLabel("text", getLangText('cash_withdrawal_take'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        return;
      }
      case 'end_session_nfc_money_take':{
        scr.setTimeout(0, "", null);
        scr.setLabel("text", getLangText('nfc_cash_withdrawal_take'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        return;
      }
      case 'wait_card_captured':{
        scr.setTimeout(0, "", null);
        scr.setLabel("text", getLangText('card_seized2'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-3.svg"}');
        scr.render("wait_message");
        return;
      }
      case 'card_return':{
        scr.nextScreen(msgResult,["","card_return"]);
        return;
      }
      case 'wait_end_timeout':{
        scr.nextScreen(msgResult,["","end_timeout"]);
        return;
      }
      case 'wait_card_error':{
        scr.nextScreen(msgResult,["card_read_err","end_err"]);
        return;
      }
      case 'wait_end_session':
      case 'end_session': {
        scr.nextScreen(msgResult,['session_ended', "end"]);
        return;
      }
      case 'end_session_nfc': {
        scr.nextScreen(msgResult,['nfc_session_ended', "end"]);
        return;
      }
      case "end_session_nfc_print":
      case "card_return_print": {
        scr.nextScreen(msgResult,[_state, "end"]);
        return;
      }
      case 'end_pin_timeout':{
        onCancelTimeout();
        return;
      }
      case 'end_pin_cancel':{
        onCancelGlobal();
        return;
      }
      case 'wait_card_notprocess':{
        scr.setLabel("text", getLangText('card_not_serviced'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case 'wait_card_hold':{
        scr.setLabel("text", getLangText('card_seized2'), "");
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.render("wait_message");
        break;
      }
      case "nfc_read_hwerror":
      case "nfc_read_error":
        if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
          scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", m_session.fitObj.formfactor == "nfc" ? getLangText("nfc_read_error_card") : getLangText("nfc_read_error_token"), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      case "wait_cheque":
        scr.nextScreen(msgResult,['wait_cheque', "end"]);
        return;
      case "bna_fatal_timeout_processing_receipt":
      case "bna_fatal_timeout_processing":
        scr.nextScreen(msgResult,[_state, "end"]);
        return;
      default: {
        scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
        scr.setLabel("warning", getLangText('wait_impos_complete'), "");
        scr.setImage("smile","../../graphics/icon-smile-2.svg","");
        scr.render("wait_message_buttons");
        break;
      }
    }
  }
  else if(_state === 'ok'){
    if(_servName === 'pinchange')
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonToPin);
    else if(_servName !== 'pin_balance')
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    if(_servName === 'pinchange') {
      if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
        scr.setLabel("warning", getLangText('pinchange_succ')+(getLangText('end_session_nfc_no_card')), "");
      else
        scr.setLabel("warning", getLangText('pinchange_succ')+(getLangText('pinchange_sucс2')), "");
    }
    else if(_servName === 'addsim'){
      //scr.setButton("third", getLangText("smsinfo_btn"), '{"icon": ""}', onButtonSMSInfo);
      scr.setLabel("warning", getLangText('simcard_added'), "");
    }
    else if(_servName === 'smsinfo') {
      if(m_session.sim.type === "add")
        scr.setLabel("warning", getLangText('smsinfo_activated'), "");
      else
        scr.setLabel("warning", getLangText('smsinfo_delete_activated'), "");
    }
    else if(_servName === 'transfer_c2c')
      scr.setLabel("warning", getLangText('transfer_good'), "");
    else if(_servName === 'transfer')
      scr.setLabel("warning", getLangText('transfer_good'), "");
    else if(_servName === 'zsfcredit')
      scr.setLabel("warning", getLangText('zsf_good') + AddSpace(m_session.zsfcredit.amount) + getLangText("zsf_curr"), "");
    else if(_servName === 'zsfdeposit')
      scr.setLabel("warning", getLangText('zsf_good') + AddSpace(m_session.zsfcredit.amount) + getLangText("zsf_curr"), "");
    else
      scr.setLabel("warning", getLangText('wait_success'), "");
    scr.setImage("smile","../../graphics/icon-smile-1.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'err'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_impos_complete'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'req_impossible'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_oper_imposs'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'cashin_impossible'){
    scr.setLabel("text", getLangText('cashin_countout2'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.setTimeout( '0', "", onButtonEmpty);
    scr.render("wait_message");
  }
  else if(_state === 'cashin_impossible_money_return'){
    scr.setLabel("text", getLangText('cashin_take_notaccepted4'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.setTimeout( '0', "", onButtonEmpty);
    scr.render("wait_message");
  }
  else if(_state === 'selfincass_impossible'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_no_incass'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'request_not_performed'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_impos_complete'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'request_not_made'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('req_not_done'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'request_not_allowed'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_not_perm'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'pinchange_not_allowed'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_no_pinchange'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'incorrect_amount'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_amount_incorr'), "");
    scr.setImage("smile","../../graphics/lapki.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'incorrect_amount2'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_amount_select'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'limit_exceeded'){
    if(allowToReturnToMenu(m_session.serviceName) && trantype == 1)
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    scr.setLabel("warning", getLangText('wait_limit_ex'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");
    scr.render("wait_message_buttons");
  }
  else if(_state === 'amount_to_big'){
    scr.nextScreen(cashoutInputAmount, ['err', getLangText('wait_pl_small1'), getLangText('wait_pl_small2')]);
    return;
  }
  else if(_state === 'not_enough_money'){
    scr.nextScreen(cashoutInputAmount, ['err', getLangText('wait_not_enogth')]);
    return;
  }
  else{
    scr.setLabel("text", getLangText('wait_impos_complete'), "");
    scr.setLabel("loader","60", '{"loader":"ellipse","icon":"../../graphics/icon-smile-2.svg"}');
    scr.setTimeout('0', "", onButtonEmpty);
    scr.render("wait_message");
    return;
  }
};

var transferMenu = function(step){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  function addBackground(){
    scr.setLabel("balance", getLangText('main_your_balance'), "");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("cardPan",m_CardIcon.value,"");
    scr.setImage("cardImage",m_CardIcon.iconSrc, "");
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    if(m_session.isCard)
      scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
    else
      scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

    scr.setLabel("cardLabel", getLangText('receive_cardnum_label'), "");
    scr.setLabel("cardValue", m_session.transfer.cardnumber, "");
    scr.setLabel("cardLabel3", getLangText('card_number_label'), "");

    scr.setLabel("valueLabel", getLangText('amount_enter'), "");
    scr.setInput("valueInput", m_session.transfer.amount.toFixed().toString(), "", "0", true, true, "", "amount", onStep2Input);
    scr.setLabel("commisionLabel1", getLangText('transferMenu_label3'), "");
    scr.setLabel("commisionLabel2", getLangText('transferMenu_label4')+amountView(m_session.transfer.commission*100.0)+"%("+amountView(m_session.transfer.commissionValue / 100.0)+" ₽)", "");

    scr.setButton("continue", getLangText("button_continue"), "", onStep2Continue);
  }
  function amountView(value){
    var help = (value).toFixed(2);
    if ( help % 1 === 0)
      help = (value).toFixed(0);
    alertMsgLog("[transferMenu] value: "+value+", view: "+help);
    return help.toString();
  }
  function valueOf(s, b) {
    if (s.indexOf(b) === -1)
      return "";
    if (s.indexOf("|", s.indexOf(b)) === -1)
      return s.substring(s.indexOf(b) + b.length);
    else
      return s.substring(s.indexOf(b) + b.length, s.indexOf("|", s.indexOf(b)));
  }
  function getConfirmScreen(s){
    if (s.indexOf("ghjdthmnt htrdbpbns") > (-1)) {
      m_session.confirmScreen.header = getLangText('check_info_pay');
      m_session.confirmScreen.buttContinue = getLangText('button_continue');
      m_session.confirmScreen.buttCancel = getLangText('button_cancel');
      if ((s.indexOf("cevvf c extnjv rjvbccbb:") 	> (-1))
        && (s.indexOf("cevvf jgthfwbb:") 			> (-1))
        && (s.indexOf("rjvbccbz:") 				> (-1))
        && (s.indexOf("ntktajy/cxtn/") 			> (-1))) {//Итог, сумма, комиссия, телефон
        var temp = "Сумма: " + valueOf(s,"cevvf jgthfwbb:") + "<br/>" + "Телефон/счет: " + valueOf(s,"ntktajy/cxtn/") + "<br/>" + getLangText('cashin_deposit_title3') + valueOf(s,"rjvbccbz:");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
      else if ((s.indexOf("cevvf:") 	> (-1))
        &&(s.indexOf("rfhnf:") 	> (-1))
        &&(s.indexOf("rjvbccbz:") > (-1))) {// сумма, карта, комиссия
        var temp = "Сумма: " + valueOf(s,"cevvf:") + "<br/>" + "Карта: " + valueOf(s,"rfhnf:") + "<br/>" + getLangText('cashin_deposit_title3') + valueOf(s,"rjvbccbz:");;
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
      else if((s.indexOf("cevvf:") > (-1))
        && (s.indexOf("ntktajy/cxtn/") > (-1))) {// сумма, телефон/счет
        var temp = "Сумма:" + valueOf(s,"cevvf:") + "<br/>" + "Телефон/счет:" + valueOf(s,"ntktajy/cxtn/");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
      else if((s.indexOf("cevvf:") > (-1))
        && (s.indexOf("~kfujndjhbntkmysq dpyjc") > (-1))) {//сумма, благотворительный платеж
        var temp = "Благотворительный платеж"+ "<br/>" + "Сумма:" +valueOf(s,"cevvf:");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
    }
    if (s.indexOf("CHECK THE PAYMENT") > (-1)) {
      m_session.confirmScreen.header = "Check the payment details<br/>";
      m_session.confirmScreen.buttContinue = "Confirm";
      m_session.confirmScreen.buttCancel = "Cancel";
      if ( (s.indexOf("AMOUNT:") > (-1))
        && (s.indexOf("ACCOUNT NUMBER:") > (-1))
        && (s.indexOf("FEE") > (-1))) {// сумма, карта, комиссия
        var temp = "AMOUNT: " + valueOf(s,"AMOUNT:") + "<br/>" + "ACCOUNT NUMBER: " + valueOf(s,"ACCOUNT NUMBER:") + "<br/>" + "FEE: " + valueOf(s,"FEE");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
      else if((s.indexOf("AMOUNT:") > (-1))
        && (s.indexOf("PHONE NUMBER:") > (-1))) {// сумма, телефон/счет
        var temp = "AMOUNT:" + valueOf(s,"AMOUNT:") + "<br/>" + "PHONE NUMBER:" + valueOf(s,"PHONE NUMBER:");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
      else if ((s.indexOf("AMOUNT:") > (-1))
        && (s.indexOf("CHARITABLE CONTRIBUTION") > (-1))) {//сумма, благотворительный платеж
        var temp = "CHARITABLE CONTRIBUTION"+ "<br/>" + "AMOUNT:" +valueOf(s,"AMOUNT:");
        temp = temp.replace(/RUR/g, "₽");
        m_session.confirmScreen.body = temp;
      }
    }
    if (typeof m_ATMFunctions != 'undefined' && !m_ATMFunctions.printer) {
      var temp = m_session.confirmScreen.body + "<br><br>Печать чека временно невозможна";
      temp = temp.replace(/RUR/g, "₽");
      m_session.confirmScreen.body = temp;
    }
    var bodyLines = m_session.confirmScreen.body.split('<br/>');
    var lineParts, notesInd = 0;
    m_session.confirmScreen.note = {};
    for(var linesInd = 0; linesInd < bodyLines.length; ++linesInd){
      lineParts = bodyLines[linesInd].split(':');
      if(lineParts.length > 1 && lineParts[0].indexOf('Сумма') > -1){
        m_session.confirmScreen['note'+(notesInd++).toString()] = 'Сумма:';
        m_session.confirmScreen['note'+(notesInd++).toString()] = lineParts[1];
      }
      else{
        m_session.confirmScreen['note'+(notesInd++).toString()] = bodyLines[linesInd];
      }
    }
  }
  function luhn() { var cardNumber = argv[0]; var arr = cardNumber.split('').map(function(char, index) { var digit = parseInt(char); if ((index + cardNumber.length) % 2 === 0) { var digitX2 = digit * 2; return digitX2 > 9 ? digitX2 - 9 : digitX2; } return digit; }); return !(arr.reduce(function (a, b) { return a + b }, 0) % 10); }


  var onButtonEmpty = function(){};
  var onStep0Requisites = function(name){
  };
  var onStep0CardNumber = function(name){
    m_session.serviceName = "transfer_c2c";
    m_session.transfer = {};
    if(m_session.fitObj.fitType === "other" || isTransferAvailableForTest())
      scr.nextScreen(transferMenu, 11);
    else
      scr.nextScreen(transferMenu, 1);
  };
  var onStep1Continue = function(name){
    //if(luhn(m_session.transfer.cardnumber))
    //{
    m_session.transfer.amount = 0;
    m_session.transfer.commission = 0;
    m_session.transfer.commissionValue = 0;
    scr.nextScreen(transferMenu, 2);
    //}
    //else
    //{
    //	scr.setInput("number", "", "", "Некорректный номер карты", true, false, "", "card_number", onStep1Input);
    //	window.external.exchange.RefreshScr();
    //}
  };
  var onStep2Continue = function(name){
    m_session.serviceName = "transfer_c2c";
    if(typeof m_session.second != "undefined" && m_session.second){
      scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "", "rotate": true, "loader":"loader"}');
      window.external.exchange.RefreshScr();
      checkAndGoToPinOrNcf();
    } else {
      scr.nextScreen(transferMenu, 3);
    }
  };
  var onStep4ModalMsg = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onStep4ModalMsg, value: '+_args);
    addBackground();
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "", "rotate": true, "loader":"loader"}');
    //window.external.exchange.RefreshScr();
    scr.render("transfer_amount_input");

    //if(_args == confirmButtons[0])
    if(_args == 0)
      window.external.exchange.ExecNdcService("confirm_no", "");
    else
      window.external.exchange.ExecNdcService("confirm_yes", "");
  };
  var onMainMenu = function(name){
    m_session.serviceName = "";
    scr.nextScreen(serviceSelect);
  };
  var onCancel = function(name){
    m_session.serviceName = "cancel";
    onCancelGlobal();
  };

  var onStep1List = function(args){
    alertMsgLog(scr.name+' onStep1List args '+args);
    var pKey = "", help = "";
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
      if(typeof args[1] == 'undefined')
        help = args;
      else{
        pKey = args[0];
        help = args[1];
      }
    }
    else if(typeof args != 'undefined')
      pKey = args;
  };
  var onStep1Input = function(args){
    alertMsgLog(' '+scr.name+' onStep1Input args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = args;
      else {
        pKey = args[0];
        help = args[1];
      }
    }
    else
      help = "";
    m_session.transfer.cardnumber = help;
    //scr.setButton("continue", getLangText("button_continue"), true, (!!m_session.transfer && !!m_session.transfer.cardnumber && m_session.transfer.cardnumber.length >= 16) ? true : false, "", onStep1Continue);
    //scr.setInput("number", m_session.transfer.cardnumber, "", "", true, true, '', "card_number", onStep1Input);
  };
  var onStep2Input = function(args){
    alertMsgLog(' '+scr.name+' onStep2Input args '+args);
    var pKey = "", help = 0.0;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
    }
    if(typeof help == 'number' && !isNaN(help))
      //m_session.transfer.amount = help * 100.0;
      m_session.transfer.amount = help;
    else
      m_session.transfer.amount = 0;
    m_session.transfer.commissionValue = Math.ceil(m_session.transfer.amount * m_session.transfer.commission);
    //scr.setInput("valueInput", (m_session.transfer.amount / 100.0).toFixed(0), "", "0", true, true, "", onStep2Input);
    //scr.setLabel("commisionLabel2", getLangText('transferMenu_label4')+amountView(m_session.transfer.commission * 100.0)+"%("+amountView(m_session.transfer.commissionValue / 100.0)+" ₽)", "");
    scr.setInput("valueInput", (m_session.transfer.amount).toFixed(0), "", "0", true, true, "", "amount", onStep2Input);
    //scr.setLabel("commisionLabel2", getLangText('transferMenu_label4')+amountView(m_session.transfer.commission * 100.0)+"%("+amountView(m_session.transfer.commissionValue)+" ₽)", "");
    //window.external.exchange.RefreshScr();
    //scr.setButton("continue", getLangText("button_continue"), true, m_session.transfer.amount > 0 ? true : false, "", onStep2Continue);
  };

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request": {
        checkSecondPINEnterFlag();
        break;
      }
      case "request_ok": {
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        /*scr.setWait(false, '', '{"icon": ""}');
				scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onMainMenu);

				scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onCancel);

				scr.setLabel("warning", getLangText('good'), "");
				scr.setImage("smile","../../graphics/icon-smile-1.svg","");
				scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
				scr.render("wait_message_buttons");*/
        return;
      }
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var confirmButtons = [getLangText('button_cancel'), getLangText('button_continue')];
  if(step === 0){
    {
      m_session.serviceName = "transfer_c2c";
      m_session.transfer = {};
      if(m_session.fitObj.fitType === "other" || isTransferAvailableForTest())
        scr.nextScreen(transferMenu, 11);
      else
        scr.nextScreen(transferMenu, 1);
      return;
    }
    scr.setLabel("balance", getLangText('main_your_balance'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
    scr.setButton("back", getLangText("button_menu_return"), '{"icon": ""}', onMainMenu);

    scr.setButton("cash", getLangText("settingMenu_transfer_type_req"),true,false, '{"icon": "img/icon-4-1.svg"}', onStep0Requisites);
    scr.setButton("ourcard", getLangText("settingMenu_transfer_type_card"),true,true, '{"icon": "img/icon-4-2.svg"}', onStep0CardNumber);

    scr.addCall("cancel", onCancel);

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    scr.render("deposit_select_source");
  }
  else if(step === 1){
    if(!!m_session.timeoutObj && !!m_session.timeoutObj.input && !!m_session.timeoutObj.input['number'])
      m_session.transfer.cardnumber = m_session.timeoutObj.input['number'];
    scr.setLabel("balance", getLangText('main_your_balance'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setLabel("cardPan",m_CardIcon.value,"");
    scr.setImage("cardImage",m_CardIcon.iconSrc, "");

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    /*if(balanceShow && !isNaN(m_session.balance))
			scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
		else
			scr.setButton("showremains", getLangText("showremains"), balanceShowReq ? '{"icon": "","state":"wait"}' : '{"icon": "","state":""}', onBalanceShowButton);
		scr.setButton("print", "", m_ATMFunctions.printer, !balancePrintNeed, (!balancePrintNeed)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', onBalancePrintButton);
		*/

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
    scr.setLabel("deleteBtn", getLangText('button_delete'), '');
    scr.setLabel("error-text1", getLangText('receive_cardnum_err1'), '');
    scr.setLabel("error-text2", getLangText('receive_cardnum_err2'), '');
    scr.setLabel("sourceLabel", getLangText('transferMenu_source'), "");
    scr.setLabel("sourceValue", m_CardIcon.paysys + ' ' + m_CardIcon.value, "");
    //scr.setList("sourceList", m_CardIcon.paysys + ' ' + m_CardIcon.value , 0, "", onStep1List);

    scr.setLabel("valueLabel", getLangText('receive_cardnum_label'), "");
    scr.setLabel("comment", getLangText('card_number_label'), "");
    scr.setInputJson({name:"number",text:((!!m_session.transfer && !!m_session.transfer.cardnumber) ?
        m_session.transfer.cardnumber : ""),type:"card_number",visible:true,enable:true}, onStep1Input);

    scr.setButton("continue", getLangText("button_continue"), true,
      (!!m_session.transfer && !!m_session.transfer.cardnumber && m_session.transfer.cardnumber.length >= 16) ?
        true : false, "", onStep1Continue);
    scr.setButton("back", getLangText("button_menu_return"), "", onMainMenu);

    scr.addCall("cancel", onCancel);
    //scr.setButton("cancel", getLangText("button_menu_return"), "", onCancel);

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    delete m_session.timeoutObj;
    scr.render("transfer_card_input");
  }
  else if(step === 11){//для перевода с чужой карты
    if(!!m_session.timeoutObj && !!m_session.timeoutObj.input && !!m_session.timeoutObj.input['number'])
      m_session.transfer.cardnumber = m_session.timeoutObj.input['number'];
    scr.setLabel("balance", getLangText('main_your_balance'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setLabel("cardPan",m_CardIcon.value,"");
    scr.setImage("cardImage",m_CardIcon.iconSrc, "");

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    /*if(balanceShow && !isNaN(m_session.balance))
			scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
		else
			scr.setButton("showremains", getLangText("showremains"), balanceShowReq ? '{"icon": "","state":"wait"}' : '{"icon": "","state":""}', onBalanceShowButton);
		scr.setButton("print", "", m_ATMFunctions.printer, !balancePrintNeed, (!balancePrintNeed)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', onBalancePrintButton);
		*/

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
    scr.setLabel("deleteBtn", getLangText('button_delete'), '');
    scr.setLabel("error-text1", getLangText('receive_cardnum_err1'), '');
    scr.setLabel("error-text2", getLangText('receive_cardnum_err2'), '');
    scr.setLabel("sourceLabel", getLangText('transferMenu_source'), "");
    scr.setLabel("sourceValue", m_CardIcon.paysys + ' ' + m_CardIcon.value, "");
    //scr.setList("sourceList", m_CardIcon.paysys + ' ' + m_CardIcon.value , 0, "", onStep1List);

    scr.setLabel("valueLabel", getLangText('receive_cardnum_label'), "");
    scr.setLabel("comment", getLangText('card_number_label'), "");
    scr.setInputJson({name:"number",text:((!!m_session.transfer && !!m_session.transfer.cardnumber) ?
        m_session.transfer.cardnumber : ""),type:"card_number",visible:true,enable:true}, onStep1Input);

    scr.setButton("continue", getLangText("button_continue"), true,
      (!!m_session.transfer && !!m_session.transfer.cardnumber && m_session.transfer.cardnumber.length >= 16) ?
        true : false, "", onStep1Continue);
    scr.setButton("back", getLangText("button_menu_return"), "", onMainMenu);

    scr.addCall("cancel", onCancel);
    //scr.setButton("cancel", getLangText("button_menu_return"), "", onCancel);

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    delete m_session.timeoutObj;
    scr.render("transfer_card_input_other");
  }
  else if(step === 2){
    if(!!m_session.timeoutObj && !!m_session.timeoutObj.input && !!m_session.timeoutObj.input['valueInput'])
      m_session.transfer.amount = m_session.timeoutObj.input['valueInput'];

    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setLabel("balance", getLangText('main_your_balance'), "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("cardPan",m_CardIcon.value,"");
    scr.setImage("cardImage",m_CardIcon.iconSrc, "");

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    /*if(balanceShow && !isNaN(m_session.balance))
			scr.setButton("showremains", AddSpace(m_session.balance) + ' ₽', '{"icon": "","state":"show"}', onBalanceShowButton);
		else
			scr.setButton("showremains", getLangText("showremains"), balanceShowReq ? '{"icon": "","state":"wait"}' : '{"icon": "","state":""}', onBalanceShowButton);
		scr.setButton("print", "", m_ATMFunctions.printer, !balancePrintNeed, (!balancePrintNeed)? '{"icon": "../../graphics/print-balance.svg"}' : '{"icon": "../../graphics/print-balance.svg", "themes":["wait"]}', onBalancePrintButton);
		*/

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
    scr.setLabel("deleteBtn", getLangText('button_delete'), '');
    scr.setLabel("cardLabel", getLangText('receive_cardnum_label'), "");
    var tmpCardNumber = "";
    var startIndex = 0;
    while (startIndex < m_session.transfer.cardnumber.length)
    {
      tmpCardNumber += m_session.transfer.cardnumber.substr(startIndex,4) + ' ';
      startIndex+=4;
    }
    scr.setLabel("cardValue", tmpCardNumber, "");
    scr.setLabel("cardLabel3", getLangText('card_number_label'), "");

    scr.setLabel("valueLabel", getLangText('amount_enter'), "");
    scr.setInput("valueInput", m_session.transfer.amount, "", "0", true, true, "", "amount", onStep2Input);
    scr.setLabel("commisionLabel1", getLangText('transferMenu_label3'), "");
    scr.setLabel("commisionLabel2", getLangText('transferMenu_label4')+amountView(m_session.transfer.commission*100.0)+" % ("+amountView(m_session.transfer.commissionValue / 100.0)+" ₽)", "");

    scr.setButton("back", getLangText("button_menu_return"), "", onMainMenu);
    scr.addCall("cancel", onCancel);
    //scr.setButton("cancel", getLangText("button_menu_return"), "", onCancel);
    scr.setButton("continue", getLangText("button_continue"), true, m_session.transfer.amount > 0 ? true : false, "", onStep2Continue);
    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    scr.render("transfer_amount_input");
  }
  else if(step === 3){
    if(typeof m_session.second === "undefined" || !m_session.second){
      scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "", "rotate": true, "loader":"loader"}');
      window.external.exchange.RefreshScr();
    }
    var help = {cardnumber : m_session.transfer.cardnumber, amount : ((m_session.transfer.amount + m_session.transfer.commissionValue)*100.0).toFixed(0)};
    m_session.serviceName = "transfer_c2c";
    callSupport('transfer_req&cardNumber='+m_session.transfer.cardnumber+'&amount='+help.amount);
    m_session.balance = NaN;
  }
  else if(step === 4){
    window.external.exchange.ExecNdcService("confirm_yes", "");
    return;

    m_session.confirmScreen = {};
    getConfirmScreen(m_HostScreenText);
    scr.setWait(false, "", '{"icon": ""}');

    var help = confirmButtons;//.join().toString();
    var msgExt = {icon:'', themes: ['left', 'noicon'],options_settings: [{name:'cancel',icon:''},{name:'deposit',icon:'',theme:'btn-green'}]};
    for(var noteInd = 0; noteInd < 10; ++noteInd)
      if(typeof m_session.confirmScreen['note'+noteInd.toString()] != 'undefined')
        msgExt['note'+noteInd.toString()] = m_session.confirmScreen['note'+noteInd.toString()];
    scr.setModalMessage(m_session.confirmScreen.header, help, -1, true, JSON.stringify(msgExt), onStep4ModalMsg);
    window.external.exchange.RefreshScr();
  }
  else {
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    //scr.setImage("smile","../../graphics/icon-loader.svg","");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.render("wait_message");
  }
};
var transferToCompany = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferInputAmount);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setLabel("title", "Введите реквизиты получателя", "");
  scr.setInput("bik", "", "", "БИК банка-получателя", "", onInput);
  scr.setInput("recipient", "", "", "Получатель", "", onInput);
  scr.setInput("schet", "", "", "Номер счета получателя", "", onInput);
  scr.setInput("inn", "", "", "ИНН", "", onInput);
  scr.setInput("kpp", "", "", "КПП", "", onInput);
  scr.setInput("nds", "", "", "Выберите НДС", "", onInput);
  scr.setButton("button3", getLangText("button_continue"), "", onButton3);

  scr.render("test")
};
var transferToSchet = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferInputAmount);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setLabel("source", getLangText('transferMenu_label1'), "");
  scr.setList("sourcekList", "1234567890,0987654321,5555555565", 0, "", onList);
  scr.setLabel("source", "Выберите получателя платежа", "");
  scr.setList("sourcekList", "3333333333,44444444444444,7777777777", 0, "", onList);

  scr.setButton("button3", getLangText("button_continue"), "", onButton3);

  scr.render("test");
};
var transferToCard = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferToCardRecipient);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

  scr.setLabel("source", getLangText('transferMenu_source'), "");
  scr.setInput("card", "", "", getLangText('card_number_label'), "", onInput);

  scr.setLabel("note", getLangText('cash_withdrawal_amnt'), "");
  scr.setInput("expire", "", "", "Месяц и год", "", onInput);

  scr.setButton("button3", getLangText("button_continue"), "", onButton3);
  scr.render("test");
};
var transferToCardRecipient = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferSend);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

  scr.setInput("card", "", "", "Номер карты получателя платежа", "", onInput);
  scr.setInput("amuont", "", "", getLangText('cash_withdrawal_amnt'), "", onInput);

  scr.setButton("button3", getLangText("button_continue"), "", onButton3);
  scr.render("test");
};
var transferChooseIdType = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);


  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }


  var onButton3 = function(name){
    scr.nextScreen(transferRequisitesInput);
  }

  var onButton4 = function(name){
    scr.nextScreen(transferCardInput);
  }
  var onButton7 = function(name){
    scr.nextScreen(helpMenu);
  }
  var onButton8 = function(name){
    scr.nextScreen(settingsMenu, 1);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  //scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  //scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
  scr.setButton("requisites", getLangText("settingMenu_transfer_type_req"), "{\"icon\": \"img/icon-4-1.svg\"}", onButton3);
  scr.setButton("numbercard", getLangText("settingMenu_transfer_type_card"), "{\"icon\": \"img/icon-4-2.svg\"}", onButton4);
  scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButton7);
  scr.setButton("settings", getLangText("button_mini_statement"),
    true, false,
    '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
  scr.setButton("receipt", getLangText("button_settings"), true, /*m_CardIcon.our*/true, '{"icon": "../../graphics/icon_settings.svg"}', onButton8);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

  scr.render("transfer_choose_id_type");

};
var transferRequisitesInput = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferInputAmount);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setLabel("source", getLangText('transferMenu_label1'), "");
  scr.setList("mbkList", "1234567890,0987654321,5555555565", 0, "", onList);
  scr.setInput("bik", "", "", "БИК банка-получателя", "", onInput);
  scr.setInput("recipient", "", "", "Получатель", "", onInput);
  scr.setInput("schet", "", "", "Номер счета", "", onInput);
  scr.setInput("uip", "", "", "УИП (если есть)", "", onInput);
  scr.setButton("button3", getLangText("button_continue"), "", onButton3);

  scr.render("test");

};
var transferCardInput = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... Руб.", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferInputAmount);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);

  scr.setLabel("source", getLangText('transferMenu_label1'), "");
  scr.setList("mbkList", "1234567890,0987654321,5555555565", 0, "", onList);

  scr.setInput("card", "", "", "Введите номер карты получателя:", "", onInput);

  scr.setButton("button3", getLangText("button_continue"), "", onButton3);
  scr.render("test");
};
var transferInputAmount = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  var onButton1 = function(name){
    scr.setLabel("balance", "... ₽", "");
    window.external.exchange.refreshScr();
  }

  var onButton3 = function(name){
    scr.nextScreen(transferSend);
  }
  var onCancel = function(name){
    onCancelGlobal();
  }

  var onList = function(){
  }

  var onInput = function(args){
  }


  scr.setLabel("balance", getLangText('main_your_balance'), "");
  scr.setButton("showremains", getLangText("showremains"), "{\"icon\": \"\",\"pair\":\"showremainson\"}", onButton1);
  scr.setButton("print", "", '{"icon": ""}', onBalancePrintButton);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onCancel);
  scr.setInput("amount", "", "", getLangText('cash_withdrawal_amnt'), "", onInput);
  scr.setInput("nazn", "", "", "Введите назначение платежа:", "", onInput);
  scr.setLabel("comment", getLangText('transfer_input_comm'), "");
  scr.setButton("button3", getLangText("button_send"), "", onButton3);
  scr.render("test");
};
var transferSend = function(){
  scr.nextScreen(msgResult,"Успешно зачисленно 12 250 ₽");
};

var cashin = function(step) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  function deleteElements(fullFlag){
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setWait(false, getLangText('wait_for_answer'), "");
    //scr.deleteLabel("modal_text2");
    scr.setLabel("modal_text2", " ", "");
    //scr.deleteLabel("wait_text2");
    scr.setLabel("wait_text2", " ", "");
    //scr.deleteLabel("popup_text");
    scr.setLabel("popup_text", "", "");
    //scr.deleteLabel("popup_sum");
    scr.setLabel("popup_sum", "", "");
    //scr.deleteLabel("popup_title_sum");
    scr.setLabel("popup_title_sum", "", "");
    //scr.deleteLabel("popup_comission");
    scr.setLabel("popup_comission", "", "");
    scr.setLabel("infoCupure", "", "");
    scr.setLabel("infoCupure2", "", "");
    //scr.deleteLabel("bynotes");
    scr.setLabel("bynotes", "", "");
    scr.deleteLabel("modal_info");
    scr.setLabel("small_warning_lab", " ", "");
    scr.setImage("small_warning","","");

    if(m_session.fitObj && m_session.fitObj.fitType === "other"){
      scr.setButtonJson({name:"ofertaClose", visible:false, enable:false, ext:{}},
        onButtonEmpty);
      scr.setLabelJson({name:"ofertaText", value:""});
      scr.setImageJson({name:"qr", src:"", ext:{}});
      ofertaModal = {name:"checkbox_print", text:"true", type:"checkbox", visible:false, enable:false,
        ext:{}};
      scr.setInputJson(ofertaModal, onOfertaCheck);
      scr.setLabelJson({name:"print_receipt", value:""});
      scr.setLabelJson({name:"Page1", value:""});
      scr.setLabelJson({name:"Page2", value:""});
      scr.setLabelJson({name:"Page3", value:""});
      scr.setLabelJson({name:"qrText", value:""});
      scr.setLabelJson({name:"title", value:""});
      scr.setLabelJson({name:"offer", value:""});
      scr.setImageJson({name:"qr", src:"", visible:false, ext:{}});
      scr.setButtonJson({name:"close", text:"", enable:false, visible:false, ext:{}},
        onButtonEmpty);
    }
  }
  function setAmountInfoLabels(){
    var amountToCard = m_session.cashin.amount, amountcom = 0.0;
    /*#hardcode 1%*/
    if(typeof m_session.comminfo !== "undefined" && !isNaN(m_session.comminfo.percent) &&
      m_session.comminfo.percent > 0) {
      amountcom = m_session.cashin.amount / 100.0;
      if(!!m_session.comminfo.percent && m_session.comminfo.percent > 0.0)
        amountcom *= m_session.comminfo.percent;
      amountcom = toFixed2Number(amountcom);
      if(m_session.comminfo.mincomm > 0.0 && amountcom < m_session.comminfo.mincomm)
        amountcom = m_session.comminfo.mincomm;
      if(m_session.cashin.amount > amountcom)
        amountToCard = m_session.cashin.amount - amountcom;
      else
        amountToCard = 0;
      m_session.cashin.toCard = amountToCard.toString();
    }
    m_session.cashin.amountcom = amountcom;

    scr.setLabel("popup_text", getLangText('cashin_deposit_title1'), "");
    scr.setLabel("popup_sum", AddSpace(amountToCard.toString())+' ₽', "");
    scr.setLabel("popup_title_sum", getLangText('cashin_deposit_title2')+
      AddSpace(m_session.cashin.amount.toString())+' ₽', "");
    if(amountcom > 0.0) {
      if(m_session.cashin.amount <= amountcom) {
        scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+
          AddSpace(amountcom.toString())+' ₽', "");
        scr.setLabel("popup_warning", getLangText('minamount_info')+
          AddSpace(amountcom.toString())+' ₽', '{"themes": ["red"]}');
        scr.setImage("warning","../../graphics/mes-error.svg", "");
      }
      else {
        if(!!m_session.comminfo.percent)
          scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+AddSpace(amountcom.toString())+(amountcom > m_session.comminfo.mincomm ? (' ₽ ('+AddSpace(m_session.comminfo.percent, true)+'%)') : ' ₽'), "");
        else
          scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+AddSpace(amountcom.toString())+(amountcom > m_session.comminfo.mincomm ? (' ₽ (1%)') : ' ₽'), "");
        setLabelWarning();
        scr.setLabel("popup_warning", "", "");
        scr.setImage("warning","", "");
      }
    }
    else if(!!m_session.comminfo && m_session.comminfo.contract === true) {
      scr.setLabel("popup_comission", getLangText('label_nukk_contract'), "");
      scr.setLabel("popup_warning", "", "");
      scr.setImage("warning","", "");
    }
    else {
      scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+AddSpace(amountcom.toString())+' ₽', "");
      scr.setLabel("popup_warning", "", "");
      scr.setImage("warning","", "");
    }
    if(m_session.fitObj.fitType === "other") {
      if(typeof (m_session.cashin.oferta) === "undefined")
        m_session.cashin.oferta = false;
      ofertaModal = {name:"checkbox_print",
        text:"true", type:"checkbox", visible:true,
        enable:true, validate:true, ext:{}};
      scr.setInputJson(ofertaModal, onOfertaCheck);
      scr.setLabelJson({name:"print_receipt", value: (m_session.cashin.oferta ? getLangText("cashin_other_on") :
          getLangText("cashin_other_off"))});
      scr.setLabelJson({name:"Page1", value:getLangText("oferta_text_page1")});
      scr.setLabelJson({name:"Page2", value:getLangText("oferta_text_page2")});
      scr.setLabelJson({name:"Page3", value:getLangText("oferta_text_page3")});
      scr.setLabelJson({name:"Page4", value:getLangText("oferta_text_page4")});
      scr.setLabelJson({name:"Page5", value:getLangText("oferta_text_page5")});
      scr.setLabelJson({name:"Page6", value:getLangText("oferta_text_page6")});
      scr.setLabelJson({name:"Page7", value:getLangText("oferta_text_page7")});
      scr.setLabelJson({name:"Page8", value:getLangText("oferta_text_page8")});
      scr.setLabelJson({name:"Page9", value:getLangText("oferta_text_page9")});
      scr.setLabelJson({name:"Page10", value:getLangText("oferta_text_page10")});
      scr.setLabelJson({name:"Page11", value:getLangText("oferta_text_page11")});
      scr.setLabelJson({name:"Page12", value:getLangText("oferta_text_page12")});
      scr.setLabelJson({name:"Page13", value:getLangText("oferta_text_page13")});
      scr.setLabelJson({name:"qrText", value:getLangText("cashin_other_qr")});
      scr.setLabelJson({name:"offer", value:getLangText("offer_text")});
      scr.setImageJson({name:"qr", src:"../../graphics/QR.png", ext:{}});
      scr.setLabelJson({name:"title", value:getLangText("cashin_other_title")});
      scr.setButtonJson({name:"close", text:getLangText("oferta_btn_close"),
          enable:true, visible:true, ext:{}},
        onButtonEmpty);
    }
  }
  function checkAndShowNUKKInfoIfNeeded(){
    if(!!m_session.cashin && !!m_session.cashin.modal_info)
      scr.setLabel("modal_info", m_session.cashin.modal_info, "");
  }
  function setLabelWarning(accText){
    if(!m_ATMFunctions.printer) {
      scr.setLabelJson({name: "warning_l", value: getLangText("zsf_no_receipt")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.refreshScr();
      return false;
    }
    else {
      scr.setLabelJson({name: "warning_l", value: " "});
      scr.setImage("warning_i", "", "");
      window.external.exchange.refreshScr();
      return false;
    }
  }

  var onModalTooMuchMoney = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onModalTooMuchMoney, value: '+_args);

    if(_args == 0) {
      scr.nextScreen(serviceSelect);
      return;
    } else if(_args == 1) {
      scr.nextScreen(cashin, "opening");
      return;
    } else {
      onCancelGlobal();
    }
  };
  function setElementsOnModal(text1, text2, icon1,countdown1, btnsArray, onModalObj){
    scr.setLabel("modal_text2",text2, "");
    var modalObj, btnsExt;
    if(btnsArray.length == 3)
      btnsExt = [{ name:"back", enable:true },{ name:"add", enable:true },{ name:"logout", icon:"../../graphics/icon-pick-card-red.svg", theme:"btn-white-red", enable:true }];
    else if(btnsArray.length == 2)
      btnsExt = [{ name:"back", enable:true },{ name:"add", enable:true }];
    else if(btnsArray.length == 1)
      btnsExt = [{ name:"back", enable:true }];
    else
      btnsExt = [];
    if(typeof icon1 !== "undefined")
      modalObj = { text: text1, options: btnsArray, selected: -1, visible: true, ext: { icon: icon1, size: "native", loader: "ellipse", options_settings: btnsExt } };
    else if(typeof countdown1 !== "undefined")
      modalObj = { text: text1, options: btnsArray, selected: -1, visible: true, ext: { icon: "",rotate:true,loader:"countdown",count: countdown1,options_settings:btnsExt}};
    scr.setModalMessageJson(modalObj, onModalObj);
  }
  function returnBanknotes(){
    deleteElements();
    scr.setLabel("wait_text2", getLangText('cashin_take_notaccepted3'), "");
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setWait(true, getLangText('cashin_take_notaccepted1'), '{"icon": "","rotate":true,"loader":"loader","count":60}');
    scr.render("deposit_select_currency");
    return;
  }
  function getDisBynotes(){
    var bynotes_dis = window.external.CallPlugin("IniFileConverter","GetRubRurSectionMissingCurrencies",
      'C:\\scs\\atm_h\\ConfigNDC\\NDC\\Custom\\bna.ini');
    if (typeof bynotes_dis !== 'undefined') {
      bynotes_dis = JSON.parse(bynotes_dis);
      if (bynotes_dis.length > 0){
        var res = getLangText("cashin_disable_cupure");
        for (var i = 0; i < bynotes_dis.length; i++) {
          res += (Number(bynotes_dis) / 100).toString() + ' ₽, ';
        }
        res = res.substring(0, res.length - 2);
        return res;
      }
    }
    return null;
  }
  var onButtonEmpty = function(){
  };
  var onMoneyCall = function(args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoneyCall, value: '+_args);

    //if(_args == onMoneyCallOptions[0])
    if(_args == 0) {
      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      if(bimType != "0"){
        if(typeof m_session.cashin != "undefined" && m_session.cashin.amount > 0)
          scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        else
          scr.setWait(true, getLangText('cashin_closing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        //scr.render("deposit_select_currency");
        window.external.exchange.RefreshScr();

        step = "money_return";
        callSupport('money_insert_return');
      } else {
        scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        //scr.render("deposit_select_currency");
        window.external.exchange.RefreshScr();

        callSupport('money_insert_accept');
      }
      serviceName = "return";
    } else {
      callSupport("cancel");
      serviceName = "cancel";
    }
  };
  var onMoneyAccept = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoneyAccept, value: '+_args);

    //if(_args == onMoneyAcceptOptions[0])
    if(_args == 0) {
      step = "money_return";
      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      //window.external.exchange.RefreshScr();
      scr.render("deposit_select_currency");
      callSupport("money_insert_return");
      serviceName = "return";
    } else if(_args == 1) {
      step = "money_add";
      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_ready'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      window.external.exchange.RefreshScr();
      //scr.render("deposit_select_currency");
      callSupport("money_insert_add");
      serviceName = "add";
    } else if(_args != -1){
      step = "money_accept";
      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_get_data'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      //window.external.exchange.RefreshScr();
      scr.render("deposit_select_currency");

      m_session.balance = NaN;
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      //window.external.exchange.ExecNdcService("accept", "");
      callSupport("money_insert_accept");
      serviceName = "accept";
    }
  };
  var onMoneyFullCall = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoneyAccept, value: '+_args);

    if(_args == 0)
    {
      step = "money_return";
      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      //window.external.exchange.RefreshScr();
      scr.render("deposit_select_currency");
      callSupport("money_insert_return");
      serviceName = "return";
    }
    else if(_args != -1){

      deleteElements();
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      scr.setWait(true, getLangText('cashin_get_data'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
      window.external.exchange.RefreshScr();

      m_session.balance = NaN;
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("money_insert_accept");
      serviceName = "accept";
    }
  };
  var onMoreTimeCall = function(args){
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onMoreTime, value: '+_args);

    if(_args == 1)
    {
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_yes");
      serviceName = "moretime";
    }
    else{
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("ask_more_time_no");
      serviceName = "return";
    }
  };
  var onButton1 = function(name){
    alertMsgLog(' '+scr.name+'. cashin зачислить ' + name);
    window.external.exchange.ExecNdcService("accept", "");
  };
  var onButton2 = function(name){
    alertMsgLog(' '+scr.name+'. cashin добавить ' + name);
    window.external.exchange.ExecNdcService("add", "");
  };
  var onButton3 = function(name){
    alertMsgLog(' '+scr.name+'. cashin отменить ' + name);
    callSupport("cancel");
  };
  var onButton4 = function(name){
    alertMsgLog(' '+scr.name+', ' + name + ', Продолжить для запроса.');
    window.external.exchange.ExecNdcService("request", "");
  };
  var onCancel = function(name){
    scr.setLabel("text", getLangText('unknown_error'), "");
    scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
    scr.render("wait_message");
    callSupport("cancel");
  };
  var onButtonCancel = function(name){
    onCancelGlobal();
  };
  var onButtonMainMenu = function(name){
    scr.nextScreen(serviceSelect);
  };
  var onSpecCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    onCancelGlobal();
  };
  var onOfertaCheck = function(someArgs){
    if(someArgs[1] == "true") {
      m_session.cashin.oferta = true;
    }
    else if(someArgs[1] == "false") {
      m_session.cashin.oferta = false;
    }
    ofertaModal.value = m_session.cashin.oferta;
    {//кнопки на верхней части подложки
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);

      setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);

      if(m_session.isCard)
        scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onButtonEmpty);
      else
        scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onButtonEmpty);
      scr.setButton("roubles", getLangText("curr_rub_text"), true, false, '{"icon": ""}', onButtonEmpty);
      scr.setButton("dollars", getLangText("curr_doll_text"),true,false, '{"icon": ""}',"", onButtonEmpty);
      scr.setButton("euro", getLangText("curr_euro_text"), true,false,'{"icon": ""}',"",onButtonEmpty);
    }
    deleteElements();
    setAmountInfoLabels();
    scr.setLabelJson({name:"print_receipt", value:(m_session.cashin.oferta ?
        getLangText("cashin_other_on") :
        getLangText("cashin_other_off"))});
    scr.setInputJson(ofertaModal, onOfertaCheck);
    fdkButts = window.external.exchange.GetModuleVariable("wex", "FDKMask");
    scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'),
      '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+
      '],"display_group": "bynotes"}');
    if(checkBit(fdkButts, 2) &&
      (m_session.ownCard || typeof m_session.comminfo === "undefined" ||
        isNaN(m_session.comminfo.maxdeposit) || m_session.comminfo.maxdeposit === 0.0 ||
        m_session.comminfo.maxdeposit > m_session.cashin.amount))
    {
      help = onMoneyAcceptOptions;
      if(typeof m_session.cashin.amountcom !== "undefined" && m_session.cashin.amountcom > 0 &&
        m_session.cashin.amount <= m_session.cashin.amountcom)
        scr.setModalMessage('', help, 0, true,
          '{"options_settings":[{"name":"back","icon":""},{"name":"add","icon":""},'+
          '{"name":"deposit","icon":"","theme":"btn-green","enable":false}]}', onMoneyAccept);
      else
        scr.setModalMessage('', help, 0, true,
          '{"options_settings":[{"name":"back","icon":""},{"name":"add","icon":""},'+
          '{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyAccept);
    }
    else
    {
      help = onMoneyWithoutAddOptions;
      if(typeof m_session.cashin.amountcom !== "undefined" && m_session.cashin.amountcom > 0 &&
        m_session.cashin.amount <= m_session.cashin.amountcom)
        scr.setModalMessage('', help, 0, true,
          '{"options_settings":[{"name":"back","icon":""},'+
          '{"name":"deposit","icon":"","theme":"btn-green","enable":false}]}', onMoneyFullCall);
      else
        scr.setModalMessage('', help, 0, true,
          '{"options_settings":[{"name":"back","icon":""},'+
          '{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyFullCall);
    }
    window.external.exchange.RefreshScr();
  };

  var bimType = window.external.exchange.bimModuleManyNotes();
  var countOnScreen = 0;
  var onTellMEWrapper = function(args) {
    switch(args){
      case "money_wait": {
        if(step == "money_menu") {
          step = args;
          deleteElements();
          scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
          scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
          //scr.render("deposit_select_currency");
          window.external.exchange.RefreshScr();
        }
        return;
      }
      case "money_check": {
        deleteElements();
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        if(step == "money_return")
          scr.setWait(true, getLangText('cashin_closing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        else if(step == "money_insert_return"){
          //step = "money_insert";
          scr.setWait(true, getLangText('cashin_ready'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        }
        else
          scr.setWait(true, getLangText('cashin_counting'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        window.external.exchange.RefreshScr();
        return;
      }
      case "money_insert": {
        step = "money_insert";
        deleteElements();
        var notesCount1 = 0, notesCount = 0, notesCount2 = 0, notesDiff, notesDiff2, maxamount = 0;
        var amntStr = window.external.exchange.getMemory("dataFromNDC");
        try {
          m_session.cashin.amount = parseInt(amntStr, 10);
          if(isNaN(m_session.cashin.amount))
            m_session.cashin.amount = 0;
          if(!m_session.ownCard && typeof m_session.comminfo !== "undefined" && !isNaN(m_session.comminfo.maxdeposit) && m_session.comminfo.maxdeposit > 0)
            maxamount = m_session.comminfo.maxdeposit - m_session.cashin.amount;
          notesDiff = JSON.parse('['+window.external.exchange.getAllAcceptedNotes("643")+']');//quantity
          notesDiff2 = JSON.parse('['+window.external.exchange.getAllAcceptedNotes("810")+']');//quantity
        } catch(e) {
          if(!m_session.cashin) m_session.cashin = {};
          m_session.cashin.amount = 0;
          if(!m_session.ownCard && typeof m_session.comminfo !== "undefined" && !isNaN(m_session.comminfo.maxdeposit) && m_session.comminfo.maxdeposit > 0)
            maxamount = m_session.comminfo.maxdeposit - m_session.cashin.amount;
          notesDiff = [];
          notesDiff2 = [];
        }
        for(var i = 0; i < notesDiff.length; ++i)
          if(!!notesDiff[i].quantity)
            notesCount1 += notesDiff[i].quantity;
        for(var i = 0; i < notesDiff2.length; ++i)
          if(!!notesDiff2[i].quantity)
            notesCount2 += notesDiff2[i].quantity;
        notesCount = 200 - (notesCount2+notesCount1);

        var text1 = getLangText('cashin_deposit_money21'), text2 = getLangText('cashin_deposit_money22'),text3 = getLangText('cashin_deposit_money33');
        var textToShow = "";
        if(!m_session.ownCard && typeof m_session.comminfo !== "undefined" && !isNaN(m_session.comminfo.maxdeposit) && m_session.comminfo.maxdeposit > 0)
          textToShow = getLangText("cashin_maxamount_deposit_money11") + notesCount + droop(notesCount, text1, text2, text1, m_session.lang);
        else
          textToShow = getLangText('cashin_deposit_money11') + notesCount + droop(notesCount, text1, text2, text1, m_session.lang);
        countOnScreen = window.external.exchange.getInActiveTimeout();
        if(typeof countOnScreen == "string" || countOnScreen == 0)
          countOnScreen = 90;

        alertMsgLog(scr.name+" countOnScreen:"+countOnScreen);
        checkAndShowNUKKInfoIfNeeded();

        if(bimType != "0"){//пачечник
          scr.setLabel("modal_text2",textToShow, "");
          if(!m_session.ownCard && typeof m_session.comminfo !== "undefined" && !isNaN(m_session.comminfo.maxdeposit) && m_session.comminfo.maxdeposit > 0)
            scr.setModalMessage(getLangText("cashin_maxamount_deposit_money1")+AddSpace(maxamount)+getLangText("cashin_maxamount_deposit_money12"), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": '+countOnScreen+',"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);
          else
            scr.setModalMessage(getLangText("cashin_deposit_money1"), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": '+countOnScreen+',"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);
          scr.render("deposit_select_currency");
        }
        else if(isNaN(m_session.cashin.amount) || m_session.cashin.amount == 0){//покупюрник, начальное внесение
          //scr.setLabel("modal_text2", getLangText('cashin_deposit_money3'), "");
          scr.setModalMessage(getLangText('cashin_deposit_money12'), onMoneyCallOptions, -1, true, '{"icon": "","rotate":true,"loader":"countdown","count": '+countOnScreen+',"options_settings":[{"name":"logout","icon":"","theme":"btn-white-red"}]}', onMoneyCall);

          //----------------------Discovery
          var res = getDisBynotes();
          if (!!res){
            scr.setLabel("infoCupure", res, "");
            scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
          }
          else {
            scr.setLabel("infoCupure", getLangText('cashin_deposit_money13'), "");
            scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
          }
          //-------------------------------

          scr.render("deposit_select_currency");
        }
        else{//покупюрник, очередное внесение
          scr.setLabel("popup_text", getLangText('cashin_deposit_title1'), "");
          scr.setLabel("popup_sum", m_session.cashin.amount+' ₽', "");
          scr.setLabel("popup_title_sum", getLangText('cashin_deposit_title2')+m_session.cashin.amount+' ₽', "");
          scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+'0 ₽', "");
          if (notesCount1 > 0)
            scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+'],"display_group": "bynotes"}');
          else
            scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), '{"values":['+window.external.exchange.getAllAcceptedNotes("810")+'],"display_group": "bynotes"}');
          var help = [getLangText('cashin_accept')];
          scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyCall);

          //----------------------Discovery
          var tmpCount = window.external.wbCassetes.GetValueFromRegistry("WOSA/XFS_ROOT\\ATM\\BIM", "ACCEPT.MaxCount");
          notesCount = tmpCount - (notesCount2+notesCount1);
          var res = getDisBynotes();
          if (notesCount1+notesCount2 >= tmpCount/2){
            var textShow2 = getLangText('cashin_deposit_money14') + notesCount + droop(notesCount, text1, text3, text2, m_session.lang);
            scr.setLabel("small_warning_lab", textShow2, "");
            scr.setImage("small_warning","../../graphics/icon_warning.svg","");
            scr.setLabel("infoCupure2", "", "");
            scr.setLabel("infoCupure", "", "");
          }
          else if (!!res){
            scr.setLabel("infoCupure", res, "");
            scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
          }
          else{
            scr.setLabel("infoCupure", getLangText('cashin_deposit_money13'), "");
            scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
          }
          //-------------------------------

          //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
          //window.external.exchange.RefreshScr();
          scr.render("deposit_select_currency");
        }
        return;
      }
      case "money_menu": {
        step = "money_menu";
        var amntStr = window.external.exchange.getMemory("dataFromNDC");
        try {
          m_session.cashin.amount = parseInt(amntStr, 10);
          if(isNaN(m_session.cashin.amount))
            m_session.cashin.amount = 0;
        }
        catch(e) {
          if(!m_session.cashin) m_session.cashin = {};
          m_session.cashin.amount = 0;
        }
        deleteElements();
        setAmountInfoLabels();
        var fdkButts = window.external.exchange.GetModuleVariable("wex", "FDKMask");
        scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+'],"display_group": "bynotes"}');
        var help;
        if(checkBit(fdkButts, 2) &&
          (m_session.ownCard || typeof m_session.comminfo === "undefined" ||
            isNaN(m_session.comminfo.maxdeposit) || m_session.comminfo.maxdeposit === 0.0 ||
            m_session.comminfo.maxdeposit > m_session.cashin.amount))
        {
          help = onMoneyAcceptOptions;
          if(typeof m_session.cashin.amountcom !== "undefined" && m_session.cashin.amountcom > 0 &&
            m_session.cashin.amount <= m_session.cashin.amountcom)
            scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"add","icon":""},{"name":"deposit","icon":"","theme":"btn-green","enable":false}]}', onMoneyAccept);
          else
            scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"add","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyAccept);
        }
        else
        {
          help = onMoneyWithoutAddOptions;
          if(typeof m_session.cashin.amountcom !== "undefined" && m_session.cashin.amountcom > 0 && m_session.cashin.amount <= m_session.cashin.amountcom)
            scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"deposit","icon":"","theme":"btn-green","enable":false}]}', onMoneyFullCall);
          else
            scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyFullCall);
        }
        if(bimType == "0"){
          var notesCount1 = 0, notesCount2 = 0, notesDiff, notesDiff2;
          try {
            notesDiff = JSON.parse('['+window.external.exchange.getAllAcceptedNotes("643")+']');//quantity
            notesDiff2 = JSON.parse('['+window.external.exchange.getAllAcceptedNotes("810")+']');//quantity
          } catch(e) {
            notesDiff = [];
            notesDiff2 = [];
          }
          for(var i = 0; i < notesDiff.length; ++i)
            if(!!notesDiff[i].quantity)
              notesCount1 += notesDiff[i].quantity;
          for(var i = 0; i < notesDiff2.length; ++i)
            if(!!notesDiff2[i].quantity)
              notesCount2 += notesDiff2[i].quantity;
          scr.setLabel("popup_text", getLangText('cashin_deposit_title1'), "");
          scr.setLabel("popup_sum", m_session.cashin.amount+' ₽', "");
          scr.setLabel("popup_title_sum", getLangText('cashin_deposit_title2')+m_session.cashin.amount+' ₽', "");
          scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+'0 ₽', "");
          if (notesCount1 > 0)
            scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'),
              '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+'],"display_group": "bynotes"}');
          else
            scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'),
              '{"values":['+window.external.exchange.getAllAcceptedNotes("810")+'],"display_group": "bynotes"}');
          help = [getLangText('cashin_accept')];
          scr.setModalMessage('', help, 0, true,
            '{"options_settings":[{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyCall);

          //----------------------Discovery
          if(!m_ATMFunctions.printer) {
            scr.setLabelJson({name: "small_warning_lab", value: getLangText("zsf_no_receipt")});
            scr.setImage("small_warning", "../../graphics/icon_warning.svg", "");
          }
          else {
            scr.setLabel("small_warning_lab", " ", "");
            scr.setImage("small_warning","","");
            var res = getDisBynotes();
            if (!!res){
              scr.setLabel("infoCupure", res, "");
              scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
            }
            else{
              scr.setLabel("infoCupure", getLangText('cashin_deposit_money13'), "");
              scr.setLabel("infoCupure2", getLangText('cupure_info_back'), "");
            }
          }
        }
        //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        //window.external.exchange.RefreshScr();
        if(m_session.fitObj && m_session.fitObj.fitType === "other")
          scr.render("deposit_select_currency_oferta");
        else
          scr.render("deposit_select_currency");
        return;
      }
      case "money_return": {
        //countOnScreen = window.external.exchange.getTimer(78);
        countOnScreen = window.external.exchange.getInActiveTimeout();
        if(isNaN(countOnScreen) || typeof countOnScreen == "string" || countOnScreen == 0)
          countOnScreen = 55;
        else if(countOnScreen > 5000)
          countOnScreen = countOnScreen/1000 - 5;
        else
          countOnScreen = 5;

        if(step == "money_insert")
          step = "money_insert_return";
        deleteElements();
        scr.setLabel("wait_text2", getLangText('cashin_take_notaccepted3'), "");
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setWait(true, getLangText('cashin_take_notaccepted1'), '{"icon": "","rotate":true,"loader":"countdown","count":'+countOnScreen+'}');
        window.external.exchange.RefreshScr();
        //scr.render("deposit_select_currency");
        return;
      }
      case "money_error": {
        scr.nextScreen(requestResult, [args]);
        return;
      }
      case "money_full_back": {
        countOnScreen = window.external.exchange.getTimer(78);
        if(isNaN(countOnScreen) || typeof countOnScreen == "string" || countOnScreen == 0)
          countOnScreen = 55;
        else if(countOnScreen > 5000)
          countOnScreen = countOnScreen/1000 - 5;
        else
          countOnScreen = 5;
        var amntStr = window.external.exchange.getMemory("dataFromNDC");
        try {
          m_session.cashin.amount = parseInt(amntStr, 10);
          if(isNaN(m_session.cashin.amount))
            m_session.cashin.amount = 0;
        } catch(e) {
          if(!m_session.cashin) m_session.cashin = {};
          m_session.cashin.amount = 0;
        }
        deleteElements();
        scr.setLabel("wait_text2", getLangText('cashin_full_text1'), "");
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setWait(true, getLangText('cashin_take_notaccepted4'), '{"icon": "","rotate":true,"loader":"countdown","count":'+countOnScreen+'}');
        window.external.exchange.RefreshScr();
        //scr.render("deposit_select_currency");
        return;
      }
      case "money_full": {
        step = "money_full";
        deleteElements();
        var amntStr = window.external.exchange.getMemory("dataFromNDC");
        try {
          m_session.cashin.amount = parseInt(amntStr, 10);
          if(isNaN(m_session.cashin.amount))
            m_session.cashin.amount = 0;
        } catch(e) {
          if(!m_session.cashin) m_session.cashin = {};
          m_session.cashin.amount = 0;
        }
        deleteElements();
        setAmountInfoLabels();
        //scr.setLabel("popup_text", getLangText('cashin_deposit_title1'), "");
        //scr.setLabel("popup_sum", m_session.cashin.amount+' ₽', "");
        //scr.setLabel("popup_title_sum", getLangText('cashin_deposit_title2')+m_session.cashin.amount+' ₽', "");
        //scr.setLabel("popup_comission", getLangText('cashin_deposit_title3')+'0 ₽', "");

        scr.setLabel("bynotes", getLangText('cashin_deposit_banknotes'), '{"values":['+window.external.exchange.getAllAcceptedNotes("643")+'],"display_group": "bynotes"}');
        var help = onMoneyWithoutAddOptions;
        scr.setModalMessage('', help, 0, true, '{"options_settings":[{"name":"back","icon":""},{"name":"deposit","icon":"","theme":"btn-green"}]}', onMoneyFullCall);
        //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
        //window.external.exchange.RefreshScr();
        scr.render("deposit_select_currency");
        return;
      }
      case "money_ok": {
        if(m_session.serviceName == "ekassir_cashin")
          callSupport("ekassir_cashin_ok");
        else {
          if(m_session.fitObj.fitType === "other" && (typeof (m_session.cashin.oferta) !== "undefined"))
            callSupport("deposit_req&BufferC="+m_session.cashin.oferta);
          else
            callSupport("deposit_req");
        }
        return;
      }
      case "money_cancel": {
        if(m_session.ownCard || typeof m_session.comminfo === "undefined" || isNaN(m_session.comminfo.maxdeposit) || m_session.comminfo.maxdeposit == 0 || m_session.comminfo.maxdeposit >= m_session.cashin.amount) {
          if(m_session.serviceName == "ekassir_cashin")
            scr.nextScreen(serviceSelectCash);
          else
            scr.nextScreen(serviceSelect);
        } else {
          //setElementsOnModal(text1, text2, icon1,countdown1, btnsArray, onModalObj)
          setElementsOnModal(getLangText("maxamount_info1") + AddSpace(m_session.comminfo.maxdeposit, true) + " ₽", getLangText("maxamount_info2"), "../../graphics/icon-smile-2.svg",null, [getLangText("button_menu_return"), getLangText("maxamount_btn")], onModalTooMuchMoney);
          scr.render("deposit_select_currency");
        }
        return;
      }
      case "wait_request": {
        checkSecondPINEnterFlag();
        deleteElements();
        scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
        scr.setWait(true, getLangText('cashin_processing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
        window.external.exchange.RefreshScr();
        return;
      }
      case "card_return": {
        scr.nextScreen(msgResult,["","card_return"]);
        return;
      }
      case "wait_end_session":
      case "end_session": {
        scr.nextScreen(msgResult,['session_ended', "end"]);
        return;
      }
      case "menu_main": {
        scr.nextScreen(serviceSelect);
        return;
      }
      case "ask_more_time": {
        deleteElements();
        scr.setModalMessageJson(m_session.jsonObj.modalMessageCashinAskMoreTime.elementObject, onMoreTimeCallCashin);
        scr.render("deposit_select_currency");
        return;
      }
      case "request_ok": {
        scr.nextScreen(cashin, "request_ok");
        return;
      }
      case "deposit_without_nukk": {
        callSupport('cashin_open');
        return;
      }
      case "deposit_nukk_err":
      case "deposit_nukk_destination_select": {
        try{
          var helpInfo = window.external.exchange.getMemory("comminfo");
          m_session.comminfo = JSON.parse(helpInfo);
        } catch(ex) {
          alertMsgLog(' cashin, Exception: '+ex.message);
          m_session.comminfo = {};
        }
        if(!!m_session.comminfo.nukk)
          scr.nextScreen(nukk_destination_select, "select");
        else {
          m_session.comminfo.nukk = false;
          scr.nextScreen(serviceSelect);
        }
        return;
      }
      case 'wait': return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        scr.nextScreen(requestResult,[args]);
        break;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);


  var onMoreTimeButtons = [getLangText(m_session.isCard ? 'button_logout_card' : 'button_logout_cash'), getLangText('button_continue')];
  var onMoneyAcceptOptions = [getLangText('cashin_return'),getLangText('cashin_add'),getLangText('cashin_accept')];
  var onMoneyWithoutAddOptions = [getLangText('cashin_return'),getLangText('cashin_accept')];
  var onMoneyCallOptions = [getLangText('cashin_cancel_operation')];
  var ofertaModal;
  {//кнопки на верхней части подложки
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);

    if(m_session.isCard)
      scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onButtonEmpty);
    else
      scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onButtonEmpty);
    scr.setButton("roubles", getLangText("curr_rub_text"), true, false, '{"icon": ""}', onButtonEmpty);
    scr.setButton("dollars", getLangText("curr_doll_text"),true,false, '{"icon": ""}',"", onButtonEmpty);
    scr.setButton("euro", getLangText("curr_euro_text"), true,false,'{"icon": ""}',"",onButtonEmpty);
  }
  if(typeof step === 'undefined'){
    return;
  }
  else if(step === "ekassir_cashin"){
    //m_session.balance = NaN;
    m_session.fitObj = {formfactor: "cash"};
    m_CardIcon = getPaySystem(m_session.fitObj);
    m_session.ownCard = isOpenCard(m_session.fitObj);
    m_session.setNecessaryParameters(m_CardIcon);
    m_session.serviceName = "ekassir_cashin";
    scr.setWait(true, getLangText('cashin_ready'), '{"icon": "", "loader":"loader"}');
    scr.render("deposit_select_currency");
    callSupport('cashin_open');
  }
  else if(step === "request_ok") {
    m_session.balance = NaN;
    var amntStr = window.external.exchange.getMemory("dataFromNDC");
    try {
      m_session.cashin.amount = parseInt(amntStr, 10);
      if(isNaN(m_session.cashin.amount))
        m_session.cashin.amount = 0;
    } catch(e) {
      m_session.cashin.amount = 0;
    }
    if(isNaN(m_session.cashin.amount)) m_session.cashin.amount = 0;
    deleteElements();
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setWait(false, '', '');
    scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
    scr.setButtonJson(m_session.jsonObj.buttonMessageCancel.elementObject, onButtonCancel);
    if(!!m_session.cashin.toCard)
      scr.setLabel("warning", getLangText('cashin_success') + ' ' + AddSpace(m_session.cashin.toCard, true) + ' ₽', "");
    else
      scr.setLabel("warning", getLangText('cashin_success') + ' ' + AddSpace(m_session.cashin.amount, true) + ' ₽', "");
    scr.setImage("smile","../../graphics/icon-smile-1.svg","");

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);

    scr.render("wait_message_buttons");
  }
  else if(step === "closing"){
    scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
    scr.setWait(true, getLangText('cashin_closing'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
    scr.render("deposit_select_currency");
  }
  else if(step === "opening"){
    scr.setWait(true, getLangText('cashin_ready'), '{"icon": "", "loader":"loader"}');
    scr.render("deposit_select_currency");
    callSupport('cashin_open');
  }

  else if(step === "opening_nukk"){
    scr.setWait(true, getLangText('cashin_ready'), '{"icon": "", "loader":"loader"}');
    scr.render("deposit_select_currency");
    if(!!m_session.cashin && !!m_session.cashin.bufferb)
      callSupport('cashin_open&bufferb='+m_session.cashin.bufferb);
    else
    {
      alertMsgLog(' '+scr.name+', step: '+ step + ', m_session.cashin.bufferb undefined');
      onCancelGlobal();
    }
  }
  else if(step === "silent_wait"){
    callSupport('cashin_open');
  }
};


nukk_destination_select = function(step) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var corpCardsInfo = getCorpCardsInfo();
  var onMenuReturn = function(name){//Вернуться в меню
    scr.nextScreen(serviceSelect);
  };
  var onBtn = function(args){
    var pKey;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0)
      pKey = args[0];
    else
      pKey = args;
    {
      alertMsgLog(' '+scr.name+', args: '+ args);
      for(var i = 0; i < corpCardsInfo.length; ++i)
        if(corpCardsInfo[i].name === pKey) {
          if(!m_session.cashin) m_session.cashin = {};
          m_session.cashin.bufferb = corpCardsInfo[i].toBufferB;
          m_session.cashin.modal_info = '<span style="color:#00BBE4;">' + corpCardsInfo[i].ext.head + '</span> ' + corpCardsInfo[i].text
        }
      scr.nextScreen(nukk_destination_select, "checkNfc");
    }
  };
  {//кнопки на верхней части подложки
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);

    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
  }
  var onTellMEWrapper = function(args)
  {
    switch(args){
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        break;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);


  if(step === "select") {
    scr.setLabelJson({name: "title", value: getLangText('nukk_title')});
    scr.setButtonJson({
      name: "backBtn",
      text: getLangText("button_menu_return"),
      enable: true,
      visible: true,
      ext: {"icon": ""}
    }, onMenuReturn);
    for (var i = 0; i < corpCardsInfo.length; ++i)
      scr.setButtonJson(corpCardsInfo[i], onBtn);
    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    scr.render("nukk_select");
  }
  else if(step === "checkNfc"){
    m_session.serviceName = "cashin_nukk";
    if(!m_session.cashin) m_session.cashin = {};
    m_session.cashin.amount = 0;
    if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken") && m_session.second) {
      scr.setWait(true, getLangText('wait_before_next_step'), '{"icon": "", "rotate": true, "loader":"loader"}');
      scr.setTimeout("0", "", onButtonEmpty);
      scr.render("nukk_select");
      checkAndGoToPinOrNcf();
    }
    else {
      checkSecondPINEnterFlag();
      scr.nextScreen(cashin, "opening_nukk");
    }
    return;
  }
};


historyCheque = function(step) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  var onContinue = function(name) {
    alertMsgLog(' '+scr.name+', ' + name + ', Продолжаем на serviceSelect.');
    scr.nextScreen(serviceSelect);
  }
  var onCancel = function(name){
    alertMsgLog(' '+scr.name+'. Cancel ' + name);
    serviceName = 'cancel';
    window.external.exchange.ExecNdcService("cancelspec", "");
    //scr.cancel();
  }

  if(step == 1){
    window.external.exchange.ExecNdcService("history", "");
  }
  else if(step == 2){
    alertMsgLog('wait запрос на сервер');
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    //scr.setImage("card","../../graphics/card.svg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    scr.setImage("error","../../graphics/mes-error.svg","");
    scr.setImage("offer","../../graphics/offer-icon.png","");
    scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "", "rotate": true, "loader":"loader"}');
    scr.render("cashout_amount");

  }
  else if(step == 3){
    //alertMsgLog('wait возврат карты');
    //scr.setLabel("note1", getLangText('card_take'), "");
    //scr.render("test");
    scr.setWait(true, getLangText('card_take'), '{"icon": "../../graphics/icon-pick-card.svg", "loader":"countdown", "count":60, "rotate": true}');
    //scr.render('cashout_amount');
    window.external.exchange.refreshScr();
  }
  else if(step == 4){
    scr.setWait(true, getLangText('wait_please_wait'), '{"icon": "../../graphics/icon-ok.svg", "loader":"ellipse","theme":"blue"}');
    window.external.exchange.refreshScr();
  }
  else if(step == 5){
    alertMsgLog('wait ошибка запроса');

    scr.setWait(true, getLangText('wait_impos_complete'), "{\"icon\": \"../../graphics/icon-smile-2.svg\", \"theme\":\"blue\"}");
    window.external.exchange.refreshScr();
  }
  else if(step == 6){
    scr.nextScreen(serviceSelect);
  }
};
specCancelWait = function(step) {
  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);

  if(step == 1){
    alertMsgLog('wait экран ожидания');
    scr.setLabel("title", getLangText('wait_please_wait'), "");
    scr.render("test");
  }
  else if(step == 2){
    alertMsgLog('wait возврат карты');
    scr.setLabel("note1", getLangText('card_take'), "");
    scr.render("test");
  }
  else if(step == 3){
    scr.setLabel("text", getLangText('wait_please_wait'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.render("wait_message");

  }
  else {
    scr.setLabel("text", getLangText('unknown_error'), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    scr.render("wait_message");
    scr.cancel();
  }
};
giveMoney = function(args){

  var onError =  function () {
    scr.nextScreen(msg_err);
  }
  scr.addOnError(onError);
  var onContinueCall = function(args) {
    var _name, _args;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      _name = args[0];
      if(args.length > 1)
        _args = args[1];
      else
        _args = "";
    }
    else {
      _name = "";
      _args = args;
    }
    alertMsgLog(scr.name+' onContinueCall, value: '+_args);

    //if(_args == getLangText("button_menu_return"))
    if(_args == 0)
    {
      window.external.exchange.ExecNdcService("continue", "");
    }
    else{
      scr.setModalMessage("", "", -1, false, "", onButtonEmpty);
      callSupport("cancel");
    }
  }
  var onButtonEmpty = function(name){
    alertMsgLog(' '+scr.name+', onButtonEmpty '+name+'.');
  }
  var onTimeout = function(args){
    alertMsgLog(scr.name+' onTimeout');
    window.external.exchange.refreshScr();
  }
  var onTellMEWrapper = function(args) {
    var onTimeoutCardReturn = function(){
      window.external.exchange.scrData.flush();
      if(!!m_session.cashout)
        m_session.cashout.result = 0;//"bad"
      else
        m_session.cashout = {result:0};
      m_session.serviceName = 'card_seized';
      scr.setLabel("text", getLangText('card_seized3'), "");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.setTimeout(0, "", null);
      scr.render("wait_message");
      return;
    };
    var onTimeoutMoneyTake = function(){
      if(!!m_session.cashout)
        m_session.cashout.result = 0;//"bad"
      else
        m_session.cashout = {result:0};
      scr.setLabel("text", getLangText('money_to_lose'), "");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.setTimeout(0, "", null);
      scr.render("wait_message");
      return;
    };
    switch(args) {
      case 'after_reinit_chip':{
        var carrReq = m_Currency.getSelectedCode();
        if(m_CheckFlag) {
          if(carrReq == 643 || carrReq == 810)//rub
            callSupport("cashoutrublprint_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else if(carrReq == 840)//doll
            callSupport("cashoutdollprint_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else if(carrReq == 978)//euro
            callSupport("cashouteuroprint_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else
            scr.nextScreen(requestResult, ['request_error']);
        } else {
          if(carrReq == 643 || carrReq == 810)//rub
            callSupport("cashoutrubl_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else if(carrReq == 840)//doll
            callSupport("cashoutdoll_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else if(carrReq == 978)//euro
            callSupport("cashouteuro_req&amount="+amount+'&bynotes='+m_session.bynotes);
          else
            scr.nextScreen(requestResult, ['request_error']);
        }
        break;
      }
      case 'card_return_cashout': {
        if(!!m_session.cashout)
          m_session.cashout.result = 1;//"good"
        else
          m_session.cashout = {result:1};
        scr.setLabel('wait_text2', "", "");
        scr.setLabelJson({name:"wait_text4", value:""});
        scr.setLabelJson({name:"wait_text5", value:""});
        scr.setWait(true, getLangText('cash_success'), '{"icon": "../../graphics/icon-pick-card.svg", "rotate":true,"loader":"countdown","count":30}');
        scr.setTimeout("30000", "", onTimeoutCardReturn);
        scr.render("cashout_amount");
        return;
      }
      case 'money_take': {
        if(!!m_session.cashout)
          m_session.cashout.result = 1;//"good"
        else
          m_session.cashout = {result:1};
        window.external.exchange.scrData.flush();
        scr.setLabel("text", getLangText('cash_withdrawal_take'), "");
        scr.setLabel("loader","60", '{"loader":"countdown"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setTimeout("60000", "", onTimeoutMoneyTake);
        scr.render("wait_message");
        m_session.balance = NaN;
        return;
      }
      case 'wait_end_session':
      case 'end_session': {
        alertMsgLog('[Print]: '+m_CheckFlag);
        if(!m_session.cashout || !!m_session.cashout && m_session.cashout.result == 1)
        {
          saveToHistory(amount, m_Currency.getSelectedCode(), m_CheckFlag);
          scr.nextScreen(msgResult,[(!!m_session.fitObj && m_session.fitObj.formfactor == 'card') ? 'session_ended' : 'nfc_session_ended', "end_good"]);
        }
        else
          scr.nextScreen(msgResult,[(!!m_session.fitObj && m_session.fitObj.formfactor == 'card') ? 'session_ended' : 'nfc_session_ended', "end"]);
        return;
      }
      case 'wait':
      case 'wait_request': return;
      case 'ask_132_thx':
        scr.nextScreen(requestResult,['end_133_req_impossible']);
        return;
      default: {
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
      }
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);


  var onContinueOptions = [_words_[getLangText("button_continue")], _words_[getLangText(m_session.isCard ? "button_logout_card" : "button_logout_cash")]];
  var amount = 0, step = 0;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
    m_session.cashout = {amount: args[0]};
    amount = args[0];
    if(args.length > 1)
      step = args[1];
  }
  else {
    m_session.cashout = {amount: args};
    amount = args;
  }
  scr.setButton("showremains", getLangText("showremains"), '{"icon": "../../graphics/print-balance-pressed.svg"}', onButtonEmpty);
  scr.setButton("print", "", true, false, '{"icon": ""}', onButtonEmpty);
  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-white-small.svg"}', onButtonEmpty);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout.svg"}', onButtonEmpty);
  scr.setInput("sum", amount.toString(), "", "0", true, true, '{"maxsum": 100000, "maxlength": 9, "empty": "0","display_group": "sum_place"}', "amount", onButtonEmpty, "None");
  scr.setInput("checkbox_print", "true", "", "", true, true, "", "checkbox", onButtonEmpty, "", m_CheckFlag);

  scr.setLabel("currencyLabel", getLangText('cash_withdrawal_curr'), '');
  scr.setList("currency", m_Currency.getNamesArr(m_session.lang), m_Currency.selected, m_Currency.getJSON(), onButtonEmpty);


  scr.setButton("receipt", getLangText("receipt"), '{"icon": "../../graphics/icon_check.png"}', onButtonEmpty);

  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  scr.setImage("error","../../graphics/mes-error.svg","");
  scr.setImage("offer","../../graphics/offer-icon.png","");
  scr.setLabel("title_sum", getLangText('cash_withdrawal_amnt'), "");
  scr.setLabel("print_receipt", getLangText('print_after_receipt'), '{"display_group": "print_receipt"}');
  scr.setKeyboard({ type:"digit", numbers: [0,1,2,3,4,5,6,7,8,9], leftBtn:{text:getLangText('fastcash_change'),type:"bynotes", disabled:true}, rightBtn:{text:getLangText('button_delete'), type:"delete"}, visible:true});

  scr.setButton("take", getLangText("button_withdrawal"), '{"icon": ""}', onButtonEmpty);
  scr.setWaitJson({enable: true, text: getLangText("label_cashout_wait"),  ext:{'icon': '', 'rotate': true, 'loader':'loader'}});
  if(!!m_session.fitObj && m_session.fitObj.fitType === "own" && m_session.lang === "ru")
  {
    scr.setLabelJson({name:"wait_text4", value:getLangText('label_cashout_wait_text4')});
    scr.setLabelJson({name:"wait_text5", value:getLangText('label_cashout_wait_text5')});
  }
  if(step == 1)
    scr.render("cashout_amount");
  else
    scr.setWait(false, "", '{"icon": ""}');
  checkSecondPINEnterFlag();
  callSupport("reinit_chip");
  return;
  //var help = {};
  //help['amount'] = amount;
  //if(m_CheckFlag)
  //	callSupport("cashoutprint_req&amount="+amount);
  //else
  //	callSupport("cashout_req&amount="+amount);
  //if(step == 100)
  //{
  //	help['amount'] = 100;
  //	help['byNotes'] = '00010000000000000000000000000000000';
  //	window.external.exchange.ExecNdcService("bynotes", JSON.stringify(help));
  //}
  //else
  //{
  //	if(m_CheckFlag)
  //		window.external.exchange.ExecNdcService("cashoutprint", JSON.stringify(help));
  //	else
  //		window.external.exchange.ExecNdcService("cashout", JSON.stringify(help));
  //}
};

incass = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);
  var onMenuCashout = function(name){
    alertMsgLog(' '+scr.name+', onMenuCashout '+name+'.');
    callSupport("incass_cashout");
    scr.nextScreen(incass, "wait");
  };
  var onMenuCashin = function(name){
    alertMsgLog(' '+scr.name+', onMenuCashin '+name+'.');
    callSupport("incass_cashin");
    scr.nextScreen(incass, "wait");
  };
  var onMenuBalance = function(name){
    alertMsgLog(' '+scr.name+', onMenuBalance '+name+'.');
    scr.nextScreen(incass, "balance");
  };
  var onMenuOther = function(name){
    alertMsgLog(' '+scr.name+', onMenuOther '+name+'.');
    scr.nextScreen(incass, "other");
  };
  var onMenuOtherNew = function(name){
    alertMsgLog(' '+scr.name+', onMenuOtherNew '+name+'.');
    callSupport("incass_cassettes_balance");
    scr.nextScreen(incass, "wait");
  };
  var onCassettesBalance = function(name){
    alertMsgLog(' '+scr.name+', onCassettesBalance '+name+'.');
    scr.nextScreen(incass, "other");
  };
  var onBalanceCashout = function(name){
    alertMsgLog(' '+scr.name+', onBalanceCashout '+name+'.');
    callSupport("incass_balance_cashout");
    scr.nextScreen(incass, "wait");
  };
  var onBalanceCashin = function(name){
    alertMsgLog(' '+scr.name+', onBalanceCashin '+name+'.');
    callSupport("incass_balance_cashin");
    scr.nextScreen(incass, "wait");
  };
  var onInputCashin12 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin12 '+name+'.');
    scr.nextScreen(incass, "cash1");
  };
  var onInputCashin34 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin34 '+name+'.');
    scr.nextScreen(incass, "cash3");
  };
  var onInput = function(args){
    alertMsgLog(' '+scr.name+' onInput args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help != 'number' || isNaN(help))
        help = 0;
    }
    else
      help = 0;
    alertMsgLog('onInput count: ' + help);
    countBuff = help;
  };
  var onInputCashin1 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin1 '+name+'.');
    m_session.incass = {};
    m_session.incass["BufferB"] = countBuff;
    scr.nextScreen(incass, "cash2");
  };
  var onInputCashin2 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin2 '+name+'.');
    m_session.incass["BufferC"] = countBuff;
    alertMsgLog(' json: '+JSON.stringify(m_session.incass));
    callSupport("incass_input12&BufferB="+m_session.incass["BufferB"] + "&BufferC="+m_session.incass["BufferC"])
    scr.nextScreen(incass, "wait");
  };
  var onInputCashin3 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin3 '+name+'.');
    m_session.incass = {};
    m_session.incass["BufferB"] = countBuff;
    scr.nextScreen(incass, "cash4");
  };
  var onInputCashin4 = function(name){
    alertMsgLog(' '+scr.name+', onInputCashin4 '+name+'.');
    m_session.incass["BufferC"] = countBuff;
    alertMsgLog(' json: '+JSON.stringify(m_session.incass));
    callSupport("incass_input34&BufferB="+m_session.incass["BufferB"] + "&BufferC="+m_session.incass["BufferC"])
    scr.nextScreen(incass, "wait");
  };
  var onCancel = function(name) {
    alertMsgLog(' '+scr.name+', onCancel '+name+'.');
    onCancelGlobal();
  };
  var onMenuIncass = function(name) {
    alertMsgLog(' '+scr.name+', onMenuIncass '+name+'.');
    scr.nextScreen(incass,"menu");
  };
  var onButtonToPin = function(name){
    alertMsgLog(scr.name+' onButtonToPin '+name);
    m_session.serviceName = '';
    callSupport("go_to_pin");
  };
  var onInput1 = function(args){
    alertMsgLog(' '+scr.name+' onInput1 args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help != 'number' || isNaN(help))
        help = 0;
    }
    else
      help = 0;
    alertMsgLog('onInput1 count: ' + help);
    m_session.incassCassettesValue.cass1 = help;
  };
  var onInput2 = function(args){
    alertMsgLog(' '+scr.name+' onInput2 args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help != 'number' || isNaN(help))
        help = 0;
    }
    else
      help = 0;
    alertMsgLog('onInput2 count: ' + help);
    m_session.incassCassettesValue.cass2 = help;
  };
  var onInput3 = function(args){
    alertMsgLog(' '+scr.name+' onInput3 args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help != 'number' || isNaN(help))
        help = 0;
    }
    else
      help = 0;
    alertMsgLog('onInput3 count: ' + help);
    m_session.incassCassettesValue.cass3 = help;
  };
  var onInput4 = function(args){
    alertMsgLog(' '+scr.name+' onInput4 args '+args);
    var pKey = "", help;
    if(typeof args != 'undefined' && args.constructor === Array && args.length > 0) {
      if(typeof args[1] == 'undefined')
        help = parseFloat(args);
      else {
        pKey = args[0];
        help = parseFloat(args[1]);
      }
      if(typeof help != 'number' || isNaN(help))
        help = 0;
    }
    else
      help = 0;
    alertMsgLog('onInput4 count: ' + help);
    m_session.incassCassettesValue.cass4 = help;
  };
  var onCassettesInputContinue = function(name) {
    alertMsgLog(' '+scr.name+', onCassettesInputContinue '+name+'.');
    scr.nextScreen(incass, "other_confirm");
  };
  var onCassettesInputRequest = function(name) {
    alertMsgLog(' '+scr.name+', onCassettesInputRequest '+name+'.');
    callSupport("incass_cassettes_balance_set&BufferB="
      +to4char(m_session.incassCassettesValue.cass1)+";"+to4char(m_session.incassCassettesValue.cass2)+";"
      +to4char(m_session.incassCassettesValue.cass3)+";"+to4char(m_session.incassCassettesValue.cass4));
    scr.nextScreen(incass, "wait");
  };

  var onTellMEWrapper = function(args) {
    alertMsgLog(scr.name+', type: '+type+', onTellMEWrapper args: '+args);
    switch(args) {
      case 'wait_request':
      case 'wait':
        return;
      case 'ask_132_thx':
        scr.nextScreen(incass, "ok");
        return;
      case 'wait_pin_error':
        scr.nextScreen(incass, "wait_pin_error");
        return;
      case 'incass_cassetes':
        //scr.nextScreen(incass, "other");
        scr.nextScreen(incass, "other");
        return;
      case 'cashin_cassettes_balance_ok':
        if(!m_session) m_session = {};
        try {
          var help = window.external.exchange.getMemory("incassCassettesInfo");
          alertMsgLog("[incass] incassCassettesInfo: " + help);
          m_session.incassCassettesInfo = JSON.parse(help);
        } catch(e){
          m_session.incassCassettesInfo = [
            {type:"0", nominal:0, currency:0, count:0},
            {type:"1", nominal:0, currency:0, count:0},
            {type:"2", nominal:0, currency:0, count:0},
            {type:"3", nominal:0, currency:0, count:0}];
        }
        scr.nextScreen(incass, "cassettes_balance_compare");
        break;
      case "wait_cheque":
        if(type === "ok"){
          scr.setLabel("text", getLangText("Пожалуйста, сначала заберите карту,") +"<br />"+getLangText("а потом не забудьте чек"), "");
          scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
          scr.setImage("bg","../../graphics/BG_blur.jpg","");
          scr.render("wait_message");
          return;
        }
      case "card_return":
        if(type === "ok"){
          scr.setLabel("text", getLangText("Пожалуйста, заберите карту") +"<br />"+getLangText("и не забудьте чек"), "");
          scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
          scr.setImage("bg","../../graphics/BG_blur.jpg","");
          scr.render("wait_message");
          return;
        }
      default:
        scr.nextScreen(incass,"error_unknown");
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var countBuff;
  if(typeof m_session.incassCassettesValue === "undefined") m_session.incassCassettesValue = {cass1:0, cass2:0, cass3:0, cass4:0};
  if(type === "menu"){
    scr.setLabel("title", "Выберите тип операции", "");
    scr.setButton("fdk_a", "Инкассация Cash Out", "", onMenuCashout);
    scr.setButton("fdk_b", "Инкассация Cash In", "", onMenuCashin);
    scr.setButton("fdk_c", "Баланс", "", onMenuBalance);
    scr.setButton("fdk_d", "Загрузка кассет", "", onMenuOtherNew);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_menu");
  }
  else if(type === "balance"){
    scr.setLabel("title", "Выберите тип операции", '');
    scr.setButton("fdk_a", "Баланс Cash Out", '', onBalanceCashout);
    scr.setButton("fdk_b", "Баланс Cash In", '', onBalanceCashin);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_balance");
  }
  else if(type === "cassettes_balance_compare"){
    scr.setLabel("title", "Выберите тип операции", '');
    scr.setButton("fdk_f", "Отмена", '', onCancel);
    scr.setButton("fdk_d", "Продолжить", '', onCassettesBalance);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_cassettes_balance_compare");
  }
  else if(type === "other"){
    scr.setLabel("title", "Выберите тип операции", '');
    scr.setButton("fdk_a", "Вверх", '', onButtonEmpty);
    scr.setButton("fdk_b", "Вниз", '', onButtonEmpty);
    scr.setButton("fdk_c", "Стереть", '', onButtonEmpty);
    scr.setButton("fdk_d", "Далее", '', onCassettesInputContinue);
    scr.setButton("fdk_f", "Назад", '', onMenuIncass);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);

    scr.setInput("cass1", "", "", "", true, true, '', "text", onInput1);
    scr.setInput("cass2", "", "", "", true, true, '', "text", onInput2);
    scr.setInput("cass3", "", "", "", true, true, '', "text", onInput3);
    scr.setInput("cass4", "", "", "", true, true, '', "text", onInput4);

    scr.render("incass_other");
  }
  else if(type === "other_confirm"){
    scr.setLabel("title", "Выберите тип операции", '');
    scr.setButton("fdk_d", "Далее", '', onCassettesInputRequest);
    scr.setButton("fdk_f", "Назад", '', onMenuIncass);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_other", "file:///C:/OPEN_NEW_GRAPH/old/0804_1.html?val1=" + m_session.incassCassettesValue.cass1 + "&val2=" + m_session.incassCassettesValue.cass2 + "&val3=" + m_session.incassCassettesValue.cass3 + "&val4=" + m_session.incassCassettesValue.cass4 + "&");
  }
  else if(type === "cash1"){
    scr.setLabel("title", "Введите количество<br>листов наличных,<br>заложеннных в кассете 1", '');
    scr.setInput("value", "", "", "", true, true, '', "text", onInput);
    scr.setButton("fdk_d", "Далее", '', onInputCashin1);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_cash1");
  }
  else if(type === "cash2"){
    scr.setLabel("title", "Введите количество<br>листов наличных,<br>заложеннных в кассете 2", '');
    scr.setInput("value", "", "", "", true, true, '', "text", onInput);
    scr.setButton("fdk_d", "Далее", '', onInputCashin2);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_cash2");
  }
  else if(type === "cash3"){
    scr.setLabel("title", "Введите количество<br>листов наличных,<br>заложеннных в кассете 3", '');
    scr.setInput("value", "", "", "", true, true, '', "text", onInput);
    scr.setButton("fdk_d", "Далее", '', onInputCashin3);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_cash3");
  }
  else if(type === "cash4"){
    scr.setLabel("title", "Введите количество<br>листов наличных,<br>заложеннных в кассете 4", '');
    scr.setInput("value", "", "", "", true, true, '', "text", onInput);
    scr.setButton("fdk_d", "Далее", '', onInputCashin4);
    scr.setButton("cancel", "Завершить", false, true, "", onCancel);
    scr.render("incass_cash4");
  }
  else if(type === "wait"){
    scr.setLabel("title", getLangText('wait_please_wait'), '');
    scr.render("incass_wait");
  }
  else if(type === "ok"){
    //scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onCancel);
    //scr.setButton("main_menu", getLangText("button_continue"), '{"icon": ""}', onMenuIncass);
    //scr.setLabel("warning", getLangText(""), "");
    //scr.setImage("smile","../../graphics/icon-smile-1.svg","");
    //scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
    //scr.render("wait_message_buttons");
    scr.setLabel("text", "", "");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.render("wait_message");
    callSupport("cancel");
    return;
  }
  else if(type === "wait_pin_error"){
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onCancel);
    scr.setButton("main_menu", getLangText("button_continue"), '{"icon": ""}', onButtonToPin);
    scr.setLabel("warning", getLangText('pin_incorrect'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);

    scr.render("wait_message_buttons");
  }
  else{
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onCancel);
    scr.setLabel("warning", getLangText('wait_impos_complete'), "");
    scr.setImage("smile","../../graphics/icon-smile-2.svg","");

    scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);

    scr.render("wait_message_buttons");
  }
};

msg_err = function(someArgs) {
  var onError =  function () {
    scr.cancel();
  }
  var onButtonCancel = function() {
    alertMsgLog(scr.name+' onButtonCancel');
    scr.cancel();
  }

  var msg = '';
  if(typeof someArgs != 'undefined') {
    if(someArgs.constructor === Array && someArgs.length > 0)
      msg = someArgs[0];
    else
      msg = someArgs;
  }
  else
    msg = getLangText('unknown_error');

  scr.addOnError(onError);

  if(m_session.isCard)
    scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onButtonCancel);
  else
    scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout-red.svg", "themes":["btn-white-red"]}', onButtonCancel);
  scr.setLabel("warning", msg, "");
  scr.setImage("smile","../../graphics/icon-smile-2.svg","");
  scr.render("wait_message_buttons");
};

var msgResult = function(args){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTakeCardTimeout = function(name) {
    alertMsgLog(scr.name+'. onTakeCardTimeout ' + name);
    scr.setLabel("text", getLangText('card_take_or_lose'), "");
    //scr.setLabel("loader","24", '{"loader":"countdown"}');
    scr.setLabel("loader","23", '{"loader":"countdown", "icon":"../../graphics/icon-takecard-white.svg"}');
    scr.setTimeout("0", "", onTakeCardTimeout);
    //window.external.exchange.refreshScr();
    scr.render("wait_message");
  };
  var onTimeoutMir = function(name){
    alertMsgLog(scr.name+'. onTimeoutMir ' + name);
    scr.nextScreen(msgResult,["", "end"]);
    callSupport("cancelnfc");
  };
  var onButton1 = function(name){
    scr.nextScreen(serviceSelect);
  };
  var onButtonCancel = function(name){
    alertMsgLog(scr.name+' onButtonCancel '+name);
    serviceName = 'cancel';
    onCancelGlobal();
  };
  var onButtonMainMenu = function(name){
    alertMsgLog(scr.name+' onButtonMainMenu '+name);
    serviceName = 'webius_menu';
    scr.nextScreen(serviceSelect);
  };
  var onCancelLocal = function(name){
    callSupport("cancel");
  }	;
  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request":
        break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case 'wait': return;
      case 'card_return':
        if(typeof message == "undefined" || message !== "pinchange_ok")
          scr.nextScreen(requestResult,[args]);
        else {
          if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
            scr.setLabel("text", getLangText('pinchange_succ')+getLangText('end_session_nfc_no_card'), "");
          else
            scr.setLabel("text", getLangText('pinchange_succ')+getLangText('pinchange_succ2'), "");
          scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
          scr.setImage("bg","../../graphics/BG_blur.jpg","");
          scr.setTimeout("7000", "", onTakeCardTimeout);
          scr.render("wait_message");
        }
        return;
      case "end_session_nfc":
        if(message === "card_not_serviced_nfc_mir" && type === "end")
        {
          scr.setButtonJson({name:"card", text: getLangText("button_dismiss"),
            visible: true, enable: true, ext: {
              themes: ['btn-white-grey'], //icon: '../../graphics/icon-logout-red.svg'
            }}, onButtonCancel);
          addLangSwitch();
          scr.setLabelJson({name: "text_three_lines_one", value: getLangText("card_not_serviced_nfc_mir_one")});
          scr.setLabelJson({name: "text_three_lines_two", value: getLangText("card_not_serviced_nfc_mir_two")});
          scr.setLabelJson({name: "text_three_lines_three", value: getLangText("card_not_serviced_nfc_mir_three")});
          scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
          scr.setImage("bg","../../graphics/BG_blur.jpg","");
          scr.setTimeout(m_session.timeoutShowWarningMir.toString(), "", onTimeoutMir);
          scr.render("wait_message");
        }
        else if(message === "nukk_token_not_serviced" && type === "end")
        {
          scr.setButtonJson({name:"card", text: getLangText("button_dismiss"),
            visible: true, enable: true, ext: {
              themes: ['btn-white-grey'], //icon: '../../graphics/icon-logout-red.svg'
            }}, onButtonCancel);
          addLangSwitch();
          scr.setLabelJson({name: "text_three_lines_one", value: getLangText("fitobj_canceltext_one")});
          scr.setLabelJson({name: "text_three_lines_two", value: getLangText("nukk_token_not_serviced_one")});
          scr.setLabelJson({name: "text_three_lines_three", value: getLangText("nukk_token_not_serviced_two")});
          scr.setLabel("loader","60",
            '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
          scr.setImage("bg","../../graphics/BG_blur.jpg","");
          scr.setTimeout(m_session.timeoutShowWarning.toString(), "", onTimeoutMir);
          scr.render("wait_message");
          return;
        }
        else
          scr.nextScreen(requestResult,[args]);
        return;
      case "menu_main":
        callSupport("cancel");
        return;
      default:
        scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var message, type;
  if(typeof args != 'undefined' && args.constructor === Array && args.length > 0){
    message = args[0];
    if(args.length > 1)
      type = args[1];
  }
  else
    message = args;

  scr.setTimeout(m_session.timePeriod.toString(), "", onCancelLocal);
  if(typeof type == 'undefined'){
    scr.setLabel("text", getLangText(message), "");
    scr.setLabel("loader","60", '{"loader":"loader"}');
    //scr.setImage("smile","../../graphics/icon-loader.svg","");
    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.render("wait_message");
  }
  else{
    if(type === 'end'){
      if(message === "pinchange_ok")
      {
        if(typeof m_session.fitObj !== "undefined" && (m_session.fitObj.formfactor === "nfc" || m_session.fitObj.formfactor === "nfctoken"))
          scr.setLabel("text", getLangText('pinchange_succ')+getLangText('end_session_nfc_no_card'), "");
        else
          scr.setLabel("text", getLangText('pinchange_succ')+getLangText('pinchange_succ2'), "");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
        callSupport("cancel");
        return;
      }
      else if(message === "")
      {
        scr.setLabel("text", "", "");
        //scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
        return;
      }
      else if(message === "nfc_session_ended")
      {
        scr.setLabel("text", getLangText(message), "");
        //scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/lapki.svg"}');
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
        return;
      }
      else if(message === "end_session_nfc_print")
      {
        scr.setLabel("text", getLangText("nfc_session_ended"), "");
        //scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/lapki.svg"}');
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
        return;
      }
      else if(message === "card_not_serviced_nfc_mir")
      {
        addLangSwitch();
        scr.setButtonJson({name:"card", text: getLangText("button_dismiss"),
          visible: true, enable: true, ext: {
            themes: ['btn-white-grey'], //icon: '../../graphics/icon-logout-red.svg'
          }}, onButtonCancel);
        scr.setLabelJson({name: "text_three_lines_one", value: getLangText("card_not_serviced_nfc_mir_one")});
        scr.setLabelJson({name: "text_three_lines_two", value: getLangText("card_not_serviced_nfc_mir_two")});
        scr.setLabelJson({name: "text_three_lines_three", value: getLangText("card_not_serviced_nfc_mir_three")});
        scr.setLabel("loader","60",
          '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setTimeout(m_session.timeoutShowWarningMir.toString(), "", onTimeoutMir);
        scr.render("wait_message");
        return;
      }
      else if(message === "nukk_token_not_serviced")
      {
        addLangSwitch();
        scr.setButtonJson({name:"card", text: getLangText("button_dismiss"),
          visible: true, enable: true, ext: {
            themes: ['btn-white-grey'], //icon: '../../graphics/icon-logout-red.svg'
          }}, onButtonCancel);
        scr.setLabelJson({name: "text_three_lines_one", value: getLangText("fitobj_canceltext_one")});
        scr.setLabelJson({name: "text_three_lines_two", value: getLangText("nukk_token_not_serviced_one")});
        scr.setLabelJson({name: "text_three_lines_three", value: getLangText("nukk_token_not_serviced_two")});
        scr.setLabel("loader","60",
          '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.setTimeout(m_session.timeoutShowWarning.toString(), "", onTimeoutMir);
        scr.render("wait_message");
        return;
      }
      else
      {
        scr.setLabel("text", getLangText(message), "");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
        return;
      }
    }
    else if(type === 'end_good'){
      scr.setLabel("text", getLangText(message), "");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-1.svg"}');
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.render("wait_message");
    }
    else if(type === 'card_return'){
      var trantype = window.external.exchange.getMemory("trantype");
      if(trantype != 1){
        scr.setLabel("text", getLangText('session_ended'), "");
        scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        scr.render("wait_message");
      } else {
        scr.setLabel("text", getLangText('card_take'), "");
        //scr.setLabel("loader","30", '{"loader":"countdown"}');
        scr.setLabel("loader","5", '{"loader":"ellipse", "icon":"../../graphics/icon-pick-card.svg"}');
        //scr.setLabel("loader","30", '{"loader":"countdown", "icon":"../../graphics/icon-takecard-white.svg"}');
        scr.setImage("bg","../../graphics/BG_blur.jpg","");
        //scr.setImage("smile","../../graphics/icon-loader.svg","");
        scr.setTimeout("7000", "", onTakeCardTimeout);
        scr.render("wait_message");
      }
    }
    else if(type === 'end_timeout'){
      scr.setLabel("text", getLangText("label_time_over"), "");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.render("wait_message");
    }
    else if(type === 'end_err'){
      if(message == '')
        scr.setLabel("text", getLangText('wait_please_wait'), "");
      else
        scr.setLabel("text", getLangText(message), "");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.render("wait_message");
    }
    else if(type === 'card_read'){
      scr.setLabel("text", getLangText('main_wait_init'), "");
      scr.setLabel("loader","60", '{"loader":"loader"}');
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      //scr.setImage("smile","../../graphics/icon-loader.svg","");
      scr.render("wait_message");
    }
    else if(type === 'error_card_read'){
      scr.setLabel("text", getLangText('card_read_err'), "");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      //scr.setImage("smile","../../graphics/icon-loader.svg","");
      scr.render("wait_message");
    }
    else if(type === 'wait'){
      if(message == '')
        scr.setLabel("text", getLangText('wait_please_wait'), "");
      else
        scr.setLabel("text", getLangText(message), "");
      //scr.setImage("smile","../../graphics/icon-loader.svg","");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"loader"}');
      scr.render("wait_message");
    }
    else if(type === 'wait_init'){
      addLangSwitch();
      if(message == '')
        scr.setLabel("text", getLangText('wait_please_wait'), "");
      else
        scr.setLabel("text", getLangText(message), "");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      scr.setLabel("loader","60", '{"loader":"loader"}');
      //scr.setImage("smile","../../graphics/icon-smile-2.svg","");
      scr.render("wait_message");
    }
    else if(type === 'return_menu'){
      scr.setButton("main_menu", getLangText("button_menu_return"), '{"icon": ""}', onButtonMainMenu);
      if(m_session.isCard)
        scr.setButton("logout", getLangText("button_logout_card"), '{"icon": "../../graphics/icon-pick-card-red.svg", "themes":["btn-white-red"]}', onButtonCancel);
      else
        scr.setButton("logout", getLangText("button_logout_cash"), '{"icon": "../../graphics/icon-logout-red.svg", "themes":["btn-white-red"]}', onButtonCancel);
      scr.setLabel("warning", getLangText(message), "");
      scr.setImage("smile","../../graphics/icon-smile-2.svg","");
      scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
      scr.render("wait_message_buttons");
    }
    else if(type === 'err'){
      scr.setLabel("text", getLangText(message), "");
      scr.setImage("bg","../../graphics/BG_blur.jpg","");
      //scr.setImage("smile","../../graphics/icon-smile-2.svg","");
      scr.setLabel("loader","60", '{"loader":"ellipse", "icon":"../../graphics/icon-smile-2.svg"}');
      scr.render("wait_message");
    }
    else{
      scr.cancel();
    }
  }
};

continueOrExit = function(args){
  onCancelGlobal();
};

function onTellMEWrapperCreditError(someArgs){
  switch(someArgs){
    case "credit_err":
      var errorType = window.external.exchange.getMemory("errorType");
      if(errorType === "")
        errorType = "credit_error";
      scr.nextScreen(zsfCreditError, errorType);
      return "ok";
    default:
      return "bad";
  }
}
var zsfAccountInput = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  function accountTooShort(accText){
    if(accText.length < 8){
      scr.setLabelJson({name:"warning_l", value:getLangText("zsf_acc_enter_err_length")});
      window.external.exchange.refreshScr();
      return true;
    }
    else
      return false;
  }
  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }

  var onInput = function(someArgs){
    alertMsgLog(' '+scr.name+' onInput args '+someArgs);
    var pKey = "", help;
    if(someArgs && someArgs.constructor === Array && someArgs.length > 0) {
      if(typeof someArgs[1] == 'undefined')
        m_session.zsfcredit.account = someArgs;
      else {
        pKey = someArgs[0];
        m_session.zsfcredit.account = someArgs[1];
      }
    }
    else
      m_session.zsfcredit.account = "";
    inpObj.text = m_session.zsfcredit.account;
    scr.setInputJson(inpObj, onInput);
    if(m_session.zsfcredit.account.length > 0) {
      buttonObjContinueCurr.enable = true;
      scr.setButtonJson(buttonObjContinueCurr, onButtonCurrent);
      buttonObjContinueAll.enable = true;
      scr.setButtonJson(buttonObjContinueAll, onButtonAll);
      window.external.exchange.RefreshScr();
    }
    else {
      buttonObjContinueCurr.enable = false;
      scr.setButtonJson(buttonObjContinueCurr, onButtonCurrent);
      buttonObjContinueAll.enable = false;
      scr.setButtonJson(buttonObjContinueAll, onButtonAll);
      window.external.exchange.RefreshScr();
    }
    alertMsgLog("Account Input: "+m_session.zsfcredit.account);
  };
  var onButtonClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    m_session.zsfcredit.account = "";
    inpObj.text = "";
    scr.setInputJson(inpObj, onInput);
  };
  var onButtonReturn = function(someArgs){
    m_session.zsfcredit = "";
    scr.nextScreen(serviceSelect);
  };
  var onButtonCurrent = function(someArgs){
    if(!accountTooShort(m_session.zsfcredit.account.length)){
      m_session.zsfcredit.type = "current";
      scr.nextScreen(zsfCreditRequestInfo);
    }
  };
  var onButtonAll = function(someArgs){
    if(!accountTooShort(m_session.zsfcredit.account.length)){
      m_session.zsfcredit.type = "all";
      scr.nextScreen(zsfCreditRequestInfo);
    }
  };
  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request": break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  addBottomLayerElements();

  m_session.zsfcredit.account = "";
  var inpObj = {name:"phone", text:m_session.zsfcredit.account, mask:"", hint:"", type:"text", state:"None",
    maxLength: 10, validate:true, visible: true, enable: true, value:m_session.zsfcredit.account};
  scr.setInputJson(inpObj, onInput);

  scr.setLabelJson({name:"title", value: getLangText("zsf_acc_enter_title")});
  scr.setLabelJson({name:"placeholder", value: "0"});
  scr.setLabelJson({name:"comment1", value: getLangText("zsf_acc_enter_comment1")});
  scr.setLabelJson({name:"comment2", value: getLangText("zsf_acc_enter_comment2")});
  if(!m_ATMFunctions.printer) {
    scr.setLabelJson({name: "warning_l", value: getLangText("zsf_no_receipt")});
    scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
  }
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  scr.setImage("info", "../../graphics/icon_information.svg", "");

  scr.setButtonJson({name:"card_return", text:getLangText("button_cancel"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  scr.setButtonJson({name:"cancel", text:getLangText("zsf_acc_enter_btn_cancel"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
    enable:true,visible:true, ext:{icon:""}}, onButtonClear);
  var buttonObjContinueCurr = {name:"continue", text:getLangText("zsf_acc_enter_btn_curr"),
    enable:false,visible:true, ext:{icon:"",themes:['blue']}};
  scr.setButtonJson(buttonObjContinueCurr, onButtonCurrent);
  var buttonObjContinueAll = {name:"middle", text:getLangText("zsf_acc_enter_btn_all"),
    enable:false,visible:true, ext:{icon:""}};
  scr.setButtonJson(buttonObjContinueAll, onButtonAll);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("zsf_popup");
};
var zsfCreditRequestInfo = function(type) {
  var onError = function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  function parseZSFInfo() {
    var help = window.external.exchange.getMemory("zsfinfo");
    if (help !== "") {
      try {
        m_session.zsfinfo = JSON.parse(help);
        if (m_session.zsfinfo.min)
          m_session.zsfinfo.min = parseFloat(m_session.zsfinfo.min);
        if (m_session.zsfinfo.max)
          m_session.zsfinfo.max = parseFloat(m_session.zsfinfo.max);
        if (m_session.zsfinfo.ostatok)
          m_session.zsfinfo.ostatok = parseFloat(m_session.zsfinfo.ostatok);
        if (m_session.zsfinfo.ssudzad)
          m_session.zsfinfo.ssudzad = parseFloat(m_session.zsfinfo.ssudzad);
        if (m_session.zsfinfo.shtraf)
          m_session.zsfinfo.shtraf = parseFloat(m_session.zsfinfo.shtraf);
        if (m_session.zsfinfo.curr_pay)
          m_session.zsfinfo.curr_pay = parseFloat(m_session.zsfinfo.curr_pay);
        if (m_session.zsfinfo.pereplata)
          m_session.zsfinfo.pereplata = parseFloat(m_session.zsfinfo.pereplata);
        if (m_session.zsfinfo.curr_pay_recom)
          m_session.zsfinfo.curr_pay_recom = parseFloat(m_session.zsfinfo.curr_pay_recom);

      } catch (ex) {
        m_session.zsfinfo = {};
      }
    }
    alertMsgLog("zsfinfo: " + JSON.stringify(m_session.zsfinfo));
  }

  var onTellMEWrapper = function (args) {
    switch (args) {
      case "credit_curr_minus":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoCurr, "minus");
        break;
      case "credit_curr_plus":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoCurr, "plus");
        break;
      case "credit_all":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoAll);
        break;
      case "wait_request":
        break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait":
        break;
      default:
        alertMsgLog("scr.name:" + scr.name + ", onTellMEWrapper args:" + args);
        if (onTellMEWrapperCreditError(args) !== "ok")
          scr.nextScreen(requestResult, [args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  function addBottomLayerElements() {
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if (!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if (!m_session.ownCard)
      flagPhoneChange = false;
    else if (typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg", "../../graphics/BG_blur.jpg", "");
    scr.setLabel("card", m_CardIcon.value, m_CardIcon.ext);
  }

  addBottomLayerElements();
  scr.setTimeout('0', "", onButtonEmpty);
  scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
  if (!m_ATMFunctions.printer) {
    scr.setImage("wait_warning_i", "../../graphics/icon_warning.svg", "");
    scr.setLabelJson({name: "wait_warning_l", value: getLangText("zsf_no_receipt")});
  }
  if (type === "pinenter"){
    scr.render("main_menu");
    checkAndGoToPinOrNcf();
  }
  else {
    scr.render("zsf_popup");
    callSupport(m_session.serviceName + "&type=" + m_session.zsfcredit.type + "&BufferB=" + m_session.zsfcredit.account);
  }
};
var zsfCreditInfoCurr = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onInput = function(someArgs){
    alertMsgLog(' '+scr.name+' onInput args '+someArgs);
    var pKey = "", help;
    if(someArgs && someArgs.constructor === Array && someArgs.length > 0) {
      if(typeof someArgs[1] == 'undefined')
        m_session.zsfcredit.amount = parseFloat(someArgs.replace(',', '.')).toFixed(2);
      else {
        pKey = someArgs[0];
        m_session.zsfcredit.amount = parseFloat((someArgs[1]).replace(',', '.')).toFixed(2);
      }
    }
    else
      m_session.zsfcredit.amount = 0.0;
    if(isNaN(m_session.zsfcredit.amount))
      m_session.zsfcredit.amount = 0.0;
    /*if(!isNaN(m_session.balance) && m_session.balance < m_session.zsfcredit.amount){
            scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_balance")});
            scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
            window.external.exchange.RefreshScr();
        }*/

    if (m_session.zsfcredit.amount != 0.0) {
      buttonObjContinue.enable = true;
      scr.setButtonJson(buttonObjContinue, onButtonPay);
      window.external.exchange.RefreshScr();
    } else {
      buttonObjContinue.enable = false;
      scr.setButtonJson(buttonObjContinue, onButtonPay);
      window.external.exchange.RefreshScr();
    }
    inpObj.text = m_session.zsfcredit.amount.toString();
    alertMsgLog("Account Input: "+m_session.zsfcredit.amount);
  };
  var onClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    m_session.zsfcredit.amount = 0.0;
    inpObj.text = "";
  };
  var onButtonReturn = function(someArgs){
    m_session.zsfcredit.amount = 0.0;
    scr.nextScreen(zsfAccountInput);
  };
  var onButtonPay = function(someArgs){
    if(!isNaN(m_session.balance) && m_session.balance < m_session.zsfcredit.amount){
      scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_balance")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.RefreshScr();
    }
    else if (m_session.zsfcredit.amount != 0.0) {
      if(typeof m_session.second != "undefined" && m_session.second)
        scr.nextScreen(zsfCreditRequestPay, "pinenter");
      else
        scr.nextScreen(zsfCreditRequestPay);
    }
  };


  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
    //scr.setImage("warning", "../../graphics/icon_warning.svg", "");
  }
  addBottomLayerElements();

  if(!m_session.zsfcredit.amount) m_session.zsfcredit.amount = 0.0;
  var inpObj = {name:"phone", text:m_session.zsfcredit.amount, mask:"", hint:"", type:"amount",
    maxLength: 9, visible: true, enable: true, validate:true};
  scr.setInputJson(inpObj, onInput);

  scr.setLabelJson({ name: "title", value: getLangText("amount_enter")});
  scr.setLabelJson({name:"currency", value: getLangText("zsf_curr")});
  scr.setLabelJson({name:"warning_l", value:" "});
  scr.setImage("warning_i", "", "");
  if(!isNaN(m_session.zsfinfo.curr_pay_recom)) {
    scr.setLabelJson({ name: "comment", value: getLangText("zsf_curr_pay")});
    scr.setLabelJson({ name: "recommended", value: AddSpace(m_session.zsfinfo.curr_pay_recom) + getLangText("zsf_curr") });
  }

  if(!isNaN(m_session.zsfinfo.pereplata)) {
    if(m_session.zsfinfo.pereplata < 0.0)
      scr.setLabelJson({
        name: "note1",
        value: getLangText("zsf_pereplata") +
          AddSpace((-1.0)*m_session.zsfinfo.pereplata) + getLangText("zsf_curr")
      });
    else
      //scr.setLabelJson({ name: "note1", value: getLangText("zsf_pereplata_no") });
      scr.setLabelJson({ name: "note1", value: " " });
  }
  if(!isNaN(m_session.zsfinfo.ostatok))
    scr.setLabelJson({name:"note2",
      value: getLangText("zsf_ostatok")+AddSpace(m_session.zsfinfo.ostatok)+getLangText("zsf_curr")});
  if(!isNaN(m_session.zsfinfo.ssudzad))
    scr.setLabelJson({name:"note3",
      value: getLangText("zsf_ssudzad")+AddSpace(m_session.zsfinfo.ssudzad)+getLangText("zsf_curr")});
  if(!isNaN(m_session.zsfinfo.shtraf)) {
    if(m_session.zsfinfo.shtraf > 0.0)
      scr.setLabelJson({ name: "note4",
        value: getLangText("zsf_shtraf") + "<span style=\"color: #CB0018\">" +
          AddSpace(m_session.zsfinfo.shtraf) + getLangText("zsf_curr") + "</span>"
      });
    else
      scr.setLabelJson({ name: "note4", value: getLangText("zsf_shtraf_no")});
  }
  if(!isNaN(m_session.zsfinfo.curr_pay))
    scr.setLabelJson({ name: "note5", value: getLangText("zsf_curr_pay_size") +
        AddSpace(m_session.zsfinfo.curr_pay) + getLangText("zsf_curr") });
  scr.setButtonJson({name:"cancel", text:getLangText("settingMenu_return"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  var buttonObjContinue = {name:"continue", text:getLangText("button_pay"),
    enable:false,visible:true, ext:{icon:"",themes:['green']}};
  scr.setButtonJson(buttonObjContinue, onButtonPay);
  scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
    enable:true,visible:true, ext:{icon:""}}, onClear);

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("zsf_popup_amount");
};
var zsfCreditInfoAll = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onInput = function(someArgs){
    alertMsgLog(' '+scr.name+' onInput args '+someArgs);
    var pKey = "", help;
    if(someArgs && someArgs.constructor === Array && someArgs.length > 0) {
      if(typeof someArgs[1] == 'undefined')
        m_session.zsfcredit.amount = parseFloat(someArgs.replace(',', '.')).toFixed(2);
      else {
        pKey = someArgs[0];
        m_session.zsfcredit.amount = parseFloat((someArgs[1]).replace(',', '.')).toFixed(2);
      }
    }
    else
      m_session.zsfcredit.amount = 0.0;
    if(isNaN(m_session.zsfcredit.amount))
      m_session.zsfcredit.amount = 0.0;
    /*if(!isNaN(m_session.balance) && m_session.balance < m_session.zsfcredit.amount){
			scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_balance")});
			scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
			window.external.exchange.RefreshScr();
		}
		else*/
    if( !!m_session.zsfinfo.min && m_session.zsfinfo.min > m_session.zsfcredit.amount){
      //scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_less") +
      //		AddSpace(m_session.zsfinfo.min) + getLangText("zsf_curr")});
      //scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      buttonObjContinue.enable = false;
      scr.setButtonJson(buttonObjContinue, onButtonPay);
      window.external.exchange.RefreshScr();
    }
    else if( !!m_session.zsfinfo.max && m_session.zsfinfo.max < m_session.zsfcredit.amount){
      //scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_bigger") +
      //		AddSpace(m_session.zsfinfo.max) + getLangText("zsf_curr")});
      //scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      buttonObjContinue.enable = false;
      scr.setButtonJson(buttonObjContinue, onButtonPay);
      window.external.exchange.RefreshScr();
    }
    else if (m_session.zsfcredit.amount != 0.0) {
      scr.setLabelJson({name:"warning_l", value:" "});
      scr.setImage("warning_i", "", "");
      buttonObjContinue.enable = true;
      scr.setButtonJson(buttonObjContinue, onButtonPay);
      window.external.exchange.RefreshScr();
    }
    inpObj.text = m_session.zsfcredit.amount.toString();
    alertMsgLog("Account Input: "+m_session.zsfcredit.amount);
  };
  var onClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    m_session.zsfcredit.amount = 0.0;
    inpObj.text = "";
    scr.setLabelJson({name:"warning_l", value:" "});
    scr.setImage("warning_i", "", "");
    scr.setInputJson(inpObj, onInput);
    window.external.exchange.RefreshScr();
  };
  var onButtonReturn = function(someArgs){
    m_session.zsfcredit.amount = 0.0;
    scr.nextScreen(zsfAccountInput);
  };
  var onButtonPay = function(someArgs){
    if(!isNaN(m_session.balance) && m_session.balance < m_session.zsfcredit.amount){
      scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_balance")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.RefreshScr();
    }
    else if( m_session.zsfinfo.min > m_session.zsfcredit.amount){
      scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_less") +
          AddSpace(m_session.zsfinfo.min) + getLangText("zsf_curr")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.RefreshScr();
    }
    else if( m_session.zsfinfo.max < m_session.zsfcredit.amount){
      scr.setLabelJson({name:"warning_l", value:getLangText("zsf_amount_bigger") +
          AddSpace(m_session.zsfinfo.max) + getLangText("zsf_curr")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.RefreshScr();
    }
    else if (m_session.zsfcredit.amount != 0.0) {
      if(typeof m_session.second != "undefined" && m_session.second)
        scr.nextScreen(zsfCreditRequestPay, "pinenter");
      else
        scr.nextScreen(zsfCreditRequestPay);
    }
  };


  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }
  addBottomLayerElements();

  if(!m_session.zsfcredit.amount) m_session.zsfcredit.amount = 0.0;
  var inpObj = {name:"phone", text:m_session.zsfcredit.amount, mask:"", hint:"", type:"amount",
    maxLength: 9, visible: true, enable: true, validate:true};
  scr.setInputJson(inpObj, onInput);

  scr.setLabelJson({ name: "title", value: getLangText("amount_enter")});
  scr.setLabelJson({name:"currency", value: getLangText("zsf_curr")});
  if(!isNaN(m_session.zsfinfo.max)) {
    scr.setLabelJson({ name: "comment", value: getLangText("zsf_all_pay")});
    scr.setLabelJson({ name: "recommended", value: AddSpace(m_session.zsfinfo.max) + getLangText("zsf_curr") });
  }
  if(!isNaN(m_session.zsfinfo.max) && !isNaN(m_session.zsfinfo.min)) {
    scr.setLabelJson({
      name: "note1",
      value: getLangText("zsf_pay_all1") +
        AddSpace(m_session.zsfinfo.min) + getLangText("zsf_curr") +
        getLangText("zsf_pay_all2") + AddSpace(m_session.zsfinfo.max) + getLangText("zsf_curr")
    });
  }
  if(!isNaN(m_session.zsfinfo.ostatok))
    scr.setLabelJson({name:"note2",
      value: getLangText("zsf_ostatok")+AddSpace(m_session.zsfinfo.ostatok)+getLangText("zsf_curr")});
  if(!isNaN(m_session.zsfinfo.ssudzad))
    scr.setLabelJson({name:"note3",
      value: getLangText("zsf_ssudzad")+AddSpace(m_session.zsfinfo.ssudzad)+getLangText("zsf_curr")});
  if(!isNaN(m_session.zsfinfo.shtraf)) {
    if(m_session.zsfinfo.shtraf > 0.0)
      scr.setLabelJson({ name: "note4",
        value: getLangText("zsf_shtraf") + "<span style=\"color: #CB0018\">" +
          AddSpace(m_session.zsfinfo.shtraf) + getLangText("zsf_curr") + "</span>"
      });
    else
      scr.setLabelJson({ name: "note4", value: getLangText("zsf_shtraf_no")});
  }
  if(!isNaN(m_session.zsfinfo.curr_pay))
    scr.setLabelJson({ name: "note5", value: getLangText("zsf_curr_pay_size") +
        AddSpace(m_session.zsfinfo.curr_pay) + getLangText("zsf_curr") });

  scr.setButtonJson({name:"cancel", text:getLangText("settingMenu_return"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  var buttonObjContinue = {name:"continue", text:getLangText("zsf_acc_enter_btn_all"),
    enable:false,visible:true, ext:{icon:"",themes:['green']}};
  scr.setButtonJson(buttonObjContinue, onButtonPay);
  scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
    enable:true,visible:true, ext:{icon:""}}, onClear);

  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("zsf_popup_amount");
};
var zsfCreditRequestPay = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTellMEWrapper = function(args)
  {
    var help = "";
    switch(args) {
      case "wait_request": break;
      case "credit_ok":
      case "request_ok":
        m_session.zsfcredit = "";
        scr.nextScreen(serviceSelect);
        break;
      case "credit_request_good":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperCreditError(args) !== "ok")
          if (onTellMEWrapperSecondPINProcess(args) !== "ok")
            scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }
  m_session.second = true;
  if (type === "pinenter"){
    scr.render("main_menu");
    checkAndGoToPinOrNcf();
  }
  else if (type === "afterpin"){
    callSupport(m_session.serviceName + "&type=" + m_session.zsfcredit.type + "&finish=true" +
      "&BufferB=" + m_session.zsfcredit.account + "&amount=" + (m_session.zsfcredit.amount * 100.0).toFixed(0).toString());
  }
  else {
    addBottomLayerElements();
    scr.setTimeout('0', "", onButtonEmpty);
    scr.setWait(true, getLangText('zsf_req_pay'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
    if(!m_ATMFunctions.printer) {
      scr.setImage("wait_warning_i", "../../graphics/icon_warning.svg", "");
      scr.setLabelJson({name:"wait_warning_l", value: getLangText("zsf_no_receipt")});
    }
    scr.render("zsf_popup");
    callSupport(m_session.serviceName + "&type=" + m_session.zsfcredit.type + "&finish=true" +
      "&BufferB=" + m_session.zsfcredit.account + "&amount=" + (m_session.zsfcredit.amount * 100.0).toFixed(0).toString());
  }
};
var zsfCreditError = function(errorType){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTellMEWrapper = function(someArgs){
    switch(someArgs) {
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+someArgs);
        if(onTellMEWrapperCreditError(someArgs) !== "ok")
          scr.nextScreen(requestResult,[someArgs]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  var onModalMessage = function(someArgs){
    alertMsgLog(scr.name+' onModalMessage, value: '+someArgs[1]);

    if(someArgs[1] == 1){
      if(m_session.serviceName === "zsfcredit"){
        scr.nextScreen(zsfAccountInput);
      }
      else {
        scr.nextScreen(zsfDepositInput);
      }
    }
    else if(someArgs[1] == 0) {
      scr.nextScreen(serviceSelect);
    }
  };
  var onModalMessageCancel = function(someArgs){
    alertMsgLog(scr.name+' onModalMessage, value: '+someArgs[1]);

    if(someArgs[1] == 1){
      onCancelGlobal();
    }
    else if(someArgs[1] == 0) {
      scr.nextScreen(serviceSelect);
    }
  };
  //var iconPath = "../../graphics/icon_warning_red.svg";
  var iconPath = "../../graphics/icon-smile-2.svg";
  var btnCancelObj = {name:"logout", text: "", enable:true, visible:false,
    ext: {icon: ""}};
  var modalButtons = [getLangText('button_menu_return')];
  var modalObj = { text: getLangText(errorType), options: modalButtons, selected: -1, visible: true,
    ext: {icon: "../../graphics/icon_warning_red.svg", loader: "icon",
      options_settings: [{name:"back", icon:""}]}};
  if(m_session.serviceName === "smsinfo"){
    if(errorType === 'ask_132_thx' || errorType === 'end_133_req_impossible' || errorType === 'request_error' ||
      errorType === 'ask_135_req_cant_perform' || errorType === 'pin_138_req_not_made' ||
      errorType === 'ask_139_req_not_made' || errorType === 'amt_140_not_enough_money' ||
      errorType === 'ask_144_req_not_allowed' || errorType === 'ask_145_incorrect_amount' ||
      errorType === 'ask_146_incorrect_amount' || errorType === 'wait_pin_error' ||
      errorType === 'pinchange_pin_error' || errorType === 'ask_303_limit_exceeded' ||
      errorType === 'amt_305_amount_to_big' || errorType === 'ask_618_pinchange_not_allowed'){//с кнопками
      modalButtons = [getLangText('button_menu_return'), m_session.onPINMoreTimeButtons[0]];
      modalObj.ext.options_settings = [{name:"back", icon:""},
        {name:"logout",
          icon:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
            .options_settings[0].icon,
          theme:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
            .options_settings[0].theme}];
    }
    else if(errorType === 'end_304_pin_try_exceeded' || errorType === 'end_136_card_seized' ||
      errorType === 'end_137_card_expired' || errorType === 'end_148_card_not_serviced' ||
      errorType === 'end_149_no_account_found' || errorType === 'money_error' ||
      errorType === 'wait_money_take' || errorType === 'wait_card_captured' ||
      errorType === 'wait_card_notprocess' || errorType === 'wait_card_hold') {//без кнопок
      modalButtons = [];
      modalObj.ext.options_settings = [];
    }
    else if(errorType === 'card_return') {
      scr.nextScreen(msgResult,["","card_return"]);
      return;
    }
    else if(errorType === 'wait_end_timeout'){
      scr.nextScreen(msgResult,["","end_timeout"]);
      return;
    }
    else if(errorType === 'wait_card_error'){
      scr.nextScreen(msgResult,["card_read_err","end_err"]);
      return;
    }
    else if(errorType === 'wait_end_session'||errorType === 'end_session') {
      scr.nextScreen(msgResult,['session_ended', "end"]);
      return;
    }
    else if(errorType === 'card_return_print') {
      scr.nextScreen(msgResult,[_state, "end"]);
      return;
    }
    else if(errorType === 'money_check') {
      scr.nextScreen(cashin, "closing");
      return;
    }
    else if(errorType === 'end_pin_timeout') {
      onCancelTimeout();
      return;
    }
    else if(errorType === 'end_pin_cancel') {
      onCancelGlobal();
      return;
    }
    else if(errorType === "wait_cheque") {
      scr.nextScreen(msgResult, ['wait_cheque', "end"]);
      return;
    }
    else {
      modalButtons = [getLangText('button_menu_return'), m_session.onPINMoreTimeButtons[0]];
      modalObj.ext.options_settings = [{name:"back", icon:""},
        {name:"logout",
          icon:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
            .options_settings[0].icon,
          theme:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
            .options_settings[0].theme}];
    }
    modalObj.ext.icon = iconPath;
    modalObj.ext.size = "native";
    modalObj.ext.loader = "ellipse";
    if(m_session.sim.type === "add")
      modalObj.text = getLangText("smsinfo_error");
    else
      modalObj.text = getLangText("smsinfo_delete_error");
    modalObj.options = modalButtons;
    scr.setModalMessageJson(modalObj, onModalMessageCancel);
    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
  }
  else {
    if(errorType === "zsf_error_number") {
      if(m_session.serviceName !== "zsfcredit")
        errorType = "zsf_error_number_dep";
      modalButtons = [getLangText('button_menu_return'), getLangText('zsf_button_error_try')];
      modalObj = { text: getLangText(errorType), options: modalButtons, selected: -1, visible: true,
        ext: {icon: iconPath, size: "native", loader: "ellipse",
          options_settings: [{name:"back", icon:""},{name:'logout',icon:""}]}};
      scr.setModalMessageJson(modalObj, onModalMessage);
    }
    else {
      scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onCancelGlobal);
      modalButtons = [getLangText('button_menu_return'),
        m_session.onPINMoreTimeButtons[0]];
      modalObj = { text: getLangText(errorType), options: modalButtons, selected: -1,
        visible: true, ext: {icon: iconPath, size: "native", loader: "ellipse",
          options_settings: [{name:"back", icon:""},
            {name:"logout",
              icon:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
                .options_settings[0].icon,
              theme:m_session.jsonObj.modalMessagePINAskMoreTime.elementObject.ext
                .options_settings[0].theme}]}};
      scr.setModalMessageJson(modalObj, onModalMessageCancel);
    }
  }
  scr.setButtonJson(btnCancelObj, onCancelGlobal);
  scr.setImage("bg","../../graphics/BG_blur.jpg","");
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("main_menu");
};

var zsfDepositInput = function(){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  function setLabelWarning(accText){
    if(!m_ATMFunctions.printer) {
      scr.setLabelJson({name: "warning_l", value: getLangText("zsf_no_receipt")});
      scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
      window.external.exchange.refreshScr();
      return false;
    }
    else {
      scr.setLabelJson({name: "warning_l", value: " "});
      scr.setImage("warning_i", "", "");
      window.external.exchange.refreshScr();
      return false;
    }
  }
  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }
  var onInput = function(someArgs){
    alertMsgLog(' '+scr.name+' onInput args '+someArgs);
    var pKey = "", help;
    if(someArgs && someArgs.constructor === Array && someArgs.length > 0) {
      if(typeof someArgs[1] == 'undefined')
        m_session.zsfcredit.account = someArgs;
      else {
        pKey = someArgs[0];
        m_session.zsfcredit.account = someArgs[1];
      }
    }
    else
      m_session.zsfcredit.account = "";
    inpObj.text = m_session.zsfcredit.account;
    scr.setInputJson(inpObj, onInput);
    if(m_session.zsfcredit.account.length > 0){
      buttonObjContinue.enable = true;
      scr.setButtonJson(buttonObjContinue, onButtonContinue);
      window.external.exchange.RefreshScr();
    }
    else {
      buttonObjContinue.enable = false;
      scr.setButtonJson(buttonObjContinue, onButtonContinue);
      window.external.exchange.RefreshScr();
    }
    alertMsgLog("Account Input: "+m_session.zsfcredit.account);
  };
  var onButtonClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    m_session.zsfcredit.account = "";
    inpObj.text = "";
    scr.setInputJson(inpObj, onInput);
  };
  var onButtonReturn = function(someArgs){
    m_session.zsfcredit = "";
    scr.nextScreen(serviceSelect);
  };
  var onButtonContinue = function(someArgs){
    scr.nextScreen(zsfDepositRequestInfo);
  };

  var onTellMEWrapper = function(args)
  {
    switch(args) {
      case "wait_request": break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperCreditError(args) !== "ok")
          if(onTellMEWrapperSecondPINProcess(args) !== "ok")
            scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  addBottomLayerElements();

  m_session.zsfcredit.account = "";
  var inpObj = {name:"phone", text:m_session.zsfcredit.account, mask:"", hint:"", type:"text", state:"None",
    maxLength: 10, validate:true, visible: true, enable: true, value:m_session.zsfcredit.account};
  scr.setInputJson(inpObj, onInput);

  scr.setLabelJson({name:"title", value: getLangText("zsf_acc_enter_title")});
  scr.setLabelJson({name:"placeholder", value: "0"});
  scr.setImage("info", "../../graphics/icon_information.svg", "");
  scr.setLabelJson({name:"comment1", value: getLangText("zsf_dep_acc_enter_comment1")});
  //scr.setLabelJson({name:"comment2", value: getLangText("zsf_dep_acc_enter_comment2")});
  scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  scr.setImage("error", "../../graphics/mes-error.svg", "");
  setLabelWarning();

  scr.setButtonJson({name:"card_return", text:getLangText("button_cancel"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  scr.setButtonJson({name:"cancel", text:getLangText("zsf_acc_enter_btn_cancel"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
    enable:true,visible:true, ext:{icon:""}}, onButtonClear);
  var buttonObjContinue = {name:"continue", text:getLangText("button_continue"),
    enable:false,visible:true, ext:{spanWidth:300, wrapper:'bigGreenBtn', icon:"",themes:['green']}};
  scr.setButtonJson(buttonObjContinue, onButtonContinue);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("zsf_popup");
};
var zsfDepositRequestInfo = function(type) {
  var onError = function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTellMEWrapper = function (args) {
    switch (args) {
      case "wait_request":
        break;
      case "zsf_deposit_info":
        var help = window.external.exchange.getMemory("zsfinfo");
        if (help !== "") {
          try {
            m_session.zsfinfo = JSON.parse(help);
            if (m_session.zsfinfo.balance)
              m_session.zsfinfo.balance = parseFloat(m_session.zsfinfo.balance);

          } catch (ex) {
            m_session.zsfinfo = {};
          }
        }
        scr.nextScreen(zsfDepositInfo);
        break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait":
        break;
      default:
        alertMsgLog("scr.name:" + scr.name + ", onTellMEWrapper args:" + args);
        if (onTellMEWrapperCreditError(args) !== "ok")
          if (onTellMEWrapperSecondPINProcess(args) !== "ok")
            scr.nextScreen(requestResult, [args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  function setLabelWarning() {
    if (!m_ATMFunctions.printer) {
      scr.setLabelJson({name: "wait_warning_l", value: getLangText("zsf_no_receipt")});
      scr.setImage("wait_warning_i", "../../graphics/icon_warning.svg", "");
    } else {
      scr.setLabelJson({name: "wait_warning_l", value: " "});
      scr.setImage("wait_warning_i", "", "");
    }
  }

  function addBottomLayerElements() {
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if (!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if (!m_session.ownCard)
      flagPhoneChange = false;
    else if (typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg", "../../graphics/BG_blur.jpg", "");
    scr.setLabel("card", m_CardIcon.value, m_CardIcon.ext);
  }

  addBottomLayerElements();
  scr.setTimeout('0', "", onButtonEmpty);
  scr.setWait(true, getLangText('wait_for_answer'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
  setLabelWarning();
  if (type === "pinenter") {
    scr.render("main_menu");
    checkAndGoToPinOrNcf();
  }
  else {
    scr.render("zsf_popup");
    callSupport(m_session.serviceName + "&BufferB=" + m_session.zsfcredit.account);
  }
};
var zsfDepositInfo = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTellMEWrapper = function(args){
    switch(args) {
      case "credit_curr_minus":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoCurr, "minus");
        break;
      case "credit_curr_plus":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoCurr, "plus");
        break;
      case "credit_all":
        parseZSFInfo();
        scr.nextScreen(zsfCreditInfoAll);
        break;
      case "wait_request": break;
      case "request_ok":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperSecondPINProcess(args) !== "ok")
          scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  function setLabelWarning(){
    /*if(!m_ATMFunctions.printer) {
			scr.setLabelJson({name: "warning_l", value: getLangText("zsf_no_receipt")});
			scr.setImage("warning_i", "../../graphics/icon_warning.svg", "");
		}
		else */{
      scr.setLabelJson({name: "warning_l", value: " "});
      scr.setImage("warning_i", "", "");
    }
  }
  var onButtonTransfer = function(someArgs){
    if(typeof m_session.second != "undefined" && m_session.second)
      scr.nextScreen(zsfDepositRequestPay, "pinenter");
    else
      scr.nextScreen(zsfDepositRequestPay);
  };
  var onButtonClear = function(someArgs){
    alertMsgLog(' '+scr.name+" onButtonClear");
    m_session.zsfcredit.account = "";
    inpObj.text = "";
    scr.setInputJson(inpObj, onInput);
  };
  function onButtonReturn() {
    scr.nextScreen(zsfDepositInput);
  }
  var onInput = function(someArgs){
    alertMsgLog(' '+scr.name+' onInput args '+someArgs);
    var pKey = "", help;
    if(someArgs && someArgs.constructor === Array && someArgs.length > 0) {
      if(typeof someArgs[1] == 'undefined')
        m_session.zsfcredit.amount = parseFloat(someArgs.replace(',', '.')).toFixed(2);
      else {
        pKey = someArgs[0];
        m_session.zsfcredit.amount = parseFloat((someArgs[1]).replace(',', '.')).toFixed(2);
      }
    }
    else
      m_session.zsfcredit.amount = 0.0;
    if(isNaN(m_session.zsfcredit.amount))
      m_session.zsfcredit.amount = 0.0;
    if (m_session.zsfcredit.amount != 0.0) {
      buttonObjContinue.enable = true;
      scr.setButtonJson(buttonObjContinue, onButtonTransfer);
      window.external.exchange.RefreshScr();
    }
    else {
      buttonObjContinue.enable = false;
      scr.setButtonJson(buttonObjContinue, onButtonTransfer);
      window.external.exchange.RefreshScr();
    }
    inpObj.text = m_session.zsfcredit.amount.toString();
    alertMsgLog("Amount Input: "+m_session.zsfcredit.amount);
  };
  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }
  addBottomLayerElements();
  setLabelWarning();
  m_session.zsfcredit.amount = 0;
  var inpObj = {name:"phone", text:m_session.zsfcredit.amount, mask:"", hint:"", type:"amount",
    maxLength: 9, visible: true, enable: true, validate:true};
  scr.setInputJson(inpObj, onInput);
  scr.setImage("info", "../../graphics/icon_information.svg", "");
  scr.setLabelJson({name:"title", value: getLangText("zsf_amount_enter_title")});
  //alert(m_session.zsfinfo.balance);
  scr.setImage("info", "../../graphics/icon_information.svg", "");
  scr.setLabelJson({name:"comment1", value: getLangText("zsf_deposit_balance")+
      AddSpace(m_session.zsfinfo.balance)+getLangText("zsf_curr")});
  scr.setLabelJson({name:"currency", value: getLangText("zsf_curr")});
  scr.setButtonJson({name:"cancel", text:getLangText("settingMenu_return"),
    enable:true,visible:true, ext:{icon:""}}, onButtonReturn);
  scr.setButtonJson({name:"Clear", text:getLangText("button_delete"),
    enable:true,visible:true, ext:{icon:""}}, onButtonClear);
  var buttonObjContinue = {name:"continue", text:getLangText("button_send"),
    enable:false,visible:true, ext:{icon:"",themes:['green']}};
  scr.setButtonJson(buttonObjContinue, onButtonTransfer);
  scr.setTimeout(m_session.timePeriod.toString(), "", onTimeout);
  scr.render("zsf_popup_amount");
};
var zsfDepositRequestPay = function(type){
  var onError =  function () {
    scr.nextScreen(msg_err);
  };
  scr.addOnError(onError);

  var onTellMEWrapper = function(args)
  {
    var help = "";
    switch(args) {
      case "wait_data_chip": break;
      case "wait_request": break;
      case "credit_request_good":
        scr.nextScreen(requestResult, ['ok', m_session.serviceName]);
        break;
      case "request_ok":
        m_session.zsfcredit = "";
        scr.nextScreen(serviceSelect);
        break;
      case "wait": break;
      default:
        alertMsgLog("scr.name:"+scr.name+", onTellMEWrapper args:"+args);
        if(onTellMEWrapperCreditError(args) !== "ok")
          if (onTellMEWrapperSecondPINProcess(args) !== "ok")
            scr.nextScreen(requestResult,[args]);
        return;
    }
  };
  scr.addCall("TellMEWrapper", onTellMEWrapper);

  function setLabelWarning(){
    if(!m_ATMFunctions.printer) {
      scr.setLabelJson({name: "wait_warning_l", value: getLangText("zsf_no_receipt")});
      scr.setImage("wait_warning_i", "../../graphics/icon_warning.svg", "");
    }
    else {
      scr.setLabelJson({name: "wait_warning_l", value: " "});
      scr.setImage("wait_warning_i", "", "");
    }
  }
  function addBottomLayerElements(){
    setBalanceAndPrintButtons(balanceShowReq, balancePrintNeed);
    scr.setButton("help", getLangText("button_help"), false, false, '{"icon": "../../graphics/icon_help.svg"}', onButtonEmpty);
    var settingsFlag = true, flagPinChange = true, flagPhoneChange = true;
    if(!!m_session.fitObj && m_session.fitObj.formfactor === "nfctoken")
      flagPinChange = false;
    if(!m_session.ownCard)
      flagPhoneChange = false;
    else if(typeof m_session.fitObj !== "undefined" && m_session.fitObj.fitType === "gru")
      flagPhoneChange = false;
    settingsFlag = flagPinChange || flagPhoneChange;

    scr.setButton("settings", getLangText("button_mini_statement"), true,
      miniStatementEnabled(), '{"icon": "../../graphics/mini-statement.svg"}', onButtonEmpty);
    scr.setButton("receipt", getLangText("button_settings"), true, settingsFlag,
      '{"icon": "../../graphics/icon_settings.svg"}', onButtonEmpty);
    scr.setButton("credit", getLangText("button_zsf_credit"), true, true,
      '{"icon": "../../graphics/icon_credit.svg"}', onButtonEmpty);
    scr.setButton("contribution", getLangText("button_zsf_contribute"), true, true,
      '{"icon": "../../graphics/icon_deposit.svg"}', onButtonEmpty);

    scr.setButtonJson(m_session.jsonObj.buttonMainMenuCancel.elementObject, onButtonEmpty);

    scr.setImage("bg","../../graphics/BG_blur.jpg","");
    scr.setLabel("card",m_CardIcon.value, m_CardIcon.ext);
  }

  m_session.second = true;
  if (type === "pinenter"){
    scr.render("main_menu");
    checkAndGoToPinOrNcf();
  }
  else if(type === "afterpin"){
    callSupport(m_session.serviceName+"&finish=true"+
      "&BufferB="+m_session.zsfcredit.account+"&amount="+(m_session.zsfcredit.amount*100.0).toFixed(0).toString());
  }
  else {
    addBottomLayerElements();
    scr.setTimeout('0', "", onButtonEmpty);
    scr.setWait(true, getLangText('zsf_req_pay'), '{"icon": "../../graphics/icon-loader.svg","loader":"loader"}');
    setLabelWarning();
    scr.render("zsf_popup");
    callSupport(m_session.serviceName+"&finish=true"+
      "&BufferB="+m_session.zsfcredit.account+"&amount="+(m_session.zsfcredit.amount*100.0).toFixed(0).toString());
  }
};

function initScreens() {
  scr = new Screen(main,"");
  start = new Screen(start, "start");
  oos = new Screen(oos, "oos");

  timeoutScreen = new Screen(timeoutScreen, "timeoutScreen");

  main = new Screen(main,"main");
  cardInserted = new Screen(cardInserted,"cardInserted");


  serviceSelect = new Screen(serviceSelect, "serviceSelect");
  serviceSelectCash = new Screen(serviceSelectCash, "serviceSelectCash");
  historyCheque = new Screen(historyCheque, "historyCheque");
  specCancelWait = new Screen(specCancelWait, "specCancelWait");
  cashin = new Screen(cashin, "cashin");
  pin = new Screen(pin, "pin");
  msg_err = new Screen(msg_err, "msg_err");
  msgResult = new Screen(msgResult,"msgResult");
  requestResult = new Screen(requestResult,"requestResult");
  depositSelectAdjunctionFrom = new Screen(depositSelectAdjunctionFrom,"depositSelectAdjunctionFrom");
  depositSelectAdjunctionCurrency = new Screen(depositSelectAdjunctionCurrency,"depositSelectAdjunctionCurrency");
  depositSelectAdjunctionMyCard = new Screen(depositSelectAdjunctionMyCard,"selectAdjunctionCard");
  depositSelectAdjunctionAnotherCard = new Screen(depositSelectAdjunctionAnotherCard,"depositSelectAdjunctionAnotherCard");
  helpMenu = new Screen(helpMenu,"helpMenu");
  settingsMenu = new Screen(settingsMenu,"settingsMenu");
  settingsChangePin = new Screen(settingsChangePin,"settingsChangePin");
  settingsSIM = new Screen(settingsSIM,"settingsSIM");
  settingsInternetBank = new Screen(settingsInternetBank,"settingsInternetBank");
  settingsCardRequisites = new Screen(settingsCardRequisites,"settingsCardRequisites");
  settingsCardLimits = new Screen(settingsCardLimits,"settingsCardLimits");
  transferMenu = new Screen(transferMenu,"transferMenu");
  transferChooseIdType = new Screen(transferChooseIdType,"transferChooseIdType");
  transferToCard = new Screen(transferToCard,"transferToCard");
  transferToSchet = new Screen(transferToSchet,"transferToSchet");
  transferToCompany = new Screen(transferToCompany,"transferToCompany");
  transferCardInput = new Screen(transferCardInput,"transferCardInput");
  transferRequisitesInput = new Screen(transferRequisitesInput,"transferRequisitesInput");
  transferInputAmount = new Screen(transferInputAmount,"transferInputAmount");
  transferSend = new Screen(transferSend,"transferSend");
  transferToCardRecipient = new Screen(transferToCardRecipient,"transferToCardRecipient");
  cashoutInputAmount = new Screen(cashoutInputAmount,"cashoutInputAmount");
  giveMoney = new Screen(giveMoney,"giveMoney");

  incass = new Screen(incass,"incass");

  ekassir = new Screen(ekassir,"ekassir");

  inputPhoneForEkassir = new Screen(inputPhoneForEkassir,"inputPhoneForEkassir");
  savePhoneForEkassir = new Screen(savePhoneForEkassir,"savePhoneForEkassir");
  inputAccountForCharity = new Screen(inputAccountForCharity,"inputAccountForCharity");
  cardlessMoneyInit = new Screen(cardlessMoneyInit,"cardlessMoneyInit");
  cardlessMoneyInsert = new Screen(cardlessMoneyInsert,"cardlessMoneyInsert");
  cardlessMoneyCheck = new Screen(cardlessMoneyCheck,"cardlessMoneyCheck");
  cardlessMoneyMenu = new Screen(cardlessMoneyMenu,"cardlessMoneyMenu");
  cardlessMoneyBack = new Screen(cardlessMoneyBack,"cardlessMoneyBack");
  cardlessMoneyFullBack = new Screen(cardlessMoneyFullBack,"cardlessMoneyFullBack");
  emulCardInserted = new Screen(emulCardInserted,"emulCardInserted");
  continueOrExit = new Screen(continueOrExit,"continueOrExit");

  nukk_destination_select = new Screen(nukk_destination_select,"nukk_destination_select");
  zsfAccountInput = new Screen(zsfAccountInput,"zsfAccountInput");
  zsfCreditRequestInfo = new Screen(zsfCreditRequestInfo,"zsfCreditRequestInfo");
  zsfCreditInfoCurr = new Screen(zsfCreditInfoCurr,"zsfCreditInfoCurr");
  zsfCreditInfoAll = new Screen(zsfCreditInfoAll,"zsfCreditInfoAll");
  zsfCreditRequestPay = new Screen(zsfCreditRequestPay,"zsfCreditRequestPay");
  zsfCreditError = new Screen(zsfCreditError,"zsfCreditError");
  zsfDepositInput = new Screen(zsfDepositInput,"zsfDepositInput");
  zsfDepositRequestInfo = new Screen(zsfDepositRequestInfo,"zsfDepositRequestInfo");
  zsfDepositInfo = new Screen(zsfDepositInfo,"zsfDepositInfo");
  zsfDepositRequestPay = new Screen(zsfDepositRequestPay, "zsfDepositRequestPay");
  consoleScreen = new Screen(consoleScreen,"consoleScreen");
}
