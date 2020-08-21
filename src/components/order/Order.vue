<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="queryOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="queryOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="orderslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="95px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="90px">
          <template slot-scope="scope">
            <el-button type="success" plain size="mini" v-if="scope.row.pay_status==='1'">已付款</el-button>
            <el-button type="danger" plain size="mini" v-else-if="scope.row.pay_status==='0'">未付款</el-button>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="70px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="150px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改订单地址 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog" title="修改订单地址">
            </el-button>
            <!-- 物流进度 -->
            <el-button size="mini" type="success" icon="el-icon-location"
              @click="showProgressDialog(scope.row.order_id)" title="物流进度">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
    </el-card>

    <!-- 修改订单地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="省市区/县" prop="attress1">
          <el-cascader v-model="editForm.attress1" :options="cityData" :props="cateProps" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="attress2">
          <el-input v-model="editForm.attress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrder">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="30%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'

export default {
  data () {
    return {
      total: 0,
      cityData,
      orderslist: [],
      progressInfo: [],
      editForm: {
        ttress1: [],
        attress2: ''
      },
      editDialogVisible: false,
      progressDialogVisible: false,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      editFormRules: {
        attress1: [{
          required: true,
          message: '请选择省市区/县',
          trigger: 'blur'
        }],
        attress2: [{
          required: true,
          message: '详细地址',
          trigger: 'blur'
        }]
      },
      cateProps: {
        expandTrigger: 'hover'
      }
    }
  },
  created () {
    this.getOrderslist()
  },
  methods: {
    async getOrderslist () {
      const {
        data: res
      } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.orderslist = res.data.goods
      this.total = res.data.total
      console.log('this.orderslist', this.orderslist)
      this.$message.success(res.meta.msg)
    },
    queryOrdersList () {
      console.log('queryOrdersList -> this.queryInfo.query', this.queryInfo.query)
      this.queryInfo.pagenum = 1
      this.getOrderslist()
    },
    // pagesize监听
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderslist()
    },
    // pagenum监听
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderslist()
    },
    showEditDialog () {
      this.editDialogVisible = true
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    async showProgressDialog () {
      const {
        data: res
      } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      console.log('showProgressDialog -> this.progressInfo', this.progressInfo)
      this.$message.success(res.meta.message)
      this.progressDialogVisible = true
    },
    editOrder () {}
  }
}

</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }

</style>
