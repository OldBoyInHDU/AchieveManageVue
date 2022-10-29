<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="title" placeholder="交流名称" style="width: 200px" clearable/>
            <Select v-model="type" style="width:150px; margin-left: 20px" placeholder="交流类型" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="author" placeholder="记录人" style="width: 150px; margin-left: 20px" clearable/>
            <DatePicker :value="daterange" format="yyyy-MM-dd" type="daterange" placeholder="选择日期" style="width: 200px; margin-left: 20px" @on-change="dateRangeChange" clearable></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">交流列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">交流记录</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <div class="table-result" style="padding-top: 20px">
                <Table border :columns="form_header" :data="form_list_content" :loading="loading" height="600" ref="table">
                    <template slot-scope="{ row }" slot="name">
                        <strong>{{ row.name }}</strong>
                    </template>
                    <template slot-scope="{ row, index }" slot="action">
                        <!--                        <Button type="primary" size="small" style="margin-right: 5px" @click="show(index)">查看</Button>-->
                        <Button type="warning" size="small" style="margin-right: 5px" @click="modify(index)">修改</Button>
                        <Button type="error" size="small" @click="confirm(index)">删除</Button>
                    </template>
                </Table>
                <br>
                <Page :total="total" :current="page" @on-change="changePage" :page-size="pageSize" show-elevator/>
            </div>
        </div>
        <div>
            <!--            交流记录-->
            <Modal
                v-model="registerModal"
                title="交流记录"
                width="800"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="交流标题" required>
                        <Input v-model="formItem.title" placeholder="请输入交流标题" ></Input>
                    </FormItem>
                    <FormItem label="交流类型" required>
                        <Select v-model="formItem.type" style="width:200px" placeholder="交流类型" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="记录人" required>
                        <Input v-model="formItem.author" placeholder="请输入记录人" ></Input>
                    </FormItem>
                    <FormItem label="交流日期" required>
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
                    <divider orientation="center">交流编辑</divider>
                    <div style="border: 1px solid #ccc; padding: 20px">
                        <Toolbar
                            style="border-bottom: 1px solid #ccc"
                            :editor="editor"
                            :defaultConfig="toolbarConfig"
                            :mode="mode"
                        />
                        <Editor
                            style="height: 300px; overflow-y: hidden;"
                            v-model="formItem.html"
                            :defaultConfig="editorConfig"
                            :mode="mode"
                            @onCreated="onCreated"
                        />
                    </div>
                </Form>
            </Modal>
            <Modal
                v-model="confirmModal"
                title="删除确认"
                @on-ok="remove()"
                ok-text="删除"
                @on-cancel="cancel">
                <p>确定删除《{{toDeleteDoc}}》交流吗？</p>
            </Modal>
        </div>
    </div>

</template>

<script>
import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import request from "@/utils/request";

