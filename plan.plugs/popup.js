var bgPage = chrome.extension.getBackgroundPage();

$(function(){
	new Vue({
		el:"#popup",
		data:{
			sites:bgPage.Lottery.sites,
			user:bgPage.User.info,
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
				
				bgPage.User.login(
					loginForm.login_name, loginForm.login_pwd, 
					function(data){
						loginForm.isLogin = false;
						console.log(data);
						vue.user = data;
					},
					function(data){
						loginForm.isLogin = false;
						notify("操作提示", {body:data.msg}, 3000);
					}
				);
				return;
			},
			logout:function(e){
				let vue = this;
				bgPage.User.logout(
					function(data){
						bgPage.Sync.abort();
						vue.user = null;
					},
					function(data){
						notify("操作提示", {body:data.msg}, 3000);
					}
				);
			},
			test:()=>{
				bgPage.Plan.bet({
					period:"20190813-178",
					position:2,
					play:"DS",
					code:"双",
				});
			},
			test1(){
				bgPage.Plan.revoke();
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

