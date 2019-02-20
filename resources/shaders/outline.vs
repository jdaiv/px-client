attribute vec2 aTextureCoord;
attribute highp vec4 aVertexNormal;

varying highp vec2 vTextureCoord;
varying highp vec3 vVertexNormal;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * (aVertexPosition + aVertexNormal * vec4(1.0, 1.0, 1.0, 0));
    vTextureCoord = aTextureCoord;
    vVertexNormal = aVertexNormal.xyz;
}