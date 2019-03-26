precision mediump float;

uniform mat4 uVP_Matrix;
attribute vec4 aVertexPosition;

void main() {
    gl_Position = uVP_Matrix * aVertexPosition;
}