# Saturn 粒子系统（Saturn Particle System）

一个基于 Three.js 的可视化演示：用百万级粒子模拟“土星”与环带，同时渲染背景星空与程序化行星（地球、火星、水星），并通过 MediaPipe 实现手势交互（缩放、俯仰）。

---

## **项目概述**

- **目标**：演示高性能粒子渲染与着色器驱动视觉效果，并结合摄像头手势控制实现沉浸式交互体验。
- **技术栈**：Three.js、GLSL 着色器、MediaPipe Hands、原生 JavaScript、HTML/CSS。
- **特色**：
  - 百万级粒子使用 `BufferGeometry` + `ShaderMaterial` 高效渲染；
  - 着色器实现 LOD（剔除）与细节增强（噪声、Fresnel 等）；
  - 程序化行星使用 FBM/noise 生成纹理；
  - MediaPipe 手势控制：拇指-食指距离控制缩放，掌心高度控制俯仰角。

---

## **快速开始（本地运行）**
建议使用静态服务器运行（不要直接用 `file://` 打开），并允许浏览器访问摄像头以启用手势控制。

- 使用 Python（如已安装）：

```powershell
# 在项目根目录运行
python -m http.server 8000
# 然后打开浏览器访问： http://localhost:8000/
```

- 或使用 Node.js 的 http-server（需先安装）：

```powershell
# 若尚未安装（只需安装一次）
npm i -g http-server
# 在项目根目录运行
http-server -p 8000
# 打开 http://localhost:8000/
```

启动后允许摄像头访问（浏览器会弹出权限请求）。若摄像头不可用，项目仍能展示静态场景，但手势控制会失效。

---

## **文件结构（简要）**

```
project_02/
├── index.html                 # 主入口（包含内联着色器 script 标签）
├── README.md                  # 本文档
├── css/
│   └── styles.css             # 页面样式
├── js/
│   ├── app.js                 # 应用入口与动画循环
│   ├── shader-manager.js      # 着色器加载/管理（从页面 script 标签读取 text）
│   ├── saturn.js              # 土星粒子系统模块
│   ├── starfield.js           # 背景星空与星云
│   ├── planets.js             # 背景行星
│   └── gesture-handler.js     # MediaPipe 手势处理
└── shaders/                   # （项目中也保留为参考）
    ├── saturn-vertex.glsl
    ├── saturn-fragment.glsl
    ├── stars-vertex.glsl
    ├── stars-fragment.glsl
    ├── planet-vertex.glsl
    └── planet-fragment.glsl
```

> 注：为了确保 `ShaderManager` 能通过 `document.getElementById(...).textContent` 读取着色器，当前实现把着色器内容内联在 `index.html` 的 `<script type="x-shader/...">` 标签中；`shaders/` 目录中仍保留独立 `.glsl` 文件作为参考或未来改进使用。

---

## **关键模块说明**

- `js/shader-manager.js`
  - 读取页面内联的 shader `script` 标签（通过 `id`）并注册着色器对。
  - 如需将着色器改为外部文件，请修改为异步 `fetch` 加载。

- `js/saturn.js`
  - 生成土星本体与环带的粒子数据（位置、颜色、大小、速度、随机 ID 等）；
  - 使用自定义顶点/片元着色器实现透视缩放、LOD 剔除、湍流噪声等效果。

- `js/starfield.js`
  - 背景星空与星云，使用粒子系统模拟远处恒星与大尺度星云。

- `js/planets.js`
  - 程序化生成背景行星的球面并使用 FBM/noise 着色器生成纹理与大气边缘。

- `js/gesture-handler.js`
  - 封装 MediaPipe Hands 的初始化与回调。
  - 输出目标缩放与旋转角（由 `app.js` 读取并平滑插值）。

- `js/app.js`
  - 协调上面各模块，初始化 Three.js 场景、相机、渲染器与动画循环；
  - 负责统一 uniforms（如 `uTime`, `uScale`, `uRotationX`）并传递给粒子着色器。

---

## **性能与兼容性建议**

- 百万级粒子对 GPU 要求较高。若在低端设备或笔记本上卡顿：
  - 在 `js/saturn.js` 中减小 `particleCount`（例如从 1,200,000 降到 200,000）；
  - 或在 `app.js` 中按设备像素比和性能动态降低 `renderer.setPixelRatio(...)`；
  - 将复杂效果（如近距湍流噪声）做为可选开关。

- 着色器调试：在把着色器改为外部文件并用 `fetch` 异步加载后，着色器编译错误会在控制台抛出详细信息，便于定位问题。

---

## **常见问题（Troubleshooting）**

- 行星或着色器不显示：确认 `index.html` 中存在对应的 `<script type="x-shader/..." id="...">` 标签（或者确保 `ShaderManager` 能正确 `fetch` 到外部文件）；打开浏览器控制台查看着色器编译错误或 runtime error。

- 摄像头无法启动：
  - 检查浏览器是否已允许摄像头权限；
  - 在本地测试时请使用 `http://localhost` 而非 `file://`；
  - 如果在虚拟机或无摄像头环境，手势功能会停用但渲染仍能运行。

---

## **扩展与改进建议**

- 将着色器外链为 `.glsl` 文件并把 `ShaderManager` 更新为 `async` `fetch`，支持热更新与更好的版本控制。
- 添加 `dat.GUI` / `lil-gui` 面板，允许运行时调节粒子数、环带密度、噪声强度等参数。
- 在低端设备上引入渐进式 LOD 策略：根据帧率动态降低粒子数或切换到烘焙纹理。
- 支持多手势映射（旋转、平移、颜色操作等）。

---