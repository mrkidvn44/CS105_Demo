//CREATE C LANGUAGE SHADER CODE 

import * as glMatrix from './lib/common.js';
import * as mat4 from './lib/mat4.js'

// Because Java script won't run on GPU so build your own shaders
var Init = function()
{
    loadTextResource('./shaders/skybox.fs.glsl', function(vsErr, sbfsText) {
        if (vsErr) {
            alert('Fatal error getting vertex shader (see console)');
            console.error(vsErr);
        } else{
        loadTextResource('./shaders/skybox.vs.glsl', function(vsErr, sbvsText) {
            if (vsErr) {
                alert('Fatal error getting vertex shader (see console)');
                console.error(vsErr);
            } else{
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
                                            loadImage('./plane.jpg', function(planeImgErr, planeImgText) {
                                                if (planeImgErr) {
                                                    alert('Fatal error getting plane texture');
                                                    console.log(planeImgErr);
                                                } else {
                                                    main(sbvsText, sbfsText, vsText, fsText, boxImgText, sphereImgText, planeImgText);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            }
        });
        }
    });
};

var main= function(sVShader, sFShader, vertexShaderText, fragmentShaderText, imgbox, imgsphere, planeImg){
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

    var program = gl.createProgram();
    var cubeProgram = gl.createProgram();
    createProgramFromText(gl, program, vertexShaderText, fragmentShaderText);
    createProgramFromText(gl, cubeProgram, sVShader, sFShader);
    //
    // Create vertices for buffer
    //
    var [boxVertices, boxIndices] = createBoxVertexAndIndices_texture();
    var [sphereVertices, sphereIndices] = createSphereVertexAndIndices_texture();
    var [planeVertices, planeIndices] = createPlaneVertexAndIndices_texture();
    // Get the object's normal for buffer
    var boxNormal = getCubeNormal();
    var sphereNormal = getSphereNormal();
    var planeNormal = getPlaneNormal(); 

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

    //Texture for sphere
    var planeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, planeTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		planeImg
	);
    
    // Texture for enviroment
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const faceInfos = [
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          url: 'cubemap/px.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          url: 'cubemap/nx.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          url: 'cubemap/py.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          url: 'cubemap/ny.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          url: 'cubemap/pz.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
          url: 'cubemap/nz.jpg',
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;
    
        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
    
        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
    
        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
          // Now that the image has loaded make copy it to the texture.
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          gl.texImage2D(target, level, internalFormat, format, type, image);
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
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
    var w_matrix3 = [6,0,0,0, 0,1,0,0, 0,0,6,0, 0,-2,0,1];
    // Light information
    gl.useProgram(program);

	var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
	var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sun.direction');
	var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sun.color');

	gl.uniform3f(ambientUniformLocation, 0.5, 0.5, 0.2);
	gl.uniform3f(sunlightDirUniformLocation, -1.0, 1.0, -1.0);
	gl.uniform3f(sunlightIntUniformLocation, 1.0, 1.0, 1.0);

    // Camera posistion
    var camPos = [0, 0, -10]

    // Init some value for matrices
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, camPos, [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth/canvas.clientHeight,0.1,1000.0);
    
    

    // Mouse event handler
    mouseControl(window, camPos);
    
    var positionLocation = gl.getAttribLocation(cubeProgram, "sbVertPosition");
    gl.enableVertexAttribArray(positionLocation);
    // lookup uniforms
    var skyboxLocation = gl.getUniformLocation(cubeProgram, "skyboxBuffer");
    var viewDirectionProjectionInverseLocation =
        gl.getUniformLocation(cubeProgram, "mViewDirectionProjectionInverse");

	//
	// Main render loop
	//
	var loop = function () {
		// Update camera position
        gl.useProgram(program);
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
		
        // Draw plane
        createBufferFromVerticesAndIndices(gl, planeVertices, planeIndices);
        getAttribData_TextureFrag(gl, positionAttribLocation, texCoordAttribLocation);
        createNormalBuffer(gl, planeNormal);
        getNormalAttribData(gl, normalAttribLocation);
	    gl.bindTexture(gl.TEXTURE_2D, planeTexture);
		
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, w_matrix3);
	    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);


        gl.useProgram(cubeProgram);
        // TO DO: make util function
        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);
        createSkyBoxBuffer(gl, positionLocation);
        // Calculate the view Direction projection matrix for shader
        skyBoxMatrixTransform(gl, viewMatrix, viewDirectionProjectionInverseLocation, projMatrix, mat4)

        // Tell the shader to use texture unit 0 for u_skybox
        gl.uniform1i(skyboxLocation, 0);

        // let our quad pass the depth test at 1.0
        gl.depthFunc(gl.LEQUAL);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};

Init();
