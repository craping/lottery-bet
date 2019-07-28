var bgPage = chrome.extension.getBackgroundPage();

$(function(){
	var sites = ["www.znvz806ubg.com",
		"www.qbqeqelab7com",
		"www.kjwpsj1406.com",
		"www.4bnqa9q351.com",
		"www.rkipm070dh.com",
		"www.q6g3osf1na.com"];
	
	new Vue({
		el:"#popup",
		data:{
			sites:sites,
			user:bgPage.User,
			forms:{
				loginForm:{
					login_name:"",
					login_pwd:"",
					isLogin:false
				}
			}
		},
		methods:{
			login:function(e) {
				if (!this.forms.loginForm.login_name || !this.forms.loginForm.login_pwd) {
					return;
				}
				let loginForm = this.forms.loginForm;
				loginForm.isLogin = true;
				let vue = this;
				Store.set("token", "data.info.token");
				loginForm.isLogin = false;
				bgPage.User = vue.user = {
					token:"data.info.token",
					userName:"Crap",
					regTime:1563635998330,
					serverEnd:1563635998330,
					locked:false
				};
				bgPage.Syc.sync();
				// bgPage.User.login(
				// 	loginForm.login_name, loginForm.login_pwd, 
				// 	function(data){
				// 		loginForm.isLogin = false;
				// 		console.log(data.info);
				// 		vue.user = data.info;
				// 	},
				// 	function(data){
				// 		loginForm.isLogin = false;
				// 		notify("操作提示", {body:data.msg}, 3000);
				// 	}
				// );
			},
			logout:function(e){
				let vue = this;
				bgPage.User.logout(
					function(data){
						console.log(data.msg);
						vue.user = {};
					},
					function(data){
						notify("操作提示", {body:data.msg}, 3000);
					}
				);
			},
			test:()=>{
				bgPage.Plan.bet({
					period:123,
					position:1,
					play:"DS",
					code:"单",
				});
			}
		}
	});

	$("#open-site").click(function(){
		$("#options").addClass("om-hidden");
		$("#site").removeClass("om-hidden");
	});
	$("#back-options").click(function(){
		$("#options").removeClass("om-hidden");
		$("#site").addClass("om-hidden");
	});
})

