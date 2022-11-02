<template>
    <div class="container" style="margin: 20px">
        <div class="search">
            <Button type="success" icon="md-cloud-upload" @click="register">轮播图上传</Button>
            <Button type="primary" style="margin-left: 20px" @click="search">轮播图查询</Button>
        </div>
        <Divider style="padding-top: 20px">轮播图列表</Divider>
        <div class="table">
            <!--            轮播图上传modal-->
            <Modal
                v-model="registerModal"
                title="轮播图上传"
                width="520"
                ok-text="提交"
                @on-ok="submit"
                @on-cancel="cancel" scrollable draggable>
                <Form :model="formItem" :label-width="200">
                    <divider orientation="center">图片上传（可多选，不超过20mb）</divider>
                    <FormItem label="轮播图(jpg,jpeg,png)：" required>
                        <Upload
                            ref="upload"
                            :show-upload-list="true"
                            :format="['jpg','jpeg','png']"
                            :max-size="20480"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            multiple
                            accept="['image/jpg','image/jpeg','image/png']"
                            action="http://localhost:8080/achieve/uploadImg">
                            <Button icon="ios-cloud-upload-outline">上传图片</Button>
                            <!--                            <div slot="tip">支持文件类型:.pdf，文件大小不超过20mb</div>-->
                        </Upload>
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
    name: 'indexBanner',
    data() {
        return {
            //查询loading
            loading: false,
            //弹出框 Modal条件
            registerModal: false, // 上传modal
            showModal: false, // 查看modal
            // 轮播图上传表单
            formItem: {
                uploadList: [],
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
                    title: '图片名称',
                    key: 'imgName',
                },
                {
                    title: '存储路径',
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
        reback() {
            this.$router.back()
        },
        async search() {
            let that = this
            await request.get(
                '/index/getBanners',
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
        //图片上传 modal
        register() {
            let that = this
            that.resetForm()
            that.registerModal = true
        },
        resetForm() {
            let that = this
            that.formItem.uploadList = []
            this.$refs.upload.clearFiles()
        },
        handleSuccess (res, file) {
            console.log(res)
            let that = this
            let img = res.data
            that.formItem.uploadList.push(img)
        },
        handleRemove(file) {
            let that = this
            let tempFileList = that.formItem.uploadList
            that.formItem.uploadList.splice(tempFileList.indexOf(file), 1)
        },
        submit() {
            let that = this
            //判断必填项 图片 是否为空
            if(that.formItem.uploadList.length === 0) {
                this.$Message.error('未上传图片！')
                return
            }
            let formData = new FormData()
            let uploadListJson = JSON.stringify(that.formItem.uploadList)
            formData.append('uploadListJson', uploadListJson)

            request.post(
                '/index/submitBannerInfo',
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
                    this.$Message.info('轮播图上传成功')
                }
            ).catch(
                err => {
                    console.log(err)
                    this.$Message.error('轮播图上传失败')
                }
            )
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
            let storagePath = that.form_list_content[index].imgStoragePath
            if (storagePath === null || storagePath === '' || storagePath === 'null') {
                this.$Message.error('资料待补充')
            } else {
                // window.open('http://localhost:8080/achieve/filestore/' + storagePath, '_blank')
                window.open(storagePath, '_blank')
            }
        },
        remove(index) {
            let paramId = this.form_list_content[index].id
            this.form_list_content.splice(index, 1)
            request.delete(
                '/index/deleteBannerById',
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
                    this.$Message.success('轮播图删除成功！')
                }).catch(
                err => {
                    this.$Message.error('轮播图删除失败！请联系技术人员')
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
