<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="paperName" placeholder="论文题目" style="width: 200px" clearable/>
            <Input v-model="author" placeholder="作者" style="width: 150px; margin-left: 20px" clearable/>
            <Select v-model="status" style="width:150px; margin-left: 20px" placeholder="申报状态" clearable>
                <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="project" placeholder="所属项目" style="width: 150px; margin-left: 20px" clearable/>
            <DatePicker :value="daterange" format="yyyy/MM/dd" type="daterange" placeholder="选择日期" style="width: 200px; margin-left: 20px" @on-change="dateRangeChange" clearable></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">专利列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">文章登记</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
<!--            专利登记modal-->
            <Modal
                v-model="registerModal"
                title="专利登记"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="论文标题" required>
                        <Input v-model="formItem.paperName" placeholder="请输入论文标题" ></Input>
                    </FormItem>
                    <FormItem label="论文作者" required>
                        <Input v-model="formItem.author" placeholder="请输入论文作者" ></Input>
                    </FormItem>
                    <FormItem label="投稿期刊">
                        <Input v-model="formItem.journal" placeholder="请输入投稿期刊" ></Input>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="formItem.project" placeholder="请输入该论文所属项目"></Input>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                        (投稿/发表 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="formItem.status" type="button">
                            <Radio label="投稿">投稿</Radio>
                            <Radio label="发表">发表</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="投稿审批单" >
                        <Upload
                            ref="upload1"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess1"
                            :on-remove="handleRemove1"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/paperUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
<!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="投稿论文(中)" >
                        <Upload
                            ref="upload2"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess2"
                            :on-remove="handleRemove2"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/paperUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="投稿论文(英)" >
                        <Upload
                            ref="upload3"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess3"
                            :on-remove="handleRemove3"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/paperUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="论文扫描件" >
                        <Upload
                            ref="upload4"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess4"
                            :on-remove="handleRemove4"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/paperUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                    <FormItem label="检索证明" >
                        <Upload
                            ref="upload5"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess5"
                            :on-remove="handleRemove5"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/paperUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>

<!--            查看modal-->
            <Modal
                v-model="showModal"
                title="专利登记"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="论文标题" required>
                        <Input v-model="resultItem.paperName" placeholder="请输入论文标题" readonly></Input>
                    </FormItem>
                    <FormItem label="论文作者" required>
                        <Input v-model="resultItem.author" placeholder="请输入论文作者" readonly></Input>
                    </FormItem>
                    <FormItem label="投稿期刊">
                        <Input v-model="resultItem.journal" placeholder="请输入投稿期刊" readonly></Input>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="resultItem.project" placeholder="请输入该论文所属项目" readonly></Input>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="resultItem.statusDate" @on-change="statusDateChange" readonly></DatePicker>
                        (投稿/发表 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="resultItem.status" type="button" disabled>
                            <Radio label="投稿">投稿</Radio>
                            <Radio label="发表">发表</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件下载</divider>
                    <FormItem label="投稿审批单" >
                        <Input v-model="resultItem.approvalStoragePath" placeholder="投稿审批单" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.approvalStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="投稿论文(中)" >
                        <Input v-model="resultItem.paperChnStoragePath" placeholder="投稿论文(中)" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.paperChnStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="投稿论文(英)" >
                        <Input v-model="resultItem.paperEngStoragePath" placeholder="投稿论文(英)" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.paperEngStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="证书扫描件" >
                        <Input v-model="resultItem.scanFileStoragePath" placeholder="证书扫描件" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.scanFileStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="检索证明" >
                        <Input v-model="resultItem.searchProofStoragePath" placeholder="检索证明" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.searchProofStoragePath)" >预览</Button>
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
    name: 'paper',
    data() {
        return {
            statusList: [
                {
                    value: '投稿',
                    label: '投稿'
                },
                {
                    value: '发表',
                    label: '发表'
                },
            ],
            paperName: '',
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
                paperName: '',
                author: '',
                journal: '',
                project: '',
                statusDate: '',
                status: '',
                approval: '',
                approvalStoragePath: '',
                paperEng: '',
                paperEngStoragePath: '',
                paperChn: '',
                paperChnStoragePath: '',
                scanFile: '',
                scanFileStoragePath: '',
                searchProof: '',
                searchProofStoragePath: '',
            },
            resultItem: {
                paperName: '',
                author: '',
                journal: '',
                project: '',
                statusDate: '',
                status: '',
                approval: '',
                approvalStoragePath: '',
                paperEng: '',
                paperEngStoragePath: '',
                paperChn: '',
                paperChnStoragePath: '',
                scanFile: '',
                scanFileStoragePath: '',
                searchProof: '',
                searchProofStoragePath: '',
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
                    title: '论文标题',
                    key: 'paperName',
                },
                {
                    title: '作者',
                    key: 'author',
                },
                {
                    title: '期刊',
                    key: 'journal',
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
                    title: '投稿审批单',
                    key: 'approval',
                },
                {
                    title: '投稿论文(中)',
                    key: 'paperChn',
                },
                {
                    title: '投稿论文(英)',
                    key: 'paperEng',
                },
                {
                    title: '论文扫描件',
                    key: 'scanFile',
                },
                {
                    title: '检索证明',
                    key: 'searchProof',
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
                '/techInno/getPaper',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        paperName: that.paperName,
                        author: that.author,
                        status: that.status,
                        project: that.project,
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
            that.paperName = ''
            that.author = ''
            that.status = ''
            that.project = ''
            that.daterange = []
        },
        //专利登记
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
            that.formItem.approval = file.name
            that.formItem.approvalStoragePath = res.data
        },
        handleRemove1(file) {
            // let fileList = this.$refs.upload1.fileList
            // this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1)
            this.$refs.upload1.clearFiles()
        },
        handleSuccess2 (res, file) {
            console.log(res)
            let that = this
            that.formItem.paperChn = file.name
            that.formItem.paperChnStoragePath = res.data
        },
        handleRemove2(file) {
            this.$refs.upload2.clearFiles()
        },
        handleSuccess3 (res, file) {
            console.log(res)
            let that = this
            that.formItem.paperEng = file.name
            that.formItem.paperEngStoragePath = res.data
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
        handleSuccess5 (res, file) {
            console.log(res)
            let that = this
            that.formItem.searchProof = file.name
            that.formItem.searchProofStoragePath = res.data
        },
        handleRemove5(file) {
            this.$refs.upload5.clearFiles()
        },
        submit() {
            let that = this
            //判断必填项 专利名称 和 发明人 是否为空
            if(that.formItem.paperName === '' && that.formItem.author === '') {
                this.$Message.error('请填写论文标题和作者！')
                return
            }
            let formData = new FormData()
            formData.append('paperName', that.formItem.paperName)
            formData.append('author', that.formItem.author)
            formData.append('journal', that.formItem.journal)
            formData.append('project', that.formItem.project)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('status', that.formItem.status)
            formData.append('approval', that.formItem.approval)
            formData.append('approvalStoragePath', that.formItem.approvalStoragePath)
            formData.append('paperChn', that.formItem.paperChn)
            formData.append('paperChnStoragePath', that.formItem.paperChnStoragePath)
            formData.append('paperEng', that.formItem.paperEng)
            formData.append('paperEngStoragePath', that.formItem.paperEngStoragePath)
            formData.append('scanFile', that.formItem.scanFile)
            formData.append('scanFileStoragePath', that.formItem.scanFileStoragePath)
            formData.append('searchProof', that.formItem.searchProof)
            formData.append('searchProofStoragePath', that.formItem.searchProofStoragePath)

            request.post(
                '/techInno/submitPaperInfo',
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
                    this.$Message.info('专利登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('专利登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.paperName = ''
            that.formItem.author = ''
            that.formItem.journal = ''
            that.formItem.project = ''
            that.formItem.statusDate = ''
            that.formItem.status = ''
            that.formItem.approval = ''
            that.formItem.approvalStoragePath = ''
            that.formItem.paperChn = ''
            that.formItem.paperChnStoragePath = ''
            that.formItem.paperEng = ''
            that.formItem.paperEngStoragePath = ''
            that.formItem.scanFile = ''
            that.formItem.scanFileStoragePath = ''
            that.formItem.searchProof = ''
            that.formItem.searchProofStoragePath = ''
            this.$refs.upload1.clearFiles()
            this.$refs.upload2.clearFiles()
            this.$refs.upload3.clearFiles()
            this.$refs.upload4.clearFiles()
            this.$refs.upload5.clearFiles()
        },
        cancel() {

        },
        //下载文档
        downloadDoc(storagePath) {

            console.log(storagePath)
            if (storagePath === null || storagePath === '' || storagePath === 'null') {
                this.$Message.error('资料待补充')
            } else {
                window.open('http://localhost:8088/achieve/filestore/' + storagePath, '_blank')
            }
        },
        show(index) {
            let that = this
            that.showModal = true
            let paperName = that.form_list_content[index].paperName
            request.get(
                '/techInno/getPaperByName',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        paperName: paperName
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    that.resultItem.paperName = res.data.paperName
                    that.resultItem.author = res.data.author
                    that.resultItem.journal = res.data.journal
                    that.resultItem.project = res.data.project
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.status = res.data.status
                    that.resultItem.approval = res.data.approval
                    that.resultItem.approvalStoragePath = res.data.approvalStoragePath
                    that.resultItem.paperChn = res.data.paperChn
                    that.resultItem.paperChnStoragePath = res.data.paperChnStoragePath
                    that.resultItem.paperEng = res.data.paperEng
                    that.resultItem.paperEngStoragePath = res.data.paperEngStoragePath
                    that.resultItem.scanFile = res.data.scanFile
                    that.resultItem.scanFileStoragePath = res.data.scanFileStoragePath
                    that.resultItem.searchProof = res.data.searchProof
                    that.resultItem.searchProofStoragePath = res.data.searchProofStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('专利查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paperName = that.form_list_content[index].paperName
            request.get(
                '/techInno/getPaperByName',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        paperName: paperName
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    that.formItem.paperName = res.data.paperName
                    that.formItem.author = res.data.author
                    that.formItem.journal = res.data.journal
                    that.formItem.project = res.data.project
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.status = res.data.status
                    that.formItem.approval = res.data.approval
                    that.formItem.approvalStoragePath = res.data.approvalStoragePath
                    that.formItem.paperChn = res.data.paperChn
                    that.formItem.paperChnStoragePath = res.data.paperChnStoragePath
                    that.formItem.paperEng = res.data.paperEng
                    that.formItem.paperEngStoragePath = res.data.paperEngStoragePath
                    that.formItem.scanFile = res.data.scanFile
                    that.formItem.scanFileStoragePath = res.data.scanFileStoragePath
                    that.formItem.searchProof = res.data.searchProof
                    that.formItem.searchProofStoragePath = res.data.searchProofStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('专利查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/techInno/deletePaperById',
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
                    this.$Message.success('专利删除成功！')
                }).catch(
                err => {
                    this.$Message.error('专利删除失败！请联系技术人员')
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
