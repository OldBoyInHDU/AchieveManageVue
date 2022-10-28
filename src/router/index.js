import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const commonRoutes = [
    {
        path: '/login',
        name: 'login',
        meta: { title: '登录' },
        component: () => import('../components/Login.vue'),
    },
    {
        path: '/other', // 点击侧边栏跳到一个单独的路由页面，需要定义，层级和其他顶级路由一样
        name: 'other',
        meta: { title: '单独的路由' },
        component: () => import('../views/Other.vue'),
    },
    {
        path: '/404',
        name: '404',
        meta: { title: '404' },
        component: () => import('../components/404.vue'),
    },
    { path: '/', redirect: '/home' },
]

// 本地所有的页面 需要配合后台返回的数据生成页面
export const asyncRoutes = {
    home: {
        path: 'home',
        name: 'home',
        meta: { title: '主页' },
        component: () => import('../views/Home.vue'),
    },
    techProject: {
        path: 'techProject',
        name: 'techProject',
        meta: { title: '科技项目' },
        component: () => import('../views/techinno/TechProject.vue'),
    },
    skillInno: {
        path: 'skillInno',
        name: 'skillInno',
        meta: { title: '技能创新' },
        component: () => import('../views/techinno/SkillInno.vue'),
    },
    qualityImprove: {
        path: 'qualityImprove',
        name: 'qualityImprove',
        meta: { title: '质量改进' },
        component: () => import('../views/techinno/QualityImprove.vue'),
    },
    paper: {
        path: 'paper',
        name: 'paper',
        meta: { title: '论文' },
        component: () => import('../views/techinno/Paper.vue'),
    },
    patent: {
        path: 'patent',
        name: 'patent',
        meta: { title: '专利' },
        component: () => import('../views/techinno/Patent.vue'),
    },
    softwareCopyright: {
        path: 'softwareCopyright',
        name: 'softwareCopyright',
        meta: { title: '软件著作权' },
        component: () => import('../views/techinno/SoftwareCopyright.vue'),
    },
    award: {
        path: 'award',
        name: 'award',
        meta: { title: '奖励荣誉' },
        component: () => import('../views/award/Award.vue'),
    },
    personTrain: {
        path: 'personTrain',
        name: 'personTrain',
        meta: { title: '人才培养' },
        component: () => import('../views/persontrain/PersonTrain.vue'),
    },
    cooperation: {
        path: 'cooperation',
        name: 'cooperation',
        meta: { title: '合作交流' },
        component: () => import('../views/cooperation/Cooperation.vue'),
    },
    studio: {
        path: 'studio',
        name: 'studio',
        meta: { title: '工作室设置' },
        component: () => import('../views/studio/Studio.vue'),
    },
    rules: {
        path: 'rules',
        name: 'rules',
        meta: { title: '规章制度' },
        component: () => import('../views/rules/Rules.vue'),
    },
    t1: {
        path: 't1',
        name: 't1',
        meta: { title: '表格' },
        component: () => import('../views/T1.vue'),
    },
    password: {
        path: 'password',
        name: 'password',
        meta: { title: '修改密码' },
        component: () => import('../views/Password.vue'),
    },
    msg: {
        path: 'msg',
        name: 'msg',
        meta: { title: '通知消息' },
        component: () => import('../views/Msg.vue'),
    },
    userinfo: {
        path: 'userinfo',
        name: 'userinfo',
        meta: { title: '用户信息' },
        component: () => import('../views/UserInfo.vue'),
    },
}

const createRouter = () => new Router({
    routes: commonRoutes,
})

const router = createRouter()

export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher
}

export default router
