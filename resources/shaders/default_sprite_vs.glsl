attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main() {
    float warp = 0.0; //sin(uTime / 100.0 + aVertexPosition.x) * 4.0;
    vec4 pos = uM_Matrix * aVertexPosition;
    gl_Position = uVP_Matrix * (pos + vec4(pos.z, -pos.z + warp, 0, 0));
    vTextureCoord = aTextureCoord;
}