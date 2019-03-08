<template>
  <div class="content">
    <div class="app-container calendar-list-container">
      <div class="filter-container">
          <el-input style="width:200px;margin-right:10px;" v-model="listQuery.orderNum" @enter='handleFilter' placeholder="订单号"></el-input>
          
          <div style="width:420px;display:inline-block;">
            <el-date-picker
              v-model="dateValue"
              type="datetimerange"
              @change="changeDate"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="订单开始日期"
              end-placeholder="订单结束日期"
              align="right">
            </el-date-picker>
          </div>
         
          <el-button style="margin-right:10px;" class="filter-item" type="primary" icon="search" @click="handleFilter">搜索</el-button>
      </div>
      <el-table 
        :key='tableKey' 
        :data="list" 
        show-summary
        v-loading="listLoading" 
        element-loading-text="给我一点时间" 
        border fit highlight-current-row 
        style="width: 100%">
        <el-table-column align="center" label="订单号">
            <template slot-scope="scope">
                <span>{{ scope.row.orderNum }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" prop="price" label="订单总额">
            <template slot-scope="scope">
                <span>{{ scope.row.price }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" label="桌号">
            <template slot-scope="scope">
                <span>{{ scope.row.tableNum }}</span>
            </template>
        </el-table-column> 
        <el-table-column align="center" prop="createdAt" sortable label="时间">
            <template slot-scope="scope">              
                <span>{{scope.row.createdAt}}</span>               
            </template>
        </el-table-column> 
        <el-table-column align="center" label="备注">
            <template slot-scope="scope">
                <span>{{ scope.row.remark }}</span>
            </template>
        </el-table-column>  

        <el-table-column align="center" label="备注">
            <template slot-scope="scope">
                <span v-if="scope.row.status == 0">未打印</span>
                <span v-else>已打印</span>
            </template>
        </el-table-column> 
                
        <el-table-column align="center" label="操作" width="250">
            <template slot-scope="scope">
                <el-button v-if="scope.row.status == 0" size="small" type="primary"
                          @click="handlePrint(scope.row.id)">打印订单
                </el-button>
                <el-button v-else size="small" type="info"
                          @click="handlePrinted(scope.row.id)">打印订单
                </el-button>
                <el-button size="small" type="success"
                          @click="handleUpdate(scope.row)">详情
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible">
      
      <el-table :data="orderList">
        <el-table-column  property="menuName" label="菜单名称"></el-table-column>
        <el-table-column  property="menuNum" label="数量"></el-table-column>
        <el-table-column  property="price" label="价格"></el-table-column>
      </el-table>
      <div class="orderBox">
        <div class="item">
          <label for="">订单号</label>
          {{ order.orderNum }}
        </div>
        <div class="item">
          <label for="">订单总额</label>
          {{ order.price }}元
        </div>
        <div class="item">
          <label for="">桌号</label>
          {{ order.tableNum }}
        </div>
        <div class="item">
          <label for="">订单时间</label>
          {{ order.createdAt }}
        </div>
        <div class="item">
          <label for="">备注</label>
          {{ order.remark }}
        </div>
      </div>
      
    </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from "@/router/axios";
import { getToken } from "@/utils/token";
export default {
  data() {
    return {
      tableName: "orderTable",
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 20
      },
      dialogFormVisible: false,
      dialogTitle: '订单详情',
      orderList: [],
      order: {},
      pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        dateValue: ''
    };
  },
  created() {
    this.getList();
    const Authorization = getToken();
    this.headers = { Authorization: Authorization };
  },
  methods: {
    /**
     * 获取菜单列表
     */
    getList() {
      this.listLoading = true;
      for (let key in this.listQuery) {
        if (this.listQuery[key] == "") {
          delete this.listQuery[key];
        }
      }
      axios
        .get("/api/admin/order/list", { params: this.listQuery })
        .then(res => {
          if (res.data.code === 0) {
            this.list = res.data.data.rows;
            this.list.map((obj, index, arr) => {
              obj.createdAt = this.changeTime(obj.createdAt)
            })
            this.total = res.data.data.count;
            this.listLoading = false;
          } else {
            this.$message({
              message: res.data.msg,
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
     * 获取订单详情
     */
    getDetail(id){
        axios
        .get("/api/admin/order/detail", { params: {id: id} })
        .then(res => {
          if (res.data.code === 0) {
            this.orderList = res.data.result.list;
            this.order = res.data.result.order;
            this.orderList.map((obj, index, arr) => {
              obj.price = Number(obj.price) * Number(obj.menuNum)
            })
            this.order.createdAt = this.changeTime(this.order.createdAt)
          } else {
            this.$message({
              message: res.data.msg,
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
     * 搜索列表
     */
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
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
     * 点击详情按钮
     */
    handleUpdate(row) {
      this.getDetail(Number(row.id));
      this.dialogFormVisible = true;
      
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
          .get("/api/admin/order/delete", { params: { id: row.id } })
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
     * 打印订单
     */
    handlePrint: function(id){
       axios.get('/api/admin/order/update', { params: {id: id} })
       .then(res => {
         if(res.data.code == 0) {
           this.getList()
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
     * 再次打印订单
     */
    handlePrinted: function(id){
      console.log(id)
    },

    /**
     * 获取选择时间范围
     */
      changeDate: function(val){
        console.log(val)
        if(val != null) {
          this.listQuery.startTime = val[0]
          this.listQuery.endTime = val[1]
        } else {
          this.listQuery.startTime = ''
          this.listQuery.endTime = ''
        }    
      },

    /**
     * 转换时间
     */
  changeTime: function (time) {
    const date = new Date(time)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minite = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return year + '-' + month + '-' + day + '  ' + hour + ':' + minite + ':' + second;
  },

    
  }
};
</script>
