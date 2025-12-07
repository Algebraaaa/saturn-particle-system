/**
 * gesture-handler.js - 手势追踪和交互模块
 * 处理手势识别和相机控制
 */

class GestureHandler {
    constructor(videoElement, statusElement, loadingElement) {
        this.videoElement = videoElement;
        this.statusElement = statusElement;
        this.loadingElement = loadingElement;
        
        this.isHandDetected = false;
        this.targetScale = 1.0;
        this.targetRotX = 0.4;
        
        this.hands = null;
        this.initialized = false;
    }

    init() {
        this.hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.onResults(results));

        const cameraUtils = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({image: this.videoElement});
            },
            width: 640,
            height: 480
        });
        
        cameraUtils.start()
            .then(() => {
                this.initialized = true;
                console.log('Camera and hand detection initialized');
            })
            .catch(e => {
                console.error('Camera initialization failed:', e);
                this.loadingElement.innerText = "摄像头启动失败";
            });
    }

    onResults(results) {
        this.loadingElement.style.display = 'none';

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.isHandDetected = true;
            const hand = results.multiHandLandmarks[0];

            // 用大拇指和食指的距离控制缩放
            const p1 = hand[4];
            const p2 = hand[8];
            const dist = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
            
            // 归一化距离并映射到缩放系数
            const normDist = Math.max(0, Math.min(1, (dist - 0.02) / 0.25));
            this.targetScale = 0.15 + normDist * 2.35;

            // 用手掌在屏幕的 Y 轴位置控制俯仰角
            const y = hand[9].y;
            const normY = Math.max(0, Math.min(1, (y - 0.1) / 0.8));
            this.targetRotX = -0.6 + normY * 1.6;

        } else {
            this.isHandDetected = false;
        }
    }

    isDetected() {
        return this.isHandDetected;
    }

    getTargetScale() {
        return this.targetScale;
    }

    getTargetRotX() {
        return this.targetRotX;
    }

    updateStatus(statusElement, autoIdleTime) {
        if (!this.isHandDetected) {
            statusElement.innerHTML = "系统状态: 自动巡航<br>输入信号: 等待中...";
            statusElement.style.color = "#666";
        } else {
            statusElement.innerHTML = "系统状态: 手动接管<br>输入信号: <span class='highlight'>已锁定</span>";
            statusElement.style.color = "#c5a059";
        }
    }
}
