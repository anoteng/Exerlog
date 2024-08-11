<template>
  <div>
    <h2>Opprett nytt treningsprogram</h2>
    <input v-model="name" placeholder="Navn på programmet" />
    <button @click="createProgram">Opprett</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: ''
    };
  },
  methods: {
    createProgram() {
      axios.post(`${process.env.VUE_APP_API_URL}/programs`, {
        name: this.name
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        this.$router.push('/dashboard');
      }).catch(error => {
        console.error("There was an error creating the program!", error);
      });
    }
  }
};
</script>
