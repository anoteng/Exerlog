const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS program_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER,
    exercise_id INTEGER,
    sets INTEGER,
    reps INTEGER,
    FOREIGN KEY(program_id) REFERENCES programs(id),
    FOREIGN KEY(exercise_id) REFERENCES exercises(id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    program_id INTEGER,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    comment TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(program_id) REFERENCES programs(id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER,
    exercise_id INTEGER,
    set_number INTEGER,
    weight REAL,
    reps INTEGER,
    FOREIGN KEY(workout_id) REFERENCES workouts(id),
    FOREIGN KEY(exercise_id) REFERENCES exercises(id)
  )`);
});

module.exports = db;
