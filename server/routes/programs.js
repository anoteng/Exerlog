const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: API for å håndtere treningsprogrammer
 */

// Opprett et nytt treningsprogram
/**
 * @swagger
 * /programs:
 *   post:
 *     summary: Opprett et nytt treningsprogram
 *     tags: [Programs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Treningsprogram opprettet
 *       500:
 *         description: Serverfeil
 */
router.post('/', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO programs (name, user_id) VALUES (?, ?)', [name, req.userId], function(err) {
        if (err) return res.status(500).send("Error creating program.");
        res.status(201).send({ id: this.lastID, name });
    });
});

// Hent alle treningsprogrammer
/**
 * @swagger
 * /programs:
 *   get:
 *     summary: Hent alle treningsprogrammer
 *     tags: [Programs]
 *     responses:
 *       200:
 *         description: Liste over treningsprogrammer
 *       500:
 *         description: Serverfeil
 */
router.get('/', (req, res) => {
    db.all('SELECT * FROM programs WHERE user_id = ?', [req.userId], (err, rows) => {
        if (err) return res.status(500).send("Error fetching programs.");
        res.status(200).send(rows);
    });
});

// Hent et spesifikt treningsprogram
/**
 * @swagger
 * /programs/{id}:
 *   get:
 *     summary: Hent et spesifikt treningsprogram
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsprogrammets ID
 *     responses:
 *       200:
 *         description: Treningsprogram hentet
 *       404:
 *         description: Treningsprogram ikke funnet
 */
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM programs WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, row) => {
        if (err || !row) return res.status(404).send("Program not found.");
        res.status(200).send(row);
    });
});

// Oppdater et eksisterende treningsprogram
/**
 * @swagger
 * /programs/{id}:
 *   put:
 *     summary: Oppdater et eksisterende treningsprogram
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsprogrammets ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treningsprogram oppdatert
 *       404:
 *         description: Treningsprogram ikke funnet
 */
router.put('/:id', (req, res) => {
    const { name } = req.body;
    db.run('UPDATE programs SET name = ? WHERE id = ? AND user_id = ?', [name, req.params.id, req.userId], function(err) {
        if (err || this.changes === 0) return res.status(404).send("Program not found or no changes made.");
        res.status(200).send({ id: req.params.id, name });
    });
});

// Slett et eksisterende treningsprogram
/**
 * @swagger
 * /programs/{id}:
 *   delete:
 *     summary: Slett et eksisterende treningsprogram
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsprogrammets ID
 *     responses:
 *       200:
 *         description: Treningsprogram slettet
 *       404:
 *         description: Treningsprogram ikke funnet
 */
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM programs WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
        if (err || this.changes === 0) return res.status(404).send("Program not found.");
        res.status(200).send("Program deleted.");
    });
});

// Legg til en øvelse i et treningsprogram
/**
 * @swagger
 * /programs/{programId}/exercises:
 *   post:
 *     summary: Legg til en øvelse i et treningsprogram
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsprogrammets ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exerciseId
 *               - sets
 *               - reps
 *             properties:
 *               exerciseId:
 *                 type: integer
 *               sets:
 *                 type: integer
 *               reps:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Øvelse lagt til programmet
 *       500:
 *         description: Serverfeil
 */
router.post('/:programId/exercises', (req, res) => {
    const { exerciseId, sets, reps } = req.body;
    const { programId } = req.params;

    db.run('INSERT INTO program_exercises (program_id, exercise_id, sets, reps) VALUES (?, ?, ?, ?)',
        [programId, exerciseId, sets, reps], function(err) {
            if (err) return res.status(500).send("Error adding exercise to program.");
            res.status(201).send({ id: this.lastID });
        });
});

// Hent alle øvelser i et treningsprogram
/**
 * @swagger
 * /programs/{programId}/exercises:
 *   get:
 *     summary: Hent alle øvelser i et treningsprogram
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Treningsprogrammets ID
 *     responses:
 *       200:
 *         description: Liste over øvelser i programmet
 *       500:
 *         description: Serverfeil
 */
router.get('/:programId/exercises', (req, res) => {
    const { programId } = req.params;

    db.all('SELECT pe.*, e.name FROM program_exercises pe JOIN exercises e ON pe.exercise_id = e.id WHERE pe.program_id = ?',
        [programId], (err, rows) => {
            if (err) return res.status(500).send("Error fetching exercises for program.");
            res.status(200).send(rows);
        });
});

module.exports = router;
