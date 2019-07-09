#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform float uTime;

in vec4 aVertexPosition;
in vec4 aVertexNormal;
in vec2 aTextureCoord;

in vec3 aStart;
in vec3 aEnd;
in float aSize;
in vec4 aColor;

out vec4 color;
out vec3 normal;

void main() {
    vec3 pos = (aVertexPosition.xyz * (aSize * 0.1)) + mix(aStart, aEnd, smoothstep(0.0, 8.0, aVertexPosition.y));
    // pos.x += (sin(uTime / 800.0) + sin(uTime / 1200.0)) * pos.y * pos.y * cos(pos.z * 0.0125 + uTime / 400.0) * 0.01;
    // pos.z += (sin(uTime / 1000.0) + sin(uTime / 1600.0)) * pos.y * pos.y * cos(pos.z * 0.0125 + uTime / 600.0) * 0.01;
    gl_Position = uVP_Matrix * vec4(pos, 1);
    color = aColor;
    normal = aVertexNormal.xyz;
}