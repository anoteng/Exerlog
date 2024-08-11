<template>
  <div>
    <h2>Start Treningsøkt</h2>
    <select v-model="selectedProgramId">
      <option v-for="program in programs" :key="program.id" :value="program.id">
        {{ program.name }}
      </option>
    </select>
    <button @click="startWorkout">Start Økt</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      programs: [],
      selectedProgramId: null
    };
  },
  created() {
    this.fetchPrograms();
  },
  methods: {
    fetchPrograms() {
      axios.get(`${process.env.VUE_APP_API_URL}/programs`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.programs = response.data;
      });
    },
    startWorkout() {
      axios.post(`${process.env.VUE_APP_API_URL}/workouts`, {
        programId: this.selectedProgramId
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        const workoutId = response.data.workoutId;
        this.$router.push(`/workouts/${workoutId}`);
      }).catch(error => {
        console.error("Error starting workout:", error);
      });
    }
  }
};
</script>
