<template>
  <div>
    <h2>Rediger treningsprogram</h2>
    <input v-model="program.name" placeholder="Navn på programmet" />
    <button @click="updateProgram">Oppdater</button>

    <h3>Legg til øvelse</h3>
    <select v-model="selectedExerciseId">
      <option v-for="exercise in exercises" :key="exercise.id" :value="exercise.id">
        {{ exercise.name }}
      </option>
    </select>
    <input v-model.number="sets" placeholder="Antall sett" type="number" />
    <input v-model.number="reps" placeholder="Antall repetisjoner per sett" type="number" />
    <button @click="addExerciseToProgram">Legg til øvelse</button>

    <h3>Øvelser i programmet</h3>
    <ul>
      <li v-for="exercise in programExercises" :key="exercise.id">
        {{ exercise.name }} - {{ exercise.sets }} sett, {{ exercise.reps }} reps
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      program: {},
      exercises: [],
      programExercises: [],
      selectedExerciseId: null,
      sets: 0,
      reps: 0
    };
  },
  created() {
    this.fetchProgram();
    this.fetchExercises();
    this.fetchProgramExercises();
  },
  methods: {
    fetchProgram() {
      axios.get(`${process.env.VUE_APP_API_URL}/programs/${this.$route.params.id}`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.program = response.data;
      });
    },
    fetchExercises() {
      axios.get(`${process.env.VUE_APP_API_URL}/exercises`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.exercises = response.data;
      });
    },
    fetchProgramExercises() {
      axios.get(`${process.env.VUE_APP_API_URL}/programs/${this.$route.params.id}/exercises`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.programExercises = response.data;
      });
    },
    addExerciseToProgram() {
      axios.post(`${process.env.VUE_APP_API_URL}/programs/${this.$route.params.id}/exercises`, {
        exerciseId: this.selectedExerciseId,
        sets: this.sets,
        reps: this.reps
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        this.fetchProgramExercises(); // Oppdater listen over øvelser i programmet
      }).catch(error => {
        console.error("Error adding exercise to program:", error);
      });
    },
    updateProgram() {
      axios.put(`${process.env.VUE_APP_API_URL}/programs/${this.$route.params.id}`, this.program, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        this.$router.push('/dashboard');
      });
    }
  }
};
</script>
