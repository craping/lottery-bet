
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.cmd) {
		case "notify":
			var nty = notify(request.title, request.options);
			break;
		case "ack_bet":
			// 投注成功消息
			Plan.setLastBet(request.bet);
			// Plan.balance = Plan.balance.sub(me.lastBet.prize);
			var n = notify("计划["+request.bet.code+"]"+request.bet.period+"期第["+request.bet.position+"]位投注", {
				body:"["+request.bet.code+"] 投注成功"
			}, 3000);
			console.log("当前余额："+Plan.balance);
			break;
		case "request":
			$.ajax({
				url: request.url,
				type: request.type,
				data: request.data,
				success: function(result) {
					sendResponse({result:"success", data: result});
				},
				error:function(XMLHttpRequest, textStatus, errorThrown){
					sendResponse({result:"error", data:[XMLHttpRequest, textStatus, errorThrown]});
				}
			});
			break;
		break;
	}
});


//chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if(tab.url.indexOf("www.55355aa.com") != -1){
//         chrome.pageAction.show(tabId);
//     }else{
//         chrome.pageAction.hide(tabId);
//     }
//});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	let site = Store.get("site");
	if(site){
		let urls = site.split("&")[1].split(",");
		urls.forEach((u, i) => {
			urls[i] = "*://"+u.trim()+"/*";
		});
		chrome.tabs.query({url:urls}, function(tabs){
			if(!tabs.length){
				if(Store.get("start")){
					stop();
				}
			}
		});
	}
});

