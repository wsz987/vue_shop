<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表 -->
      <el-table :data="roleslist" border stripe="">
        <!-- 展开列 -->
        <el-table-column type="expand" label="#">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0 ? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染 二 & 三 级权限 -->
              <el-col :span="19">
                <el-row :span="6" :class="[i2===0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag type="warning" :class="[i3===0 ? '':'bdtop']" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRolesById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close="addDialogClose">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 权限分配对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%"
      @close="setRightDialogClosed">
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="alloRight">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleslist: [],
      rightslist: [],
      // 当前id
      roleId: '',
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      addDialogVisible: false,
      setRightDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {},
      // 默认选中的节点
      defkeys: [],
      addFormRules: {
        roleName: [{
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
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取列表
    async getRolesList () {
      const {
        data: res
      } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleslist = res.data
      console.log('getRolesList -> res.data', res.data)
      this.$message.success(res.meta.msg)
    },
    // 添加角色
    async addRoles () {
      const {
        data: res
      } = await this.$http.post('roles', this.addForm)
      console.log('addRoles -> data', res)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败')
      this.$message.success(res.meta.msg)
      this.addDialogVisible = false
      this.getRolesList()
    },
    // addDialog 关闭清理
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // addDialog 关闭清理
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // setRightDialog关闭清理
    setRightDialogClosed () {
      this.defkeys = []
    },
    // 删除用户 & 确认
    removeRolesById (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {
          data: res
        } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败!')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getRolesList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 根据id删除对应权限 & 确认
    removeRightById (role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {
          data: res
        } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败!')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        role.children = res.data
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 权限分配Dialog
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所以权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightslist = res.data
      console.log('showSetRightDialog -> this.rightslist', this.rightslist)
      // 获取三级节点id
      this.getLeafkeys(role, this.defkeys)
      this.$message.success(res.meta.msg)
      this.setRightDialogVisible = true
    },
    // 递归 获取角色下所有三级权限id->defkeys[]
    getLeafkeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafkeys(item, arr)
      })
    },
    async alloRight () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('更新权限失败')
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 提交角色修改
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色信息失败!')
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('修改角色信息成功!')
      })
      this.editDialogVisible = false
    },
    // 查询角色信息
    async editRoleDialog (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询角色失败')
      this.editForm = res.data
      console.log('editRoleDialog -> this.editForm', this.editForm)
      this.$message.success(res.meta.msg)
      this.editDialogVisible = true
    }
  }
}

</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
