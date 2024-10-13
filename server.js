const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' })); // 최대 50MB로 본문 크기 제한 설정
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
//디버그 모드 활성화
mongoose.set('debug', true);
// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/exerciseTracker');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// 운동 세션 스키마 정의
const landmarkSchema = new mongoose.Schema({
    landmark_id: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
}, { _id: false });

const frameSchema = new mongoose.Schema({
    timestamp: { type: Number, required: true },
    landmarks: [landmarkSchema]
});

const exerciseSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    exerciseType: { type: String, required: true },
    frames: [frameSchema]
});

const ExerciseSession = mongoose.model('ExerciseSession', exerciseSessionSchema);

// 운동 세션 저장 API
app.post('/api/exercise-session', async (req, res) => {
    try {
        const newSession = new ExerciseSession(req.body);
        await newSession.save();
        res.status(201).send('Exercise session saved successfully.');
    } catch (error) {
        console.error('Error saving session:', error);
        res.status(500).send('Error saving session: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});