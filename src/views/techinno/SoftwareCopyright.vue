<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="rightName" placeholder="软件名称" style="width: 200px" clearable/>
            <Input v-model="author" placeholder="著作权人" style="width: 150px; margin-left: 20px" clearable/>
            <Select v-model="status" style="width:150px; margin-left: 20px" placeholder="申报状态" clearable>
                <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="project" placeholder="所属项目" style="width: 150px; margin-left: 20px" clearable/>
            <DatePicker :value="daterange" format="yyyy/MM/dd" type="daterange" placeholder="选择日期" style="width: 200px; margin-left: 20px" @on-change="dateRangeChange" clearable></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">软件著作权列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">软著登记</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <!--            软著登记modal-->
            <Modal
                v-model="registerModal"
                title="软著登记"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="软著标题" required>
                        <Input v-model="formItem.rightName" placeholder="请输入软件名称" ></Input>
                    </FormItem>
                    <FormItem label="著作权人" required>
                        <Input v-model="formItem.author" placeholder="请输入著作权人" ></Input>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="formItem.project" placeholder="请输入该软著所属项目"></Input>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                        (申报/发证 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="formItem.status" type="button">
                            <Radio label="申报">申报</Radio>
                            <Radio label="发证">发证</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="登记申请表" >
                        <Upload
                            ref="upload1"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess1"
                            :on-remove="handleRemove1"
                            accept="application/pdf"
                            action="http://localhost:8080/achieve/techInno/rightUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="操作说明书" >
                        <Upload
                            ref="upload2"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess2"
                            :on-remove="handleRemove2"
                            accept="application/pdf"
                            action="http://localhost:8080/achieve/techInno/rightUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="软件源码" >
                        <Upload
                            ref="upload3"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess3"
                            :on-remove="handleRemove3"
                            accept="application/pdf"
                            action="http://localhost:8080/achieve/techInno/rightUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="软著扫描件" >
                        <Upload
                            ref="upload4"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess4"
                            :on-remove="handleRemove4"
                            accept="application/pdf"
                            action="http://localhost:8080/achieve/techInno/rightUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>

            <!--            查看modal-->
            <Modal
                v-model="showModal"
                title="软著登记"
                width="520"
                ok-text="提交"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="软件名称" required>
                        <Input v-model="resultItem.rightName" placeholder="请输入软著标题" readonly></Input>
                    </FormItem>
                    <FormItem label="著作权人" required>
                        <Input v-model="resultItem.author" placeholder="请输入软著作者" readonly></Input>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="resultItem.project" placeholder="请输入该软著所属项目" readonly></Input>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="resultItem.statusDate" @on-change="statusDateChange" readonly></DatePicker>
                        (投稿/发表 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="resultItem.status" type="button" disabled>
                            <Radio label="申报">申报</Radio>
                            <Radio label="发证">发证</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件下载</divider>
                    <FormItem label="登记申请表" >
                        <Input v-model="resultItem.appStoragePath" placeholder="登记申请表" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.appStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="操作说明书" >
                        <Input v-model="resultItem.manualStoragePath" placeholder="操作说明书" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.manualStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="软件源码" >
                        <Input v-model="resultItem.codesStoragePath" placeholder="软件源码" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.codesStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="软著扫描件" >
                        <Input v-model="resultItem.scanFileStoragePath" placeholder="软著扫描件" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.scanFileStoragePath)" >预览</Button>
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
    name: 'softwareCopyright',
    data() {
        return {
            statusList: [
                {
                    value: '申报',
                    label: '申报'
                },
                {
                    value: '发证',
                    label: '发证'
                },
            ],
            rightName: '',
            author: '',
            status: '',
            project: '',
            daterange: [],
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 登记modal
            showModal: false, // 查看modal
            // 文章登记表单
            formItem: {
                rightName: '',
                author: '',
                project: '',
                statusDate: '',
                status: '',
                application: '',
                appStoragePath: '',
                manual: '',
                manualStoragePath: '',
                codes: '',
                codesStoragePath: '',
                scanFile: '',
                scanFileStoragePath: '',
            },
            resultItem: {
                rightName: '',
                author: '',
                project: '',
                statusDate: '',
                status: '',
                application: '',
                appStoragePath: '',
                manual: '',
                manualStoragePath: '',
                codes: '',
                codesStoragePath: '',
                scanFile: '',
                scanFileStoragePath: '',
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
                    title: '软件名称',
                    key: 'rightName',
                },
                {
                    title: '著作权人',
                    key: 'author',
                },
                {
                    title: '所属项目',
                    key: 'project',
                },
                {
                    title: '申报状态',
                    key: 'status',
                },
                {
                    title: '申报/发表 日期',
                    key: 'statusDate',
                },
                {
                    title: '登记申请表',
                    key: 'application',
                },
                {
                    title: '操作说明书',
                    key: 'manual',
                },
                {
                    title: '软件源码',
                    key: 'codes',
                },
                {
                    title: '软著扫描件',
                    key: 'scanFile',
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
            let dateList = this.daterange
            await request.get(
                '/techInno/getRight',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        rightName: that.rightName,
                        author: that.author,
                        status: that.status,
                        project: that.project,
                        startDate: dateList[0],
                        endDate: dateList[1],
                    },
                },
            ).then(
                res => {
                    console.log(res)
                    that.form_total_content = res.data
                    that.form_list_content = that.form_total_content.slice(
                        (that.page - 1) * that.pageSize,
                        that.page * that.pageSize
                    )

                }).catch(
                err => {
                    console.log(err)
                    this.$Message.error('后台服务出问题，请联系技术人员')
                })

        },
        reset() {
            let that = this
            that.rightName = ''
            that.author = ''
            that.status = ''
            that.project = ''
            that.daterange = []
        },
        //软著登记
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
        handleSuccess1 (res, file) {
            console.log(res)
            let that = this
            that.formItem.application = file.name
            that.formItem.appStoragePath = res.data
        },
        handleRemove1(file) {
            // let fileList = this.$refs.upload1.fileList
            // this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1)
            this.$refs.upload1.clearFiles()
        },
        handleSuccess2 (res, file) {
            console.log(res)
            let that = this
            that.formItem.manual = file.name
            that.formItem.manualStoragePath = res.data
        },
        handleRemove2(file) {
            this.$refs.upload2.clearFiles()
        },
        handleSuccess3 (res, file) {
            console.log(res)
            let that = this
            that.formItem.codes = file.name
            that.formItem.codesStoragePath = res.data
        },
        handleRemove3(file) {
            this.$refs.upload3.clearFiles()
        },
        handleSuccess4 (res, file) {
            console.log(res)
            let that = this
            that.formItem.scanFile = file.name
            that.formItem.scanFileStoragePath = res.data
        },
        handleRemove4(file) {
            this.$refs.upload4.clearFiles()
        },
        submit() {
            let that = this
            //判断必填项 软著名称 和 发明人 是否为空
            if(that.formItem.rightName === '' && that.formItem.author === '') {
                this.$Message.error('请填写软件标题和著作权人！')
                return
            }
            let formData = new FormData()
            formData.append('rightName', that.formItem.rightName)
            formData.append('author', that.formItem.author)
            formData.append('project', that.formItem.project)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('status', that.formItem.status)
            formData.append('application', that.formItem.application)
            formData.append('appStoragePath', that.formItem.appStoragePath)
            formData.append('manual', that.formItem.manual)
            formData.append('manualStoragePath', that.formItem.manualStoragePath)
            formData.append('codes', that.formItem.codes)
            formData.append('codesStoragePath', that.formItem.codesStoragePath)
            formData.append('scanFile', that.formItem.scanFile)
            formData.append('scanFileStoragePath', that.formItem.scanFileStoragePath)

            request.post(
                '/techInno/submitRightInfo',
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
                    this.$Message.info('软著登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('软著登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.rightName = ''
            that.formItem.author = ''
            that.formItem.project = ''
            that.formItem.statusDate = ''
            that.formItem.status = ''
            that.formItem.application = ''
            that.formItem.appStoragePath = ''
            that.formItem.manual = ''
            that.formItem.manualStoragePath = ''
            that.formItem.codes = ''
            that.formItem.codesStoragePath = ''
            that.formItem.scanFile = ''
            that.formItem.scanFileStoragePath = ''

            this.$refs.upload1.clearFiles()
            this.$refs.upload2.clearFiles()
            this.$refs.upload3.clearFiles()
            this.$refs.upload4.clearFiles()
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
                window.open('http://localhost:8080/achieve/filestore/' + storagePath, '_blank')
            }
        },
        show(index) {
            let that = this
            that.showModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/techInno/getRightById',
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
                    that.resultItem.rightName = res.data.rightName
                    that.resultItem.author = res.data.author
                    that.resultItem.project = res.data.project
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.status = res.data.status
                    that.resultItem.application = res.data.application
                    that.resultItem.appStoragePath = res.data.appStoragePath
                    that.resultItem.manual = res.data.manual
                    that.resultItem.manualStoragePath = res.data.manualStoragePath
                    that.resultItem.codes = res.data.codes
                    that.resultItem.codesStoragePath = res.data.codesStoragePath
                    that.resultItem.scanFile = res.data.scanFile
                    that.resultItem.scanFileStoragePath = res.data.scanFileStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('软著查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/techInno/getRightById',
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
                    that.formItem.rightName = res.data.rightName
                    that.formItem.author = res.data.author
                    that.formItem.project = res.data.project
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.status = res.data.status
                    that.formItem.application = res.data.application
                    that.formItem.appStoragePath = res.data.appStoragePath
                    that.formItem.manual = res.data.manual
                    that.formItem.manualStoragePath = res.data.manualStoragePath
                    that.formItem.codes = res.data.codes
                    that.formItem.codesStoragePath = res.data.codesStoragePath
                    that.formItem.scanFile = res.data.scanFile
                    that.formItem.scanFileStoragePath = res.data.scanFileStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('软著查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/techInno/deleteRightById',
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
                    this.$Message.success('软著删除成功！')
                }).catch(
                err => {
                    this.$Message.error('软著删除失败！请联系技术人员')
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
