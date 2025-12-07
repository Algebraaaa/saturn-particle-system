uniform vec3 color1;
uniform vec3 color2;
uniform float noiseScale;
uniform vec3 lightDir;
uniform float atmosphere;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// 基础噪声函数
float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 分形布朗运动 (FBM)
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // 根据噪声生成地表颜色
    float n = fbm(vUv * noiseScale);
    vec3 albedo = mix(color1, color2, n);
    
    // 简单的漫反射光照
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(lightDir);
    float diff = max(dot(normal, light), 0.05);
    
    // 菲涅尔效应 (Fresnel)
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    
    vec3 finalColor = albedo * diff + atmosphere * vec3(0.5, 0.6, 1.0) * fresnel;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
