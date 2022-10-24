<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="project" placeholder="项目名称" style="width: 200px" clearable/>
            <Select v-model="sort" style="width:150px; margin-left: 20px" placeholder="项目类别" clearable>
                <Option v-for="item in sortList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="type" style="width:150px; margin-left: 20px" placeholder="项目类型" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="status" style="width:150px; margin-left: 20px" placeholder="项目状态" clearable>
                <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="leader" placeholder="项目负责人" style="width: 150px; margin-left: 20px" clearable/>
            <Input v-model="member" placeholder="主要完成人" style="width: 150px; margin-left: 20px" clearable/>
            <DatePicker :value="daterange" format="yyyy/MM/dd" type="daterange" placeholder="选择日期" style="width: 200px; margin-left: 20px" @on-change="dateRangeChange" clearable></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">项目列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">项目登记</Button>
            <Button type="primary" style="margin-left: 20px" @click="exportData">列表导出</Button>
            <div class="table-result" style="padding-top: 20px">
                <Table border :columns="form_header" :data="form_list_content" :loading="loading" height="600" ref="table">
                    <template slot-scope="{ row }" slot="name">
                        <strong>{{ row.name }}</strong>
                    </template>
                    <template slot-scope="{ row, index }" slot="action">
                        <Button type="primary" size="small" style="margin-right: 5px" @click="show(index)">查看</Button>
                        <Button type="warning" size="small" style="margin-right: 5px" @click="modify(index)">修改</Button>
                        <Button type="error" size="small" @click="confirm(index)">删除</Button>
                    </template>
                </Table>
                <br>
                <Page :total="total" :current="page" @on-change="changePage" :page-size="pageSize" show-elevator/>
            </div>
        </div>
        <div>
<!--            项目登记-->
            <Modal
                v-model="registerModal"
                title="项目登记"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="项目名称" required>
                        <Input v-model="formItem.project" placeholder="请输入项目名称" ></Input>
                    </FormItem>
                    <FormItem label="项目类别" required>
                        <RadioGroup v-model="formItem.sort" type="button">
                            <Radio label="QC创新">QC创新</Radio>
                            <Radio label="QC问题解决">QC问题解决</Radio>
                            <Radio label="精益管理">精益管理</Radio>
                            <Radio label="6σ改进">6σ改进</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="项目类型" required>
                        <RadioGroup v-model="formItem.type" type="button">
                            <Radio label="技术类">技术类</Radio>
                            <Radio label="管理类">管理类</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="项目负责人" required>
                        <Input v-model="formItem.leader" placeholder="请输入项目负责人" ></Input>
                    </FormItem>
                    <FormItem label="主要完成人" required>
                        <Input v-model="formItem.member" placeholder="请输入主要完成人" ></Input>
                    </FormItem>
                    <FormItem label="项目状态" >
                        <RadioGroup v-model="formItem.status" type="button">
                            <Radio label="立项">立项</Radio>
                            <Radio label="结题">结题</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                        (立项/结题 日期)
                    </FormItem>
                    <FormItem label="获奖等级">
                        <Input v-model="formItem.award" placeholder="请输入获奖等级"></Input>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="附件" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            multiple
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/techInno/qiUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
<!--            项目查看-->
            <Modal
                v-model="showModal"
                title="项目查看"
                width="520"
                ok-text="确定"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="项目名称" required>
                        <Input v-model="resultItem.project" placeholder="请输入项目名称" readonly></Input>
                    </FormItem>
                    <FormItem label="项目类别" required>
                        <RadioGroup v-model="resultItem.sort" type="button">
                            <Radio label="QC创新" disabled>QC创新</Radio>
                            <Radio label="QC问题解决" disabled>QC问题解决</Radio>
                            <Radio label="精益管理" disabled>精益管理</Radio>
                            <Radio label="6σ改进" disabled>6σ改进</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="项目类型" required>
                        <RadioGroup v-model="resultItem.type" type="button">
                            <Radio label="技术类" disabled>技术类</Radio>
                            <Radio label="管理类" disabled>管理类</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="项目负责人" required>
                        <Input v-model="resultItem.leader" placeholder="请输入主要完成人" readonly></Input>
                    </FormItem>
                    <FormItem label="主要完成人" required>
                        <Input v-model="resultItem.member" placeholder="请输入主要完成人" readonly></Input>
                    </FormItem>
                    <FormItem label="项目状态" >
                        <RadioGroup v-model="resultItem.status" type="button">
                            <Radio label="立项" disabled>立项</Radio>
                            <Radio label="结题" disabled>结题</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="日期">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择日期" :value="resultItem.statusDate" @on-change="statusDateChange" readonly></DatePicker>
                        (立项/结题 日期)
                    </FormItem>
                    <FormItem label="获奖等级">
                        <Input v-model="resultItem.award" placeholder="请输入获奖等级" readonly></Input>
                    </FormItem>
                    <divider orientation="center">附件列表</divider>
                    <div v-for="(item, index) in resultItem.docFileList">
                        <FormItem :label="'附件' + (index + 1)" >
                            <Input :value="item.docFileName" :placeholder="item.docFileName" style="width: 200px; padding-right: 20px" readonly></Input>
                            <Button type="primary" ghost @click="downloadDoc(item.storagePath)" >预览</Button>
                        </FormItem>
                    </div>
                </Form>
            </Modal>
