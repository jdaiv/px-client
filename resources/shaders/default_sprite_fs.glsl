varying highp vec2 vTextureCoord;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    if (color.a < 1.0) discard;
    gl_FragColor = color;
}