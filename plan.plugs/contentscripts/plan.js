var betQueue = [];
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("收到消息");
	switch (request.cmd) {
		case "bet":
			console.log(request);
			betMYXTT(request.bet, sendResponse);
		case "revoke":
			console.log(request);
			revokeMYXTT(request.bet, sendResponse);
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
	chrome.extension.sendMessage({
		cmd:"ack_bet",
		bet:bet
	});
	/* $.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/static-open-time",
		type: 'POST',
		cache: false,
		data: {name:"t6s300"},
		success: function (response) {
			response.issue
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			
		}
	}) */
	$.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/add-order",
		type: 'POST',
		cache: false,
		data: data,
		success: function (response) {
			if(response.error == 0){
				chrome.extension.sendMessage({
					cmd:"ack_bet",
					bet:bet
				});
				console.log("%c方案["+bet.code+"]投注成功", "color:red");
			}else{
				chrome.extension.sendMessage({
					cmd:"notify",
					title:"操作提示",
					options:{body:response.message}
				});
				console.log("投注失败，方案["+bet.code+"]"+response.message);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			const json = JSON.parse(XMLHttpRequest.responseText);
			chrome.extension.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:json.msg}
			});
			console.log("投注失败，方案["+bet.code+"]"+json.msg);
		}
	})
}

