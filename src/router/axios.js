/**
 *
 * http配置
 *
 */

import axios from 'axios'
import router from '../router/index'
// import { getToken, setToken, removeToken } from '@/util/auth'
import { Message } from 'element-ui'
// import errorCode from '@/const/errorCode'
import NProgress from 'nprogress' // 页面加载时显示进度条
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/token'

// 超时时间
axios.defaults.timeout = 30000
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true
NProgress.configure({ showSpinner: false })// NProgress Configuration
// HTTPrequest拦截
axios.interceptors.request.use(config => {
  NProgress.start() // start progress bar
  if (config.url !== '/api/user/login') {
    if (!!getToken()) {
      config.headers['Authorization'] = getToken() // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
    } else {
      router.push({ path: '/login' })
    }
  }
  
  return config
}, error => {
  return Promise.reject(error)
})
// HTTPresponse拦截
axios.interceptors.response.use(data => {
  NProgress.done()
  return data
}, error => {
  NProgress.done()
  const errMsg = error.toString()
  console.log(errMsg)
  const code = errMsg.substr(errMsg.indexOf('code') + 5)
  Message({
    message: '未知错误',
    type: 'error'
  })

  if (parseInt(code) === 401) {
    store.dispatch('FedLogOut').then(() => {
      router.push({ path: '/login' })
    })
  }

  return Promise.reject(new Error(error))
})

export default axios
