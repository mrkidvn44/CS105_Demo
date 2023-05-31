attribute vec4 sbVertPosition;
varying vec4 position;
void main() {
    position = sbVertPosition;
    gl_Position = vec4(sbVertPosition.xy, 1, 1);
}