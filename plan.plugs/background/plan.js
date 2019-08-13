var Plan = {
	lastBet:null,
	balance:Big(1),
	strategy:{
		odds:Big(9.95),
		play:"DS",
		price:Big(0.1)
	},
	bet(plan){
		const me = this;
		const {period, code, play, price, position} = plan;
		if(User.maxChase == 0){
			notify("操作提示", { body: "未配置计划" }, 3000);
			return;
		}

		var bet = {
			period:period,
			play:play?play:me.strategy.play,
			position:position,
			code:code,
			price:price?price:me.strategy.price,
			chase:User.chase,
			maxChase:User.maxChase,
			win:-1
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
		if(me.lastBet != null && me.lastBet.win == 0){
			bet.multi = me.lastBet.multi * 2;
			bet.order = Big(me.lastBet.order).mul(2);
			bet.prize = Big(me.lastBet.prize).mul(2);
			bet.chase = me.lastBet.chase + 1;
		}else{
			bet.multi = parseInt(me.balance.div(Math.pow(2, User.maxChase) - 1).abs().mul(10));
			for (let i = 0; i < User.chase; i++) {
				bet.multi = bet.multi * 2;
			}
			bet.order = me.strategy.price.mul(bet.code.length).mul(bet.multi);
			bet.prize = me.strategy.price.mul(odds).mul(bet.multi);
		}

		if(Lottery.sites){
			let urls = [];
			Lottery.sites.forEach((u, i) => {
				urls[i] = "*://"+u.trim()+"/*";
			});
			chrome.tabs.query({url:urls}, function(tabs){
				if(!tabs.length){
					alert("未检测到平台页面");
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
	open(){
		const me = this;
		let codes = Lottery.codes["xyft"];
		let openPeriod = codes?codes[0]:null;
		if(openPeriod && me.lastBet && me.lastBet.win == -1 && me.lastBet.period.split("-")[1] == openPeriod){
			me.prize(codes);
		}else{
			setTimeout(() => {
				me.open();
			}, 500);
		}
	},
	prize(codes){
		let me = this;
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
			me.lastBet.win = 1;
			updateLastBet();
			console.log(
				"计划["+me.lastBet.code+"] "+playName[me.lastBet.play] +" 第["+me.lastBet.position+"]位中奖：%c+"+me.lastBet.prize+"%c 中[%c"+openNum+"%c]", 
				"color:#fff;background:red", "color:black", "color:red", "color:black");
			User.chase = 0;
		} else if(User.chase == User.maxChase){
			me.lastBet.win = 0;
			this.setLastBet(null);
			console.log("到达最高期数");
			User.chase = 0;
		}else{
			me.lastBet.win = 0;
			updateLastBet();
		}
	},
	revoke(){
		if(Lottery.sites){
			let urls = [];
			Lottery.sites.forEach((u, i) => {
				urls[i] = "*://"+u.trim()+"/*";
			});
			chrome.tabs.query({url:urls}, function(tabs){
				if(!tabs.length){
					alert("未检测到平台页面");
				}else{
					chrome.tabs.update(tabs[0].id, {active:true});
					chrome.tabs.sendMessage(tabs.length?tabs[0].id: null, {
						cmd:"revoke"
					}, function(response) {
						
					});
				}
			});
		}
	},
	setLastBet(bet){
		this.lastBet = bet;
		Store.set("lastBet", bet);
	},
	updateLastBet(){
		Store.set("lastBet", this.lastBet);
	},

	ACK_BET(success){
		Web.ajax("bet/syncBetting", {
            data:{
				success:success
			}
        });
	},
	ACK_REVOKE(success){
		Web.ajax("bet/syncCancel", {
            data:{
				success:success
			}
        });
	}
}