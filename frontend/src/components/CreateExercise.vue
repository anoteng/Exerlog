<template>
  <div>
    <h2>Opprett ny øvelse</h2>
    <input v-model="name" placeholder="Navn på øvelse" />
    <button @click="createExercise">Opprett</button>
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
    createExercise() {

      axios.post(`${process.env.VUE_APP_API_URL}/exercises`, {
        name: this.name
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        this.$router.push('/dashboard');
      }).catch(error => {
        console.error("There was an error creating the exercise!", error);
      });
    }
  }
};
</script>
