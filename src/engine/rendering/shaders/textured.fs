precision highp float;

uniform highp float uTime;
uniform sampler2D uSampler;

varying highp vec2 vTextureCoord;
varying highp vec4 vVertexNormal;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    if (color.a < 1.0) discard;
    // color = vec4(vVertexNormal.xyz / 2.0 + 0.5, color.a);
    float lum =  dot(vVertexNormal.xyz / 2.0 + 0.5, vec3(0.2125, 0.7154, 0.0721));
    gl_FragColor = color * lum * 2.0;
}