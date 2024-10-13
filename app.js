import { Holistic } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Pose } from '@mediapipe/pose';

// 비디오와 캔버스 요소 가져오기
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// 각도 계산 함수
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * (180.0 / Math.PI));
    
    if (angle > 180.0) {
        angle = 360.0 - angle;
    }
    return angle;
}

let count = 0;
let squatState = 'up'; // 시작 상태는 '서있음'
let isRecording = false; // 기록 중인지 여부

// 운동 세션 데이터 초기화
const sessionId = `session_${new Date().getTime()}`;
const userId = 'user_123'; // 예시 사용자 ID
let currentSession = {
    userId: userId,
    sessionId: sessionId,
    exerciseType: 'squat',
    frames: []
};

let lastSavedTimestamp = 0; // 마지막으로 저장한 시간

// 결과 처리 함수
function onResults(results) {
    if (!isRecording) return; // 기록 중이 아닐 때는 아무 작업도 하지 않음

    const landmarks = results.poseLandmarks;

    if (landmarks) {
        const currentTimestamp = new Date().getTime();

        // 마지막 저장 시간과 비교하여 500ms가 지났을 때만 저장
        if (currentTimestamp - lastSavedTimestamp > 1000) {
            const frameData = {
                timestamp: currentTimestamp,
                landmarks: landmarks.map((landmark, index) => ({
                    landmark_id: index,
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z
                }))
            };
            currentSession.frames.push(frameData);
            lastSavedTimestamp = currentTimestamp; // 마지막 저장 시간 갱신

            // 만약 currentSession.frames의 길이가 일정 수준 이상이면 서버로 전송
            if (currentSession.frames.length >= 100) { // 예: 100 프레임씩 나누어 저장
                saveSessionToDB(currentSession);
                currentSession.frames = []; // 전송 후 프레임 초기화
            }
        }

        // 엉덩이, 무릎, 발목 랜드마크 가져오기
        const hip = landmarks[23]; // 왼쪽 엉덩이
        const knee = landmarks[25]; // 왼쪽 무릎
        const ankle = landmarks[27]; // 왼쪽 발목

        // 무릎 각도 계산
        const angle = calculateAngle(hip, knee, ankle);

        // 스쿼트 상태 체크
        if (angle > 160) {
            if (squatState === 'down') {
                squatState = 'up';
                count++;
                document.getElementById('count_display').innerText = `Squat Count: ${count}`;
                console.log(`Count: ${count}`);
            }
        }
        if (angle < 90) {
            squatState = 'down';
        }
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // 포즈 랜드마크 그리기
    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: 'white', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: 'white', lineWidth: 2 });
    }
    // 얼굴 및 손 랜드마크 그리기
    if (results.faceLandmarks) {
        drawLandmarks(canvasCtx, results.faceLandmarks, { color: 'blue', lineWidth: 1 });
    }
    if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, Pose.HAND_CONNECTIONS, { color: 'red', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: 'red', lineWidth: 2 });
    }
    if (results.rightHandLandmarks) {
        drawConnectors(canvasCtx, results.rightHandLandmarks, Pose.HAND_CONNECTIONS, { color: 'green', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: 'green', lineWidth: 2 });
    }
    canvasCtx.restore();
}

// 운동 세션 종료 후 데이터를 MongoDB에 저장 (API 호출)
async function saveSessionToDB(sessionData) {
    try {
        const response = await fetch('http://localhost:3000/api/exercise-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        if (response.ok) {
            console.log('Exercise session saved successfully.');
        } else {
            console.error('Failed to save exercise session.');
        }
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

// Holistic 설정 및 초기화
const holistic = new Holistic({
    locateFile: (file) => `./node_modules/@mediapipe/holistic/${file}`
});

holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

holistic.onResults(onResults);

// Pose 설정 및 초기화
const pose = new Pose({
    locateFile: (file) => `./node_modules/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// 카메라 설정 및 시작
const camera = new Camera(videoElement, {
    onFrame: async () => {
        if (isRecording) { // 기록 중일 때만 데이터를 처리
            await holistic.send({ image: videoElement });
            await pose.send({ image: videoElement });
        }
    },
    width: 1280,
    height: 900
});

// 시작 버튼과 정지 버튼으로 기록 제어
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');

startButton.addEventListener('click', () => {
    isRecording = true;
    lastSavedTimestamp = 0; // 기록 시작 시 마지막 저장 시간 초기화
    console.log('Recording started');
});

stopButton.addEventListener('click', () => {
    isRecording = false;
    console.log('Recording stopped');
    saveSessionToDB(currentSession); // 기록 종료 후 세션 저장
    currentSession.frames = []; // 프레임 데이터 초기화
});

camera.start();