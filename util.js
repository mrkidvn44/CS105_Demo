
// Load text resource from a file 
var loadTextResource = function (url, callback){

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function(){
        if(request.status < 200 || request.status > 299){
            callback('Error: HTTP Status ' + request.status + 'on resource ' + url)
        }else
        {
            callback(null, request.responseText);
        }
    };
    request.send();
}

// Load image function for texture
var loadImage = function (url, callback){
    var image = new Image();
    image.onload = function(){
        callback(null, image);
    };
    image.src = url;
}

var createProgramFromText = function(gl, program, vertexShaderText, fragmentShaderText)
{
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
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //check for error when linking shader
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('ERROR linking program', gl.getProgramInfoLog(program));
        return;
    }
}
// TO DO: create Color vertex function
// This function create vertices with offset, because we don't need animation so this will do
// x, y, z is offset

var createSphereVertexAndIndices_texture = function(){
    var SPHERE_DIV = 240;
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    // Vertices
    var vertices = [], indices = [];
    for (j = 0; j <= SPHERE_DIV; j++) {
        // Math from online source to calculate all the vertice of a sphere
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV; 
            si = Math.sin(ai);
            ci = Math.cos(ai);


            vertices.push(si * sj );  // X
            vertices.push(cj );       // Y
            vertices.push(ci * sj );  // Z

            vertices.push(i / SPHERE_DIV);  // U
            vertices.push(j / SPHERE_DIV);  // V
        }
    }

    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            // Math for the indices of sphere
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
      }
    return [vertices, indices];
}

var createBoxVertexAndIndices_texture = function(){
    var boxVertices = 
	[   // X,        Y,       Z          U V 
		// Top                          // change this matrix to U V for texture map (online source)
		1.0, 1.0, 1.0,                  1.0, 1.0,         
        -1.0, 1.0, 1.0,                 0.0, 1.0,
        -1.0,-1.0, 1.0,                 0.0, 0.0,
        1.0,-1.0, 1.0,                  1.0, 0.0,

        1.0, 1.0, 1.0,                  0.0, 1.0,        
        1.0,-1.0, 1.0,                  0.0, 0.0,
         1.0,-1.0,-1.0,                 1.0, 0.0,
         1.0, 1.0,-1.0,                 1.0, 1.0,

        1.0, 1.0, 1.0,                  1.0, 0.0,        
        1.0, 1.0,-1.0,                  1.0, 1.0,
        -1.0, 1.0,-1.0,                 0.0, 1.0,
        -1.0, 1.0, 1.0,                 0.0, 0.0,

        -1.0, 1.0, 1.0,                 1.0, 1.0,         
        -1.0, 1.0,-1.0,                 0.0, 1.0,
        -1.0,-1.0,-1.0,                 0.0, 0.0,
        -1.0,-1.0, 1.0,                 1.0, 0.0,

        -1.0,-1.0,-1.0,                 0.0, 0.0,         
        1.0,-1.0,-1.0,                  1.0, 0.0,
        1.0,-1.0, 1.0,                  1.0, 1.0,
        -1.0,-1.0, 1.0,                 0.0, 1.0,

        1.0,-1.0,-1.0,                  0.0, 0.0,         
        -1.0,-1.0,-1.0,                 1.0, 0.0,
        -1.0, 1.0,-1.0,                 1.0, 1.0,
        1.0, 1.0,-1.0,                  0.0, 1.0,


	];

    // Indices is correct and don't need to change
    var boxIndices =
    [
        0, 1, 2,   0, 2, 3,
      4, 5, 6,   4, 6, 7,
      8, 9,10,   8,10,11,
      12,13,14,  12,14,15,
      16,17,18,  16,18,19,
      20,21,22,  20,22,23
    ];
    return [boxVertices, boxIndices];
}
var getCubeNormal= function()
{
    normal=[

        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
          1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
          0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
         -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
          0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
          0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0 
    ];
    return normal;
}

