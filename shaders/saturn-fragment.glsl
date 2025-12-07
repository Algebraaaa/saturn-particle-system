varying vec3 vColor;
varying float vDist;
varying float vOpacity;
varying float vScaleFactor;
varying float vIsRing;

void main() {
    // 把方形的点变成圆的
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    // 边缘羽化，做成光球的效果
    float glow = smoothstep(1.0, 0.4, r); 
    
    // 根据缩放比例计算一个过渡值
    float t = clamp((vScaleFactor - 0.15) / 2.35, 0.0, 1.0);

    // 颜色混合逻辑：放大时偏向原色，缩小时偏向深金色
    vec3 deepGold = vec3(0.35, 0.22, 0.05); 
    float colorMix = smoothstep(0.1, 0.9, t);
    vec3 baseColor = mix(deepGold, vColor, colorMix);

    float brightness = 0.2 + 1.0 * t; 

    // 密度透明度调整
    float densityAlpha = 0.25 + 0.45 * smoothstep(0.0, 0.5, t);

    vec3 finalColor = baseColor * brightness;
    
    // --- 近距离纹理增强 ---
    if (vDist < 40.0) {
        float closeMix = 1.0 - (vDist / 40.0);
        
        if (vIsRing < 0.5) {
            // 行星本体：增加一点对比度和深色纹理
            vec3 deepTexture = pow(vColor, vec3(1.4)) * 1.5; 
            finalColor = mix(finalColor, deepTexture, closeMix * 0.8);
        } else {
            // 光环：增加一点尘埃感
            finalColor += vec3(0.15, 0.12, 0.1) * closeMix;
        }
    }

    // 防止近裁切面太生硬，淡出
    float depthAlpha = 1.0;
    if (vDist < 10.0) depthAlpha = smoothstep(0.0, 10.0, vDist);

    float alpha = glow * vOpacity * densityAlpha * depthAlpha;
    
    gl_FragColor = vec4(finalColor, alpha);
}
