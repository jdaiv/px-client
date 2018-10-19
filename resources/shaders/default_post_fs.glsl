varying highp vec2 vTextureCoord;

vec2 getScreenCoords(vec2 uv) {
    return vec2(uv.x, 1.0 - uv.y) * uScreenSize;
}

vec2 getUV(vec2 screenCoord) {
    vec2 uv = screenCoord /  uScreenSize;
    return vec2(uv.x, 1.0 - uv.y);
}

const float shadowSize = 10.0;

void main() {
    vec2 screenCoords = getScreenCoords(vTextureCoord);
    vec4 color = texture2D(uSampler, vTextureCoord);

    color.x = screenCoords.x / uScreenSize.x;
    color.y = screenCoords.y / uScreenSize.y;

    gl_FragColor = color;
}