var createPlaneVertexAndIndices_texture = function(){
    var planeVertices = 
	[   // X,        Y,       Z          U      V 
		// Top                          // change this matrix to U V for texture map (online source)
        1.0, 1.0, 1.0,                  1.0, 0.0,        
        1.0, 1.0,-1.0,                  1.0, 1.0,
        -1.0, 1.0,-1.0,                 0.0, 1.0,
        -1.0, 1.0, 1.0,                 0.0, 0.0,

        -1.0,1.0,-1.0,                 0.0, 0.0,         
        1.0,1.0,-1.0,                  1.0, 0.0,
        1.0,1.0, 1.0,                  1.0, 1.0,
        -1.0,1.0, 1.0,                 0.0, 1.0,
	];

    var planeIndices =
    [
        0, 1, 2,   
        0, 2, 3,    

        4, 5, 6,
        4, 6, 7
    ];
    return [planeVertices, planeIndices];
}

var getSphereNormal= function()
{
    var SPHERE_DIV = 240;
    var i, ai, si, ci;
    var j, aj, sj, cj;  

    var normal = [];
    for (j = 0; j <= SPHERE_DIV; j++) {
        // Math from online source to calculate all the vertice of a sphere
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV; 
            si = Math.sin(ai);
            ci = Math.cos(ai);


            normal.push(si * sj);  // X
            normal.push(cj );      // Y
            normal.push(ci * sj);  // Z
        }
    }
    return normal;
}

var getPlaneNormal= function()
{
    normal=[

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,   
        0.0, 1.0, 0.0,   
        0.0, 1.0, 0.0,

        0.0,-1.0, 0.0,  
        0.0,-1.0, 0.0,   
        0.0,-1.0, 0.0,   
        0.0,-1.0, 0.0,
    ];
    return normal;
}

// Get Buffer data to draw object
var createBufferFromVerticesAndIndices = function(gl, Vertices, Indices)
{
    // Create buffer object
    var VerticesBufferObject = gl.createBuffer();
    // Bind it to graphic library object
    gl.bindBuffer(gl.ARRAY_BUFFER, VerticesBufferObject);
    // Put data to buffer from array
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

    var IndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indices), gl.STATIC_DRAW);
    return gl;
}

var createNormalBuffer = function(gl, normal)
{
    var NormalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, NormalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    return gl;
}

var createBuffer = function(gl, Vertices, Indices, normal)
{
    // Create buffer object
    var VerticesBufferObject = gl.createBuffer();
    // Bind it to graphic library object
    gl.bindBuffer(gl.ARRAY_BUFFER, VerticesBufferObject);
    // Put data to buffer from array
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

    var IndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indices), gl.STATIC_DRAW);

    var NormalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, NormalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);
    return gl;
}
// This is an get attribute data funtion for color only, if use texture map build a new one or change the color attribute pointer
var getAttribData_ColorFrag = function(gl, positionAttribLocation, colorAttribLocation)
{
    // Position attribute from buffer
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, // Number of element per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribue
    );
    // Color attribute from buffer
    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, // Number of element per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT// Offset from the beginning of a single vertex to this attribue
    );
    return gl;
}

var getAttribData_TextureFrag = function(gl, positionAttribLocation, texCoordAttribLocation)
{
    // Position attribute from buffer
    gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
    return gl;
}

var getNormalAttribData = function(gl, normalAttribLocation)
{
    // Position attribute from buffer
    gl.vertexAttribPointer(
		normalAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.TRUE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
    return gl;
}

// Create the sky box buffer and it attribute
var createSkyBoxBuffer = function(gl, positionLocation)
{
    // Bind the position buffer.
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = new Float32Array(
        [
          -1, -1,
           1, -1,
          -1,  1,
          -1,  1,
           1, -1,
           1,  1,
        ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, 
        size, 
        type, 
        normalize, 
        stride, 
        offset);
    return gl;
}

var skyBoxMatrixTransform = function(gl, viewMatrix, viewDirectionProjectionInverseLocation,projMatrix, mat4)
{
    // Make a view matrix from the camera matrix.
    var viewMatrix2 = new Float32Array(16);
    mat4.invert(viewMatrix2,viewMatrix);

    // We only care about direciton so remove the translation
    viewMatrix2[12] = 0;
    viewMatrix2[13] = 0;
    viewMatrix2[14] = 0;

    var viewDirectionProjectionMatrix = new Float32Array(16);
    mat4.multiply(viewDirectionProjectionMatrix,projMatrix, viewMatrix2);
    var viewDirectionProjectionInverseMatrix = new Float32Array(16);
    mat4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);

    // Set the uniforms
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        viewDirectionProjectionInverseMatrix);
    return gl;
}