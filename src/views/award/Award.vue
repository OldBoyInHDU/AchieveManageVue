<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Select v-model="type" style="width:150px" placeholder="荣誉类别" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="level" style="width:150px; margin-left: 20px" placeholder="荣誉等级" clearable>
                <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="sort" style="width:150px; margin-left: 20px" placeholder="企业内外" clearable>
                <Option v-for="item in sortList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="awardee" placeholder="获奖人/荣誉" style="width: 200px; margin-left: 20px" clearable/>
            <Input v-model="award" placeholder="荣誉名称" style="width: 150px; margin-left: 20px" clearable/>
            <DatePicker :value="daterange" format="yyyy" type="year" placeholder="选择年度" style="width: 150px; margin-left: 20px" @on-change="dateRangeChange" clearable></DatePicker>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">荣誉列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">荣誉登记</Button>
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
            <!--            荣誉登记-->
            <Modal
                v-model="registerModal"
                title="荣誉登记"
                width="550"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="荣誉类别" required>
                        <Select v-model="formItem.type" placeholder="请输入荣誉类别" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="荣誉等级" required>
                        <Select v-model="formItem.level" placeholder="请输入荣誉等级" clearable>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="企业内外" required>
                        <RadioGroup v-model="formItem.sort" type="button" >
                            <Radio label="企业内">企业内</Radio>
                            <Radio label="企业外">企业外</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="获奖人/荣誉" required>
                        <Input v-model="formItem.awardee" placeholder="请输入获奖人/荣誉" ></Input>
                    </FormItem>
                    <FormItem label="荣誉名称" required>
                        <Input v-model="formItem.award" placeholder="请输入荣誉名称" ></Input>
                    </FormItem>
                    <FormItem label="年度">
                        <DatePicker type="year" format="yyyy" placement="bottom-end" placeholder="选择年度" :value="formItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
                    <divider orientation="center">附件上传（PDF，不超过20mb）</divider>
                    <FormItem label="荣誉证书" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['pdf']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            accept="application/pdf"
                            action="http://localhost:8088/achieve/award/awardUpload">
                            <Button icon="ios-cloud-upload-outline">上传文件</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
            <!--            荣誉查看-->
            <Modal
                v-model="showModal"
                title="荣誉查看"
                width="550"
                ok-text="确定"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="荣誉类别" required>
                        <Select v-model="resultItem.type" placeholder="请输入荣誉类别" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="荣誉等级" required>
                        <Select v-model="resultItem.level" placeholder="请输入荣誉等级" clearable>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="企业内外" required>
                        <RadioGroup v-model="resultItem.sort" type="button">
                            <Radio label="企业内">企业内</Radio>
                            <Radio label="企业外">企业外</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="获奖人/荣誉" required>
                        <Input v-model="resultItem.awardee" placeholder="请输入获奖人/荣誉" ></Input>
                    </FormItem>
                    <FormItem label="荣誉名称" required>
                        <Input v-model="resultItem.award" placeholder="请输入荣誉名称" ></Input>
                    </FormItem>
                    <FormItem label="年度">
                        <DatePicker type="year" format="yyyy" placement="bottom-end" placeholder="选择年度" :value="resultItem.statusDate" @on-change="statusDateChange" ></DatePicker>
                    </FormItem>
                    <divider orientation="center">附件列表</divider>
                    <FormItem label="荣誉证书" >
                        <Input v-model="resultItem.certStoragePath" placeholder="荣誉证书" style="width: 200px; padding-right: 20px" readonly></Input>
                        <Button type="primary" ghost @click="downloadDoc(resultItem.certStoragePath)" >预览</Button>
                    </FormItem>
                </Form>
            </Modal>
            <!--            确认删除-->
            <Modal
                v-model="confirmModal"
                title="删除确认"
                @on-ok="remove()"
                ok-text="删除"
                @on-cancel="cancel">
                <p>确定删除《{{toDeleteDoc}}》荣誉吗？</p>
            </Modal>
        </div>
    </div>

</template>

<script>
import request from "@/utils/request";

