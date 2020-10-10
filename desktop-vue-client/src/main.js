import Vue from 'vue'
// import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueRouter from 'vue-router'
import CreateEpisodePage from "@/pages/CreateEpisodePage";
import SearchPage from "@/pages/SearchEpisodePage";
import App from "@/App";
import LoginPage from "@/pages/LoginPage";

// import Vuex from 'vuex'
import LoginService from "./LoginService"
import PodcastService from "@/PodcastService";

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueRouter)


const rootUrl = ((u) => (u.endsWith('/')) ? u : u + '/')(process.env.VUE_APP_SERVICE_ROOT)
const loginService = new LoginService(rootUrl + 'token')
const podcastService = new PodcastService(rootUrl + 'podcasts', () => loginService.getUserToken())


function sortPodcastsByDateMostRecentFirst(results) {
  function dateIndex(dateStr) {
    return dateStr.split('T')[0]
  }

  results.sort((a, b) => dateIndex(a.date).localeCompare(dateIndex(b.date)))
  results.reverse()
  return results
}

const store = {

  service: {
    url: rootUrl
  },

  session: {
    token: null,
    username: null
  },

  async login(username, password) {
    this.session.token = await loginService.login(username, password)
    this.session.username = username.toLowerCase()
    return this.session.token
  },

  async getPodcasts() {
    return sortPodcastsByDateMostRecentFirst(await podcastService.getPodcasts())
  },

  async searchPodcasts(query) {
    return sortPodcastsByDateMostRecentFirst(await podcastService.searchPodcasts(query))
  }

}

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {path: '/create', component: CreateEpisodePage, meta: {authenticated: true}},
    {path: '/search', component: SearchPage, meta: {authenticated: true}},
    {path: '/login', component: LoginPage, meta: {authenticated: false}},
    {path: '/', component: LoginPage, meta: {authenticated: false}}
  ]
})


router.beforeEach((to, from, next) => {
  next ()
  if (to.matched.some(record => record.meta.authenticated && record.meta.authenticated === true)) {
    if (loginService.getUserToken() == null) {
      console.log('need to login!')
      console.log( next, ';', to, ';', from )
      next({
        path: '/login',
        query: {nextUrl: to.fullPath}
      })

    } //
    else {
      console.log('next...')
      next()
    }
  }
});


new Vue({router, data: store, render: h => h(App)}).$mount('#app')
