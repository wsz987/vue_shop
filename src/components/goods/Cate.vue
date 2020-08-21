<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 列表 -->
      <tree-table class="treeTable" :data="caseList" :columns="columns" :selection-type="false" :expand-type="false" show-index
        index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else-if="scope.row.cat_deleted===true" style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 编辑 -->
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
          <!-- 删除 -->
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="30%" @close="addDialogClose">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
              <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类对话框 -->
      <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      caseList: [],
      // 父级分裂列表
      parentCateList: [],
      // 总数据条数
      total: 0,
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 当前列自定义为模板列
        type: 'template',
        // 当前列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 当前列自定义为模板列
        type: 'template',
        // 当前列使用模板名称
        template: 'order'
      }, {
        label: '操作',
        // 当前列自定义为模板列
        type: 'template',
        // 当前列使用模板名称
        template: 'opt'
      }],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid: 0
      },
      editForm: {
        cat_id: '',
        cat_name: ''
      },
      addFormRules: {
        cat_name: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'blur'
        },
        {
          min: 1,
          max: 10,
          message: '长度在 1 到 10 个字符',
          trigger: 'blur'
        }
        ]
      },
      // 联级选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中父级分类的id组
      selectedKeys: []
    }
  },
  created () {
    this.getCaseList()
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
    async getCaseList () {
      const {
        data: res
      } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据列表失败')
      console.log('getCaseList -> res', res.data)
      this.caseList = res.data.result
      this.total = res.data.total
      return this.$message.success(res.meta.msg)
    },
    // 监听pagesize
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCaseList()
    },
    // 监听pagenum
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCaseList()
    },
    // addDialog 关闭清理
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    // addDialog 关闭清理
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    showAddCateDialog () {
      this.getParentCateDialog()
      this.addDialogVisible = true
    },
    // 获取父级分类
    async getParentCateDialog () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      console.log('getCaseList -> res', res.data)
      this.parentCateList = res.data
    },
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, { cat_name: this.editForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改分类失败!')
        this.editDialogVisible = false
        this.getCaseList()
        this.$message.success('修改分类成功!')
      })
    },
    removeCateById (id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {
          data: res
        } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败!')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getCaseList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success(res.meta.msg)
        this.getCaseList()
        this.addDialogVisible = false
      })
    },
    // 联级选择器选中触发
    parentCateChange () {
      // 判断是否选中
      if (this.selectedKeys.length > 0) {
        // 父级分列id
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        // 当前分类等级
        this.addForm.cat_level = 0
      }
    },
    // editDialog 信息查询加载
    showEditDialog (cate) {
      this.editForm.cat_name = cate.cat_name
      this.editForm.cat_id = cate.cat_id
      this.editDialogVisible = true
    }
  }
}

</script>

<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}

</style>
