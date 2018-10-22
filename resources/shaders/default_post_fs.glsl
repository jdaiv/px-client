varying highp vec2 vTextureCoord;

vec2 getScreenCoords(vec2 uv) {
    return vec2(uv.x, uv.y) * uScreenSize;
}

vec2 getUV(vec2 screenCoord) {
    return screenCoord /  uScreenSize;
}

vec4 processColor(vec2 coords, vec4 color) {
    if (color.w >= 0.0 && length(color.xyz) > 0.0) {
        // color.x += (sin(coords.y / 500.0 + uTime / 150.0)) / 1.0;
        // color.y += (sin(coords.y / 100.0 + uTime / 100.0)) / 2.0;
        // color.z += (sin(coords.y / 10.0 + uTime / 200.0)) / 1.0;
    } else {
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
        color /= 18.0;
    }
    return color;
}

const float shadowSize = 10.0;

void main() {
    vec2 screenCoords = getScreenCoords(vTextureCoord);
    vec4 color = texture2D(uSampler, vTextureCoord);

    color = processColor(screenCoords, color);

    gl_FragColor = color;
}