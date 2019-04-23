#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;
uniform float uTime;
uniform sampler2D uSamplerTwo;

in vec4 aVertexPosition;

out highp vec2 vTextureCoord;
out highp vec3 vPos;

void main() {
    vec4 pos = uM_Matrix * aVertexPosition;
    vTextureCoord = (pos.xz / 16.0 + 512.75) / 1024.0;
    pos.y = texture(uSamplerTwo, vTextureCoord).r;
    gl_Position = uVP_Matrix * pos;
    vPos = pos.xzy;
}