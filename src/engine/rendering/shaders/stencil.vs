precision mediump float;

uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;

attribute vec4 aVertexPosition;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * aVertexPosition;
}