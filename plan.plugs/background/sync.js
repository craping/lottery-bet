var Syc = {
    sync(){
        var deferred = $.Deferred();
        const me = this;
        Web.ajax("api/sync", {
            timeout:35000,
            success: function (data) {
                deferred.resolve(data);
            },
            fail: function (data) {
                if(data.errcode == 506){
                    console.log("提示", "当前账户在其他地点登录！");
                    return;   
                }
                if(data.errcode == 507){
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
    invokes:{
        LOTTERY:{
            BET(data){
                Plan.bet(data);
            },
            REVOKE(data){
                
            }
        },
        USER:{
            UPDATE(data){
                Plan.maxChase = data;
                Plan.setLastBet(null);
            }
        }
    }
}