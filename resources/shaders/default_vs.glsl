attribute vec4 aVertexColor;

varying lowp vec4 vColor;

void main() {
    float warp = 0.0; //sin(uTime / 100.0 + aVertexPosition.x) * 4.0;
    vec4 pos = uM_Matrix * aVertexPosition;
    gl_Position = uVP_Matrix * (pos);
    vColor = aVertexColor;
}