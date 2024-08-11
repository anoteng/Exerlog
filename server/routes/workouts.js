const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Workouts
 *   description: API for å håndtere treningsøkter
 */

// Start en ny treningsøkt
/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Start en ny treningsøkt
 *     tags: [Workouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - programId
 *             properties:
 *               programId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Treningsøkt startet
 *       500:
 *         description: Serverfeil
 */
router.post('/', (req, res) => {
    const { programId } = req.body;
    const userId = req.userId;

    db.run('INSERT INTO workouts (user_id, program_id) VALUES (?, ?)', [userId, programId], function(err) {
        if (err) return res.status(500).send("Error starting workout.");
        res.status(201).send({ workoutId: this.lastID });
    });
});

// Hent øvelser for en treningsøkt med historikk
/**
 * @swagger
 * /workouts/{workoutId}/exercises:
 *   get:
 *     summary: Hent øvelser i en treningsøkt
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsøkts ID
 *     responses:
 *       200:
 *         description: Liste over øvelser i treningsøkten
 *       500:
 *         description: Serverfeil
 */
router.get('/:workoutId/exercises', (req, res) => {
    const { workoutId } = req.params;

    db.all(`
    SELECT pe.*, e.name, ws.weight, ws.reps, ws.set_number, 
    (
      SELECT ws2.weight 
      FROM workout_sets ws2 
      JOIN workouts w2 ON ws2.workout_id = w2.id 
      WHERE ws2.exercise_id = pe.exercise_id AND w2.user_id = ? AND w2.id < ? 
      ORDER BY w2.date DESC, ws2.set_number DESC 
      LIMIT 1
    ) as previous_weight,
    (
      SELECT ws2.reps 
      FROM workout_sets ws2 
      JOIN workouts w2 ON ws2.workout_id = w2.id 
      WHERE ws2.exercise_id = pe.exercise_id AND w2.user_id = ? AND w2.id < ? 
      ORDER BY w2.date DESC, ws2.set_number DESC 
      LIMIT 1
    ) as previous_reps
    FROM program_exercises pe
    JOIN exercises e ON pe.exercise_id = e.id
    LEFT JOIN workout_sets ws ON ws.exercise_id = e.id AND ws.workout_id = ?
    WHERE pe.program_id = (SELECT program_id FROM workouts WHERE id = ?)
  `, [req.userId, workoutId, req.userId, workoutId, workoutId, workoutId], (err, rows) => {
        if (err) return res.status(500).send("Error fetching exercises for workout.");
        res.status(200).send(rows);
    });
});

// Hent historikk for en øvelse
/**
 * @swagger
 * /workouts/{workoutId}/exercises/{exerciseId}/history:
 *   get:
 *     summary: Hent historikk for en øvelse
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsøkts ID
 *       - in: path
 *         name: exerciseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Øvelsens ID
 *     responses:
 *       200:
 *         description: Historikk for øvelsen
 *       500:
 *         description: Serverfeil
 */
router.get('/:workoutId/exercises/:exerciseId/history', (req, res) => {
    const { workoutId, exerciseId } = req.params;

    db.all(`
    SELECT ws.weight, ws.reps, ws.set_number, w.date 
    FROM workout_sets ws
    JOIN workouts w ON ws.workout_id = w.id
    WHERE ws.exercise_id = ? AND w.user_id = ?
    ORDER BY w.date DESC, ws.set_number ASC
  `, [exerciseId, req.userId], (err, rows) => {
        if (err) return res.status(500).send("Error fetching exercise history.");
        res.status(200).send(rows);
    });
});

// Logg et sett i en treningsøkt
/**
 * @swagger
 * /workouts/{workoutId}/exercises/{exerciseId}/sets:
 *   post:
 *     summary: Logg et sett i en treningsøkt
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsøkts ID
 *       - in: path
 *         name: exerciseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Øvelsens ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setNumber
 *               - weight
 *               - reps
 *             properties:
 *               setNumber:
 *                 type: integer
 *               weight:
 *                 type: number
 *               reps:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sett logget
 *       500:
 *         description: Serverfeil
 */
router.post('/:workoutId/exercises/:exerciseId/sets', (req, res) => {
    const { setNumber, weight, reps } = req.body;
    const { workoutId, exerciseId } = req.params;

    db.run('INSERT INTO workout_sets (workout_id, exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
        [workoutId, exerciseId, setNumber, weight, reps], function(err) {
            if (err) return res.status(500).send("Error logging set.");
            res.status(201).send({ setId: this.lastID });
        });
});

// Avslutt treningsøkt med kommentar
/**
 * @swagger
 * /workouts/{workoutId}/finish:
 *   post:
 *     summary: Avslutt en treningsøkt og legg til en kommentar
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsøkts ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treningsøkt avsluttet
 *       500:
 *         description: Serverfeil
 */
router.post('/:workoutId/finish', (req, res) => {
    const { comment } = req.body;
    const endTime = new Date().toISOString();
    const { workoutId } = req.params;

    db.run('UPDATE workouts SET comment = ?, end_time = ? WHERE id = ?', [comment, endTime, workoutId], function(err) {
        if (err) return res.status(500).send("Error finishing workout.");
        res.status(200).send({ message: "Workout finished successfully." });
    });
});

module.exports = router;
