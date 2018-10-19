varying highp vec2 vTextureCoord;

void main() {
    gl_Position = vec4(aScreenCoord, 1);
    vTextureCoord = aTextureCoord;
}