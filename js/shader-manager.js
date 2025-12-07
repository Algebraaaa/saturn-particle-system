/**
 * shader-manager.js - 着色器管理模块
 * 动态加载和管理所有着色器代码
 */

class ShaderManager {
    constructor() {
        this.shaders = {};
    }

    // 从脚本标签加载着色器
    loadShaderFromScript(id) {
        const element = document.getElementById(id);
        if (element) {
            return element.textContent;
        }
        console.warn(`Shader script with id '${id}' not found`);
        return '';
    }

    // 注册着色器对
    registerShader(name, vertexShader, fragmentShader) {
        this.shaders[name] = {
            vertex: vertexShader,
            fragment: fragmentShader
        };
    }

    // 获取顶点着色器
    getVertexShader(name) {
        if (this.shaders[name]) {
            return this.shaders[name].vertex;
        }
        console.error(`Vertex shader '${name}' not found`);
        return '';
    }

    // 获取片元着色器
    getFragmentShader(name) {
        if (this.shaders[name]) {
            return this.shaders[name].fragment;
        }
        console.error(`Fragment shader '${name}' not found`);
        return '';
    }

    // 初始化所有着色器（从HTML script标签）
    initializeFromScripts() {
        this.registerShader(
            'saturn',
            this.loadShaderFromScript('vertexshader'),
            this.loadShaderFromScript('fragmentshader')
        );

        this.registerShader(
            'stars',
            this.loadShaderFromScript('starVertexShader'),
            this.loadShaderFromScript('starFragmentShader')
        );

        this.registerShader(
            'planet',
            this.loadShaderFromScript('planetVertexShader'),
            this.loadShaderFromScript('planetFragmentShader')
        );
    }
}