export default {
    name: 'award',
    data() {
        return {
            typeList: [
                {
                    value: '个人荣誉',
                    label: '个人荣誉'
                },
                {
                    value: '集体荣誉',
                    label: '集体荣誉'
                },
                {
                    value: '荣誉荣誉',
                    label: '荣誉荣誉'
                },
                {
                    value: '其他',
                    label: '其他'
                },
            ],
            levelList: [
                {
                    value: '国家级',
                    label: '国家级'
                },
                {
                    value: '省部级',
                    label: '省部级'
                },
                {
                    value: '厅局级',
                    label: '厅局级'
                },
                {
                    value: '县处级',
                    label: '县处级'
                },
            ],
            sortList: [
                {
                    value: '企业内',
                    label: '企业内'
                },
                {
                    value: '企业外',
                    label: '企业外'
                },
            ],
            type: '',
            level: '',
            sort: '',
            awardee: '',
            award: '',
            daterange: '',
            //查询loading
            loading: false,
            registerModal: false,
            showModal: false,
            confirmModal: false,
            formItem: {
                id: -1,
                type: '',
                level: '',
                sort: '',
                awardee: '',
                award: '',
                statusDate: '',
                cert: '',
                certStoragePath: ''
            },
            resultItem: {
                id: -1,
                type: '',
                level: '',
                sort: '',
                awardee: '',
                award: '',
                statusDate: '',
                cert: '',
                certStoragePath: ''
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
                    title: '荣誉类别',
                    key: 'type',
                },
                {
                    title: '荣誉等级',
                    key: 'level',
                },
                {
                    title: '获奖人/项目',
                    key: 'awardee',
                },
                {
                    title: '企业内外',
                    key: 'sort',
                },
                {
                    title: '荣誉名称',
                    key: 'award',
                },
                {
                    title: '荣誉年度',
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
        }
    },
    methods: {
        dateRangeChange(date) {
            this.daterange = date;
        },
        async search() {
            let that = this
            // let dateList = this.daterange
            await request.get(
                '/award/getAwards',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        type: that.type,
                        level: that.level,
                        sort: that.sort,
                        awardee: that.awardee,
                        award: that.award,
                        year: that.daterange
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
            that.level = ''
            that.sort = ''
            that.awardee = ''
            that.award = ''
            that.daterange = ''
        },
        resetForm() {
            let that = this
            this.$refs.upload.clearFiles()
            that.formItem.id = -1
            that.formItem.type = ''
            that.formItem.level = ''
            that.formItem.sort = ''
            that.formItem.awardee = ''
            that.formItem.award = ''
            that.formItem.statusDate = ''
            that.formItem.cert = ''
            that.formItem.certStoragePath = ''
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
            console.log(res)
            let that = this
            that.formItem.cert = file.name
            that.formItem.certStoragePath = res.data
        },
        handleRemove(file) {
            let that = this
            let tempFileList = that.formItem.uploadList
            that.formItem.uploadList.splice(tempFileList.indexOf(file), 1)
        },
        submit() {
            let that = this
            if(that.formItem.type === '' || that.formItem.type === null) {
                this.$Message.error('请输入荣誉类别！')
                return
            }
            if(that.formItem.level === '' || that.formItem.level === null) {
                this.$Message.error('请选择荣誉等级！')
                return
            }
            if(that.formItem.sort === '' || that.formItem.sort === null) {
                this.$Message.error('请选择荣誉获得地点！')
                return
            }
            if(that.formItem.awardee === '' || that.formItem.awardee === null) {
                this.$Message.error('请选择获奖人/荣誉！')
                return
            }
            if(that.formItem.award === '' || that.formItem.award === null) {
                this.$Message.error('请输入荣誉名称！')
                return
            }
            /*if(that.formItem.uploadList.length < 1) {
                this.$Message.error('文件为空！请选择要上传的文件！')
                return
            }*/
            let formData = new FormData()
            let uploadListJson = JSON.stringify(that.formItem.uploadList)
            if(that.formItem.id != -1) {
                formData.append('id', that.formItem.id)
            }

            formData.append('type', that.formItem.type)
            formData.append('level', that.formItem.level)
            formData.append('sort', that.formItem.sort)
            formData.append('awardee', that.formItem.awardee)
            formData.append('award', that.formItem.award)
            formData.append('statusDate', that.formItem.statusDate)
            formData.append('cert', that.formItem.cert)
            formData.append('certStoragePath', that.formItem.certStoragePath)
            request.post(
                '/award/submitAwardInfo',
                formData,
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            ).then(
                res => {
                    console.log(res)
                    that.$Message.success('荣誉登记成功！')
                    // that.showUploadListFlag = false
                }
            ).catch(
                err => {
                    console.log(err)
                    that.$Message.error('荣誉登记失败，请联系技术人员')
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
            // let paramProj = that.form_list_content[index].project
            request.get(
                '/award/getAwardById',
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
                    that.resultItem.level = res.data.level
                    that.resultItem.sort = res.data.sort
                    that.resultItem.awardee = res.data.awardee
                    that.resultItem.award = res.data.award
                    that.resultItem.statusDate = res.data.statusDate
                    that.resultItem.cert = res.data.cert
                    that.resultItem.certStoragePath = res.data.certStoragePath
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
                '/award/getAwardById',
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
                    that.formItem.level = res.data.level
                    that.formItem.sort = res.data.sort
                    that.formItem.awardee = res.data.awardee
                    that.formItem.award = res.data.award
                    that.formItem.statusDate = res.data.statusDate
                    that.formItem.cert = res.data.cert
                    that.formItem.certStoragePath = res.data.certStoragePath
                    this.$refs.upload.clearFiles()
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('荣誉修改失败')
                }
            )
        },
        confirm(index) {
            let that = this
            that.confirmModal = true
            that.toDeleteDoc = that.form_list_content[index].award
            that.delDocIndex = index
            // that.remove(index)
        },
        remove() {
            let index = this.delDocIndex
            let paramId = this.form_list_content[index].id
            // let paramProj = this.toDeleteDoc
            this.form_list_content.splice(index, 1)
            request.delete(
                '/award/deleteAwardById',
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
                    this.$Message.success('荣誉删除成功！')
                }).catch(
                err => {
                    this.$Message.error('荣誉删除失败！请联系技术人员')
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
