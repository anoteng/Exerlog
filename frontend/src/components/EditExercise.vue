<template>
  <div>
    <h2>Rediger øvelse</h2>
    <input v-model="name" placeholder="Navn på øvelse" />
    <button @click="updateExercise">Oppdater</button>
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
  created() {
    this.fetchExercise();
  },
  methods: {
    fetchExercise() {
      axios.get(`${process.env.VUE_APP_API_URL}/exercises/${this.$route.params.id}`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.name = response.data.name;
      }).catch(error => {
        console.error("There was an error fetching the exercise!", error);
      });
    },
    updateExercise() {
      axios.put(`${process.env.VUE_APP_API_URL}/exercises/${this.$route.params.id}`, {
        name: this.name
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        this.$router.push('/dashboard');
      }).catch(error => {
        console.error("There was an error updating the exercise!", error);
      });
    }
  }
};
</script>
