import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/index/index'
import navBar from '@/components/navBar.vue'
import Login from '@/views/login/index'
import menuClass from '@/views/menuClass/index'
import menu from '@/views/menu/index'
import order from '@/views/order/index'
import { getToken } from '@/utils/token'
const jwt = require('jsonwebtoken')
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: '导航',     
      component: navBar,
      children: [
        { path: 'index', component: order, name: '订单', meta: {requireAuth: true} },
        { path: 'menuClass', component: menuClass, name: '菜单分类', meta: {requireAuth: true} },
        { path: 'menulist', component: menu, name: '菜单列表', meta: {requireAuth: true} }
      ],
      meta: {requireAuth: true},
      redirect:'/index'
    },

    {
      path: '/login',
      name: '登陆',
      component: Login,
      meta: {requireAuth: false}
    },
    { path: '/*', redirect: '/index' }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log(to)
  if (to.matched.some(res => res.meta.requireAuth)) {// 判断是否需要登录权限
  if (getToken()) {// 判断是否登录
    jwt.verify(getToken(), 'jwt', (err, decode)=> {
      if (err) {  //  时间失效的时候 || 伪造的token
        alert('登陆已过期，请重新登陆')
        next({path: '/login',}) 
      } 
      else {
          next()
      }
    })
  } else {// 没登录则跳转到登录界面
   next({
   path: '/login',
  //  query: {redirect: to.fullPath}
   })
  }
  } else {
  next()
  }
 })

 export default router
