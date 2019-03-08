<template>
  <div class="content">
    <div class="app-container calendar-list-container">
      <div class="filter-container">
          <el-select style="margin-right:10px;" placeholder="请选择菜单分类" filterable clearable v-model="listQuery.menuClassId"
              @keyup.enter.native="handleFilter">
            <el-option
                v-for="item in menuClass"
                :key="item.id"
                :label="item.menuClassName"
                :value="item.id">
            </el-option>
          </el-select>
 
          <el-button style="margin-right:10px;" class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>

        <el-button class="filter-item" @click="handleCreate" type="primary" icon="edit">添加菜单
        </el-button>
      </div>
      <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
                    highlight-current-row style="width: 100%">
        <el-table-column align="center" label="菜单分类">
            <template slot-scope="scope">
                <span>{{ scope.row.menuClassName }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" label="菜单名称">
            <template slot-scope="scope">
                <span>{{ scope.row.menuName }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" label="单价">
            <template slot-scope="scope">
                <span>{{ scope.row.price }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" label="菜单图片">
            <template slot-scope="scope">
               <img :src="scope.row.menuImg" width="80" height="80" class="head_pic"/>
                <!-- <span><img :src="scope.row.menuImg" alt=""></span> -->
                
            </template>
        </el-table-column> 
        <el-table-column align="center" label="销售量">
            <template slot-scope="scope">
                <span>{{ scope.row.saleNum }}</span>
            </template>
        </el-table-column>  
        <el-table-column align="center" label="介绍">
            <template slot-scope="scope">
                <span>{{ scope.row.introduce }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" label="是否推荐">
            <template slot-scope="scope">
                <span v-if="scope.row.isRecommend == 1">是</span>
                <span v-else>否</span>
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
                      :page-sizes="[10,20,30,50]" :page-size="listQuery.pageSize"
                      layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item v-show="false" label="主键id" prop="id" v-if="dialogStatus == 'update'">
          <el-input v-model="form.id" placeholder="主键id" :disabled="true"></el-input>
        </el-form-item>
   
        <el-form-item label="菜单分类" prop="menuClassId">
          <el-select v-model="form.menuClassId" placeholder="请选择" @change="changeSel">
            <el-option
              v-for="item in menuClass"
              :key="item.id"
              :label="item.menuClassName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input v-model="form.price" placeholder="单价"></el-input>
        </el-form-item>
        <el-form-item label="菜单图片" prop="menuImg">
          <el-upload
            class="avatar-uploader"
            action="http://192.168.16.191:3000/admin/menu/uploadImg"
            :headers="headers"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <el-input v-model="form.menuImg" style="display:none"></el-input>
        </el-form-item>
        <el-form-item label="介绍" prop="introduce">
          <el-input type="textarea" v-model="form.introduce" placeholder="介绍"></el-input>
        </el-form-item>
        <el-form-item label="是否推荐" prop="isRecommend">
          <el-radio v-model="form.isRecommend" label="1">是</el-radio>
          <el-radio v-model="form.isRecommend" label="0">否</el-radio>
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
import axios from '@/router/axios'
import { getToken } from '@/utils/token'
export default {
  data () {
    return {
      tableName: 'menuTable',
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
          page: 1,
          pageSize: 20
      },
      textMap: {
        create: '新建',
        update: '更改'
      },
      rules: {
        menuClassId: [
          {
            required: true,
            message: "请选择分类菜单名称",
            trigger: "blur"
          }
        ],
        menuClassName: [
          {
            required: true,
            message: "请选择分类菜单名称",
            trigger: "blur"
          }
        ],
        menuName: [
          {
            required: true,
            message: "请填写分类名称",
            trigger: "blur"
          }
        ],
        price: [
          {
            required: true,
            message: "请填写菜单价格",
            trigger: "blur"
          }
        ],
        menuImg: [
          {
            required: true,
            message: "请上传菜单图片",
            trigger: "blur"
          }
        ],
        // isRecommend: [
        //   {
        //     required: true,
        //     message: "请选择是否推荐菜单",
        //     trigger: "blur"
        //   }
        // ],
      },
      form: {
        isRecommend: '0'
      }, 
      // isRecommend: '0',     
      dialogFormVisible: false,
      dialogStatus: '',
      imageUrl: '',
      heads: {},
      menuClass: []
    }
  },
  created() {
    this.getList()
    this.getMenuClass()
    const Authorization = getToken()
    this.headers = {Authorization: Authorization}
  },
  methods: {
    /**
     * 获取菜单列表
     */
    getList(){
      this.listLoading = true
      for(let key in this.listQuery) {
        if(this.listQuery[key] == '') {
          delete this.listQuery[key]
        }
      }
      axios.get('/api/admin/menu/list', { params: this.listQuery }).then(res => {
        if(res.data.code === 0) {
          this.list = res.data.data.rows
          this.total = res.data.data.count
          this.listLoading = false
        }
        else {
          this.$message({
            message: res.data.msg,
            type: 'warning'
          });
        } 
      }).catch(err => {
        this.$message({
            message: '错误',
            type: 'warning'
          });
      })     
    },
    
    /**
     * 搜索列表
     */
    handleFilter(){
      this.listQuery.page = 1;
      this.getList();
    },

    /**
     * 获取菜单分类列表
     */
    getMenuClass(){
      axios.get('/api/admin/menuClass/alllist').then(res => {
        if(res.data.code === 0) {
          this.menuClass = res.data.data
        }
        else {
          this.$message({
            message: res.data.msg,
            type: 'warning'
          });
        } 
      }).catch(err => {
        this.$message({
            message: '错误',
            type: 'warning'
          });
      })     
    },

    /**
     * 每页数量改变
     */
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },

    /**
     * 页码改变
     */
    handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
    }, 

    /**
     * 点击编辑按钮
     */
    handleUpdate(row) {
      console.log(row)
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.form.id = row.id;
      this.form.menuClassId = row.menuClassId;
      this.form.menuClassName = row.menuClassName;
      this.form.menuName = row.menuName;
      this.form.price = row.price;
      this.form.menuImg = row.menuImg;
      this.imageUrl = row.menuImg;
      this.form.introduce = row.introduce;
      this.form.isRecommend = row.isRecommend;
    },

    /**
     * 删除
     */
    deleterow(row){
      this.$confirm(
        "此操作将永久删除该记录, 是否继续?",
        "提示",
        {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
        }
      ).then(() => {
        axios.get('/api/admin/menu/delete',{params:{id:row.id}})
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
     * 点击添加菜单
     */
    handleCreate() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.form = {};
      this.imageUrl = ''
    },
    /**
     * 添加
     */
    create(formName) {
      // this.form.isRecommend = this.isRecommend;
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          axios.post('/api/admin/menu/add', this.form).then(res => {
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
              this.$message.error('修改失败');
            }           
          }).catch(err => {
            this.$message.error('修改失败');
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
      // this.form.isRecommend = this.isRecommend;
      console.log(this.form)
      const set = this.$refs;
      set[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          axios.put('/api/admin/menu/update', this.form).then(res => {
            if(res.data.code === 0) {
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
            } else {
              this.$message.error('修改失败');
            }
            
          }).catch(err => {
            this.$message.error('修改失败');
          });
        } else {
          return false;
        }
      });
    },

    /**
     * 图片上传成功
     */
    handleAvatarSuccess(res, file) {
      if (res.code == 0) {
        this.imageUrl = res.imgUrl;
        this.form.menuImg = res.imgUrl;
        this.$message({
          message: '图片上传成功',
          type: 'success'
        });
      } else {
        this.$message.error('图片上传失败');
      }
      
    },

    /**
     * 图片上传前
     */
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    
    /**
     * 菜单分类选择变化
     */
    changeSel(menuClassId) {
      for(let i = 0; i < this.menuClass.length; i++) {
        if(this.menuClass[i].id == menuClassId) {
          this.form.menuClassName = this.menuClass[i].menuClassName
          break;
        }
        
      }
    },

    }  
  }

</script>
