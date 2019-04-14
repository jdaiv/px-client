precision mediump float;

uniform highp float uTime;
uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;

attribute vec4 aVertexPosition;
attribute highp vec4 aVertexNormal;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;
varying highp vec4 vVertexNormal;

void main() {
    vec4 pos = uVP_Matrix * uM_Matrix * aVertexPosition;
    float width = 0.3;
    gl_Position = uVP_Matrix * uM_Matrix * (aVertexPosition + aVertexNormal * vec4(width, width, width, 0));
    vTextureCoord = aTextureCoord;
    vVertexNormal = aVertexNormal;
}