/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home },
  ]
})

router.beforeEach((to,from,next)=>{
  //to要去的路径 form哪个路径跳转过来 next 函数 放行  next() next('/login')强制跳转
  if (to.path==='/login') return next()
  const tokenStr=window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router