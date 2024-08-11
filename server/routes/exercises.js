const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Exercises
 *   description: API for å håndtere øvelser
 */

/**
 * @swagger
 * /exercises:
 *   post:
 *     summary: Opprett en ny øvelse
 *     tags: [Exercises]
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
 *         description: Øvelse opprettet
 *       500:
 *         description: Serverfeil
 */
router.post('/', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO exercises (name, user_id) VALUES (?, ?)', [name, req.userId], function(err) {
        if (err) return res.status(500).send("Error creating exercise.");
        res.status(201).send({ id: this.lastID, name });
    });
});

/**
 * @swagger
 * /exercises:
 *   get:
 *     summary: Hent alle øvelser
 *     tags: [Exercises]
 *     responses:
 *       200:
 *         description: Liste over øvelser
 *       500:
 *         description: Serverfeil
 */
router.get('/', (req, res) => {
    db.all('SELECT * FROM exercises WHERE user_id = ?', [req.userId], (err, rows) => {
        if (err) return res.status(500).send("Error fetching exercises.");
        res.status(200).send(rows);
    });
});

/**
 * @swagger
 * /exercises/{id}:
 *   get:
 *     summary: Hent en spesifikk øvelse
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Øvelsens ID
 *     responses:
 *       200:
 *         description: Øvelse hentet
 *       404:
 *         description: Øvelse ikke funnet
 */
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, row) => {
        if (err || !row) return res.status(404).send("Exercise not found.");
        res.status(200).send(row);
    });
});

/**
 * @swagger
 * /exercises/{id}:
 *   put:
 *     summary: Oppdater en eksisterende øvelse
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Øvelse oppdatert
 *       404:
 *         description: Øvelse ikke funnet
 */
router.put('/:id', (req, res) => {
    const { name } = req.body;
    db.run('UPDATE exercises SET name = ? WHERE id = ? AND user_id = ?', [name, req.params.id, req.userId], function(err) {
        if (err || this.changes === 0) return res.status(404).send("Exercise not found or no changes made.");
        res.status(200).send({ id: req.params.id, name });
    });
});

/**
 * @swagger
 * /exercises/{id}:
 *   delete:
 *     summary: Slett en eksisterende øvelse
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Øvelsens ID
 *     responses:
 *       200:
 *         description: Øvelse slettet
 *       404:
 *         description: Øvelse ikke funnet
 */
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.userId], function(err) {
        if (err || this.changes === 0) return res.status(404).send("Exercise not found.");
        res.status(200).send("Exercise deleted.");
    });
});

module.exports = router;
