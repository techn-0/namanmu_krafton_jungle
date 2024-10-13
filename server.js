const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;


// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/exerciseTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// 운동 세션 스키마 정의
const landmarkSchema = new mongoose.Schema({
    landmark_id: Number,
    x: Number,
    y: Number,
    z: Number,
});

const frameSchema = new mongoose.Schema({
    timestamp: Number,
    landmarks: [landmarkSchema],
});

const exerciseSessionSchema = new mongoose.Schema({
    userId: String,
    sessionId: String,
    date: { type: Date, default: Date.now },
    exerciseType: String,
    frames: [frameSchema],
});

const ExerciseSession = mongoose.model('ExerciseSession', exerciseSessionSchema);

// 운동 세션 저장 API
app.post('/api/exercise-session', async (req, res) => {
    try {
        console.log('Received exercise session data:', req.body);
        const newSession = new ExerciseSession(req.body);
        await newSession.save();
        res.status(201).send('Exercise session saved successfully.');
    } catch (error) {
        res.status(500).send('Error saving session: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});