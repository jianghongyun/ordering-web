<template>
  <div class="loginbg">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="loginForm">
      <el-row>
        <el-col :span="24" class="loginTitle">点餐系统登陆</el-col>
      </el-row>
      <el-form-item label="登录名" prop="name">
        <el-input v-model="form.username" placeholder="登录名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="password">
        <el-input type="password" class="codeInput" v-model="code" placeholder="验证码"></el-input><el-button type="primary" :class="codeBtn" :disabled='disabled' @click="getCode">{{codeText}}</el-button>
        
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">立即登陆</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// import { login } from '@/api/login'
import qs from "qs"
import axios from '@/router/axios'
import router from '@/router/index'
import { setToken } from '@/utils/token'
import { baseUrl } from '@/utils/baseUrl'

export default {
  data () {
    return {
      form: {
        username: '18739925643',
        password: 123456
      },
      code: '',
      submitPhone: '',
      resCode: '',
      codeText: '获取验证码',
      disabled: false,
      codeBtn: {
        codeBtn: true,
        opc: false
      },
      rules: {
        username: {
          required: true,
          message: '请输入登录名',
          trigger: 'blur'
        },
        password: {
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }
      }
    }
  },
  methods: {
      /*
       *获取验证码
       */
      getCode: function() {
        if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.form.username))) {
          alert('请填写正确的手机号')
          return
        }
        this.disabled = true;
        var count = 10;
        var timer = null;
        var _this = this
        timer = setInterval(()=>{
          count--
          if(count==0) {
            _this.codeText = "获取验证码"
            _this.disabled = false
            _this.codeBtn = {
              codeBtn: true,
              opc: false
            }
            clearInterval(timer)
          } else {
            _this.codeBtn = {
              codeBtn: true,
              opc: true
            }
            _this.codeText = count+'s'
          }          
        },1000)
        
        axios.get(baseUrl()+"user/sms", {
          params: { mobile: this.form.username }
        })
        .then(res => {
          console.log(res)
          this.resCode = res.data.sms
          this.submitPhone = this.form.username
        })
        .catch(err => {
          this.$message({
            message: "错误",
            type: "warning"
          });
        });
      },
    /**
     * 登陆
     */
    onSubmit (formName) {
      if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.form.username))) {
        alert('请填写正确的手机号')
        return
      }
      // if(this.code != this.resCode) {
      //   alert('验证码不正确')
      //   return
      // }
      // if(this.form.username != this.submitPhone) {
      //   alert('请输入收到验证码的手机号')
      //   return
      // }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          axios.post(baseUrl()+'user/login',this.form)
          .then( (response) => {
            if (response.data.code === 0) {
              setToken(response.data.token)
              router.push({ path: '/index' })
            } else {
              this.$message({
                message: response.data.msg,
                type: 'warning'
              });
            } 
          })
          .catch( (error) => {
            this.$message.error('登陆失败');
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.codeInput {
  width: 55%;
  margin-right: 5%;
}
.codeBtn {
  width: 40%;
}

.codeBtn.opc {
  opacity:0.8;
}
</style>
