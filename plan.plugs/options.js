var bgPage = chrome.extension.getBackgroundPage();
var vm;
var curScheme = {};
var constant = {
	lottery:{
		// "txffc":{
		// 	name:"腾讯分分彩",
		// 	ico:"fab fa-qq text-info",
		// 	info:"00:00-23:59（1440期）1分钟一期"
		// },
		"pk10":{
			name:"北京PK10",
			ico:"fas fa-flag-checkered text-dark",
			info:"09:07-23:57（179期）5分钟一期"
		}/* ,
		"cqssc":{
			name:"重庆时时彩",
			ico:"fas fa-award text-danger",
			info:"10:00-22:00（72期）10分钟一期，22:00-02:00（48期）5分钟一期"
		} */
	},
	defaultLottery:"pk10"
};

function alertWrapper(alert, text, time){
	var alert = $("#alert-"+alert);
	alert.removeClass("hide").find("span[name=text]").html(text);
	setTimeout(() => {
		alert.addClass("hide");
	}, time?time:3000);
}

(function() {

	$script('lib/jquery/jquery-3.3.1.min.js', 'jquery', function (){
		$script(['lib/bootstrap-4.1/js/popper.min.js', 'lib/bootstrap-4.1/js/bootstrap.min.js'], 'bootstrap');
		return $script('common.js', 'common');
	});

	$script('lib/vue/vue.js', 'vue');

	$script('lib/big.min.js', 'big');

	$script.ready(['jquery', 'vue', 'bootstrap', 'big', 'common'], function() {
		$("#user").load("options/user.html", {}, function(){
			// $script('options/user.js', 'user');
		});

		$("#general").load("options/general.html", {}, function(){
			$script('options/general.js', 'general');
		});

		$("#io").load("options/io.html", {}, function(){
			$script('options/io.js', 'io');
		});

		$("#scheme").load("options/scheme.html", {}, function(){
			$script('options/scheme.js', 'scheme');
		});
	});

	$script.ready(['general', 'io', 'scheme'], function() {
		vm = new Vue({
			el:"#app",
			data:{
				user:bgPage.User,
				schemes:Store.schemes.getAll(),
				curScheme:{},
				account:null,
				action:false,
				title:"用户："+bgPage.User.userName,
				forms:{
					schemeForm:{
						name:"",
						lottery:constant.defaultLottery
					},
					generalForm:{
						site:Store.get("site"),
						lotteryEnable:Store.get("lotteryEnable")
					},
					userForm:{
						oldPwd:"",
						newPwd:"",
						repeatPwd:"",
						isSubmit:false
					},
					change:false
				},
				historyPlan:[]
			},
			watch:{
				"forms.generalForm":{
					handler(val, oldVal){
						this.forms.change = true;
					},
					deep:true
				}
			},
			methods:{
				tab:function(type, name){
					switch (type) {
						case "action":
							this.action=true;
							this.title = name;
							break;
						case "user":
							this.action=false;
							this.title = name;
							break;
						case "scheme":
							this.action = false;
							this.curScheme = curScheme = bgPage.schemes[name];
							this.account = curScheme.Account;
							this.title = constant.lottery[curScheme.schemeCache.lottery].name+"："+name;
							curScheme.schemeCache.plan.lottery = curScheme.schemeCache.lottery;
							$("#searchLottery").val(curScheme.schemeCache.lottery);
							fillScheme();
							break;
					}
					if(name == "关于"){
						$("#tab_about").tab("show");
					}
				},
				newSchemeSubmit:function(e){
					let schemeName = this.forms.schemeForm.name;
					if (!schemeName || bgPage.schemes[schemeName]) {
						return;
					}

					let cache = {
						name:schemeName,
						lottery:this.forms.schemeForm.lottery,
						start:false,
						able:true,
						auto:true,
						plan: {
							lottery:this.forms.schemeForm.lottery,
							site: "",
							position: "*",
							play: "*",
							planType: "*",
							codeNum:"*",
							plan: ""
						},
						strategy: {
							money: 0,
							odds: 9.9,
							price: 2,
							maxChase: 10,
							chaseType: 1,
							minMulti: 1,
							maxMulti: 99999,
							profitLimit: 0,
							lossLimit: 0
						},
						account: {
							balance: 0,
							out: 0,
							highest: 0,
							lowest: 0
						},
					};
					Store.schemes.set(schemeName, cache);
					bgPage.schemes[schemeName] = new bgPage.Scheme(cache);
					$('#newSchemeModal').modal('hide');
					alertWrapper("success", "方案创建成功！");
					this.schemes = Store.schemes.getAll();
					this.$nextTick(function(){
						$("a[name="+schemeName+"]")[0].click();
						this.forms.schemeForm.name = "";
						this.forms.schemeForm.lottery = constant.defaultLottery;
					})
				},
				changeSchemeSubmit:function(e){
					let schemeName = this.forms.schemeForm.name;
					if (!schemeName || bgPage.schemes[schemeName]) {
						return;
					}
					this.curScheme.change(schemeName);
					this.schemes = Store.schemes.getAll();
					$('#changeSchemeModal').modal('hide');
					alertWrapper("success", "名称修改成功！");
					this.$nextTick(function(){
						$("a[name="+schemeName+"]")[0].click();
					})
				},
				removeSchemeSubmit:function(e){
					this.curScheme.destory();
					this.schemes = Store.schemes.getAll();
					$('#removeSchemeModal').modal('hide');
					$("a[name=general]")[0].click();
				},
				setAble:function(able){
					this.curScheme.setAble(able);
					this.$forceUpdate();
					alertWrapper("success", able?"方案已启用":"方案已禁用");
				},
				setAuto:function(auto){
					this.curScheme.setAuto(auto);
					this.$forceUpdate();
					alertWrapper("success", auto?"已设置为自动模式":"已设置为手工模式");
				},
				generalSubmit:function(e){
					Store.set("site", this.forms.generalForm.site);
					Store.set("lotteryEnable", this.forms.generalForm.lotteryEnable);
					this.forms.change = false;
					alertWrapper("success", "保存选项成功！");
				},
				cancel:function(e){
					this.forms.generalForm = {
						site:Store.get("site")
					}
					this.$nextTick(function(){
						this.forms.change = false;
					})
				},
				userSubmit:function(e){
					let userForm = this.forms.userForm;
					let me = this;
					if (!userForm.oldPwd || !userForm.newPwd || !userForm.repeatPwd) {
						return;
					}
					userForm.isSubmit = true;
					bgPage.User.changePwd(userForm.oldPwd, userForm.newPwd, userForm.repeatPwd, 
						function(data){
							$("#userForm").collapse('hide');
							alertWrapper("success", "操作成功！");
							$('#userForm').on('hidden.bs.collapse', function () {
								userForm.oldPwd = "";
								userForm.newPwd = "";
								userForm.repeatPwd = "";
								userForm.isSubmit = false;
							})
						},
						function(data){
							userForm.isSubmit = false;
							alertWrapper("danger", data.msg);
						}
					);
				}
			}
		})
	});
}).call(this);

