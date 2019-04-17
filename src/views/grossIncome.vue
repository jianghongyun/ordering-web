<template>
  <div class="content">
    <el-row class="incomeHead">
      <el-col :span="7">
        <el-card class="box-card">        
          <div slot="header" class="clearfix">
            <span>{{income.dailyIncome}}</span>
            <label for="">{{income.daily}}</label>
          </div>
          <div class="text item">
            当天收入总金额（元）         
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="box-card">        
          <div slot="header" class="clearfix">
            <span>{{income.monthlyIncome}}</span>
            <label for="">{{income.monthly}}</label>
          </div>
          <div class="text item">
            当月收入总金额（元）
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="box-card">        
          <div slot="header" class="clearfix">
            <span>{{income.yearlyIncome}}</span>
            <label for="">{{income.yearly}}</label>
          </div>
          <div class="text item">
            当年收入总金额（元）
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="echartBox">
      <el-col :span="12">
        <div id="main"></div>
      </el-col>
      <el-col :span="10">
        <div id="year"></div>
      </el-col>
    </el-row>

  </div>
</template>
<script>
import axios from "@/router/axios";
import { baseUrl } from '@/utils/baseUrl'
import echarts from "echarts";
export default {
  data() {
    return {
      income: {}
    };
  },
  mounted(){
    this.monthlyIncome()
    this.yearlyIncome()
      
  },
  created() {
    this.grossIncome()
    
  },
  methods: {
    /**
     *当前年月日总收入
     */
    grossIncome: function(){
      axios.get(baseUrl()+'admin/finance/grossIncome')
      .then(res => {
          this.income = res.data.grossIncome
        })
        .catch(err => {
          this.$message({
            message: "错误",
            type: "warning"
          });
        });
    },

    /**
     * 月收入
     */
    monthlyIncome: function(){
      axios.get(baseUrl()+'admin/finance/monthlyIncome')
      .then(res => {
          let monthData = res.data.monthlyIncome
          let xAxisData = []
          let yAxisData = []
          monthData.map((obj,index,arr) => {
            xAxisData.push(obj.date+'月')
            yAxisData.push(obj.income)
          })
          this.monthLine('monthEchart', '月收入', 'main', xAxisData, yAxisData)
        })
        .catch(err => {
          this.$message({
            message: "错误",
            type: "warning"
          });
        });
    },

    /**
     * 年收入
     */
    yearlyIncome: function(){
      axios.get(baseUrl()+'admin/finance/yearlyIncome')
      .then(res => {
          // this.income = res.data.grossIncome
          let yearData = res.data.yearlyIncome
          let xAxisData = []
          let yAxisData = []
          yearData.map((obj,index,arr) => {
            xAxisData.push(obj.date+'年')
            yAxisData.push(obj.income)
          })
          console.log(xAxisData,yAxisData)
          this.monthLine('yearEchart', '年收入', 'year', xAxisData, yAxisData)
        })
        .catch(err => {
          this.$message({
            message: "错误",
            type: "warning"
          });
        });
    },
    
    /**
     * 年月收入折线图
     * myChart
     * title 图表标题
     * idName 图表容器id名称
     * xAxisData横轴数据
     * yAxisData纵轴数据
     */
    monthLine: function(myChart, title, idName, xAxisData, yAxisData){
      myChart = echarts.init(document.getElementById(idName));
      let option = {
        title: {
          text: title
        },
        color: ['#'+Math.floor(Math.random()*0xffffff).toString(16)],
        tooltip : {
          trigger: 'axis',
        },
        toolbox:{
          show: true,
          feature: {
            mark : {show: true},
            dataView : {show: true},
            magicType : {show: true, type: ['line', 'bar']},
            restore : {show: true},
            saveAsImage : {show: true}
          },
        },
        xAxis : [
          {
            type : 'category',
            data : xAxisData,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis : [
          {
            type : 'value',
            axisLabel : {
                formatter: '{value}元'
            }
          }
        ],
        series : [
          {
            name: title,
            type:'line',
            data:yAxisData,
          }
        ]
      };
      myChart.setOption(option);
 
      //建议加上以下这一行代码，不加的效果图如下（当浏览器窗口缩小的时候）。超过了div的界限（红色边框）
      window.addEventListener('resize',function() {myChart.resize()});
    }
  }
};
</script>

<style scoped>
.echartBox {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

#main, #year {
  height: 50vh;
}

.incomeHead {
  display: flex;
  justify-content: space-between;
}

.el-card {
  color: #606266;
}

.clearfix {
  font-size: 22px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clearfix span {
  display: block;
}

.clearfix label {
  display: block;
  font-size: 16px;
  color: #999999;
  font-weight: normal;
}
</style>


