import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CouponList from '@/pages/CouponList.vue'
import CouponForm from '@/pages/CouponForm.vue'

const routes = [
  {
    path: '/',
    redirect: '/coupons',
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/coupons',
    name: 'coupon-list',
    component: CouponList,
  },
  {
    path: '/coupons/new',
    name: 'coupon-new',
    component: CouponForm,
  },
  {
    path: '/coupons/:id/edit',
    name: 'coupon-edit',
    component: CouponForm,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
