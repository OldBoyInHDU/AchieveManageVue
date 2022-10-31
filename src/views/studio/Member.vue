<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Input v-model="name" placeholder="姓名" style="width: 150px" clearable/>
            <Select v-model="type" style="width:150px; margin-left: 20px" placeholder="类别" clearable>
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="academic" style="width:150px; margin-left: 20px" placeholder="学历" clearable>
                <Option v-for="item in academicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Select v-model="skillName" style="width:150px; margin-left: 20px" placeholder="职业技能名称1" clearable>
                <Option v-for="item in skillList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <Input v-model="techName" placeholder="专业技术名称" style="width: 150px; margin-left: 20px" clearable/>
            <Button type="primary" style="margin-left: 20px" @click="search">查询</Button>
            <Button type="error" style="margin-left: 10px" @click="reset">重置</Button>
        </div>
        <Divider style="padding-top: 20px">成员列表</Divider>
        <div class="table">
            <Button type="success" icon="md-add-circle" @click="register">信息登记</Button>
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
            <!--            成员登记-->
            <Modal
                v-model="registerModal"
                title="信息登记"
                width="550"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="120">
                    <FormItem label="姓名" required>
                        <Input v-model="formItem.name" placeholder="请输入姓名" ></Input>
                    </FormItem><FormItem label="类别" required>
                        <Select v-model="formItem.type" placeholder="请输入类别" clearable>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="性别" required>
                        <RadioGroup v-model="formItem.gender" type="button">
                            <Radio label="男">男</Radio>
                            <Radio label="女">女</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="出生年月">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择出生年月" :value="formItem.birthday" @on-change="birthdayChange" ></DatePicker>
                    </FormItem>
                    <FormItem label="学历" required>
                        <Select v-model="formItem.academic" placeholder="请选择学历" clearable>
                            <Option v-for="item in academicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="学位" >
                        <Select v-model="formItem.degree" placeholder="请选择学位" clearable>
                            <Option v-for="item in degreeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职业技能名称1" required>
                        <Select v-model="formItem.skillName1" placeholder="请输入职业技能名称1" clearable>
                            <Option v-for="item in skillList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="等级1" required>
                        <Select v-model="formItem.skillLevel1" placeholder="请选择等级1" clearable>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职业技能名称2" >
                        <Input v-model="formItem.skillName2" placeholder="请输入职业技能名称2" ></Input>
                    </FormItem>
                    <FormItem label="等级2" >
                        <Select v-model="formItem.skillLevel2" placeholder="请选择等级2" clearable>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="专业技术名称" required>
                        <Input v-model="formItem.techName" placeholder="请输入专业技术名称" ></Input>
                    </FormItem>
                    <FormItem label="等级" required>
                        <RadioGroup v-model="formItem.techLevel" type="button">
                            <Radio label="初级">初级</Radio>
                            <Radio label="中级">中级</Radio>
                            <Radio label="高级">高级</Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Modal>
            <!--            信息查看-->
            <Modal
                v-model="showModal"
                title="信息查看"
                width="550"
                ok-text="确定"
                @on-ok="ok"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="resultItem" :label-width="120">
                    <FormItem label="姓名" required>
                        <Input v-model="resultItem.name" placeholder="请输入姓名" readonly></Input>
                    </FormItem>
                    <FormItem label="类别" required>
                        <Select v-model="resultItem.type" placeholder="请输入类别" disabled>
                            <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="性别" required>
                        <RadioGroup v-model="resultItem.gender" type="button">
                            <Radio label="男">男</Radio>
                            <Radio label="女">女</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="出生年月">
                        <DatePicker type="date" format="yyyy-MM-dd" placement="bottom-end" placeholder="选择出生年月" :value="resultItem.birthday" @on-change="birthdayChange" ></DatePicker>
                    </FormItem>
                    <FormItem label="学历" required>
                        <Select v-model="resultItem.academic" placeholder="请选择学历" disabled>
                            <Option v-for="item in academicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="学位" >
                        <Select v-model="resultItem.degree" placeholder="请选择学位" disabled>
                            <Option v-for="item in degreeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职业技能名称1" required>
                        <Select v-model="resultItem.skillName1" placeholder="请输入职业技能名称1" disabled>
                            <Option v-for="item in skillList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="等级1" required>
                        <Select v-model="resultItem.skillLevel1" placeholder="请选择等级1" disabled>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="职业技能名称2" >
                        <Input v-model="resultItem.skillName2" placeholder="请输入职业技能名称2" readonly></Input>
                    </FormItem>
                    <FormItem label="等级2" >
                        <Select v-model="resultItem.skillLevel2" placeholder="请选择等级2" disabled>
                            <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="专业技术名称" required>
                        <Input v-model="resultItem.techName" placeholder="请输入专业技术名称" readonly></Input>
                    </FormItem>
                    <FormItem label="等级" required>
                        <RadioGroup v-model="resultItem.techLevel" type="button">
                            <Radio label="初级">初级</Radio>
                            <Radio label="中级">中级</Radio>
                            <Radio label="高级">高级</Radio>
                        </RadioGroup>
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
                <p>确定删除《{{toDeleteDoc}}》成员吗？</p>
            </Modal>
        </div>
    </div>

