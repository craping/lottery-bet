
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
		case "ack_revoke":
			var n = notify("计划["+request.bet.code+"]"+request.bet.period+"期第["+request.bet.position+"]位撤销", {
				body:"["+request.bet.code+"] 撤销成功"
			}, 3000);
			console.log("撤销订单："+Plan.balance+"成功");
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
				token: User.getToken(),
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
						case 506:
							Store.remove("token");
							User.info = null;
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

User.getUserInfo(() => {
	console.log("%c初始化成功", "color:green");
	Syc.handling();
	notify("操作提示", { body: "自动计划已连接" }, 3000);
},() => {
	User.setToken(null);
	Plan.setLastBet(null);
});

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