var Web = {
	serverURL: "http://localhost/",
	// serverURL: "http://118.89.37.101:9527/",
	/* Common - Ajax request */
	ajax: function (method, param) {
		var cipher = Crypto.generateCipher();
		if (!param)
			param = {};
		var defaultParam = {
			param: {},
			type: "post",
			timeout: 20000,
			safe: false,
			data: {
				token: User.token,
			},
			url: Web.serverURL,
			success: function () { },
			fail: function () { },
			error: function () { }
		};
		$.extend(true, defaultParam, param);

		if (defaultParam.safe) {
			defaultParam.data = {
				encrypt_data: cipher.encrypt(JSON.stringify(defaultParam.data)),
				encrypt_source: "js",
				encrypt_flag: Crypto.encryptFlag,
			};
		}

		$.ajax({
			type: defaultParam.type,
			data: defaultParam.type == "get" ? defaultParam.data : JSON.stringify(defaultParam.data),
			async: defaultParam.async,
			timeout: defaultParam.timeout,
			url: defaultParam.url + method + "?format=json",
			contentType: "application/json",
			processData: false,
			dataType: "text",
			success: function (data) {
				if (param.safe) {
					data = decodeURIComponent(cipher.decrypt(data).replace(/\+/g, '%20'));
				}
				data = JSON.parse(data);
				if (!data.result) {
					if (defaultParam.success)
						defaultParam.success(data.data ? data.data : data, defaultParam.param);
				} else {
					switch (data.errcode) {
						case 504:
						case 507:
						case 508:
							if(Store.get("start")){
								stop();
							}
							break;
						case 506:
							Store.remove("token");
							User.token = null;
							User.userName = null;
							User.serverEnd = null;
							User.serverState = null;
							User.locked = null;
							break;
						default:
							break;
					}
					if (defaultParam.fail)
						defaultParam.fail(data, defaultParam.param);
					if(data.result == -1)
						console.log("%c服务器异常："+data.data.info, "color:red");
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				var status = XMLHttpRequest.status;
				if (status == 403) {
				}
				if (defaultParam.error)
					defaultParam.error(XMLHttpRequest, textStatus, errorThrown, defaultParam.param);
			}
		});
	}
};

var Plan = {
	lastBet:null,
	maxChase:5,
	balance:Big(1000),
	strategy:{
		odds:Big(8.99),
		play:"DS",
		price:Big(0.1)
	},
	bet(plan){
		const me = this;
		const {period, code, play, price, position} = plan;

		var bet = {
			period:period,
			play:play?play:me.strategy.play,
			position:position,
			code:code,
			price:price?price:me.strategy.price,
			chase:1,
			maxChase:me.maxChase
		};

		let singleOdds = me.strategy.odds.div(10);
		let oddsMap = {
			"DWD":me.strategy.odds,
			"DX":singleOdds.mul(2).toString(),
			"DS":singleOdds.mul(2).toString(),
			"LH":singleOdds.mul(2).toString(),
			"HZ":{},
			"HZDX":{
				"大":singleOdds.mul(90).div(40).toString(),
				"小":singleOdds.mul(90).div(50).toString()
			},
			"HZDS":{
				"单":singleOdds.mul(90).div(50).toString(),
				"双":singleOdds.mul(90).div(40).toString()
			},
			"HZ":{}
		};
		let odds = oddsMap[bet.play];
		if(Object.prototype.toString.call(odds) == "[object Object]")
			odds = odds[bet.code];

		bet.odds = odds;
		//倍数计算
		if(me.lastBet != null && !me.lastBet.pass){
			bet.multi = me.lastBet.multi * 2;
			bet.order = Big(me.lastBet.order).mul(2);
			bet.prize = Big(me.lastBet.prize).mul(2);
			bet.chase = me.lastBet.chase + 1;
		}else{
			bet.multi = parseInt(me.balance.div(Math.pow(2, me.maxChase) - 1).abs().mul(10));
			bet.order = me.strategy.price.mul(bet.code.length).mul(bet.multi);
			bet.prize = me.strategy.price.mul(odds).mul(bet.multi);
		}

		var sites = ["www.znvz806ubg.com",
		"www.qbqeqelab7com",
		"www.kjwpsj1406.com",
		"www.4bnqa9q351.com",
		"www.rkipm070dh.com",
		"www.q6g3osf1na.com"];

		if(sites){
			let urls = [];
			sites.forEach((u, i) => {
				urls[i] = "*://"+u.trim()+"/*";
			});
			chrome.tabs.query({url:urls}, function(tabs){
				if(!tabs.length){
					alert("未检测到有可投注页面");
				}else{
					chrome.tabs.update(tabs[0].id, {active:true});
					chrome.tabs.sendMessage(tabs.length?tabs[0].id: null, {
						cmd:"bet", 
						bet:bet
					}, function(response) {
						
					});
				}
			});
		}
	},
	prize(codes){
		let me = this;
		if(!codes || !me.lastBet || me.lastBet.period != parseInt(codes[0])){
			return true;
		}
		
		let win = false;
		let playNum = {
			"DX大":[6,7,8,9,10],
			"DX小":[1,2,3,4,5],
			"DS单":[1,3,5,7,9],
			"DS双":[2,4,6,8,10],
			"HZDX大":[12,13,14,15,16,17,18,19],
			"HZDX小":[3,4,5,6,7,8,9,10,11],
			"HZDS单":[3,5,7,9,11,13,15,17,19],
			"HZDS双":[4,6,8,10,12,14,16,18],
			"LH龙":[],
			"LH虎":[]
		}
		let betNum = playNum[me.lastBet.play+me.lastBet.code];
		if(!betNum)
			betNum = me.lastBet.code;
		let openNum = parseInt(codes[me.lastBet.position]);

		switch (me.lastBet.play) {
			case "HZ":
			case "HZDX":
			case "HZDS":
				openNum = parseInt(codes[1]) + parseInt(codes[2]);
			case "DX":
			case "DS":
			case "DWD":
				win = betNum.indexOf(openNum) != -1;
				break;
			case "LH":
				openNum = parseInt(codes[me.lastBet.position]) > parseInt(codes[11-me.lastBet.position])?"龙":"虎";
				win = me.lastBet.code == openNum;
				break;
			default:
				break;
		}

		if(win){
			let playName = {
				"DWD":"定位胆",
				"DX":"大小",
				"DS":"单双",
				"HZ":"和值",
				"HZDX":"和值大小",
				"HZDS":"和值单双",
				"LH":"龙虎"
			}
			me.lastBet.pass = true;
			updateLastBet();
			// me.balance = me.balance.add(me.lastBet.prize);
			console.log(
				"计划["+me.lastBet.code+"] "+playName[me.lastBet.play] +" 第["+me.lastBet.position+"]位中奖：%c+"+me.lastBet.prize+"%c 中[%c"+openNum+"%c]", 
				"color:#fff;background:red", "color:black", "color:red", "color:black");
			me.chase = 1;
		} else if(me.chase == me.maxChase){
			this.setLastBet(null);
			console.log("计划["+that.schemeCache.name+"]倍数重置");
			me.chase = 1;
		}else{
			me.lastBet.pass = false;
			updateLastBet();
			me.chase ++;
		}
	},
	
	setLastBet(bet){
		this.lastBet = bet;
		Store.set("lastBet", bet);
	},
	updateLastBet(){
		Store.set("lastBet", bet);
	}
}

/* Web.ajax("api/getPublicKey", {
	success: function (data) {
		Crypto.setRSAPublicKey(data.info.n);
		Crypto.encryptFlag = data.info.id;
		
		if (User.token) {
			User.getUserInfo(() => {
				console.log("%c初始化成功", "color:green");
				notify("操作提示", { body: "自动计划初始化成功" }, 3000);
			});
		} else {
			console.log("%c初始化成功", "color:green");
			notify("操作提示", { body: "自动计划初始化成功" }, 3000);
		}
	},
	fail: function (data) {
		console.log("%c初始化失败", "color:red");
		notify("操作提示", { body: "自动计划初始化失败" }, 3000);
	},
	error:function(){
		console.log("%c初始化失败", "color:red");
		notify("操作提示", { body: "自动计划初始化失败" }, 3000);
	}
}); */