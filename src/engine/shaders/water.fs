precision highp float;

uniform sampler2D uSampler;
uniform highp float uTime;

varying highp vec2 vTextureCoord;
varying highp float depth;

void main() {
    float time = uTime / 4000.0;
    gl_FragColor = vec4(texture2D(uSampler, vTextureCoord + vec2(
        sin(vTextureCoord.y * 16.0 + time) * 0.025 +
        sin(vTextureCoord.y * 8.0 + time) * 0.025 + time / 16.0 +
        sin(depth / 400.0),
        sin(vTextureCoord.x * 16.0 + time) * 0.025 +
        sin(vTextureCoord.x * 8.0 + time) * 0.025 - time / 16.0
    )).rgb, 0.3);
}