export default Vue.extend({
    components: { Editor, Toolbar },
    data() {
        return {
            typeList: [
                {
                    value: '业外_外出交流',
                    label: '业外_外出交流'
                },
                {
                    value: '业外_接待交流',
                    label: '业外_接待交流'
                },
                {
                    value: '业内_外出交流',
                    label: '业内_外出交流'
                },
                {
                    value: '业内_接待交流',
                    label: '业内_接待交流'
                },
            ],
            title: '',
            type: '',
            author: '',
            daterange: [],
            //查询loading
            loading: false,
            registerModal: false,
            showModal: false,
            confirmModal: false,
            formItem: {
                id: -1,
                title: '',
                type: '',
                author: '',
                statusDate: '',
                html: ''
            },
            form_header: [
                {
                    title: '序号',
                    // key: 'id',
                    type: 'index',
                    width: 70,
                    render: (h, params) => h('span', {}, params.index + 1),
                },
                {
                    title: '交流标题',
                    key: 'title',
                },
                {
                    title: '交流类型',
                    key: 'type',
                },
                {
                    title: '记录人',
                    key: 'author',
                },
                {
                    title: '交流日期',
                    key: 'statusDate',
                },
                {
                    title: '更新时间',
                    key: 'updateDate',
                },
                {
                    title: '操作',
                    slot: 'action',
                    width: 200,
                    align: 'center',
                },
            ],
            form_list_content: [], // 当前展示的数据
            form_total_content: [], // 一次性请求的所有数据
            page: 1, // 当前页
            pageSize: 10, // 一页展示10条数据
            total: 0, // 数据总条数
            toDeleteDoc: '',
            //editor
            editor: null,
            // html: '', // formItem.html
            toolbarConfig: { },
            editorConfig: {
                placeholder: '请输入内容...',
                MENU_CONF: {
                    uploadImage: {
                        fieldName: 'file',
                        server: 'http://localhost:8088/achieve/uploadImg',
                        maxFileSize: 5 * 1024 * 1024, // 5M
                        maxNumberOfFiles: 10,
                        allowedFileTypes: ['image/*'],
                        timeout: 5 * 1000, // 5 秒
                        // onBeforeUpload: this.onBeforeUpload,
                        // onProgress: this.onProgress,
                        onSuccess: this.onSuccess,
                        onFailed: this.onFailed,
                        onError: this.onError,
                        customInsert: this.customInsert
                    }
                }
            },
            mode: 'simple', // or 'simple'
        }
    },
    methods: {
        onCreated(editor) {
            this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错

        },
        dateRangeChange(date) {
            this.daterange = date;
        },
        async search() {
            let that = this
            let dateList = this.daterange
            await request.get(
                '/cooperation/getCooperations',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        title: that.title,
                        type: that.type,
                        author: that.author,
                        startDate: dateList[0],
                        endDate: dateList[1],
                    },
                },
            ).then(
                res => {
                    console.log('success')
                    console.log(res)
                    that.form_total_content = res.data
                    that.form_list_content = that.form_total_content.slice(
                        (that.page - 1) * that.pageSize,
                        that.page * that.pageSize
                    )

                }).catch(
                err => {
                    console.log('error')
                    this.$Message.error('后台服务出问题，请联系技术人员')
                })

        },
        reset() {
            let that = this
            that.title = ''
            that.type = ''
            that.author = ''
            that.daterange = []
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.title = ''
            that.formItem.type = ''
            that.formItem.author = ''
            that.formItem.statusDate = ''
            that.formItem.html = ''
        },
        register() {
            this.resetForm()
            this.registerModal = true
        },
        //导出数据
        exportData() {
            this.$refs.table.exportCsv({
                filename: '表格数据'
            });
        },
        statusDateChange(date) {
            this.formItem.statusDate = date
        },
        handleSuccess(res, file) {
            let that = this
            let docStoragePath = res.data
            that.formItem.uploadList.push({
                fileName: file.name,
                storagePath: docStoragePath,
            })
        },
        handleRemove(file) {
            let that = this
            let tempFileList = that.formItem.uploadList
            that.formItem.uploadList.splice(tempFileList.indexOf(file), 1)
        },
        submit() {
            let that = this
            if(that.formItem.title === '' || that.formItem.title === null) {
                this.$Message.error('请输入交流标题！')
                return
            }
            if(that.formItem.type === '' || that.formItem.type === null) {
                this.$Message.error('请选择交流类型！')
                return
            }
            if(that.formItem.author === '' || that.formItem.author === null) {
                this.$Message.error('请输入记录人！')
                return
            }
            if(that.formItem.statusDate === '' || that.formItem.statusDate === null) {
                this.$Message.error('请输入交流日期！')
                return
            }
            /*if(that.formItem.uploadList.length < 1) {
                this.$Message.error('文件为空！请选择要上传的文件！')
                return
            }*/
            let formData = new FormData()
            if(that.formItem.id != -1) {
                formData.append('id', that.formItem.id)
            }
            formData.append('title', that.formItem.title)
            formData.append('type', that.formItem.type)
            formData.append('author', that.formItem.author)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('content', that.formItem.html)
            request.post(
                '/cooperation/submitCooperationInfo',
                formData,
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            ).then(
                res => {
                    console.log(res)
                    that.$Message.success('交流登记成功！')
                    // that.showUploadListFlag = false
                }
            ).catch(
                err => {
                    console.log(err)
                    that.$Message.error('交流登记失败，请联系技术人员')
                    // that.showUploadListFlag = false
                }
            )
        },
        cancel() {
            let that = this
            that.confirmModal = false
            this.$Message.info('已取消')
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/cooperation/getCooperationById',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        id: paramId
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    that.formItem.id = res.data.id
                    that.formItem.title = res.data.title
                    that.formItem.type = res.data.type
                    that.formItem.author = res.data.author
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.html = res.data.content
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('交流修改失败')
                }
            )
        },
        confirm(index) {
            let that = this
            that.confirmModal = true
            that.toDeleteDoc = that.form_list_content[index].title
            that.delDocIndex = index
            // that.remove(index)
        },
        remove() {
            let index = this.delDocIndex
            let paramId = this.form_list_content[index].id
            // let paramProj = this.toDeleteDoc
            this.form_list_content.splice(index, 1)
            request.delete(
                '/cooperation/deleteCooperationById',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        id: paramId,
                    },
                }
            ).then(
                res => {
                    this.$Message.success('交流删除成功！')
                }).catch(
                err => {
                    this.$Message.error('交流删除失败！请联系技术人员')
                }
            )
        },
        changePage(page) {
            let that = this
            if (page) {
                that.page = page
            }
            that.form_list_content = that.form_total_content.slice(
                (that.page - 1) * that.pageSize,
                that.page * that.pageSize
            )
        },
        // 上传之前触发
        onBeforeUpload(file) {
            // file 选中的文件，格式如 { key: file }
            return file
            // 可以 return
            // 1. return file 或者 new 一个 file ，接下来将上传
            // 2. return false ，不上传这个 file
        },

        // 上传进度的回调函数
        onProgress(progress) {
            // progress 是 0-100 的数字
            console.log('progress', progress)
        },

        // 单个文件上传成功之后
        onSuccess(file, res) {
            console.log(`${file.name} 上传成功`, res)
        },

        // 单个文件上传失败
        onFailed(file, res) {
            this.$Message.error('图片上传失败')
            console.log(`${file.name} 上传失败`, res)
        },

        // 上传错误，或者触发 timeout 超时
        onError(file, err, res) {
            this.$Message.error('图片上传失败')
            console.log(`${file.name} 上传出错`, err, res)
        },
        customInsert(res, insertFn) {
            // res 即服务端的返回结果
            // 从 res 中找到 url alt href ，然后插入图片
            insertFn(res.data.url, res.data.alt, res.data.href)
        },
    },
    mounted() {
        // 模拟 ajax 请求，异步渲染编辑器
        // setTimeout(() => {
        //     this.html = '<p>模拟 Ajax 异步设置内容 HTML</p>'
        // }, 1500)
    },
    beforeDestroy() {
        const editor = this.editor
        if (editor == null) return
        editor.destroy() // 组件销毁时，及时销毁编辑器
    },
})
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>

