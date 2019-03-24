precision highp float;

varying highp float vData;

vec4 EncodeFloatRGBA(float v) {
    float _v = v + 32000.0;
    _v = max(0.0, min(_v, 64000.0));
    float _f = floor(fract(_v) * 64000.0);
    return vec4(
        floor(_v / 255.0) / 255.0,
        floor(mod(_v, 255.0)) / 255.0,
        floor(_f / 255.0) / 255.0,
        floor(mod(_f, 255.0)) / 255.0
    );
}

void main() {
    gl_FragColor = EncodeFloatRGBA(vData);
}