import { Holistic } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Pose } from '@mediapipe/pose';

// 비디오와 캔버스 요소 가져오기
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// 스쿼트 카운트를 화면에 표시할 요소 생성
const countElement = document.createElement('div');
countElement.style.position = 'absolute';
countElement.style.top = '20px';
countElement.style.left = '20px';
countElement.style.fontSize = '30px';
countElement.style.color = 'red';
countElement.innerText = 'Squat Count: 0';
document.body.appendChild(countElement);

// 스쿼트 기준을 화면에 표시할 요소 생성
const instructionElement = document.createElement('div');
instructionElement.style.position = 'absolute';
instructionElement.style.top = '60px';
instructionElement.style.left = '20px';
instructionElement.style.fontSize = '20px';
instructionElement.style.color = 'blue';
instructionElement.innerText = 'Squat when knee angle is less than 90 degrees, stand when above 160 degrees.';
document.body.appendChild(instructionElement);

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

// 결과 처리 함수
function onResults(results) {
    const landmarks = results.poseLandmarks;

    if (landmarks) {
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
                countElement.innerText = `Squat Count: ${count}`;
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
        await holistic.send({ image: videoElement });
        await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 900
});
camera.start();