attribute vec2 aTextureCoord;
attribute highp vec3 aVertexNormal;

varying highp vec3 vVertexNormal;
varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vVertexNormal = aVertexNormal;
}