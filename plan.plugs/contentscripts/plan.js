var betQueue = [];
var rebate = "1800";
var lastOrder = "";


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	sendResponse("");
	console.log("收到消息");
	switch (request.cmd) {
		case "bet":
			console.log(request);
			betFYGG(request.bet, sendResponse);
			break
		case "revoke":
			console.log(request);
			revokeFYGG(request.bet, sendResponse);
			break
		default:
			break;
	}
});


function fireInput(el, value){
	var inputElement = el;
	var focusEvent = document.createEvent("HTMLEvents");
	focusEvent.initEvent("focus", true, true);
	inputElement.dispatchEvent(focusEvent);

	inputElement.value = value.toString();

	var keyupEvent = document.createEvent("HTMLEvents");
	keyupEvent.initEvent("keyup", true, true);
	inputElement.dispatchEvent(keyupEvent);

	var blurEvent = document.createEvent("HTMLEvents");
	blurEvent.initEvent("blur", true, true);
	inputElement.dispatchEvent(blurEvent);

	var inputEvent = document.createEvent("HTMLEvents");
	inputEvent.initEvent("input", true, true);
	inputElement.dispatchEvent(inputEvent);

	var changeEvent = document.createEvent("HTMLEvents");
	changeEvent.initEvent("change", true, true);
	inputElement.dispatchEvent(changeEvent);
}

(function ($) {
	$.fn.fire=function(e){  
	    var event = document.createEvent("HTMLEvents");
		event.initEvent(e, true, true);
		this[0].dispatchEvent(event);
	};
})(jQuery);

function login(){
	axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	axios.defaults.transformRequest = [function (data) {
		let ret = ''
		for (let it in data) {
			ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
		}
		return ret
	}];

	axios.all([getBalance(),  getRebate()])
  .then(axios.spread(function (res1, res2) {
	const balance = res1.data.useraccounts[0].balance;
	rebate = parseFloat(res2.data.defaultBetModel);

	console.log("余额："+balance);
	console.log("返点："+rebate);
	console.log("心跳开始");
	chrome.runtime.sendMessage({
		cmd:"ping",
		balance:balance
	});

	let timer = setInterval(() => {
		getBalance().then(function(res){
			chrome.runtime.sendMessage({
				cmd:"ping",
				balance:res.data.useraccounts[0].balance
			});
		}).catch(function(){
			
		})
	}, 5000);
  })).catch(function(){
	  setTimeout(() => {
		login();
	  }, 3000);
	
  });
}

chrome.runtime.sendMessage({
	cmd:"sites"
},function(response){
	const sites = response.sites;
	if(sites.includes(document.domain))
		login();
});

function getBalance(){
	return axios.post("/ct-data/front/dsFlush?timeStamp="+Date.now());
}
function getRebate(){
	return axios.post("/ct-data/lottery", {
		shortName: "xyftpks",
		rulecode: "bjpk10qian1"
	});
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}













function betFYGG(bet, sendResponse){
	let data;
	const model = {"1":"yuan", "0.1":"jiao", "0.01":"fen", "0.001":"li"};
	const rulecode = {
		"DWD":"bjpk10dwd",
		"DX":"bjpk10dx",
		"DS":"bjpk10ds",
		"LH":"lhd"
	}
	if(bet.play == "DWD"){
	} else {
		const pos = ["", "dy", "de", "ds"];
		const zu = {
			"大":["0"],
			"小":[null, "1"],
			"单":["0"],
			"双":[null, "1"]
		};
		lastOrder = Date.now()+"-"+guid().substr(0, 8).toUpperCase();
		data = {
			orderlist:JSON.stringify({
				lottery: "xyftpks",
				currExpect: bet.period.replace("-", ""),
				total: bet.order.toString(),
				ordercount: 1,
				itemcount: 1,
				currency: "rmb",
				items: {
					[lastOrder]: {
						total: parseFloat(bet.order),
						itemcount: 1,
						rulecode: rulecode[bet.play]+pos[bet.position],
						times: bet.multi,
						yjf: parseFloat(bet.price),
						mode: rebate,
						repoint: "0.0",
						balls: {
							zu: zu[bet.code]
						}
					}
				}
			}),
			userAccountType:""
		}
	}
	console.log(data);

	axios.post("/ct-data/userBets/buy", data).then(function(response){
		console.log(response);
		const data = response.data;
		if(data.sign){
			chrome.runtime.sendMessage({
				cmd:"ack_bet",
				bet:bet,
				success:true
			});
			chrome.runtime.sendMessage({
				cmd:"notify",
				title:"计划["+bet.code+"]"+bet.period+"期第["+bet.position+"]位",
				options:{body:"["+bet.code+"] 投注成功"}
			});
			console.log("%c方案["+bet.code+"]投注成功", "color:red");
		}else{
			chrome.runtime.sendMessage({
				cmd:"ack_bet",
				bet:bet,
				success:false
			});
			chrome.runtime.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:data.message}
			});
			console.log("投注失败，方案["+bet.code+"]"+data.message);
		}
	}).catch(function (error) {
		console.log(error);
		chrome.runtime.sendMessage({
			cmd:"ack_bet",
			bet:bet,
			success:false
		});
		chrome.runtime.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:error.message}
		});
		console.log("投注失败，方案["+bet.code+"]"+error.message);
	});
}

