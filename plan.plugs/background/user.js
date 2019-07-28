var User = {
    token:Store.get("token"),
    login:function(name, pwd, success, fail){
        Web.ajax("user/login", {
			safe:true,
            data:{
                login_name:name,
                login_pwd:md5(pwd)
            },
            success:function(data){
                Store.set("token", data.info.token);
                User.token = data.info.token;
				User.userName = data.info.userName;
				User.regTime = data.info.regTime;
                User.serverEnd = data.info.serverEnd;
                User.locked = data.info.locked;

                if(success)
                    success(data);
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
                Store.remove("token");
                User.token = null;
                User.userName = null;
                User.serverEnd = null;
                User.serverState = null;
                User.locked = null;
                if(success)
                    success(data);
            },
            fail:function(data){
                alert(data.msg);
                if(fail)
                    fail(data);
            }
        });
    },
    getUserInfo:function(callback){
		Web.ajax("user/getUserInfo", {
			success:function(data){
				User.userName = data.info.userName;
				User.regTime = data.info.regTime;
                User.serverEnd = data.info.serverEnd;
                User.locked = data.info.locked;
				if(callback)
					callback(data);
			},
			fail:function(data){
				if(callback)
					callback(data);
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
	},
	bet:function(bet){
		let play = {
			"DWD":"DWD",
			"DX":"DWD",
			"DS":"DWD",
			"HZ":"GYH",
			"HZDX":"GYHDX",
			"HZDS":"GYHDS",
			"LH":"LH"
		};
		Web.ajax("bet/betting", {
			data:{
				lottery_type:bet.lottery,
				bet_type:play[bet.play],
				period:bet.period,
				schema:bet.code.toString(),
				position:bet.position,
				amount:bet.order,
				rate:bet.odds
			},
            fail:function(data){
				setTimeout(() => {
					User.bet(bet);
				}, 500);
            }
        });
	}
}