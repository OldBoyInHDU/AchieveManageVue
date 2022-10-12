<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="patentName" placeholder="专利名称" style="width: 200px" clearable/>
            <Input v-model="inventor" placeholder="发明人" style="width: 150px; margin-left: 20px" clearable/>
            <Select v-model="patentType" style="width:150px; margin-left: 20px" placeholder="专利类型" clearable>
                <Option v-for="item in patentTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="status" style="width:150px; margin-left: 20px" placeholder="申报状态" clearable>
                <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <DatePicker :value="daterange" type="daterange" placement="bottom-end" placeholder="日期" style="width: 200px; margin-left: 20px" @on-change="dateRangeChange" ></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">专利列表</Divider>
        <div class="table">
            <Button type="primary" icon="md-add-circle" @click="register">专利登记</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <Modal
                v-model="registerModal"
                title="专利登记"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel">
                <Form :model="formItem" :label-width="120">
                    <FormItem label="专利名称" required>
                        <Input v-model="formItem.patentName" placeholder="请输入专利名称" ></Input>
                    </FormItem>
                    <FormItem label="发明人" required>
                        <Input v-model="formItem.inventor" placeholder="请输入发明人" ></Input>
                    </FormItem>
                    <FormItem label="专利类型">
                        <RadioGroup v-model="formItem.patentType">
                            <Radio label="发明专利">发明专利</Radio>
                            <Radio label="实用新型">实用新型</Radio>
                            <Radio label="外观设计">外观设计</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="formItem.project" placeholder="请输入该专利所属项目"></Input>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                        (申报/公开/授权 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="formItem.status" type="button">
                            <Radio label="授权">授权</Radio>
                            <Radio label="公开">公开</Radio>
                            <Radio label="申报中">申报中</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件上传</divider>
                    <FormItem label="专利申请表" >
                        <input class="file-input" type="file" @change="getApplicationFile($event)" />
                        <Button type="primary" ghost @click="uploadApplication" :loading="loadingStatus1">{{ loadingStatus1 ? '上传中' : '上传文件' }}</Button><Icon type="ios-checkmark-circle" color="#19be6b" v-show="uploadStatus1"/>
                    </FormItem>
                    <FormItem label="技术交底书" >
                        <input class="file-input" type="file" @change="getTechFile($event)" />
                        <Button type="primary" ghost @click="uploadTechFile" :loading="loadingStatus2">{{ loadingStatus2 ? '上传中' : '上传文件' }}</Button><Icon type="ios-checkmark-circle" color="#19be6b" v-show="uploadStatus2"/>
                    </FormItem>
                    <FormItem label="证书扫描件" >
                        <input class="file-input" type="file" @change="getCertFile($event)" />
                        <Button type="primary" ghost @click="uploadCert" :loading="loadingStatus3">{{ loadingStatus3 ? '上传中' : '上传文件' }}</Button><Icon type="ios-checkmark-circle" color="#19be6b" v-show="uploadStatus3"/>
                    </FormItem>
                </Form>

            </Modal>
<!--            专利查看 modal-->
            <Modal
                v-model="showModal"
                title="专利查看"
                width="520"
                @on-ok="ok"
                @on-cancel="cancel">
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="专利名称">
                        <Input v-model="resultItem.patentName" placeholder="专利名称" readonly></Input>
                    </FormItem>
                    <FormItem label="发明人">
                        <Input v-model="resultItem.inventor" placeholder="发明人" readonly></Input>
                    </FormItem>
                    <FormItem label="专利类型">
                        <RadioGroup v-model="resultItem.patentType" disabled>
                            <Radio label="发明专利" disabled>发明专利</Radio>
                            <Radio label="实用新型" disabled>实用新型</Radio>
                            <Radio label="外观设计" disabled>外观设计</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="所属项目">
                        <Input v-model="resultItem.project" placeholder="该专利所属项目" readonly></Input>
                    </FormItem>
                    <FormItem label="授权日期">
                        <DatePicker type="date" placeholder="选择日期" format="yyyy-MM-dd" :value="resultItem.statusDate" readonly></DatePicker>
                        (申报/公开/授权 日期)
                    </FormItem>
                    <FormItem label="申报状态" >
                        <RadioGroup v-model="resultItem.status" type="button" disabled>
                            <Radio label="授权" disabled>授权</Radio>
                            <Radio label="公开" disabled>公开</Radio>
                            <Radio label="申报中" disabled>申报中</Radio>
                        </RadioGroup>
                    </FormItem>
                    <divider orientation="center">附件下载</divider>
                    <FormItem label="专利申请表" >
                        <Input v-model="resultItem.appStoragePath" placeholder="专利申请表" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.appStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="技术交底书" >
                        <Input v-model="resultItem.techFileStoragePath" placeholder="技术交底书" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.techFileStoragePath)" >预览</Button>
                    </FormItem>
                    <FormItem label="证书扫描件" >
                        <Input v-model="resultItem.certStoragePath" placeholder="证书扫描件" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.certStoragePath)" >预览</Button>
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
                        <Button type="warning" size="small"  @click="modify(index)">修改</Button>
