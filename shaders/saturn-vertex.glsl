attribute float size;
attribute vec3 customColor;
attribute float opacityAttr;
attribute float orbitSpeed;
attribute float isRing;
attribute float aRandomId;

varying vec3 vColor;
varying float vDist;
varying float vOpacity;
varying float vScaleFactor;
varying float vIsRing;

uniform float uTime;
uniform float uScale;
uniform float uRotationX;

// 2D 旋转矩阵
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

// 简单的哈希函数，用来做随机
float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
    // 根据缩放级别做 LOD (细节层次) 剔除，离得远就不渲染那么多点
    float normScaleLOD = clamp((uScale - 0.15) / 2.35, 0.0, 1.0);
    float visibilityThreshold = 0.9 + pow(normScaleLOD, 1.2) * 0.1; 

    // 如果随机ID大于阈值，直接把点扔出屏幕，省显卡资源
    if (aRandomId > visibilityThreshold) {
        gl_Position = vec4(0.0);
        gl_PointSize = 0.0;
        return;
    }

    vec3 pos = position;

    // 让光环和本体分开旋转，增加动态感
    if (isRing > 0.5) {
        float angleOffset = uTime * orbitSpeed * 0.2;
        vec2 rotatedXZ = rotate2d(angleOffset) * pos.xz;
        pos.x = rotatedXZ.x;
        pos.z = rotatedXZ.y;
    } else {
        float bodyAngle = uTime * 0.03;
        vec2 rotatedXZ = rotate2d(bodyAngle) * pos.xz;
        pos.x = rotatedXZ.x;
        pos.z = rotatedXZ.y;
    }

    // 处理整体视角的 X 轴旋转（即手势控制的俯仰角）
    float cx = cos(uRotationX);
    float sx = sin(uRotationX);
    float ry = pos.y * cx - pos.z * sx;
    float rz = pos.y * sx + pos.z * cx;
    pos.y = ry;
    pos.z = rz;

    // 转换到相机空间
    vec4 mvPosition = modelViewMatrix * vec4(pos * uScale, 1.0);
    float dist = -mvPosition.z;
    vDist = dist;

    // --- 混沌噪点效果 ---
    // 当摄像机贴得很近时，让粒子位置产生抖动，模拟气体湍流
    float chaosThreshold = 25.0; 
    if (dist < chaosThreshold && dist > 0.1) {
        float chaosIntensity = 1.0 - (dist / chaosThreshold);
        chaosIntensity = pow(chaosIntensity, 3.0);

        float highFreqTime = uTime * 40.0; 
        float noiseX = sin(highFreqTime + pos.x * 10.0) * hash(pos.y);
        float noiseY = cos(highFreqTime + pos.y * 10.0) * hash(pos.x);
        float noiseZ = sin(highFreqTime * 0.5) * hash(pos.z);
        
        vec3 noiseVec = vec3(noiseX, noiseY, noiseZ) * chaosIntensity * 3.0;
        mvPosition.xyz += noiseVec;
    }
    
    gl_Position = projectionMatrix * mvPosition;
    
    // 根据距离计算粒子大小 (透视投影)
    float pointSize = size * (350.0 / dist); 
    pointSize *= 0.55; 

    // 近距离观察行星本体时，稍微把点变小一点，看起来更细腻
    if (isRing < 0.5 && dist < 50.0) {
         pointSize *= 0.8; 
    }

    gl_PointSize = clamp(pointSize, 0.0, 300.0);

    // 传递数据给片元着色器
    vColor = customColor;
    vOpacity = opacityAttr;
    vScaleFactor = uScale;
    vIsRing = isRing;
}
