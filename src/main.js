import Vue from 'vue'
import axios from 'axios'
import service from '@/utils/request'
import ViewUI from 'view-design'
import App from './App'
import store from './store'
import router from './router'
import 'view-design/dist/styles/iview.css'
import './permission'
import request from "@/utils/request";
import api from "@/utils/api"

Vue.config.productionTip = false
Vue.use(ViewUI)

Vue.prototype.$axios = axios
Vue.prototype.$request = request
Vue.prototype.api = api
axios.defaults.baseURL = 'http://localhost:8088/achieve'

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
})
