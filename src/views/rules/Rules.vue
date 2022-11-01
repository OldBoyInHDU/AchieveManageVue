<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Select v-model="type" style="width:150px" placeholder="制度类别" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">制度列表</Divider>
        <div class="table">
            <Button type="success" icon="md-cloud-upload" @click="register">制度上传</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <!--            制度登记modal-->
            <Modal
                v-model="registerModal"
                title="制度上传"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="规章制度" required>
                        <Select v-model="formItem.type" style="width:150px" placeholder="规章制度" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="制度文件" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            accept="application/pdf"
                            action="http://localhost:8080/achieve/rules/ruleUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
            <!--            查看modal-->
            <Modal
                v-model="showModal"
                title="制度查看"
                width="520"
                ok-text="提交"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="制度标题" required>
                        <Input v-model="resultItem.type" placeholder="请输入制度标题" readonly></Input>
                    </FormItem>
                    <divider orientation="center">附件下载</divider>
                    <FormItem label="制度文件" >
                        <Input v-model="resultItem.ruleStoragePath" placeholder="投稿审批单" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.ruleStoragePath)" >预览</Button>
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
    name: 'rules',
    data() {
        return {
            typeList: [
                {
                    value: '组织机构',
                    label: '组织机构'
                },
                {
                    value: '管理制度',
                    label: '管理制度'
                },
                {
                    value: '活动制度',
                    label: '活动制度'
                },
                {
                    value: '培训制度',
                    label: '培训制度'
                },
                {
                    value: '长期规划',
                    label: '长期规划'
                },
                {
                    value: '年度规划',
                    label: '年度规划'
                },

            ],
            type: '',
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 登记modal
            showModal: false, // 查看modal
            // 制度登记表单
            formItem: {
                id: -1,
                type: '',
                rule: '',
                ruleStoragePath: '',
            },
            resultItem: {
                type: '',
                rule: '',
                ruleStoragePath: '',
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
                    title: '制度名称',
                    key: 'rule',
                },
                {
                    title: '制度类别',
                    key: 'type',
                },
                {
                    title: '存储路径',
                    key: 'ruleStoragePath',
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
        dateRangeChange(date) {
            this.daterange = date;
        },
        statusDateChange(date) {
            this.formItem.statusDate = date
        },
        async search() {
            let that = this
            await request.get(
                '/rules/getRules',
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
        //制度登记
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
            that.formItem.rule = file.name
            that.formItem.ruleStoragePath = res.data
        },
        handleRemove(file) {
            this.$refs.upload.clearFiles()
        },
        submit() {
            let that = this
            //判断必填项 规章制度类别 是否为空
            if(that.formItem.type === '' && that.formItem.type === null) {
                this.$Message.error('请选择制度类别！')
                return
            }
            let formData = new FormData()
            if(that.formItem.id != -1) {
                formData.append('id', that.formItem.id)
            }
            formData.append('type', that.formItem.type)
            formData.append('rule', that.formItem.rule)
            formData.append('ruleStoragePath', that.formItem.ruleStoragePath)

            request.post(
                '/rules/submitRuleInfo',
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
                    this.$Message.info('制度登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('制度登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.type = ''
            that.formItem.rule = ''
            that.formItem.ruleStoragePath = ''
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
                '/rules/getRuleById',
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
                    that.resultItem.rule = res.data.rule
                    that.resultItem.ruleStoragePath = res.data.ruleStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('制度查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/rules/getRuleById',
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
                    that.formItem.rule = res.data.rule
                    that.formItem.ruleStoragePath = res.data.ruleStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('制度查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/rules/deleteRuleById',
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
                    this.$Message.success('制度删除成功！')
                }).catch(
                err => {
                    this.$Message.error('制度删除失败！请联系技术人员')
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
}
</script>

<style>

</style>
