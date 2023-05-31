precision mediump float;

uniform samplerCube skyboxBuffer;
uniform mat4 mViewDirectionProjectionInverse;

varying vec4 position;
void main() {
    vec4 t = mViewDirectionProjectionInverse * position;
    gl_FragColor = textureCube(skyboxBuffer, normalize(t.xyz / t.w));
}