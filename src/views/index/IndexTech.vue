<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Button type="success" icon="md-cloud-upload" @click="register">科技创新上传</Button>
            <Button type="primary" style="margin-left: 20px" @click="search">科技创新查询</Button>
        </div>
        <Divider style="padding-top: 20px">科技创新列表(保证4-6条数据)</Divider>
        <div class="table">
            <!--            科技创新登记modal-->
            <Modal
                v-model="registerModal"
                title="科技创新上传"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="科技创新名称" required>
                        <Input v-model="formItem.project" placeholder="请输入科技创新名称" ></Input>
                    </FormItem>
                    <FormItem label="科技创新摘要" required>
                        <Input v-model="formItem.content" type="textarea" :rows="rows" placeholder="请输入科技创新摘要" />
                    </FormItem>
                    <FormItem label="科技创新类型" required>
                        <Select v-model="formItem.type" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="年度" required>
                        <DatePicker type="year" format="yyyy" placement="bottom-end" placeholder="选择年度" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
<!--                    <divider orientation="center">附件上传</divider>
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
                            &lt;!&ndash;                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>&ndash;&gt;
                        </Upload>
                    </FormItem>-->
                </Form>
            </Modal>
            <!--            查看modal-->
            <Modal
                v-model="showModal"
                title="科技创新查看"
                width="520"
                ok-text="提交"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="科技创新名称" required>
                        <Input v-model="resultItem.project" placeholder="请输入科技创新名称" readonly></Input>
                    </FormItem>
                    <FormItem label="科技创新摘要" required>
                        <Input v-model="resultItem.content" type="textarea" :rows="rows" placeholder="请输入科技创新摘要" readonly/>
                    </FormItem>
                    <FormItem label="科技创新类型" required>
                        <Select v-model="resultItem.type" >
                            <Option v-for="item in typeList" :value="item.value" :key="item.value" disabled>{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="年度" required>
                        <DatePicker type="year" format="yyyy" placement="bottom-end" placeholder="选择年度" :value="resultItem.statusDate" @on-change="statusDateChange" readonly></DatePicker>
                    </FormItem>
<!--                    <divider orientation="center">附件查看</divider>
                    <FormItem label="科技创新图片" >
                        <Input v-model="resultItem.imgStoragePath" placeholder="摘要" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.imgStoragePath)" >预览</Button>
                    </FormItem>-->
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
    name: 'indexTech',
    data() {
        return {
            typeList: [
                {
                    value: '科技项目',
                    label: '科技项目'
                },
                {
                    value: '技能创新',
                    label: '技能创新'
                },
                {
                    value: '质量改进',
                    label: '质量改进'
                },
                {
                    value: '论文',
                    label: '论文'
                },
                {
                    value: '专利',
                    label: '专利'
                },
                {
                    value: '软件著作权',
                    label: '软件著作权'
                },
            ],
            rows: 4,
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 登记modal
            showModal: false, // 查看modal
            // 科技创新登记表单
            formItem: {
                id: -1,
                project: '',
                content: '',
                statusDate: '',
                type: '',
                // imgName: '',
                // imgStoragePath: ''
            },
            resultItem: {
                project: '',
                content: '',
                // imgName: '',
                // imgStoragePath: ''
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
                    title: '科技创新名称',
                    key: 'project',
                },
                {
                    title: '科技创新摘要',
                    key: 'content',
                },
                {
                    title: '科技创新类型',
                    key: 'type',
                },
                {
                    title: '年度',
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
        }
    },
    methods: {
        async search() {
            let that = this
            await request.get(
                '/index/getTechs',
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
        //科技创新登记
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
            //判断必填项 图片 是否为空
            if(that.formItem.project === '' && that.formItem.project === null) {
                this.$Message.error('项目名称为空！请输入项目名称')
                return
            }
            let formData = new FormData()
            if(that.formItem.id !== -1) {
                formData.append('id', that.formItem.id)
            }
            formData.append('project', that.formItem.project)
            formData.append('content', that.formItem.content)
            formData.append('type', that.formItem.type)
            formData.append('statusDate', that.formItem.statusDate)

            request.post(
                '/index/submitTechInfo',
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
                    this.$Message.info('科技创新登记成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('科技创新登记失败')
                }
            )
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.project = ''
            that.formItem.content = ''
            that.formItem.type = ''
            that.formItem.statusDate = ''
            // that.formItem.imgName = ''
            // that.formItem.imgStoragePath = ''
            // this.$refs.upload.clearFiles()
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
                '/index/getTechById',
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
                    that.resultItem.content = res.data.content
                    that.resultItem.type = res.data.type
                    that.resultItem.statusDate = res.data.statusDate
                    // that.resultItem.imgName = res.data.imgName
                    // that.resultItem.imgStoragePath = res.data.imgStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('科技创新查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/index/getTechById',
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
                    that.formItem.content = res.data.content
                    that.formItem.type = res.data.type
                    that.formItem.statusDate = res.data.statusDate
                    // that.formItem.imgName = res.data.imgName
                    // that.formItem.imgStoragePath = res.data.imgStoragePath
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('科技创新查看失败')
                }
            )
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/index/deleteTechById',
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
                    this.$Message.success('科技创新删除成功！')
                }).catch(
                err => {
                    this.$Message.error('科技创新删除失败！请联系技术人员')
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
