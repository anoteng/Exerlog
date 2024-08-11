<template>
  <div>
    <h2>Treningsøkt</h2>
    <div v-for="exercise in exercises" :key="exercise.id" class="exercise">
      <h3>{{ exercise.name }}</h3>
      <div>
        <label>Antall sett:</label>
        <span>{{ exercise.sets }}</span>
        <button @click="decrementSets(exercise)">-</button>
        <button @click="incrementSets(exercise)">+</button>
      </div>
      <div>
        <label>Repetisjoner per sett (fra program):</label>
        <span>{{ exercise.reps }}</span>
      </div>
      <div v-for="set in exercise.setsArray" :key="set.set_number" class="set-row">
        <span>Sett {{ set.set_number }}:</span>
        <input v-model.number="set.weight" placeholder="Vekt" type="number" class="weight-input" />
        <button @click="decrementSetReps(set)" class="small-button">-</button>
        <span>{{ set.reps }} reps</span>
        <button @click="incrementSetReps(set)" class="small-button">+</button>
        <div v-if="set.previousWeight !== null || set.previousReps !== null">
          <small>Sist brukt: {{ set.previousWeight || 0 }} kg, {{ set.previousReps || 0 }} reps</small>
        </div>
      </div>
      <button @click="saveExercise(exercise)">Lagre øvelse</button>
      <button @click="toggleHistory(exercise)">
        {{ exercise.showHistory ? 'Skjul Historikk' : 'Vis Historikk' }}
      </button>
      <div v-if="exercise.showHistory">
        <h4>Historikk</h4>
        <ul>
          <li v-for="history in exercise.history" :key="history.date + '-' + history.set_number">
            {{ history.date }} - Sett {{ history.set_number }}: {{ history.weight }} kg, {{ history.reps }} reps
          </li>
        </ul>
      </div>
    </div>
    <div>
      <h3>Avslutt treningsøkt</h3>
      <textarea v-model="comment" placeholder="Legg til en kommentar..."></textarea>
      <button @click="finishWorkout">Avslutt Økt</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserWorkout',
  data() {
    return {
      exercises: [],
      comment: ''
    };
  },
  created() {
    this.fetchWorkoutExercises();
  },
  methods: {
    fetchWorkoutExercises() {
      axios.get(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/exercises`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        this.exercises = response.data.map(exercise => {
          const setsArray = [];
          for (let i = 1; i <= exercise.sets; i++) {
            setsArray.push({
              set_number: i,
              weight: null,
              reps: exercise.reps, // Hentet fra programmet
              previousWeight: null,
              previousReps: null
            });
          }
          return {
            ...exercise,
            setsArray,
            showHistory: false,
            history: [],
            defaultReps: exercise.reps
          };
        });

        // Fetch historical data for each set
        this.exercises.forEach(exercise => {
          axios.get(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/exercises/${exercise.exercise_id}/history`, {
            headers: {
              'x-access-token': localStorage.getItem('token')
            }
          }).then(response => {
            response.data.forEach(historyItem => {
              const set = exercise.setsArray.find(s => s.set_number === historyItem.set_number);
              if (set) {
                set.previousWeight = historyItem.weight;
                set.previousReps = historyItem.reps;
                set.weight = historyItem.weight || set.weight;
                set.reps = historyItem.reps || set.reps;
              }
            });
          });
        });
      }).catch(error => {
        console.error("Error fetching exercises:", error);
      });
    },
    incrementSets(exercise) {
      exercise.sets += 1;
      this.updateSets(exercise);
    },
    decrementSets(exercise) {
      if (exercise.sets > 1) {
        exercise.sets -= 1;
        this.updateSets(exercise);
      }
    },
    incrementSetReps(set) {
      set.reps += 1;
    },
    decrementSetReps(set) {
      if (set.reps > 1) {
        set.reps -= 1;
      }
    },
    updateSets(exercise) {
      exercise.setsArray = [];
      for (let i = 1; i <= exercise.sets; i++) {
        exercise.setsArray.push({
          set_number: i,
          weight: null,
          reps: exercise.reps, // Bruk reps fra programmet som standard
          previousWeight: null,
          previousReps: null
        });
      }
      // Re-fetch history if sets changed
      axios.get(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/exercises/${exercise.exercise_id}/history`, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(response => {
        response.data.forEach(historyItem => {
          const set = exercise.setsArray.find(s => s.set_number === historyItem.set_number);
          if (set) {
            set.previousWeight = historyItem.weight;
            set.previousReps = historyItem.reps;
            set.weight = historyItem.weight || set.weight;
            set.reps = historyItem.reps || set.reps;
          }
        });
      }).catch(error => {
        console.error("Error fetching exercise history after sets update:", error);
      });
    },
    saveExercise(exercise) {
      const promises = exercise.setsArray.map(set => {
        return axios.post(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/exercises/${exercise.exercise_id}/sets`, {
          setNumber: set.set_number,
          weight: set.weight,
          reps: set.reps
        }, {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        });
      });

      Promise.all(promises)
          .then(() => {
            console.log("Exercise saved successfully");
          })
          .catch(error => {
            console.error("Error saving exercise:", error);
          });
    },
    finishWorkout() {
      axios.post(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/finish`, {
        comment: this.comment
      }, {
        headers: {
          'x-access-token': localStorage.getItem('token')
        }
      }).then(() => {
        console.log("Workout finished successfully");
        this.$router.push('/dashboard');
      }).catch(error => {
        console.error("Error finishing workout:", error);
      });
    },
    toggleHistory(exercise) {
      exercise.showHistory = !exercise.showHistory;
      if (exercise.showHistory && exercise.history.length === 0) {
        axios.get(`${process.env.VUE_APP_API_URL}/workouts/${this.$route.params.id}/exercises/${exercise.exercise_id}/history`, {
          headers: {
            'x-access-token': localStorage.getItem('token')
          }
        }).then(response => {
          exercise.history = response.data;
        }).catch(error => {
          console.error("Error fetching exercise history:", error);
        });
      }
    }
  }
};
</script>

<style scoped>
.set-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.weight-input {
  width: 50px;
  margin-right: 10px;
}

.small-button {
  width: 30px;
  height: 30px;
  margin: 0 5px;
  font-size: 18px;
}
</style>