</template>

<script>
import request from "@/utils/request";

export default {
    name: 'member',
    data() {
        return {
            typeList: [
                {
                    value: '机械',
                    label: '机械'
                },
                {
                    value: '电气',
                    label: '电气'
                },
            ],
            academicList: [
                {
                    value: '大专',
                    label: '大专'
                },
                {
                    value: '本科',
                    label: '本科'
                },
                {
                    value: '硕士研究生',
                    label: '硕士研究生'
                },
                {
                    value: '博士研究生',
                    label: '博士研究生'
                },
            ],
            degreeList: [
                {
                    value: '无',
                    label: '无'
                },
                {
                    value: '学士',
                    label: '学士'
                },
                {
                    value: '硕士',
                    label: '硕士'
                },
                {
                    value: '博士',
                    label: '博士'
                },
            ],
            levelList: [
                {
                    value: '一级',
                    label: '一级'
                },
                {
                    value: '二级',
                    label: '二级'
                },
                {
                    value: '三级',
                    label: '三级'
                },
                {
                    value: '四级',
                    label: '四级'
                },
                {
                    value: '五级',
                    label: '五级'
                },
            ],
            skillList: [
                {
                    value: '烟机设备修理工(制丝)',
                    label: '烟机设备修理工(制丝)'
                },
                {
                    value: '烟叶制丝设备电气维修工',
                    label: '烟叶制丝设备电气维修工'
                },
            ],
            name: '',
            type: '',
            academic: '',
            skillName: '',
            techName: '',
            //查询loading
            loading: false,
            registerModal: false,
            showModal: false,
            confirmModal: false,
            formItem: {
                id: -1,
                name: '',
                type: '',
                gender: '',
                birthday: '',
                academic: '',
                degree: '',
                skillName1: '',
                skillLevel1: '',
                skillName2: '',
                skillLevel2: '',
                techName: '',
                techLevel: '',
            },
            resultItem: {
                id: -1,
                name: '',
                type: '',
                gender: '',
                birthday: '',
                academic: '',
                degree: '',
                skillName1: '',
                skillLevel1: '',
                skillName2: '',
                skillLevel2: '',
                techName: '',
                techLevel: '',
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
                    title: '姓名',
                    key: 'name',
                },
                {
                    title: '类别',
                    key: 'type',
                },
                {
                    title: '性别',
                    key: 'gender',
                },
                {
                    title: '出生年月',
                    key: 'birthday',
                },
                {
                    title: '学历',
                    key: 'academic',
                },
                {
                    title: '学位',
                    key: 'degree',
                },
                {
                    title: '职业技能名称1',
                    key: 'skillName1',
                },
                {
                    title: '等级1',
                    key: 'skillLevel1',
                },
                {
                    title: '职业技能名称2',
                    key: 'skillName2',
                },
                {
                    title: '等级2',
                    key: 'skillLevel2',
                },
                {
                    title: '专业技术名称',
                    key: 'techName',
                },
                {
                    title: '等级',
                    key: 'techLevel',
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
        async search() {
            let that = this
            await request.get(
                '/studio/getMembers',
                {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    params: {
                        name: that.name,
                        type: that.type,
                        academic: that.academic,
                        skillName1: that.skillName1,
                        techName: that.techName,
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
            that.name = ''
            that.type = ''
            that.academic = ''
            that.skillName1 = ''
            that.techName = ''
        },
        resetForm() {
            let that = this
            that.formItem.id = -1
            that.formItem.name = ''
            that.formItem.type = ''
            that.formItem.gender = ''
            that.formItem.birthday = ''
            that.formItem.academic = ''
            that.formItem.degree = ''
            that.formItem.skillName1 = ''
            that.formItem.skillLevel1 = ''
            that.formItem.skillNamel2 = ''
            that.formItem.skillLeve2 = ''
            that.formItem.techName = ''
            that.formItem.techLevel = ''
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
        birthdayChange(date) {
            this.formItem.birthday = date
        },
        submit() {
            let that = this
            if(that.formItem.name === '' || that.formItem.name === null) {
                this.$Message.error('请输入姓名！')
                return
            }
            if(that.formItem.type === '' || that.formItem.type === null) {
                this.$Message.error('请选择类别！')
                return
            }
            if(that.formItem.gender === '' || that.formItem.gender === null) {
                this.$Message.error('请选择性别！')
                return
            }
            if(that.formItem.academic === '' || that.formItem.academic === null) {
                this.$Message.error('请选择学历！')
                return
            }
            if(that.formItem.skillName1 === '' || that.formItem.skillName1 === null) {
                this.$Message.error('请选择职业技能名称1！')
                return
            }
            if(that.formItem.skillLevel1 === '' || that.formItem.skillLevel1 === null) {
                this.$Message.error('请选择等级1！')
                return
            }
            if(that.formItem.techName === '' || that.formItem.techName === null) {
                this.$Message.error('请输入专业技术名称！')
                return
            }
            if(that.formItem.techLevel === '' || that.formItem.techLevel === null) {
                this.$Message.error('请选择等级！')
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

            formData.append('name', that.formItem.name)
            formData.append('type', that.formItem.type)
            formData.append('gender', that.formItem.gender)
            formData.append('birthday', that.formItem.birthday)
            formData.append('academic', that.formItem.academic)
            formData.append('degree', that.formItem.degree)
            formData.append('skillName1', that.formItem.skillName1)
            formData.append('skillLevel1', that.formItem.skillLevel1)
            formData.append('skillName2', that.formItem.skillName2)
            formData.append('skillLevel2', that.formItem.skillLevel2)
            formData.append('techName', that.formItem.techName)
            formData.append('techLevel', that.formItem.techLevel)
            request.post(
                '/studio/submitMemberInfo',
                formData,
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            ).then(
                res => {
                    console.log(res)
                    that.$Message.success('成员登记成功！')
                    // that.showUploadListFlag = false
                }
            ).catch(
                err => {
                    console.log(err)
                    that.$Message.error('成员登记失败，请联系技术人员')
                    // that.showUploadListFlag = false
                }
            )
        },
        ok() {
            let that = this
            that.confirmModal = false
            // this.$Message.info('')
        },
        cancel() {
            this.$Message.info('已取消')
        },
        show(index) {
            let that = this
            that.showModal = true
            let paramId = that.form_list_content[index].id
            // let paramProj = that.form_list_content[index].project
            request.get(
                '/studio/getMemberById',
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
                    that.resultItem.name = res.data.name
                    that.resultItem.type = res.data.type
                    that.resultItem.gender = res.data.gender
                    that.resultItem.birthday = res.data.birthday
                    that.resultItem.academic = res.data.academic
                    that.resultItem.degree = res.data.degree
                    that.resultItem.skillName1 = res.data.skillName1
                    that.resultItem.skillLevel1 = res.data.skillLevel1
                    that.resultItem.skillName2 = res.data.skillName2
                    that.resultItem.skillLevel2 = res.data.skillLevel2
                    that.resultItem.techName = res.data.techName
                    that.resultItem.techLevel = res.data.techLevel
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('成员查看失败')
                }
            )
        },
        modify(index) {
            let that = this
            that.registerModal = true
            let paramId = that.form_list_content[index].id
            request.get(
                '/studio/getMemberById',
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
                    that.formItem.name = res.data.name
                    that.formItem.type = res.data.type
                    that.formItem.gender = res.data.gender
                    that.formItem.birthday = res.data.birthday
                    that.formItem.academic = res.data.academic
                    that.formItem.degree = res.data.degree
                    that.formItem.skillName1 = res.data.skillName1
                    that.formItem.skillLevel1 = res.data.skillLevel1
                    that.formItem.skillName2 = res.data.skillName2
                    that.formItem.skillLevel2 = res.data.skillLevel2
                    that.formItem.techName = res.data.techName
                    that.formItem.techLevel = res.data.techLevel
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('成员修改失败')
                }
            )
        },
        confirm(index) {
            let that = this
            that.confirmModal = true
            that.toDeleteDoc = that.form_list_content[index].name
            that.delDocIndex = index
            // that.remove(index)
        },
        remove() {
            let index = this.delDocIndex
            let paramId = this.form_list_content[index].id
            // let paramProj = this.toDeleteDoc
            this.form_list_content.splice(index, 1)
            request.delete(
                '/studio/deleteMemberById',
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
                    this.$Message.success('成员删除成功！')
                }).catch(
                err => {
                    this.$Message.error('成员删除失败！请联系技术人员')
                }
            )
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
