var User = {
	token:Store.get("token"),
	setToken(token){
		Store.set("token", token);
		this.token = token;
	},
	getToken(){
		return this.token?this.token:Store.get("token");
	},
	maxChase:0,
	chase:0,
	info:{},
    login:function(name, pwd, success, fail){
		const me = this;
        Web.ajax("user/login", {
			safe:false,
            data:{
                userName:name,
                userPwd:md5(pwd)
            },
            success:function(data){
				Plan.setLastBet(null);
				me.setToken(data.info.token);
				me.info = data.info;
				me.maxChase = parseInt(data.info.periods);
				me.chase = parseInt(data.info.nowPeriods);
				Lottery.start();
				Sync.handling();
				Plan.open();

                if(success)
                    success(data.info);
            },
            fail:function(data){
                if(fail)
                    fail(data);
            }
        });
        
    },
    logout:function(success, fail){
        Web.ajax("user/logout", {
            success:function(data){
				Plan.setLastBet(null);
				Lottery.stop();
				Sync.abort();
                User.info = null;
                if(success)
                    success();
            },
            fail:function(data){
                alert(data.msg);
                if(fail)
                    fail(data);
            }
        });
	},
	ping(request){
		request.chase = this.chase;
		if(this.token)
			Web.ajax("user/heartbeat", {data:request});
	},
    getUserInfo:function(success, fail){
		const me = this;
		Web.ajax("user/userInfo", {
			success:function(data){
				User.info = data.info;
				me.maxChase = parseInt(data.info.periods);
				Lottery.start();
				Sync.handling();
				Plan.open();

				if(success)
					success(data.info);
			},
			fail:function(data){
				if(fail)
					fail(data);
			},
			error:function(){
				if(fail)
					fail();
			}
		});
	},
	changePwd:function(oldPwd, newPwd, repeatPwd, success, fail){
		Web.ajax("user/changePwd", {
			safe:true,
			data:{
				old_pwd:md5(oldPwd),
				new_pwd:md5(newPwd),
				confirm_pwd:md5(repeatPwd)
			},
			success:function(data){
				if(success)
                    success(data);
			},
			fail:function(data){
				if(fail)
                    fail(data);
			}
		});
	}
}