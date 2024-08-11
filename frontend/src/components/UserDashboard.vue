<template>
  <div>
    <h2>Dashboard</h2>
    <button @click="goToCreateExercise">Opprett ny øvelse</button>
    <button @click="goToCreateProgram">Opprett nytt treningsprogram</button>
    <button @click="goToStartWorkout">Start Treningsøkt</button> <!-- Ny knapp for å starte treningsøkt -->

    <h3>Dine øvelser</h3>
    <ul>
      <li v-for="exercise in exercises" :key="exercise.id">
        {{ exercise.name }} <button @click="editExercise(exercise.id)">Rediger</button>
      </li>
    </ul>

    <h3>Dine treningsprogrammer</h3>
    <ul>
      <li v-for="program in programs" :key="program.id">
        {{ program.name }} <button @click="editProgram(program.id)">Rediger</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      exercises: [],
      programs: []
    };
  },
  created() {
    this.fetchExercises();
    this.fetchPrograms();
  },
  methods: {
    fetchExercises() {
      axios.get(`${process.env.VUE_APP_API_URL}/exercises`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.exercises = response.data;
      }).catch(error => {
        console.error("Error fetching exercises:", error);
      });
    },
    fetchPrograms() {
      axios.get(`${process.env.VUE_APP_API_URL}/programs`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.programs = response.data;
      }).catch(error => {
        console.error("Error fetching programs:", error);
      });
    },
    goToCreateExercise() {
      this.$router.push('/create-exercise');
    },
    goToCreateProgram() {
      this.$router.push('/create-program');
    },
    goToStartWorkout() {  // Ny metode for å starte treningsøkt
      this.$router.push('/start-workout');
    },
    editExercise(id) {
      this.$router.push(`/edit-exercise/${id}`);
    },
    editProgram(id) {
      this.$router.push(`/edit-program/${id}`);
    }
  }
};
</script>
