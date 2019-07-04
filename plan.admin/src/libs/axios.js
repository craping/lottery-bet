import axios from 'axios';
import router from '../router'
import { getToken } from '@/libs/util'

var http = axios.create({
    baseURL: '/api/',
    //baseURL : 'http://127.0.0.1:80/',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    // 超时时间120s
    timeout: 120 * 1000,
    validateStatus(status) {
        return true
    }
})

// http request 拦截器
http.interceptors.request.use(
    config => {
        // 在post请求发送出去之前，对其进行编码
        // if (config.method === 'post') {
        //     config.data = JSON.stringify(config.data);
        // }
        const token = getToken();
        if (token) {
            config.data.token = token;
        } else {
            console.log("管理员登录已过期");
        }
        return config;
    },
    err => {
        console.error("请求失败：" + err);
        return Promise.reject(err);
    });

// http response 拦截器
http.interceptors.response.use(
    response => {
        if (response.data.result != "0" && response.data.errcode == "506") {
            console.log(response);
            router.push({
                path: '/login',
                query: { redirect: router.currentRoute.fullPath } //从哪个页面跳转
            })
        }
        return response;
    },
    error => {
        console.error("响应失败：" + err);
        if (error.response) {
            console.log("请求错误");
            console.log(error.response.status);
            switch (error.response.status) {
                case 401:
                    // store.dispatch('logout');
                    console.log("401");
                    break;
                case 404:
                    router.push('/Error/Error404');
                    break;
                case 500:
                    router.push('/Error/Error500');
            }
        }
        return Promise.reject(error);// 返回接口返回的错误信息
    });

export default http;