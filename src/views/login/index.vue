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
        username: 'admin',
        password: 123456
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
    onSubmit (formName) {
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

