precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoor;
varying vec2 fragTexCoord;

uniform mat4 mWorld;    // Matrix of all object in world
uniform mat4 mView;     // Matrix of view camera
uniform mat4 mProj;     // Matrix of projection

void main() {
    fragTexCoord = vertTexCoor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}