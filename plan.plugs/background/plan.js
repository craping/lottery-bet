var Plan = {
	lastBet:null,
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
			maxChase:User.info.maxChase
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
			bet.multi = parseInt(me.balance.div(Math.pow(2, User.info.maxChase) - 1).abs().mul(10));
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
		} else if(me.chase == User.info.maxChase){
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