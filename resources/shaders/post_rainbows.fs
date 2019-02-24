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

vec4 processColor(vec2 coords, vec4 color) {
    if (color.w >= 0.0 && length(color.xyz) > 0.0) {
        color.x = abs(sin(coords.y / 8.0 + uTime / 100.0));
        color.y = abs(sin(coords.y / 8.0 + uTime / 150.0));
        color.z = abs(sin(coords.y / 8.0 + uTime / 200.0));
    }
    return color;
}

void main() {
    vec2 screenCoords = getScreenCoords(vTextureCoord);
    vec4 color = texture2D(uSampler, vTextureCoord);

    color = processColor(screenCoords, color);

    gl_FragColor = color;
}