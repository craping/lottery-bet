import Cookies from 'js-cookie'
import config from '@/config'
const { cookieExpires } = config

export const TOKEN_KEY = 'token'

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: cookieExpires || 1
  })
}

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}

export const delToken = () => {
  Cookies.remove(TOKEN_KEY);
}

/**
 * 匹配数据
 * @param {数据} data 
 * @param {*} argumentObj 
 */
export const filterAll = (data, argumentObj) => {
  return data.filter(d => {
    for (let argu in argumentObj) {
      if (d[argu] != null && d[argu].toUpperCase().includes(argumentObj[argu].toUpperCase()))
        return true;
    }
    return false;
  });
}

export const filter = (data, argumentObj) => {
  let res = data;
  let dataClone = data;
  for (let argu in argumentObj) {
    if (argumentObj[argu].length > 0) {
      res = dataClone.filter(d => {
        return d[argu].includes(argumentObj[argu]);
      });
      dataClone = res;
    }
  }
  return res;
}

/**
 * 获取content类型描述
 * @param {int} state 
 */
export const betStateDesc = (state) => {
  let desc = '等待开奖';
  switch (state) {
    case 1:
      desc = '已中奖';
      break
    case 2:
      desc = '未中奖';
      break
    case 3:
      desc = '等待开奖';
      break
    case 4:
      desc = '已撤销';
      break
  }
  return desc;
}

export const betStateType = (state) => {
  let desc = '等待开奖';
  switch (state) {
    case 1:
      desc = 'danger';
      break
    case 2:
      desc = 'default';
      break
    case 3:
      desc = 'success';
      break
    case 4:
      desc = 'primary';
      break
  }
  return desc;
}

export const showPositionDesc = (position) => {
  let desc = "冠军";
  if (position == 2){
    desc = "亚军";
  }
  return desc;
}

export const showDsDesc = (ds) => {
  let desc = "单";
  if (ds == 2){
    desc = "双";
  }
  return desc;
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split('?')[1].split('&')
  let paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

export const textareaToHtml = (txt) => {
  return txt.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');
}

export const htmlToTextarea = (html) => {
  return html.replace(/<br\s*\/?>/ig, "\n");
}

export const formatDate = (value) => {
  let date = new Date(parseInt(value));
  let y = date.getFullYear();
  let MM = date.getMonth() + 1;
  MM = MM < 10 ? ('0' + MM) : MM;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let s = date.getSeconds();
  s = s < 10 ? ('0' + s) : s;
  return y + '-' + MM + '-' + d + ' ' + h + ':' + m;
}