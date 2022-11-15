<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Select v-model="type" style="width:150px" placeholder="工作室/领办人" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">简介列表</Divider>
        <div class="table">
            <Button type="success" icon="md-cloud-upload" @click="register">简介上传</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <!--            简介文档登记modal-->
            <Modal
                v-model="registerModal"
                title="简介上传"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="工作室/领办人" required>
                        <Select v-model="formItem.type" style="width:150px" placeholder="工作室/领办人" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="简介文档" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            accept="application/pdf"
                            :action="actionURL">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
            <!--            查看modal-->
            <Modal
                v-model="showModal"
                title="简介查看"
                width="520"
                ok-text="确定"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="简介文档标题" required>
                        <Input v-model="resultItem.type" placeholder="工作室/领办人" readonly></Input>
                    </FormItem>
                    <divider orientation="center">附件下载</divider>
                    <FormItem label="简介文档" >
                        <Input v-model="resultItem.profileStoragePath" placeholder="简介文档" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.profileStoragePath)" >预览</Button>
                    </FormItem>
                </Form>
            </Modal>
            <div class="table-result" style="padding-top: 20px">
                <Table border :columns="form_header" :data="form_list_content" :loading="loading" height="600" ref="table">
                    <template slot-scope="{ row }" slot="name">
                        <strong>{{ row.name }}</strong>
                    </template>
                    <template slot-scope="{ row, index }" slot="action">
                        <Button type="primary" size="small" style="margin-right: 5px" @click="show(index)">查看</Button>
                        <Button type="warning" size="small" style="margin-right: 5px" @click="modify(index)">修改</Button>
                        <Button type="error" size="small" @click="remove(index)">删除</Button>
                    </template>
                </Table>
                <br>
                <Page :total="total" :current="page" @on-change="changePage" :page-size="pageSize" show-elevator/>
            </div>
        </div>

    </div>

</template>

<script>
import request from "@/utils/request";

export default {
    name: 'studio',
    data() {
        return {
            actionURL: '', // http://localhost:8080/achieve/studio/profileUpload
            typeList: [
                {
                    value: '工作室简介',
                    label: '工作室简介'
                },
                {
                    value: '领办人简介',
                    label: '领办人简介'
                },
            ],
            type: '',
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 登记modal
            showModal: false, // 查看modal
            // 简介文档登记表单
            formItem: {
                id: -1,
                type: '',
                profile: '',
                profileStoragePath: '',
            },
            resultItem: {
                type: '',
                profile: '',
                profileStoragePath: '',
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
                    title: '简介文档名称',
                    key: 'profile',
                },
                {
                    title: '简介类别',
                    key: 'type',
                },
                {
                    title: '存储路径',
                    key: 'profileStoragePath',
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
        }
    },
    methods: {
        reback() {
            this.$router.back()
        },
        async search() {
            let that = this
            await request.get(
                '/studio/getProfiles',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        type: that.type,
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
            that.type = ''
        },
        //简介文档登记
        register() {
            let that = this
            that.resetForm()
            that.registerModal = true
        },
        //导出数据
        exportData() {
            this.$refs.table.exportCsv({
                filename: '表格数据'
            });
        },
        handleSuccess (res, file) {
            console.log(res)
            let that = this
            that.formItem.profile = file.name
            that.formItem.profileStoragePath = res.data
        },
        handleRemove(file) {
            this.$refs.upload.clearFiles()
        },
        submit() {
            let that = this
            //判断必填项 规章简介文档类别 是否为空
            if(that.formItem.type === '' && that.formItem.type === null) {
                this.$Message.error('请选择简介文档类别！')
                return
            }
            let formData = new FormData()
            if(that.formItem.id != -1) {
                formData.append('id', that.formItem.id)
            }
            formData.append('type', that.formItem.type)
            formData.append('profile', that.formItem.profile)
            formData.append('profileStoragePath', that.formItem.profileStoragePath)

            request.post(
                '/studio/submitProfileInfo',
                formData,
                {
                    headers: {
                        'content-type': 'application/json',
                    }
                }
            ).then(
                res => {
                    console.log(res)
                    this.resetForm()
                    this.$Message.info('简介文档登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('简介文档登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.type = ''
            that.formItem.profile = ''
            that.formItem.profileStoragePath = ''
            this.$refs.upload.clearFiles()
        },
        ok() {

        },
        cancel() {

        },
        //下载文档
        downloadDoc(storagePath) {

            console.log(storagePath)
            if (storagePath === null || storagePath === '' || storagePath === 'null') {
                this.$Message.error('资料待补充')
            } else {
                // window.open('http://localhost:8080/achieve/filestore/' + storagePath, '_blank')
                window.open(this.api.FileStoreURL + storagePath, '_blank')
            }
        },
        show(index) {
            let that = this
            that.showModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/studio/getProfileById',
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
                    that.resultItem.type = res.data.type
                    that.resultItem.profile = res.data.profile
                    that.resultItem.profileStoragePath = res.data.profileStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('简介文档查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/studio/getProfileById',
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
                    that.formItem.type = res.data.type
                    that.formItem.profile = res.data.profile
                    that.formItem.profileStoragePath = res.data.profileStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('简介文档查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/studio/deleteProfileById',
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
                    this.$Message.success('简介文档删除成功！')
                }).catch(
                err => {
                    this.$Message.error('简介文档删除失败！请联系技术人员')
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
    },
    mounted() {
        //http://localhost:8080/achieve/studio/profileUpload
        this.actionURL = this.api.BaseURL + 'studio/profileUpload'
        // console.log(this.actionURL)
    }
}
</script>

<style>

</style>
