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
    if (color.w <= 0.0 || length(color.xyz) <= 0.0) {
        color = texture2D(uSampler, getUV(coords + vec2(0, 1)));
        color += texture2D(uSampler, getUV(coords + vec2(0, 2))) * 0.5;
        color += texture2D(uSampler, getUV(coords + vec2(1, 1)));
        color += texture2D(uSampler, getUV(coords + vec2(1, 0)));
        color += texture2D(uSampler, getUV(coords + vec2(2, 0))) * 0.5;
        color += texture2D(uSampler, getUV(coords + vec2(-1, 1)));
        color += texture2D(uSampler, getUV(coords + vec2(-1, -1)));
        color += texture2D(uSampler, getUV(coords + vec2(0, -1)));
        color += texture2D(uSampler, getUV(coords + vec2(0, -2))) * 0.5;
        color += texture2D(uSampler, getUV(coords + vec2(-1, 0)));
        color += texture2D(uSampler, getUV(coords + vec2(-2, 0))) * 0.5;
        color += texture2D(uSampler, getUV(coords + vec2(1, -1)));
        color /= 12.0;
    }
    return color;
}

void main() {
    vec2 screenCoords = getScreenCoords(vTextureCoord);
    vec4 color = texture2D(uSampler, vTextureCoord);

    color = processColor(screenCoords, color);

    gl_FragColor = color;
}