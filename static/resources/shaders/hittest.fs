precision highp float;

uniform highp float uTime;
uniform sampler2D uSampler;
uniform vec4 uColor;

varying highp vec2 vTextureCoord;
varying highp vec4 vVertexNormal;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    if (color.a < 1.0) discard;
    gl_FragColor = uColor / 255.0;
}