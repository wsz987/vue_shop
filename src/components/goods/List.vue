<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 & 添加 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="queryGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="queryGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="150px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)">编辑</el-button>
            <!-- 删除 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeGoodsById(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 50]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      total: 0,
      goodslist: [],
      addDialogVisible: false,
      editDialogVisible: false,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const {
        data: res
      } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.total = res.data.total
      this.goodslist = res.data.goods
      console.log('this.goodslist', this.goodslist)
      this.$message.success(res.meta.msg)
    },
    // pagesize监听
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // pagenum监听
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    removeGoodsById (id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {
          data: res
        } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除商品失败!')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getGoodsList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        const { data: res } = await this.$http.post('goods', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('获取商品列表失败')
        this.$message.success(res.meta.msg)
        this.getGoodsList()
        this.addDialogVisible = false
      })
    },
    queryGoodsList () {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}

</script>

<style lang="less" scoped>

</style>
