import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        isShowLoading: false, // 全局 loading
        // 左侧菜单栏数据
        menuItems: [
            {
                name: 'home', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'md-home', // icon类型
                text: '主页', // 文本内容
            },
            {
                size: 18,
                text: '门户首页设置',
                type: 'md-settings',
                children: [
                    {
                        size: 18,
                        type: 'md-images',
                        name: 'indexBanner',
                        text: '轮播图',
                        // hidden 属性 隐藏此菜单 可以通过在地址栏上输入对应的 URL 来显示页面
                        // hidden: true,
                    },
                    {
                        size: 18, // icon大小
                        type: 'ios-trophy', // icon类型
                        name: 'indexAward',
                        text: '奖励荣誉',
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-trending-up', // icon类型
                        name: 'indexTech',
                        text: '科技创新',
                    },
                    {
                        size: 18, // icon大小
                        type: 'ios-swap', // icon类型
                        name: 'indexCoope',
                        text: '合作交流',
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-person-add', // icon类型
                        name: 'indexPerson',
                        text: '人才培养',
                    }
                ],
            },
            {
                size: 18, // icon大小
                type: 'md-podium', // icon类型
                text: '工作室设置', //
                children: [
                    {
                        size: 18,
                        type: 'ios-home',
                        name: 'studio',
                        text: '工作室/领班人简介',
                        // hidden 属性 隐藏此菜单 可以通过在地址栏上输入对应的 URL 来显示页面
                        // hidden: true,
                    },
                    {
                        size: 18, // icon大小
                        type: 'ios-people', // icon类型
                        name: 'member',
                        text: '成员管理',
                    },
                ]
            },
            {
                size: 18,
                text: '科技创新',
                type: 'ios-paper',
                children: [
                    {
                        size: 18,
                        type: 'md-git-network',
                        name: 'techProject',
                        text: '科技项目',
                        // hidden 属性 隐藏此菜单 可以通过在地址栏上输入对应的 URL 来显示页面
                        // hidden: true,
                    },
                    {
                        size: 18, // icon大小
                        type: 'ios-hammer', // icon类型
                        name: 'skillInno',
                        text: '技能创新',
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-trending-up', // icon类型
                        name: 'qualityImprove',
                        text: '质量改进',
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-paper', // icon类型
                        name: 'paper',
                        text: '论文',
                    },
                    {
                        size: 18, // icon大小
                        type: 'ios-paper', // icon类型
                        name: 'patent',
                        text: '专利',
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-wifi', // icon类型
                        name: 'softwareCopyright',
                        text: '软件著作权',
                    },
                ],
            },
            {
                name: 'rules', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'md-clipboard', // icon类型
                text: '规章制度', //
            },
            {
                name: 'award', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'md-trophy', // icon类型
                text: '奖励荣誉', //
            },
            {
                name: 'personTrain', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'md-person-add', // icon类型
                text: '人才培养', //
            },
            {
                name: 'cooperation', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'md-swap', // icon类型
                text: '合作交流', //
            },
            {
                size: 18, // icon大小
                type: 'md-arrow-forward', // icon类型
                text: '工作室首页',
                url: 'https://www.baidu.com',
                isExternal: true, // 外链 跳到一个外部的 URL 页面
            },
/*            {
                name: 'other', // 要跳转的路由名称 不是路径
                size: 18, // icon大小
                type: 'ios-egg-outline', // icon类型
                text: '单独的路由', // 点击侧边栏跳到一个单独的路由页面，需要提前在 router.js 定义
            },
            {
                text: '二级菜单',
                type: 'ios-paper',
                children: [
                    {
                        type: 'ios-grid',
                        name: 't1',
                        text: '表格',
                        // hidden 属性 隐藏此菜单 可以通过在地址栏上输入对应的 URL 来显示页面
                        // hidden: true,
                    },
                    {
                        size: 18, // icon大小
                        type: 'md-arrow-forward', // icon类型
                        text: '外链',
                        url: 'https://www.baidu.com',
                        isExternal: true, // 外链 跳到一个外部的 URL 页面
                    },
                    {
                        text: '三级菜单',
                        type: 'ios-paper',
                        children: [
                            {
                                type: 'ios-notifications-outline',
                                name: 'msg',
                                text: '查看消息',
                            },
                            {
                                type: 'md-lock',
                                name: 'password',
                                text: '修改密码',
                            },
                            {
                                type: 'md-person',
                                name: 'userinfo',
                                text: '基本资料',
                            },
                            {
                                size: 18, // icon大小
                                type: 'md-arrow-forward', // icon类型
                                text: '外链',
                                url: 'https://www.baidu.com',
                                isExternal: true, // 外链 跳到一个外部的 URL 页面
                            },
                        ],
                    },
                ],
            },*/
        ],
    },
    mutations: {
        setMenus(state, items) {
            state.menuItems = [...items]
        },
        setLoading(state, isShowLoading) {
            state.isShowLoading = isShowLoading
        },
    },
})

export default store
