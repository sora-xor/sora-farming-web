import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Game from '@/views/Game.vue'
import NotAllowed from '@/views/NotAllowed.vue'
import geoUtil from '@/utils/geo-util'
import store from '@/store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Game',
    component: Game
  },
  {
    path: '/restricted',
    name: 'NotAllowed',
    component: NotAllowed
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach(async (to, from, next) => {
  await store.dispatch('loadConfiguration')
  const config = store.getters.configParams
  const location = await geoUtil.getUserLocation()
  const isRestricted = geoUtil.isUserLocationRestricted(location, config['restricted-locations'])

  if (to.name === 'NotAllowed' && !isRestricted) {
    return next({ name: 'Game' })
  }

  if (to.name === 'NotAllowed') return next()

  if (isRestricted) {
    return next({ name: 'NotAllowed' })
  }

  return next()
})

export default router
