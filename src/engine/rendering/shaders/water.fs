precision highp float;

uniform sampler2D uSampler;
uniform highp float uTime;

varying highp vec2 vTextureCoord;
varying highp float depth;

void main() {
    float time = uTime / 4000.0;
    vec2 texCoord = floor(vTextureCoord * 2048.0) / 2048.0;
    vec4 color = texture2D(uSampler, texCoord + vec2(
        sin(texCoord.y * 16.0 + time) * 0.025 +
        sin(texCoord.y * 8.0 + time) * 0.025 + time / 16.0 +
        sin(depth / 400.0),
        sin(texCoord.x * 16.0 + time) * 0.025 +
        sin(texCoord.x * 8.0 + time) * 0.025 - time / 16.0
    ));
    color += texture2D(uSampler, texCoord + vec2(
        sin(texCoord.y * 16.0 + time) * -0.025 +
        sin(texCoord.y * 8.0 + time) * -0.025 + time / 16.0 +
        sin(depth / 400.0) + 0.5,
        sin(texCoord.x * 8.0 + time) * 0.025 +
        sin(texCoord.x * 16.0 + time) * 0.025 - time / 16.0 + 0.5
    ));
    color += texture2D(uSampler, (texCoord + vec2(
        sin(texCoord.y * 16.0 + time) * -0.025 +
        sin(texCoord.y * 8.0 + time) * -0.025 + time / 32.0 +
        sin(depth / 400.0) + 0.25,
        sin(texCoord.x * 8.0 + time) * -0.025 +
        sin(texCoord.x * 16.0 + time) * -0.025 - time / 32.0 + 0.25
    )));
    color.b = max(color.b, 0.5);
    gl_FragColor = color / 3.0;
}