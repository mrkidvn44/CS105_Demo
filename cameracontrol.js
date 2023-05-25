var mouseControl = function(window, camPos){
    let isDown = false;
    let xpos = 0;
    let ypos = 0;
    let deltaX = 0;
    let deltaY = 0;

    window.addEventListener('mousedown', function(event){
        isDown = true;
        xpos = event.clientX;
        ypos = event.clientY;
        deltaX = 0;
        deltaY = 0;
    }, false);

    window.addEventListener('mousemove', function(event){
        if (isDown === true) {
            deltaX = event.clientX - xpos;
            deltaY = event.clientY - ypos;
            var sensitivity = 0.5;
            if(camPos[2] > 0)
                camPos[0] -= deltaX * sensitivity;
            else
                camPos[0] += deltaX * sensitivity;
            camPos[1] += deltaY * sensitivity;
            xpos = event.clientX;
            ypos = event.clientY;
        }
    }, false);

    window.addEventListener('mouseup',function(){
        if (isDown === true) {
            isDown = false;
        }
    }, false)  
    
    window.addEventListener('wheel',function(event){
        var sensitivity = 0.005;
        camPos[2] -= sensitivity * event.wheelDelta;
    }, false)
    return camPos;
}