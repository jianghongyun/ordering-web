<template>
  <div class="content">
    <div class="app-container calendar-list-container">
      <div class="filter-container">
        <el-button class="filter-item" @click="handleCreate" type="primary" icon="edit">添加菜单分类
        </el-button>
      </div>
      <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
                    highlight-current-row style="width: 100%">
        <el-table-column align="center" label="菜单分类名称">
            <template slot-scope="scope">              
                <!-- <el-input v-if="scope.row.edit" v-model="scope.row.menuClassName"></el-input> -->
                <span>{{ scope.row.menuClassName }}</span>
            </template>
        </el-table-column>              
        <el-table-column align="center" label="操作" width="200">
            <template slot-scope="scope">
                <el-button size="small" type="success"
                          @click="handleUpdate(scope.row)">编辑
                </el-button>
                <el-button size="small" type="danger"
                          @click="deleterow(scope.row)">删除
                </el-button>
                
            </template>
        </el-table-column>
      </el-table>
      <div v-show="!listLoading" class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                      :current-page.sync="listQuery.page"
                      :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize"
                      layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item v-show="false" label="主键id" prop="id" v-if="dialogStatus == 'update'">
          <el-input v-model="form.id" placeholder="主键id" :disabled="true"></el-input>
        </el-form-item>
   
        <el-form-item label="菜单分类名称" prop="menuClassName">
          <el-input v-model="form.menuClassName" placeholder="菜单分类名称"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
        <el-button v-if="dialogStatus == 'update'" type="primary" @click="update('form')">修 改</el-button>
      </div>
    </el-dialog>
    </div>
  </div>
</template>
<script>
import axios from "@/router/axios";
import { baseUrl } from '@/utils/baseUrl'
export default {
  data() {
    return {
      tableName: "menuClassTable",
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 20
      },
      textMap: {
        create: "新建",
        update: "更改"
      },
      rules: {
        menuClassName: [
          {
            required: true,
            message: "请填写分类菜单名称",
            trigger: "blur"
          }
        ]
      },
      form: {},
      dialogFormVisible: false,
      dialogStatus: "",
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /**
     * 获取分类菜单列表
     */
    getList() {
      this.listLoading = true;
      axios
        .get(baseUrl()+"admin/menuClass/list", { params: this.listQuery })
        .then(res => {
          if (res.data.code === 0) {
            this.list = res.data.data.rows;
            // this.list.map((value,index,array)=>{
            //   array[index].edit = true
            // })
            // console.log(this.list)
            this.total = res.data.data.count;
            this.listLoading = false;
          } else {
            this.$message({
              message: response.data.msg,
              type: "warning"
            });
          }
        })
        .catch(err => {
          this.$message({
            message: "错误",
            type: "warning"
          });
        });
    },



    /**
     * 每页数量改变
     */
    handleSizeChange(val) {
      this.listQuery.pageSize = val;
      this.getList();
    },

    /**
     * 页码改变
     */
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },

    /**
     * 点击编辑按钮
     */
    handleUpdate(row) {
      console.log(row);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.form.id = row.id;
      this.form.menuClassName = row.menuClassName;
    },

    /**
     * 删除
     */
    deleterow(row) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        axios
          .get(baseUrl()+"admin/menuClass/delete", { params: { id: row.id } })
          .then(response => {
            this.getList();
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
          })
          .catch(() => {
            this.$notify({
              title: "失败",
              message: "删除失败",
              type: "error",
              duration: 2000
            });
          });
      });
    },

    /**
     * 点击添加菜单分类
     */
    handleCreate() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.form = {};
    },
    /**
     * 添加
     */
    create(formName) {
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          axios
            .post(baseUrl()+"admin/menuClass/add", this.form)
            .then(res => {
              if (res.data.code === 0) {
                this.dialogFormVisible = false;
                this.getList();
                this.$notify({
                  title: "成功",
                  message: "创建成功",
                  type: "success",
                  duration: 2000
                });
              } else {
                this.$message.error("修改失败");
              }
            })
            .catch(err => {
              this.$message.error("修改失败");
            });
        } else {
          return false;
        }
      });
    },
    /**
     * 点击取消按钮
     */
    cancel(formName) {
      this.dialogFormVisible = false;
      this.form = {};
      const set = this.$refs;
      set[formName].resetFields();
    },
    /**
     * 更新
     */
    update(formName) {
      console.log(this.form);
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          axios
            .put(baseUrl()+"admin/menuClass/update", this.form)
            .then(res => {
              if (res.data.code === 0) {
                this.dialogFormVisible = false;
                this.getList();
                this.$notify({
                  title: "成功",
                  message: "修改成功",
                  type: "success",
                  duration: 2000
                });
              } else {
                this.$message.error("修改失败");
              }
            })
            .catch(err => {
              this.$message.error("修改失败");
            });
        } else {
          return false;
        }
      });
    }
  }
};
</script>
