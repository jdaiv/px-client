precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;
uniform mediump vec2 uScreenSize;

varying highp vec2 vTextureCoord;

vec2 getScreenCoords(vec2 uv) {
    return vec2(uv.x, uv.y) * uScreenSize;
}

vec2 getUV(vec2 screenCoord) {
    return screenCoord /  uScreenSize;
}

void main() {
    vec2 screenCoords = getScreenCoords(vTextureCoord);
    vec4 color = texture2D(uSampler, vTextureCoord + vec2(
        sin(screenCoords.y / 16.0 + uTime / 400.0) * 0.01,
        sin(screenCoords.x / 16.0 + uTime / 400.0) * 0.01
    ));

    // color = processColor(screenCoords, color);

    gl_FragColor = color;
}