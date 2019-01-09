attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
}