<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Button type="success" icon="md-cloud-upload" @click="register">荣誉上传</Button>
            <Button type="primary" style="margin-left: 20px" @click="search">荣誉查询</Button>
        </div>
        <Divider style="padding-top: 20px">荣誉列表</Divider>
        <div class="table">
            <!--            荣誉登记modal-->
            <Modal
                v-model="registerModal"
                title="荣誉上传"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="课题项目名称" required>
                        <Input v-model="formItem.project" placeholder="请输入课题项目名称" ></Input>
                    </FormItem>
                    <FormItem label="获奖人" required>
                        <Input v-model="formItem.awardee" placeholder="请输入获奖人" ></Input>
                    </FormItem>
                    <FormItem label="获奖时间" required>
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择获奖时间" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
                    <FormItem label="荣誉奖项" required>
                        <Input v-model="formItem.award" placeholder="请输入荣誉奖项" ></Input>
                    </FormItem>
                    <divider orientation="center">附件上传</divider>
                    <FormItem label="图片" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['jpg','jpeg','png']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            accept="['image/jpg','image/jpeg','image/png']"
                            action="http://localhost:8080/achieve/uploadImg">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
            <!--            查看modal-->
            <Modal
                v-model="showModal"
                title="荣誉查看"
                width="520"
                ok-text="提交"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="项目名称" required>
                        <Input v-model="resultItem.project" placeholder="请输入项目名称" ></Input>
                    </FormItem>
                    <FormItem label="获奖人" required>
                        <Input v-model="resultItem.awardee" placeholder="请输入获奖人" ></Input>
                    </FormItem>
                    <FormItem label="获奖时间" required>
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择获奖时间" :value="resultItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
                    <FormItem label="荣誉奖项" required>
                        <Input v-model="resultItem.award" placeholder="请输入荣誉奖项" ></Input>
                    </FormItem>
                    <divider orientation="center">附件查看</divider>
                    <FormItem label="荣誉图片" >
                        <Input v-model="resultItem.imgStoragePath" placeholder="简介" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.imgStoragePath)" >预览</Button>
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
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 登记modal
            showModal: false, // 查看modal
            // 荣誉登记表单
            formItem: {
                id: -1,
                project: '',
                awardee: '',
                statusDate: '',
                award: '',
                imgName: '',
                imgStoragePath: ''
            },
            resultItem: {
                project: '',
                awardee: '',
                statusDate: '',
                award: '',
                imgName: '',
                imgStoragePath: ''
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
                    title: '课题项目名称',
                    key: 'project',
                },
                {
                    title: '获奖人',
                    key: 'awardee',
                },
                {
                    title: '获奖日期',
                    key: 'statusDate',
                },
                {
                    title: '荣誉奖项',
                    key: 'award',
                },
                {
                    title: '图片名称',
                    key: 'imgName',
                },
                {
                    title: '图片存储路径',
                    key: 'imgStoragePath',
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
        async search() {
            let that = this
            await request.get(
                '/index/getAwards',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
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
        //荣誉登记
        register() {
            let that = this
            that.resetForm()
            that.registerModal = true
        },
        statusDateChange(date) {
            this.formItem.statusDate = date
        },
        handleSuccess (res, file) {
            console.log(res)
            let that = this
            that.formItem.imgName = file.name
            that.formItem.imgStoragePath = res.data.url
        },
        handleRemove(file) {
            this.$refs.upload.clearFiles()
        },
        submit() {
            let that = this
            //判断必填项 规章荣誉类别 是否为空
            if(that.formItem.type === '' && that.formItem.type === null) {
                this.$Message.error('请选择荣誉类别！')
                return
            }
            let formData = new FormData()
            if(that.formItem.id !== -1) {
                formData.append('id', that.formItem.id)
            }
            formData.append('project', that.formItem.project)
            formData.append('awardee', that.formItem.awardee)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('award', that.formItem.award)
            formData.append('imgName', that.formItem.imgName)
            formData.append('imgStoragePath', that.formItem.imgStoragePath)

            request.post(
                '/index/submitAwardInfo',
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
                    this.$Message.info('荣誉登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('荣誉登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.project = ''
            that.formItem.awardee = ''
            that.formItem.statusDate = ''
            that.formItem.award = ''
            that.formItem.imgName = ''
            that.formItem.imgStoragePath = ''
            this.$refs.upload.clearFiles()
        },
        ok() {

        },
        cancel() {

        },
        //下载
        downloadDoc(storagePath) {

            console.log(storagePath)
            if (storagePath === null || storagePath === '' || storagePath === 'null') {
                this.$Message.error('资料待补充')
            } else {
                // window.open('http://localhost:8080/achieve/filestore/' + storagePath, '_blank')
                window.open(storagePath, '_blank')
            }
        },
        show(index) {
            let that = this
            that.showModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/index/getAwardById',
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
                    that.resultItem.awardee = res.data.awardee
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.award = res.data.award
                    that.resultItem.imgName = res.data.imgName
                    that.resultItem.imgStoragePath = res.data.imgStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('荣誉查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/index/getAwardById',
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
                    that.formItem.project = res.data.project
                    that.formItem.awardee = res.data.awardee
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.award = res.data.award
                    that.formItem.imgName = res.data.imgName
                    that.formItem.imgStoragePath = res.data.imgStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('荣誉查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/index/deleteAwardById',
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
                    this.$Message.success('荣誉删除成功！')
                }).catch(
                err => {
                    this.$Message.error('荣誉删除失败！请联系技术人员')
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
