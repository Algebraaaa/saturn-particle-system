/**
 * app.js - 主应用模块
 * 初始化 Three.js 场景和管理动画循环
 */

class SaturnApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.saturn = null;
        this.starfield = null;
        this.planets = null;
        this.gestureHandler = null;
        
        this.uniforms = null;
        this.shaderManager = null;
        
        this.clock = new THREE.Clock();
        this.autoIdleTime = 0;
        
        // 动画参数
        this.currentScale = 1.0;
        this.currentRotX = 0.4;
        this.targetScale = 1.0;
        this.targetRotX = 0.4;
    }

    init() {
        this.initThree();
        this.initShaders();
        this.initScene();
        this.initGestureHandler();
        this.animate();
    }

    initThree() {
        const container = document.getElementById('canvas-container');

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020202, 0.00015);

        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            1, 
            10000
        );
        this.camera.position.z = 100;
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // 窗口大小改变事件
        window.addEventListener('resize', () => this.onWindowResize());
    }

    initShaders() {
        this.shaderManager = new ShaderManager();
        this.shaderManager.initializeFromScripts();

        // 初始化 uniforms
        this.uniforms = {
            uTime: { value: 0 },
            uScale: { value: 1.0 },
            uRotationX: { value: 0.4 }
        };
    }

    initScene() {
        // 初始化土星
        this.saturn = new Saturn(this.scene, this.uniforms, this.shaderManager);
        this.saturn.init();

        // 初始化星空
        this.starfield = new Starfield(this.scene, this.shaderManager);
        this.starfield.init();

        // 初始化行星
        this.planets = new Planets(this.scene, this.shaderManager);
        this.planets.init();
    }

    initGestureHandler() {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const statusElement = document.getElementById('status-indicator');
        const loadingElement = document.getElementById('loading');

        this.gestureHandler = new GestureHandler(videoElement, statusElement, loadingElement);
        this.gestureHandler.init();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        const elapsedTime = this.clock.getElapsedTime();
        
        // 更新 uniforms
        this.uniforms.uTime.value = elapsedTime;

        // 更新各子系统
        this.starfield.update(elapsedTime);
        this.planets.update(elapsedTime);
        this.saturn.update();

        // 处理手势和自动巡航
        if (!this.gestureHandler.isDetected()) {
            this.autoIdleTime += 0.005;
            this.targetScale = 1.0 + Math.sin(this.autoIdleTime) * 0.2;
            this.targetRotX = 0.4 + Math.sin(this.autoIdleTime * 0.3) * 0.15;
        } else {
            this.targetScale = this.gestureHandler.getTargetScale();
            this.targetRotX = this.gestureHandler.getTargetRotX();
        }

        // 更新状态
        this.gestureHandler.updateStatus(
            document.getElementById('status-indicator'),
            this.autoIdleTime
        );

        // 平滑插值
        const lerpFactor = 0.08;
        this.currentScale += (this.targetScale - this.currentScale) * lerpFactor;
        this.currentRotX += (this.targetRotX - this.currentRotX) * lerpFactor;

        this.uniforms.uScale.value = this.currentScale;
        this.uniforms.uRotationX.value = this.currentRotX;

        // 渲染
        this.renderer.render(this.scene, this.camera);
    };
}

// 应用入口
document.addEventListener('DOMContentLoaded', () => {
    const app = new SaturnApp();
    app.init();

    // 全屏按钮
    window.toggleFullScreen = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };
});
