varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

void main() {
    gl_Position = vec4((
        (
            aScreenCoord.xy
        ) /
            uScreenSize * vec2(2, -2)) + vec2(-1, 1),
        aScreenCoord.z, 1);
    vTextureCoord = aTextureCoord;
}