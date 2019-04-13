#version 300 es

precision highp float;

in highp vec4 vData;
out vec4 color;

void main() {
    color = vData;
}