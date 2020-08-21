<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加提示 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndexNum" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单 el-form必须在el-tabs外边 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px" label-position="top">
        <!-- Tabs typeof(+'0' | -'0' | '0'-0)-number  typeof('0'+0)-string-->
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"
                clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in mangTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox :label="cb" border v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals" clearable></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="upLoadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce"/>
              <el-button type="primary" style="margin-top:15px" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
      <el-dialog title="图片预览" :visible.sync="dialogVisible" width="30%">
          <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      cateList: [],
      mangTableData: [],
      onlyTableData: [],
      previewPath: '',
      dialogVisible: false,
      upLoadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      addForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [{
          required: true,
          message: '请输入名称',
          trigger: 'blur'
        }],
        goods_cat: [{
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '请输入价格',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '请输入数量',
          trigger: 'blur'
        }],
        goods_weight: [{
          required: true,
          message: '请输入重量',
          trigger: 'blur'
        }]
      },
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created () {
    this.getCateList()
  },
  // 联级选择器中选择框去掉/优化 & 全局css隐藏
  mounted () {
    setInterval(function () {
      document.querySelectorAll('.el-cascader-node__label').forEach(el => {
        el.onclick = function () {
          if (this.previousElementSibling) this.previousElementSibling.click()
        }
      })
    }, 1000)
  },
  methods: {
    async getCateList () {
      const {
        data: res
      } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
      this.$message.success(res.meta.msg)
    },
    handleChange () {
      // 确保第三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.mangTableData = res.data
        console.log('tabClicked -> this.mangTableData', this.mangTableData)
        this.$message.success(res.meta.msg)
      } else if (this.activeIndex === '2') {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品属性失败')
        this.onlyTableData = res.data
        console.log('tabClicked -> this.onlyTableData', this.onlyTableData)
        this.$message.success(res.meta.msg)
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log('handleRemove -> this.addForm.pics', this.addForm.pics)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log('handleSuccess -> this.addForm.pics', this.addForm.pics)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 动态参数
        this.mangTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log('add -> form.attrs', form.attrs)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    activeIndexNum () {
      return this.activeIndex - 0
    },
    cateId () {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  }
}

</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 !important;
  }
.previewImg{
    width: 100%;
}
</style>
