precision highp float;

uniform highp float uTime;
uniform sampler2D uSampler;

varying highp vec2 vTextureCoord;
varying highp vec4 vVertexNormal;

void main() {
    vec4 color = texture2D(uSampler, vec2(0, 0));
    color = vec4(0, dot(vVertexNormal.xyz / 2.0 + 0.5, vec3(0.2125, 0.7154, 0.0721)), 0, color.a);
    gl_FragColor = color;
}