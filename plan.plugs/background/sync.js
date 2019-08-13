var Sync = {
    connect:null,
    sync(){
        var deferred = $.Deferred();
        const me = this;
        me.connect = Web.ajax("api/sync", {
            timeout:35000,
            success: function (data) {
                deferred.resolve(data);
            },
            fail: function (data) {
                if(data.errcode == 504){
                    notify("提示", { body: "您的账号已被冻结，请联系管理员" });
                    console.log("提示", "您的账号已被冻结，请联系管理员");
                    return;   
                }
                if(data.errcode == 506){
                    notify("提示", { body: "当前账户已退出登录！" });
                    console.log("提示", "当前账户已退出登录！");
                    return;   
                }
                if(data.errcode == 507){
                    notify("提示", { body: "您的服务已到期，请联系管理员" });
                    console.log("提示", "您的服务已到期，请联系管理员");
                    return;   
                }
                deferred.reject();
                me.sync();
            },
            error: function(){
                deferred.reject();
                me.sync();
            }
        }, "sync");
        return deferred.promise();
    },
    handling(){
        const me = this;
        this.sync().then(events => {
            setTimeout(() => {
                events.forEach(msg => {
                    console.log(msg);
                    const data = msg.data;
                    try{
                        me.invokes[msg.biz][msg.action](data);
                    }catch(e){
                        console.error(e);
                    }
                })
            }, 0);
            this.handling();
        },() => {
            console.log("reject");
            this.handling();
        });
    },
    abort(){
        this.connect.abort();
    },
    invokes:{
        LOTTERY:{
            BET(data){
                if(!Plan.lastBet || Plan.lastBet.win != -1)
                    Plan.bet(data);
            },
            REVOKE(data){
                Plan.revoke();
            }
        },
        USER:{
            UPDATE(data){
                User.maxChase = data;
                User.chase = 0;
                Plan.setLastBet(null);
            },
            RESET(data){
                User.chase = 0;
                Plan.setLastBet(null);
            }
        }
    }
}