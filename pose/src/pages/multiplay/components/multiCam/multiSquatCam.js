// MultiSquatCam.js

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import VideoStream from "../VideoStream";
import MediapipeSquatTracking from "./squatCamera";
import socket from "../../services/Socket";

const MultiSquatCam = ({ roomName }) => {
  const [localReady, setLocalReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);

  // OK 포즈 감지를 위한 참조 및 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const okStateRef = useRef(false);

  // 서버로부터 두 플레이어 모두 준비 완료 이벤트 수신
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("bothPlayersReady", () => {
      setBothReady(true);
    });

    return () => {
      socket.off("bothPlayersReady");
    };
  }, []);

  // OK 포즈 감지 함수
  const detectOkPose = (landmarks) => {
    const leftElbowY = landmarks[13].y;
    const rightElbowY = landmarks[14].y;
    const leftWristY = landmarks[15].y;
    const rightWristY = landmarks[16].y;
    const leftShoulderY = landmarks[11].y;
    const rightShoulderY = landmarks[12].y;

    const avgElbowY = (leftElbowY + rightElbowY) / 2;
    const avgWristY = (leftWristY + rightWristY) / 2;
    const avgShoulderY = (leftShoulderY + rightShoulderY) / 2;

    if (avgElbowY < avgShoulderY && avgWristY < avgElbowY) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    let timerId = null;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const landmarks = results.poseLandmarks;

      if (landmarks) {
        if (!okStateRef.current && detectOkPose(landmarks)) {
          if (!timerId) {
            timerId = setTimeout(() => {
              okStateRef.current = true;
              timerId = null;

              // 로컬 플레이어 준비 완료 상태 설정
              setLocalReady(true);

              // 서버에 플레이어 준비 완료 알림
              socket.emit("playerReady", { roomName });

              // 카메라 및 포즈 감지 중지
              if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
              }
            }, 1000); // 1초 유지 시 상태 변경
          }
        } else if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }

        // 캔버스에 그리기 등 필요한 경우 추가 코드 작성
      }
    });

    if (!localReady && !bothReady) {
      // OkCam을 위한 카메라 시작
      let camera = cameraRef.current;
      const videoElement = videoRef.current;
      if (videoElement && !camera) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (pose) {
              await pose.send({ image: videoElement });
            }
          },
          width: 1280,
          height: 720,
        });
        camera.start();
        cameraRef.current = camera;
      }
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [localReady, bothReady, roomName]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* 상대방의 비디오 스트림 */}
      <div style={{ flex: 1 }}>
        <VideoStream roomName={roomName} showLocalVideo={false} />
      </div>

      {/* 자신의 Mediapipe 캠 */}
      <div style={{ flex: 1, position: "relative" }}>
        {bothReady ? (
          <MediapipeSquatTracking
            onCanvasUpdate={() => {}}
            active={true}
            onCountUpdate={() => {}}
            roomName={roomName} // roomName을 전달하여 스쿼트 횟수 동기화에 사용
          />
        ) : (
          // OK 포즈 감지 화면
          <div>
            <p>OK 포즈를 취해주세요...</p>
            <video
              ref={videoRef}
              width="800"
              height="640"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            ></video>
            <canvas
              ref={canvasRef}
              width="800"
              height="640"
              style={{
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></canvas>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSquatCam;
