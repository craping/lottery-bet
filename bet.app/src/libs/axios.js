import axios from 'axios';
import { Toast } from 'vant'

var http = axios.create({
    //baseURL: '/api/',
    baseURL: 'http://127.0.0.1:80/',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    // 超时时间120s
    // timeout: 120 * 1000,
})

// http request 拦截器
http.interceptors.request.use(
    config => {
        //const token = _config.token;
        //console.log(config.data.token);
        //config.data.token = config.data.token + "_m";
        return config;
    },
    err => {
        Toast.fail("请求失败");
        console.error("请求失败：" + err);
        return Promise.reject(err);
    });

// http response 拦截器
http.interceptors.response.use(
    response => {
        // if (response.data.result != "0" && response.data.errcode == "506") {
        //     console.log(response);
        //     router.push({
        //         path: '/login',
        //         query: { redirect: router.currentRoute.fullPath } //从哪个页面跳转
        //     })
        // }
        return response;
    },
    error => {
        Toast.fail("响应失败");
        console.error("响应失败：" + error);
        return Promise.reject(error);// 返回接口返回的错误信息
    });

export default http;