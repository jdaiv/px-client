#version 300 es

precision mediump float;

in vec4 aVertexPosition;

void main() {
    gl_Position = aVertexPosition;
}