<!--            确认删除-->
            <Modal
                v-model="confirmModal"
                title="删除确认"
                @on-ok="remove()"
                ok-text="删除"
                @on-cancel="cancel">
                <p>确定删除《{{toDeleteDoc}}》项目吗？</p>
            </Modal>
        </div>
    </div>

</template>

<script>
import request from "@/utils/request";

export default {
    name: 'qualityImprove',
    data() {
        return {
            sortList: [
                {
                    value: 'QC创新',
                    label: 'QC创新'
                },
                {
                    value: 'QC问题解决',
                    label: 'QC问题解决'
                },
                {
                    value: '精益管理',
                    label: '精益管理'
                },
                {
                    value: '6σ改进',
                    label: '6σ改进'
                },
            ],
            typeList: [
                {
                    value: '技术类',
                    label: '技术类'
                },
                {
                    value: '管理类',
                    label: '管理类'
                },
            ],
            statusList: [
                {
                    value: '立项',
                    label: '立项'
                },
                {
                    value: '结题',
                    label: '结题'
                },
            ],
            project: '',
            sort: '',
            type: '',
            status: '',
            leader: '',
            member: '',
            daterange: [],
            //查询loading
            loading: false,
            registerModal: false,
            showModal: false,
            confirmModal: false,
            formItem: {
                project: '',
                sort: '',
                type: '',
                leader: '',
                member: '',
                statusDate: '',
                status: '',
                award: '',
                uploadList: [],
            },
            resultItem: {
                project: '',
                sort: '',
                type: '',
                leader: '',
                member: '',
                statusDate: '',
                status: '',
                award: '',
                docFileList: []
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
                    title: '项目名称',
                    key: 'project',
                },
                {
                    title: '项目类别',
                    key: 'sort',
                },
                {
                    title: '项目类型',
                    key: 'type',
                },
                {
                    title: '项目负责人',
                    key: 'leader',
                },
                {
                    title: '主要完成人',
                    key: 'member',
                },
                {
                    title: '项目状态',
                    key: 'status',
                },
                {
                    title: '立项/结题 日期',
                    key: 'statusDate',
                },
                {
                    title: '获奖等级',
                    key: 'award',
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
        }
    },
    methods: {
        dateRangeChange(date) {
            this.daterange = date;
        },
        async search() {
            let that = this
            let dateList = this.daterange
            await request.get(
                '/techInno/getQualityImprove',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        project: that.project,
                        sort: that.sort,
                        type: that.type,
                        status: that.status,
                        leader: that.leader,
                        member: that.member,
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
            that.project = ''
            that.sort = ''
            that.type = ''
            that.leader = ''
            that.member = ''
            that.status = ''
            that.daterange = []
        },
        resetForm() {
            let that = this
            this.$refs.upload.clearFiles()
            that.formItem.project = ''
            that.formItem.sort = ''
            that.formItem.type = ''
            that.formItem.leader = ''
            that.formItem.member = ''
            that.formItem.status = ''
            that.formItem.statusDate = ''
            that.formItem.award = ''
            that.formItem.uploadList = []
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
            if(that.formItem.project === '' || that.formItem.project === null) {
                this.$Message.error('请输入项目名称！')
                return
            }
            if(that.formItem.sort === '' || that.formItem.sort === null) {
                this.$Message.error('请选择项目类别！')
                return
            }
            if(that.formItem.type === '' || that.formItem.type === null) {
                this.$Message.error('请选择项目类型！')
                return
            }
            if(that.formItem.member === '' || that.formItem.member === null) {
                this.$Message.error('请输入项目完成人！')
                return
            }
            /*if(that.formItem.uploadList.length < 1) {
                this.$Message.error('文件为空！请选择要上传的文件！')
                return
            }*/
            let formData = new FormData()
            let uploadListJson = JSON.stringify(that.formItem.uploadList)
            formData.append('project', that.formItem.project)
            formData.append('sort', that.formItem.sort)
            formData.append('type', that.formItem.type)
            formData.append('leader', that.formItem.leader)
            formData.append('member', that.formItem.member)
            formData.append('status', that.formItem.status)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('award', that.formItem.award)
            formData.append('uploadList', uploadListJson)
            request.post(
                '/techInno/submitQIInfo',
                formData,
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            ).then(
                res => {
                    console.log(res)
                    that.$Message.success('项目登记成功！')
                    // that.showUploadListFlag = false
                }
            ).catch(
                err => {
                    console.log(err)
                    that.$Message.error('项目登记失败，请联系技术人员')
                    // that.showUploadListFlag = false
                }
            )
        },
        cancel() {
            let that = this
            that.confirmModal = false
            this.$Message.info('已取消')
        },
        show(index) {
            let that = this
            that.showModal = true
            let paramId = that.form_list_content[index].id
            let paramProj = that.form_list_content[index].project
            request.get(
                '/techInno/getQIById',
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
                    that.resultItem.project = res.data.project
                    that.resultItem.sort = res.data.sort
                    that.resultItem.type = res.data.type
                    that.resultItem.leader = res.data.leader
                    that.resultItem.member = res.data.member
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.status = res.data.status
                    that.resultItem.award = res.data.award
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('项目查看失败')
                }
            )
            request.get(
                '/techInno/getQIDocByProject',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        project: paramProj
                    },
                }
            ).then(
                res => {
                    console.log(res)
                    that.resultItem.docFileList = res.data
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('项目查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/techInno/getQIById',
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
                    that.formItem.project = res.data.project
                    that.formItem.sort = res.data.sort
                    that.formItem.type = res.data.type
                    that.formItem.leader = res.data.leader
                    that.formItem.member = res.data.member
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.status = res.data.status
                    that.formItem.award = res.data.award
                    that.formItem.uploadList = []
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('项目修改失败')
                }
            )
        },
        confirm(index) {
            let that = this
            that.confirmModal = true
            that.toDeleteDoc = that.form_list_content[index].project
            that.delDocIndex = index
            // that.remove(index)
        },
        remove() {
            let index = this.delDocIndex
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/techInno/deleteQIById',
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
                    this.$Message.success('项目删除成功！')
                }).catch(
                err => {
                    this.$Message.error('项目删除失败！请联系技术人员')
                }
            )
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
