#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;
uniform highp float uTime;
uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

in vec4 aVertexPosition;

out highp vec2 vTextureCoord;
out highp vec3 vPos;

void main() {
    vec4 pos = uM_Matrix * aVertexPosition;
    pos.x += (texture(uSampler, pos.xz / 4000.0).g - 0.5) * 128.0;
    pos.z += (texture(uSampler, pos.xz / 4000.0).g - 0.5) * 128.0;
    vTextureCoord = (pos.xz / 16.0 + 512.75) / 1024.0;
    pos.y = texture(uSamplerTwo, vTextureCoord).r;
    pos.y += texture(uSampler, pos.xz / 512.0).g * (pos.y / 2.0 - 0.25) * 8.0;
    gl_Position = uVP_Matrix * pos;
    vPos = pos.xzy;
}