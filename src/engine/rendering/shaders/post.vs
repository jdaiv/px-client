#version 300 es

precision mediump float;

uniform highp float uTime;
uniform mediump vec2 uScreenSize;

in vec4 aVertexPosition;

void main() {
    gl_Position = aVertexPosition;
}