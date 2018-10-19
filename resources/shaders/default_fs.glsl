varying highp vec2 vTextureCoord;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}