function revokeFYGG(order, sendResponse){

	axios.post("/ct-data/userBets/cancel", {
		billNo: lastOrder,
		type: "order",
	}).then(function(response){
		console.log(response);
		const data = response.data;
		if(data.sign){
			chrome.runtime.sendMessage({
				cmd:"ack_revoke",
				success:true
			});
			chrome.runtime.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:"撤单成功"}
			});
			console.log("%c撤单成功", "color:red");
		}else{
			chrome.runtime.sendMessage({
				cmd:"ack_revoke",
				success:false
			});
			chrome.runtime.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:"撤单失败，"+data.message}
			});
			console.log("撤单失败，"+data.message);
		}
	}).catch(function (error) {
		console.log(error);
		chrome.runtime.sendMessage({
			cmd:"ack_revoke",
			success:false
		});
		chrome.runtime.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:"撤单失败，"+error.message}
		});
		console.log("撤单失败，"+error.message);
	});
}









function betMYXTT(bet, sendResponse){
	const gameId = "22";
	let data;
	const model = {"1":"yuan", "0.1":"jiao", "0.01":"fen", "0.001":"li"};
	if(bet.play == "DWD"){
		let code = [];
		bet.code.forEach(n => {
			code.push(parseInt(n) < 10?"0"+n:""+n);
		});
		const poschooseName = ["", "第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八", "第九", "第十"];
	} else {
		const playName = {
			"DWD":"",
			"DX":"dxd",
			"DS":"dsd",
			"LH":"lhd"
		}
		data = JSON.stringify({ text: [{ 
			"lottery": "t6s300", 
			"issue": "", 
			"method": playName[bet.play]+bet.position, 
			"content": bet.code, 
			"model": model[bet.price], 
			"multiple": bet.multi, 
			"code": 1800, 
			"compress": false 
		}] });
		console.log(data);
	}
	chrome.runtime.sendMessage({
		cmd:"ack_bet",
		bet:bet
	});
	$.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/static-open-time",
		type: 'POST',
		cache: false,
		data: {name:"t6s300"},
		success: function (response) {
			if(response.issue){
				const issue = parseInt(response.issue.split("-")[1]);

			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			
		}
	})
	$.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/add-order",
		type: 'POST',
		cache: false,
		data: data,
		success: function (response) {
			if(response.error == 0){
				chrome.runtime.sendMessage({
					cmd:"ack_bet",
					bet:bet
				});
				console.log("%c方案["+bet.code+"]投注成功", "color:red");
			}else{
				chrome.runtime.sendMessage({
					cmd:"notify",
					title:"操作提示",
					options:{body:response.message}
				});
				console.log("投注失败，方案["+bet.code+"]"+response.message);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			const json = JSON.parse(XMLHttpRequest.responseText);
			chrome.runtime.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:json.msg}
			});
			console.log("投注失败，方案["+bet.code+"]"+json.msg);
		}
	})
}

function revokeMYXTT(order, sendResponse){
	$.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/search-order",
		type: 'POST',
		cache: false,
		data: {
			page: 0,
			size: 1
		},
		success: function (response) {
			if(response.error == 0 && response.data.totalCount > 0){
				$.ajax({
					url: "https://www.znvz806ubg.com/api/game-lottery/cancel-order",
					type: 'POST',
					cache: false,
					data: {billno:response.data.list[0].billno},
					success: function (response) {
						if(response.error == 0){
							chrome.runtime.sendMessage({
								cmd:"ack_bet",
								result:true
							});
						}else{
							chrome.runtime.sendMessage({
								cmd:"ack_bet",
								result:false
							});
						}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown){
						chrome.runtime.sendMessage({
							cmd:"ack_bet",
							result:false
						});
					}
				})
				
			}else{
				chrome.runtime.sendMessage({
					cmd:"ack_bet",
					result:false
				});
			}
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			
		}
	})
}