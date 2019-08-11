import http from '@/libs/axios'
import config from '@/config'

export const sync = (token) => {
    return http.post("api/sync?format=sync", {
        token: token
    });
}

export const syncSetting = (token) => {
    http.post("setting/getSetting?format=json", {token: token}).then(response => {
        const data = response.data;
        if (!data.result) {
            console.log("同步用户配置信息成功");
            config.setting = data.data.info;
        } else {
            console.log(response.data);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

export const syncContacts = (token) => {
    $http.post("contact/getContacts?format=json", {token: token}).then(response => {
        const data = response.data;
        if (!data.result) {
            console.log("同步群列表成功");
            config.chatRooms = data.data.info;
        } else {
            console.log(data.msg);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

export const syncGlobalTimer = (token) => {
    http.post("timer/getTimers?format=json", {token: token}).then(response => {
        const data = response.data;
        if (!data.result) {
            console.log('同步全域定时消息设置成功');
            config.globalTimer = data.data.info.global;
        } else {
            console.log(data.msg);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

export const syncGlobalKeyWords = (token) => {
    http.post("keyword/getKeywords?format=json", {token: token}).then(response => {
        const data = response.data;
        if (!data.result) {
            console.log("同步全域关键字列表成功");
            config.globalKeyword = this.chatRoomKeyMap = data.data.info.global;
        } else {
            console.log(data.msg);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

export const handling = (token) => {
    sync(token).then(events => {
        console.log(events);
        events.data.forEach(msg => {
            console.log(msg.biz);
            console.log(msg.action);
            if (msg.biz == "SETTING" || msg.biz == "SWITCHS" || msg.biz == "TIPS" || msg.biz == "PERMISSIONS") {
                syncSetting(token);
            } else if (msg.biz == "CONTACT") {
                syncContacts(token);
            }
        });
        handling(token);
    }, () => {
        console.log("reject");
        handling(token);
    });
}