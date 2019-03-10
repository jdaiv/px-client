precision highp float;

uniform highp float uTime;
uniform sampler2D uSampler;

varying highp vec2 vTextureCoord;
varying highp vec4 vVertexNormal;

void main() {
    vec4 color = texture2D(uSampler, vec2(0, 0));
    // color = vec4(vVertexNormal / 2.0 + 0.5, color.a);
    gl_FragColor = color;
}