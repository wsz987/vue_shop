<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 联级选择器 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:
            <el-cascader v-model="selectedKeys" :options="cateList" :props="cateProps" @change="handleChange" clearable>
            </el-cascader>
          </span>
        </el-col>
      </el-row>
      <!-- Tabs -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态表格 -->
          <el-table :data="mangTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" clearable></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑 -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <!-- 删除 -->
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" clearable></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑 -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <!-- 删除 -->
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数/属性对话框 -->
      <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="30%" @close="addDialogClose">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数/属性对话框 -->
      <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="30%">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeName: 'many',
      addDialogVisible: false,
      editDialogVisible: false,
      mangTableData: [],
      onlyTableData: [],
      cateList: [],
      selectedKeys: [],
      addForm: {
        attr_name: ''
      },
      editForm: {},
      // 联级选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入名称',
          trigger: 'blur'
        },
        {
          min: 1,
          max: 10,
          message: '长度在 1 到 10 个字符',
          trigger: 'blur'
        }
        ]
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
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    // addDialog 关闭清理
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 获取参数列表
    async getParamsData () {
      // 确保第三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        // 点到二级分类清空列表
        this.mangTableData = []
        this.onlyTableData = []
        return
      }
      const {
        data: res
      } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      console.log('handle(Tab)Change -> res ', res.data)
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') this.mangTableData = res.data
      else this.onlyTableData = res.data
      this.$message.success(res.meta.msg)
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    removeCateById (attrid) {
      this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {
          data: res
        } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
        if (res.meta.status !== 200) return this.$message.error(`删除${this.titleText}失败!`)
        this.getParamsData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async showEditDialog (attrid) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editForm = res.data
      this.$message.success(res.meta.msg)
      this.editDialogVisible = true
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    showInput (row) {
      row.inputVisible = true
      // $nextTick页面被重新渲染后 文本框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 保存修改后的属性并提交  add & del 都是涉及attr_vals提交 del不需要delete请求
    async saveAttrVals (row) {
      const {
        data: res
      } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败!')
      this.$message.success(res.meta.msg)
    },
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 当前选中三级类id
    cateId () {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    },
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    }
  }
}

</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

.el-tag{
  margin: 10px;
}
.input-new-tag{
  width: 120px;
}
</style>
