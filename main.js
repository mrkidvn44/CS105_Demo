//CREATE C LANGUAGE SHADER CODE 

import * as glMatrix from './lib/common.js';
import * as mat4 from './lib/mat4.js'

// Because Java script won't run on GPU so build your own shaders
var Init = function()
{
    loadImage('./crate.png', function(boxImgErr, boxImgText) {
        if (boxImgErr) {
            alert('Fatal error getting box texture');
            console.log(boxImgErr);
        } else {
            loadImage('./earthmap1k.jpg', function(sphereImgErr, sphereImgText) {
                if (sphereImgErr) {
                    alert('Fatal error getting sphere texture');
                    console.log(sphereImgErr);
                } else {
                    loadTextResource('./shaders/shader.tvs.glsl', function(vsErr, vsText) {
                        if (vsErr) {
                            alert('Fatal error getting vertex shader (see console)');
                            console.error(vsErr);
                        } else {
                            loadTextResource('./shaders/shader.tfs.glsl', function(fsErr, fsText) {
                                if (fsErr) {
                                    alert('Fatal error getting fragment shader (see console)');
                                    console.error(fsErr);
                                } else {
                                    main(vsText, fsText, boxImgText, sphereImgText);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

var main= function(vertexShaderText, fragmentShaderText, imgbox, imgsphere){
    //init canvas
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("glcanvas"); 
    //init webgl
    /** @type {WebGLRenderingContext} */
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    //resize function
    function resizer(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
        //console.log("resized");
    }

    // Resize window event Listenner;
    window.addEventListener('resize', resizer);
    resizer();

    // Draw back ground
    gl.clearColor( 0.5, 0.5, 0.5, 0.9 );
    gl.clearDepth( 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Enable depth test to draw face at the correct depth
    gl.enable(gl.DEPTH_TEST);
    // Enable CULL_FACE to only draw the front face
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    gl.depthFunc( gl.LEQUAL );
    //
    // Create shader
    //
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Tell web gl which shaderSource we are using
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    
    //check compile shader
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    
    //check compile shader
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
        return;
    }
    
    //create program like in C
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //check for error when linking shader
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('ERROR linking program', gl.getProgramInfoLog(program));
        return;
    }

    //
    // Create vertices for buffer
    //
    var [boxVertices, boxIndices] = createBoxVertexAndIndices_texture(-6,0,0);
    var [sphereVertices, sphereIndices] = createSphereVertexAndIndices_texture(3,0,0,240);
    
    var boxNormal = getCubeNormal();
    var sphereNormal = getSphereNormal();

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal')

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.enableVertexAttribArray(normalAttribLocation);
    
    //Texture for box
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		imgbox
	);
    //Texture for sphere
    var sphereTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		imgsphere
	);
    // Tell WebGL which program we are using
    gl.useProgram(program);

    // Create uniform matrix from program.
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    
    var w_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 3,0,0,1];
    var w_matrix2 = [1,0,0,0, 0,1,0,0, 0,0,1,0, -3,0,0,1];

    // Light information
    gl.useProgram(program);

	var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
	var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sun.direction');
	var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sun.color');

	gl.uniform3f(ambientUniformLocation, 0.5, 0.5, 0.2);
	gl.uniform3f(sunlightDirUniformLocation, -0.5, -2.0, -1.0);
	gl.uniform3f(sunlightIntUniformLocation, 1.0, 1.0, 1.0);

    // Camera posistion
    var camPos = [0,0, -10]

    // Init some value for matrices
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, camPos, [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth/canvas.clientHeight,0.1,1000.0);
    
    

    // Mouse event handler
    mouseControl(window, camPos);
    

	//
	// Main render loop
	//
	var loop = function () {
		// Update camera position
        mat4.lookAt(viewMatrix,camPos, [0,0,0], [0,1,0]);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        // Draw background
        gl.viewport( 0.0, 0.0, canvas.width, canvas.height );
        gl.clearColor( 0.5, 0.5, 0.5, 0.9 );
    	gl.clearDepth( 1.0 );
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        // Draw box
        createBufferFromVerticesAndIndices(gl, boxVertices, boxIndices);
        getAttribData_TextureFrag(gl, positionAttribLocation, texCoordAttribLocation);
        createNormalBuffer(gl, boxNormal);
        getNormalAttribData(gl, normalAttribLocation);
        
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, w_matrix);
	    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        
        // Draw sphere
        createBufferFromVerticesAndIndices(gl, sphereVertices, sphereIndices);
        getAttribData_TextureFrag(gl, positionAttribLocation, texCoordAttribLocation);
        createNormalBuffer(gl, sphereNormal);
        getNormalAttribData(gl, normalAttribLocation);
	
	gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
		
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, w_matrix2);
	    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0);
		
        requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};

Init();