<!--                        <Button type="error" size="small" @click="remove(index)">删除</Button>-->
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
    name: 'patent',
    data() {
        return {
            // 搜索 select组件
            statusList: [
                {
                    value: '授权',
                    label: '授权'
                },
                {
                    value: '公开',
                    label: '公开'
                },
                {
                    value: '申报中',
                    label: '申报中'
                }
            ],
            patentTypeList: [
                {
                    value: '发明专利',
                    label: '发明专利'
                },
                {
                    value: '实用新型',
                    label: '实用新型'
                },
                {
                    value: '外观设计',
                    label: '外观设计'
                }
            ],
            // 搜索条件
            patentName: '',
            inventor: '',
            patentType: '',
            status: '',
            daterange: [], // 申报/公开/授权 时间区间 ['2016-01-01', '2016-02-15'] 需要搭配on-change使用
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 专利登记modal
            showModal: false, // 查看modal
            // 专利登记表单
            formItem: {
                patentName: '',
                inventor: '',
                patentType: '',
                project: '',
                statusDate: '',
                status: '',
                application: '',
                appStoragePath: '',
                techFile: '',
                techFileStoragePath: '',
                cert: '',
                certStoragePath: ''
            },
            resultItem: {
                patentName: '',
                inventor: '',
                patentType: '',
                project: '',
                statusDate: '',
                status: '',
                application: '',
                appStoragePath: '',
                techFile: '',
                techFileStoragePath: '',
                cert: '',
                certStoragePath: ''
            },
            file1: null,
            file2: null,
            file3: null,
            filename1: '',
            filename2: '',
            filename3: '',
            loadingStatus1: false,
            loadingStatus2: false,
            loadingStatus3: false,
            uploadStatus1: false,
            uploadStatus2: false,
            uploadStatus3: false,
            //查询结果
            form_header: [
                {
                    title: '序号',
                    // key: 'id',
                    type: 'index',
                    width: 75,
                    render: (h, params) => h('span', {}, params.index + 1),
                },
                {
                    title: '专利名称',
                    key: 'patentName',
                },
                {
                    title: '发明人',
                    key: 'inventor',
                },
                {
                    title: '专利类型',
                    key: 'patentType',
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
                    title: '申报/公开/授权 日期',
                    key: 'statusDate',
                },
                {
                    title: '专利申请表',
                    key: 'application',
                },
                {
                    title: '技术交底书',
                    key: 'techFile',
                },
                {
                    title: '证书扫描件',
                    key: 'cert',
                },
                {
                    title: '更新时间',
                    key: 'updateDate',
                },
                {
                    title: '操作',
                    slot: 'action',
                    width: 150,
                    align: 'center',
                },
            ],
            form_list_content: [
                // {
                //     patentName: '一种切丝机改进方法',
                //     inventor: '黄桁',
                //     patentType: '发明专利',
                //     project: '切丝机质量改进',
                //     status: '授权',
                //     statusDate: '2022-09-20',
                //     application: '专利申请表',
                //     techFile: '技术交底书',
                //     cert: '专利证书',
                //     updateDate: '2022-10-08'
                // }
            ], // 当前展示的数据
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
            // let dateStr = new Date(date, 'yyyy-MM-dd').toString();
            // console.log('dateStr:' + dateStr)
            this.daterange = date;
        },
        statusDateChange(date) {
          this.formItem.statusDate = date
        },
        async search() {
            let that = this
            let dateList = this.daterange
            await request.get(
                '/techInno/getPatent',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        patentName: that.patentName,
                        inventor: that.inventor,
                        patentType: that.patentType,
                        status: that.status,
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
            that.patentName = ''
            that.inventor = ''
            that.patentType = ''
            that.status = ''
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
        //选取文件
        getApplicationFile(event) {
            let that = this
            that.file1 = event.target.files[0]
            that.filename1 = that.file1.name
            console.log(that.filename1)
        },
        getTechFile(event) {
            let that = this
            that.file2 = event.target.files[0]
            that.filename2 = that.file2.name
            console.log(that.filename2)
        },
        getCertFile(event) {
            let that = this
            that.file3 = event.target.files[0]
            that.filename3 = that.file3.name
            console.log(that.filename3)
        },
        uploadApplication() {
            //上传文档
            let that = this
            let uncheckedFile = this.file1
            if (uncheckedFile == null) {
                this.$Message.error('未选择文件！请先选择文件！')
                return
            }
            let isRight = this.beforeUploadApplication(uncheckedFile)
            if (!isRight) {
                this.$Message.error('请重新上传文件')
                return
            }
            let checkedFile = uncheckedFile
            let formData = new FormData()
            formData.append('file', checkedFile)
            that.loadingStatus1 = true
            request.post(
                'techInno/patentUpload',
                formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    }
                }
            ).then(
                res => {
                    console.log('文件上传成功')
                    console.log(res.data)
                    that.loadingStatus1 = false
                    that.uploadStatus1 = true
                    that.formItem.application = that.filename1
                    that.formItem.appStoragePath = res.data
                    console.log('application:' + that.formItem.application + '/' + that.formItem.appStoragePath)
            }).catch(
                err => {
                    console.log('文件上传失败')
                    console.log(err.data)
                    this.$Message.error('后台服务出问题，请联系技术人员')
                }
            )
        },

        uploadTechFile() {
            //上传文档
            let that = this
            let uncheckedFile = this.file2
            if (uncheckedFile == null) {
                this.$Message.error('未选择文件！请先选择文件！')
                return
            }
            let isRight = this.beforeUploadTechFile(uncheckedFile)
            if (!isRight) {
                this.$Message.error('请重新上传文件')
                return
            }
            let checkedFile = uncheckedFile
            let formData = new FormData()
            formData.append('file', checkedFile)
            that.loadingStatus2 = true
            request.post(
                'techInno/patentUpload',
                formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    }
                }
            ).then(
                res => {
                    console.log('文件上传成功')
                    console.log(res.data)
                    that.loadingStatus2 = false
                    that.uploadStatus2 = true
                    that.formItem.techFile = that.filename2
                    that.formItem.techFileStoragePath = res.data
                    console.log('techFile:' + that.formItem.techFile + '/' + that.formItem.techFileStoragePath)
                }).catch(
                err => {
                    console.log('文件上传失败')
                    console.log(err.data)
                    this.$Message.error('后台服务出问题，请联系技术人员')
                }
            )
        },

        uploadCert() {
            //上传文档
            let that = this
            let uncheckedFile = this.file3
            if (uncheckedFile == null) {
                this.$Message.error('未选择文件！请先选择文件！')
                return
            }
            let isRight = this.beforeUploadCert(uncheckedFile)
            if (!isRight) {
                this.$Message.error('请重新上传文件')
                return
            }
            let checkedFile = uncheckedFile
            let formData = new FormData()
            formData.append('file', checkedFile)
            that.loadingStatus3 = true
            request.post(
                'techInno/patentUpload',
                formData,
                {
                    headers: {
                        'content-type': 'multipart/form-data',
                    }
                }
            ).then(
                res => {
                    console.log('文件上传成功')
                    console.log(res.data)
                    that.loadingStatus3 = false
                    that.uploadStatus3 = true
                    that.formItem.cert = that.filename3
                    that.formItem.certStoragePath = res.data
                    console.log('cert:' + that.formItem.cert + '/' + that.formItem.certStoragePath)
                }).catch(
                err => {
                    console.log('文件上传失败')
                    console.log(err.data)
                    this.$Message.error('后台服务出问题，请联系技术人员')
                }
            )
        },
        beforeUploadApplication(file) {
            let that = this
            let name = file.name
            // console.log(name)
            let suffix = name.substring(name.lastIndexOf('.'))
            // console.log(suffix)
            let isNameLegal = true
            let isLs2M = true
            let isRight = true
            isNameLegal = suffix === '.pdf'
            isLs2M = file.size / 1024 / 1024 < 200
            if (!isLs2M || !isNameLegal) {
                that.loadingStatus = false
                this.$Message.error('上传的文件大小不能超过200MB 且 格式为pdf！')
                isRight = false
            }
            that.filename1 = file.name
            that.file1 = file
            // 一定要return false 不然会直接上传
            return isRight
        },
        beforeUploadTechFile(file) {
            let that = this
            let name = file.name
            // console.log(name)
            let suffix = name.substring(name.lastIndexOf('.'))
            // console.log(suffix)
            let isNameLegal = true
            let isLs2M = true
            let isRight = true
            isNameLegal = suffix === '.pdf'
            isLs2M = file.size / 1024 / 1024 < 200
            if (!isLs2M || !isNameLegal) {
                that.loadingStatus = false
                this.$Message.error('上传的文件大小不能超过200MB 且 格式为pdf！')
                isRight = false
            }
            that.filename2 = file.name
            that.file2 = file
            // 一定要return false 不然会直接上传
            return isRight
        },
        beforeUploadCert(file) {
            let that = this
            let name = file.name
            // console.log(name)
            let suffix = name.substring(name.lastIndexOf('.'))
            // console.log(suffix)
            let isNameLegal = true
            let isLs2M = true
            let isRight = true
            isNameLegal = suffix === '.pdf'
            isLs2M = file.size / 1024 / 1024 < 200
            if (!isLs2M || !isNameLegal) {
                that.loadingStatus = false
                this.$Message.error('上传的文件大小不能超过200MB 且 格式为pdf！')
                isRight = false
            }
            that.filename3 = file.name
            that.file3 = file
            // 一定要return false 不然会直接上传
            return isRight
        },
        resetForm() {
            let that = this
            that.formItem.patentName = ''
            that.formItem.inventor = ''
            that.formItem.patentType = ''
            that.formItem.project = ''
            that.formItem.statusDate = ''
            that.formItem.status = ''
            that.formItem.application = ''
            that.formItem.appStoragePath = ''
            that.formItem.techFile = ''
            that.formItem.techFileStoragePath = ''
            that.formItem.cert = ''
            that.formItem.certStoragePath = ''
            that.uploadStatus1 = false
            that.uploadStatus2 = false
            that.uploadStatus3 = false
            that.file1 = null
            that.file2 = null
            that.file3 = null

        },
        //提交表单
        submit () {
            let that = this
            //判断必填项 专利名称 和 发明人 是否为空
            if(that.formItem.patentName === '' && that.formItem.inventor === '') {
                this.$Message.error('请填写专利名称和发明人！')
                return
            }
            let formData = new FormData()
            formData.append('patentName', that.formItem.patentName)
            formData.append('inventor', that.formItem.inventor)
            formData.append('patentType', that.formItem.patentType)
            formData.append('project', that.formItem.project)
            formData.append('status', that.formItem.status)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('application', that.formItem.application)
            formData.append('appStoragePath', that.formItem.appStoragePath)
            formData.append('techFile', that.formItem.techFile)
            formData.append('techFileStoragePath', that.formItem.techFileStoragePath)
            formData.append('cert', that.formItem.cert)
            formData.append('certStoragePath', that.formItem.certStoragePath)

            request.post(
                '/techInno/submitPatentInfo',
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
        ok () {
            // this.$Message.info('Clicked cancel');
        },
        cancel () {
            // this.$Message.info('Clicked cancel');
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
            let patentNameTemp = that.form_list_content[index].patentName
            request.get(
                '/techInno/getPatentByName',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        patentName: patentNameTemp
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    that.resultItem.patentName = res.data.patentName
                    that.resultItem.inventor = res.data.inventor
                    that.resultItem.patentType = res.data.patentType
                    that.resultItem.project = res.data.project
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.status = res.data.status
                    that.resultItem.appStoragePath = res.data.appStoragePath
                    that.resultItem.techFileStoragePath = res.data.techFileStoragePath
                    that.resultItem.certStoragePath = res.data.certStoragePath
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
            let patentNameTemp = that.form_list_content[index].patentName
            request.get(
                '/techInno/getPatentByName',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        patentName: patentNameTemp
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    // console.log(res.data.statusDate)
                    that.formItem.patentName = res.data.patentName
                    that.formItem.inventor = res.data.inventor
                    that.formItem.patentType = res.data.patentType
                    that.formItem.project = res.data.project
                    that.formItem.statusDate = res.data.statusDate
                    // that.formItem.statusDate = that.str2Date(res.data.statusDate)
                    that.formItem.status = res.data.status
                    that.formItem.appStoragePath = res.data.appStoragePath
                    that.formItem.techFileStoragePath = res.data.techFileStoragePath
                    that.formItem.certStoragePath = res.data.certStoragePath
                    // console.log(that.formItem.statusDate)
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('专利查看失败')
                }
            )
        },
        str2Date(str) {
            let date = ''
            if (!str) return date
            let strArr = str.split('-')
            let year = strArr[0]
            let month = strArr[1]
            let day = strArr[2]
            date = new Date(year, month, day)
            return date
        },
        remove(index) {
/*            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            // console.log('index' + index)
            // console.log('paramId' + paramId)
            axios.delete('http://localhost:8080/eduonline/forum/coursewareManage/deleteCoursewareInfo', {
                params: {
                    id: paramId,
                },
            }).then(
                res => {
                    // console.log(res)
                },
                err => {
                    // console.log(err)
                    this.$Message.error('后台服务出问题，请联系技术人员')
                }
            )*/
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
