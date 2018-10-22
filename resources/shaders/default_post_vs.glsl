attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

void main() {
    gl_Position = aVertexPosition;
    vTextureCoord = aTextureCoord;
}