function betMYXTT(order, sendResponse){
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
							chrome.extension.sendMessage({
								cmd:"ack_bet",
								result:true
							});
						}else{
							chrome.extension.sendMessage({
								cmd:"ack_bet",
								result:false
							});
						}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown){
						chrome.extension.sendMessage({
							cmd:"ack_bet",
							result:false
						});
					}
				})
				
			}else{
				chrome.extension.sendMessage({
					cmd:"ack_bet",
					result:false
				});
			}
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			
		}
	})
	/* $.ajax({
		url: "https://www.znvz806ubg.com/api/game-lottery/add-order",
		type: 'POST',
		cache: false,
		data: data,
		success: function (response) {
			if(response.error == 0){
				chrome.extension.sendMessage({
					cmd:"ack_bet",
					bet:bet
				});
				console.log("%c方案["+bet.code+"]投注成功", "color:red");
			}else{
				chrome.extension.sendMessage({
					cmd:"notify",
					title:"操作提示",
					options:{body:response.message}
				});
				console.log("投注失败，方案["+bet.code+"]"+response.message);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			const json = JSON.parse(XMLHttpRequest.responseText);
			chrome.extension.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:json.msg}
			});
			console.log("投注失败，方案["+bet.code+"]"+json.msg);
		}
	})
}


function betDingBo(bet, sendResponse, callback){
	const gameId = "22";
	let data;
	if(bet.play == "DWD"){
		const model = ["2", "0.2", "0.02"];
		let code = [];
		bet.code.forEach(n => {
			code.push(parseInt(n) < 10?"0"+n:""+n);
		});
		const poschooseName = ["", "第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八", "第九", "第十"];
		data = JSON.stringify({
			"turnNum": bet.period,
			"gameId": gameId,
			"totalMoney": bet.order,
			"content": [{
				"code": "922106101101",
				"cateName": "定位胆",
				"money": bet.price,
				"betInfo": code.toString(),
				"odds": Big(bet.odds).mul(2).toString(),
				"totalMoney": bet.order,
				"totalNums": bet.code.length,
				"rebate": 0,
				"multiple": bet.multi,
				"betModel": model.indexOf(bet.price),
				"poschoose": parseInt(bet.position)-1,
				"poschooseName": poschooseName[bet.position],
				"showContent": code+"("+poschooseName[bet.position]+")"
			}]
		})
	} else {
		const posName = ["", "冠军", "亚军", "第三名", "第四名", "第五名", "第六名", "第七名", "第八名", "第九名", "第十名", "", "冠亚军和"];
		const posCode = ["", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "", "101"]
		const playName = {
			"DWD":"",
			"DX":"大小",
			"DS":"单双",
			"LH":"龙虎"
		}
		const playCode = {
			"HZ":"101",
			"DWD":"101",
			"DS":"102",
			"HZDS":"102",
			"DX":"103",
			"HZDX":"103",
			"LH":"104"
		}
		data = JSON.stringify({
			"gameId": gameId,
			"turnNum": bet.period,
			"content": [{
				"code": gameId+posCode[parseInt(bet.position)]+playCode[bet.play],
				"betInfo": bet.code,
				"odds": bet.odds,
				"money": 1,
				"betModel": 0,
				"rebate": 0,
				"multiple": bet.order,
				"totalMoney": bet.order,
				"totalNums": 1,
				"cateName": posName[parseInt(bet.position)]+playName[bet.play]
			}]
		});
	}
	$.ajax({
		url: bet.play == "DWD"?"api/bet/betG":"/api/bet",
		type: 'POST',
		cache: false,
		contentType: "application/json",
		data: data,
		success: function (response) {
			chrome.extension.sendMessage({
				cmd:"ack_bet",
				bet:bet
			});
			console.log("%c方案["+bet.scheme+"]投注成功", "color:red");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			const json = JSON.parse(XMLHttpRequest.responseText);
			chrome.extension.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:json.msg}
			});
			console.log("投注失败，方案["+bet.scheme+"]"+json.msg);
		}
	})
}


function betXinBo(bet, sendResponse, callback){

	var current_issue = $("#current_issue").text();
	if(current_issue == (bet.period+"")){
		console.log("当前投注期："+current_issue);
		let m = ["2", "0.2", "0.02"];
		let play = {
			"DWD":"digital",
			"DX":"dxds",
			"DS":"dxds",
			"LH":"dxds",
			"HZ":"digital",
			"HZDX":"dxds",
			"HZDS":"dxds"
		};
		let code = [];
		bet.code.forEach(n => {
			code.push(parseInt(n) < 10?"0"+n:""+n);
		});
		let codes = ["","","","","","","","","",""];
		let desc = ["","","","","","","","","",""]
		codes[parseInt(bet.position) - 1] = code.join("&");
		desc[parseInt(bet.position) - 1] = code.join(" ");
		let data = {
			"lotteryid": 22,
			"flag": "save",
			"play_source": 1,
			"lt_issue_start": current_issue,
			"lt_total_nums": bet.code.length,
			"lt_total_money": bet.order,
			"lt_project": [{
				"type": play[bet.play],
				"methodid": "70601003",
				"rebate": 0,
				"codes": codes.join("|"),
				"nums": bet.code.length,
				"omodel": 1,
				"times": bet.multi,
				"money": bet.order,
				"mode": m.indexOf(bet.price),
				"desc": desc.join(","),
				"poschoose": ""
			}],
			"lt_trace_if": false,
			"lt_trace": {
				"lt_trace_stop": true,
				"lt_trace_money": 0,
				"lt_trace_issues": [],
				"lt_trace_if": false,
				"lt_trace_count": 0
			},
			"randomNum": Math.floor((Math.random() * 10000) + 1),
			"poschoose": []
		};
		console.log(data);
		$.ajax({
			dataType : "json",
			type: 'POST',
			url : "/?controller=game&action=play&curmid=22000",
			data : data,
			success:function(data){
				if(data.sError === 0){
					chrome.extension.sendMessage({
						cmd:"ack_bet",
						bet:bet
					});
					console.log("%c方案["+bet.scheme+"]投注成功", "color:red");
				} else {
					//返回错误重新投注
					console.log("网络问题方案["+bet.scheme+"]重新投注...");
					setTimeout(() => {
						betXinBo(bet, sendResponse);
					}, 500);
				}
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				console.log(XMLHttpRequest);
			}
		});
	}else if(!current_issue){
		chrome.extension.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:"未开盘"}
		});
	}else{
		chrome.extension.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:"已过投注期"}
		});
	}
}

var deliQueue = [];
var deliStart = false;
var version_number;
function DeLiInit(bet) {
	deliQueue.push(bet);
	if(!deliStart){
		deliStart = true;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.innerHTML = '$(function(){document.body.oncontextmenu = function() {return true;};})'
		document.body.appendChild(script);
		
		function init(){
			$.ajax({
				type: "POST",
				url: "ssaad416514f_3143/pk/order/list?&_=" + new Date().getTime() + "__ajax",
				data: {
					action: "ajax",
					play: "ballNO60",
					ball: ""
				},
				timeout: 35000,
				cache: true,
				success: function (data) {
					data = JSON.parse(data.split("êêê")[0]);
					if (data.data.success) {
						version_number = data.data.version_number;
						function start() {
							const bet = deliQueue.pop();
							if (bet) {
								DeLiBet(bet, function(){
									setTimeout(() => {
										start();
									}, 200);
								});
							} else {
								setTimeout(() => {
									start()
								}, 200);
							}
						}
						start();
					} else {
						setTimeout(() => {
							init();
						}, 1000);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					setTimeout(() => {
						init();
					}, 1000);
				}
			});
		}
		init();
	}
}

function DeLiBet(bet, callback){
	const integrate = {
		"DWD":9.707,
		"DX":1.942,
		"DS":1.942,
		"LH":1.942,
		"HZDX":{
			"大":2.03,
			"小":1.73
		},
		"HZDS":{
			"双":2.03,
			"单":1.73
		}
	};
	const play = {
		"DWD":0,
		"DX":1,
		"DS":2,
		"LH":3
	}
	const num = {
		"大":0,
		"小":1,
		"单":0,
		"双":1,
		"龙":0,
		"虎":1
	};

	let rate = integrate[bet.play];
	if(Object.prototype.toString.call(rate) == "[object Object]")
		rate = rate[bet.code];
	const singlePrice = Big(bet.order).div(bet.code.length);
	
	let t = [];
	if(Array.isArray(bet.code)){
		bet.code.forEach(n => {
			t.push("0"+play[bet.play]+(bet.position-1)+"|"+n+"|"+rate+"|"+singlePrice);
		});
	} else {
		t.push("0"+play[bet.play]+(bet.position-1)+"|"+num[bet.code]+"|"+rate+"|"+singlePrice);
	}
	
	let param = {
		t:t.join(";")+";",
		v:version_number
	};
	
	const timesnow = $("#timesnow").text();
	const timeclose = $("#timeclose").text();
	if(timesnow != bet.period.toString()){
		chrome.extension.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:"已过投注期"}
		});
		if(callback)
			callback();
		return;
	}
	if(timeclose == "00:00"){
		chrome.extension.sendMessage({
			cmd:"notify",
			title:"操作提示",
			options:{body:"未开盘"}
		});
		if(callback)
			callback();
		return;
	}

	$.ajax({
		type : "POST",
		url : "ssaad416514f_3143/pk/order/leftInfo/?post_submit&&_="+new Date().getTime()+"__ajax",
		data : param,
		timeout : 35000,
		cache : true,
		success:function(data){
			data = JSON.parse(data.split("êêê")[0]);
			if(data.state != 0){
				version_number = data.data.user.version_number;
				if(data.data.success){
					chrome.extension.sendMessage({
						cmd:"ack_bet",
						bet:bet
					});
					console.log("%c方案["+bet.scheme+"]投注成功", "color:red");
					if(callback)
						callback();
				} else {
					console.log("投注失败，方案["+bet.scheme+"] 重新投注...");
					setTimeout(() => {
						DeLiBet(bet, callback);
					}, 1000);
				}
			} else {
				chrome.extension.sendMessage({
					cmd:"notify",
					title:"操作提示",
					options:{body:"未开盘"}
				});
				if(callback)
					callback();
			}
			
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){
			console.log(XMLHttpRequest);
			console.log("投注失败，方案["+bet.scheme+"]...");
			chrome.extension.sendMessage({
				cmd:"notify",
				title:"操作提示",
				options:{body:XMLHttpRequest.responseText}
			});
			if(callback)
				callback();
		}
	});
}