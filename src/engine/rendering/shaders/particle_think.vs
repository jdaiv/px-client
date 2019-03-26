precision highp float;

uniform float uTexSize;

attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main() {
    gl_Position = aVertexPosition;
    vTextureCoord = aTextureCoord * uTexSize;
}