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

// Load JSON 3d resource
var loadJSONResource = function(url, callback){
    loadTextResource(url, function(err, result){
        if(err){
            callback(err);
        } else{
            try{
                callback(null, JSON.parse(result));
            } catch(e){
                callback(e);
            }
        }
    })
}
// TO DO: create Color vertex function
// This function create vertices with offset, because we don't need animation so this will do
// x, y, z is offset
var createSphereVertexAndIndices = function(x, y, z){
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


            vertices.push(si * sj + x);  // X
            vertices.push(cj + y);       // Y
            vertices.push(ci * sj + z);  // Z

            vertices.push(si * sj);  // R
            vertices.push(cj);       // G
            vertices.push(ci * sj);  // B
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
// This function create vertices with offset, because we don't need animation so this will do
// x, y, z is offset
var createBoxVertexAndIndices = function(x, y, z){
    var boxVertices = 
	[   // X,        Y,       Z           R, G, B   
		// Top                          // change this matrix to U V for texture map (online source)
		-1.0 + x, 1.0 + y, -1.0 + z,   0.5, 0.5, 0.5,
		-1.0 + x, 1.0 + y, 1.0 + z,    0.5, 0.5, 0.5,
		1.0 + x, 1.0 + y, 1.0 + z,     0.5, 0.5, 0.5,
		1.0 + x, 1.0 + y, -1.0 + z,    0.5, 0.5, 0.5,

		// Left
		-1.0 + x, 1.0 + y, 1.0 + z,    0.75, 0.25, 0.5,
		-1.0 + x, -1.0 + y, 1.0 + z,   0.75, 0.25, 0.5,
		-1.0 + x, -1.0 + y, -1.0 + z,  0.75, 0.25, 0.5,
		-1.0 + x, 1.0 + y, -1.0 + z,   0.75, 0.25, 0.5,

		// Right
		1.0 + x, 1.0 + y, 1.0 + z,    0.25, 0.25, 0.75,
		1.0 + x, -1.0 + y, 1.0 + z,   0.25, 0.25, 0.75,
		1.0 + x, -1.0 + y, -1.0 + z,  0.25, 0.25, 0.75,
		1.0 + x, 1.0 + y, -1.0 + z,   0.25, 0.25, 0.75,

		// Front
		1.0 + x, 1.0 + y, 1.0 + z,    1.0, 0.0, 0.15,
		1.0 + x, -1.0 + y, 1.0 + z,    1.0, 0.0, 0.15,
		-1.0 + x, -1.0 + y, 1.0 + z,    1.0, 0.0, 0.15,
		-1.0 + x, 1.0 + y, 1.0 + z,    1.0, 0.0, 0.15,

		// Back
		1.0 + x, 1.0 + y, -1.0 + z,    0.0, 1.0, 0.15,
		1.0 + x, -1.0 + y, -1.0 + z,    0.0, 1.0, 0.15,
		-1.0 + x, -1.0 + y, -1.0 + z,    0.0, 1.0, 0.15,
		-1.0 + x, 1.0 + y, -1.0 + z,    0.0, 1.0, 0.15,

		// Bottom
		-1.0 + x, -1.0 + y, -1.0 + z,   0.5, 0.5, 1.0,
		-1.0 + x, -1.0 + y, 1.0 + z,    0.5, 0.5, 1.0,
		1.0 + x, -1.0 + y, 1.0 + z,     0.5, 0.5, 1.0,
		1.0 + x, -1.0 + y, -1.0 + z,    0.5, 0.5, 1.0,
	];

    // Indices is correct and don't need to change
    var boxIndices =
    [
        // Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
    ];
    return [boxVertices, boxIndices];
}

// Get Buffer data to draw object
var createBufferFromVerticesAndIndices= function(gl, Vertices, Indices)
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

// This is an get attribute data funtion for color only, if use texture map build a new one or change the color attribute pointer
var getAttribData = function(gl, positionAttribLocation, colorAttribLocation)
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