var Lottery = {
	timer:null,
	sites:[],
	codes:{
		"txffc":null,
		"pk10":null,
		"cqssc":null,
		"xyft":null
	},
	getSites:function(success, fail){
		const me = this;
		Web.ajax("api/getWebSites", {
			success: function (data) {
				me.sites = data.info.split(",")
				if(success)
					success(data.info);

				console.log("%c初始化配置成功", "color:green");
				notify("操作提示", { body: "获取平台域名成功" }, 3000);
			},
			fail: function (data) {
				if(fail)
					fail(data);
				console.log("%c初始化配置失败", "color:red");
				notify("操作提示", { body: "获取平台域名失败" }, 3000);
			},
			error:function(){
				if(fail)
					fail();
				console.log("%c初始化配置失败", "color:red");
				notify("操作提示", { body: "获取平台域名失败" }, 3000);
			}
		});
	},
	getLastData:function(type){
		var url = {
			"txffc":"txffc",
			"pk10":"pk10",
			"cqssc":"shishicai",
			"xyft":"xyft"
		};
		var me = this;
		$.ajax({
			url:"https://www.1396j.com/"+url[type]+"/getawarddata?t="+Math.random(),
			type:"get",
			timeout:5000,
			success:function(data){
				if(data){
					var period = data.current.period;
					var result = data.current.result;
					var codes = (period+","+result).split(",");
					
					me.codes[type] = codes;
				}
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				console.log("获取开奖数据异常:"+errorThrown);
			}
		})
	},
	getOpenCaiLastData:function(type){
		var url = {
			"txffc":"txffc",
			"pk10":"bjpk10",
			"cqssc":"shishicai"
		};
		var me = this;
		$.ajax({
			url: "http://data.opencai.net/ob/?ob=" + url[type],
			type: 'get',
			dataType:"json",
			timeout:5000,
			success: function(ob) {
				let code = ob[url[type]];
				let rd = code.__.substr(146 - 142) + code.__.substr(0, 79 - 75);
				for (var m = 0; m < rd.length; m++)
					 code._[0].r = code._[0].r.replace(new RegExp(rd[m],"gm"), m);

				me.codes[type] = (code._[0].p+","+code._[0].r).split(",");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("获取开奖数据异常:"+errorThrown);
			}
		});
	},
	start:function(){
		var me = this;
		me.getLastData("xyft");
		me.timer = setTimeout(() => {
			me.start();
		}, 10000);
	},
	stop:function(){
		clearTimeout(this.timer);
	}
};