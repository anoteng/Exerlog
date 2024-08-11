<template>
  <div>
    <h2>Login</h2>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="login">Login</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    login() {
      axios.post(`${process.env.VUE_APP_API_URL}/login`, {
        username: this.username,
        password: this.password
      }).then(response => {
        localStorage.setItem('token', response.data.token);
        this.$router.push('/workouts'); // Etter innlogging, naviger til treningsoversikt
      }).catch(error => {
        console.error("There was an error logging in!", error);
      });
    }
  }
};
</script>
