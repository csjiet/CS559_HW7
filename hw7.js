function start() {

    // Get canvas, WebGL context, twgl.m4
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Sliders at center
    var slider1 = document.getElementById('slider1');
    slider1.value = 0;
    var slider2 = document.getElementById('slider2');
    slider2.value = 0;

    var button1 = document.getElementById('button1');


    // Read shader source
    var vertexSource = document.getElementById("vertexShader").text;
    var fragmentSource = document.getElementById("fragmentShader2").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vertexShader)); return null; }
    
    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fragmentShader)); return null; }
    
    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialize shaders"); }
    gl.useProgram(shaderProgram);	    
    
    // with the vertex shader, we need to pass it positions
    // as an attribute - so set up that communication
    shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
    
    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
    
    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
    
    shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);
   
    // this gives us access to the matrix uniform
    shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

    // Attach samplers to texture units
    shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
    gl.uniform1i(shaderProgram.texSampler1, 0);
    shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
    gl.uniform1i(shaderProgram.texSampler2, 1);
    shaderProgram.texSampler3 = gl.getUniformLocation(shaderProgram, "texSampler3");
    gl.uniform1i(shaderProgram.texSampler3, 2);

    // Data ...

    var numberOfVerticesInXY = 10; // 50 good effect
    
    // vertex positions
    // var vertexPos = new Float32Array( // CHANGED
    //     [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,
    //        1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,
    //        1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,
    //       -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,
    //       -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
    //        1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]);

    function cylinderVertexPosGenerator(vertexPerCircle, height){
      var vertices = [];
      var r = 1;
      var y = 1;
      var degree = 0;
      var degIncrement = 360/ vertexPerCircle;

      // n face = n vertexPerCircle
      // 4 vertex per face x n faces
      for(let i = 0; i< vertexPerCircle; i++){
        let x = (r* Math.cos(degree * Math.PI / 180));
        let z = (r* Math.sin(degree * Math.PI / 180));
        
        let vertex1 = [x, y, z];
        let vertex2 = [x, -y, z];
        vertices.push(vertex1);
        // vertices.push(vertex2);

        degree = degree + degIncrement;
        

        x = (r* Math.cos(degree * Math.PI / 180));
        z = (r* Math.sin(degree * Math.PI / 180));
        
        let vertex3 = [x, y, z];
        let vertex4 = [x, -y, z];
        vertices.push(vertex3);

        
        vertices.push(vertex4);
        vertices.push(vertex2);

      }

      vertices = vertices.flat();

      return new Float32Array(vertices);
    }

    //console.log(cylinderVertexPosGenerator(4, 1));

    var vertexPos = cylinderVertexPosGenerator(numberOfVerticesInXY,1); // Does not generate cube because missing faces

    // vertex normals
    // var vertexNormals = new Float32Array( // CHANGED
    //     [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
    //        1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0, 
    //        0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0, 
    //       -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0, 
    //        0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0, 
    //        0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1  ]);

    function cylinderVertexNormalGenerator(vertexPerCircle, height){
      var vertices = [];
      var r = 1;
      var z = 1;
      var degree = 0;
      var degIncrement = 360/ vertexPerCircle;

      for(let i = 0; i< vertexPerCircle; i++){
        
        let x1 = (r* Math.cos(degree * Math.PI / 180));
        let z1 = (r* Math.sin(degree * Math.PI / 180));

        degree = degree + degIncrement;
        
        let x2 = (r* Math.cos(degree * Math.PI / 180));
        let z2 = (r* Math.sin(degree * Math.PI / 180));

        let midX = (x1+ x2)/2;
        let midZ = (z1+ z2)/2;

        for(let e = 0; e< 4; e++){
          vertices.push([midX, 0, midZ]);
        }

      }

      vertices = vertices.flat();

      return new Float32Array(vertices);
    }

    var vertexNormals = cylinderVertexNormalGenerator(numberOfVerticesInXY,1);
    //console.log(cylinderVertexNormalGenerator(4,1));


    // vertex colors
    // var vertexColors = new Float32Array( // CHANGED
    //     [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
    //        1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
    //        0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
    //        1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
    //        1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
    //        0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);

    function cylinderVertexColorGenerator(vertexPerCircle, height){
      var vertices = [];
      var r = 1;
      var z = 1;
      var degree = 0;
      var degIncrement = 360/ vertexPerCircle;

      for(let i = 0; i< vertexPerCircle; i++){
        
        for(let e = 0; e< 4; e++){
          vertices.push([1, 0, 0]);
        }

      }

      vertices = vertices.flat();

      return new Float32Array(vertices);
    }

    vertexColors = cylinderVertexColorGenerator(numberOfVerticesInXY,1);


    
    // vertex texture coordinates
    // var vertexTextureCoords = new Float32Array( // CHANGED
    //     [  0, 0,   1, 0,   1, 1,   0, 1,
    //        1, 0,   1, 1,   0, 1,   0, 0,
    //        0, 1,   0, 0,   1, 0,   1, 1,
    //        0, 0,   1, 0,   1, 1,   0, 1,
    //        1, 1,   0, 1,   0, 0,   1, 0,
    //        1, 1,   0, 1,   0, 0,   1, 0 ]);

    function cylinderVertexTextureCoordsGenerator(vertexPerCircle, height){
      var vertices = [];
      var r = 1;
      var z = 1;
      var degree = 0;
      var degIncrement = 360/ vertexPerCircle;

      for(let i = 0; i< vertexPerCircle; i++){
        
        vertices.push([0, 0,   1, 0,   1, 1,   0, 1]);

      }

      vertices = vertices.flat();

      return new Float32Array(vertices);
    }

    var vertexTextureCoords = cylinderVertexTextureCoordsGenerator(numberOfVerticesInXY,1);

    // var vertexTextureCoords = new Float32Array( // CHANGED
    //   [  0, 0,   1, 0,   0, 1,   1, 1,
    //      0, 0,   1, 0,   0, 1,   1, 1,
    //      0, 0,   1, 0,   1, 1,   0, 1,
    //      0, 0,   1, 0,   1, 1,   0, 1]);

    // element index array
    // var triangleIndices = new Uint8Array( // CHANGED
    //     [  0, 1, 2,   0, 2, 3,    // front
    //        4, 5, 6,   4, 6, 7,    // right
    //        8, 9,10,   8,10,11,    // top
    //       12,13,14,  12,14,15,    // left
    //       16,17,18,  16,18,19,    // bottom
	  //     20,21,22,  20,22,23 ]); // back

    function cylinderTriangleIndicesGenerator(vertexPerCircle, height){
      var vertices = [];
      var r = 1;
      var z = 1;
      var degree = 0;
      var degIncrement = 360/ vertexPerCircle;

      var vNumber = 0;
      for(let i= 0; i< vertexPerCircle; i++){
        var tI = [vNumber, vNumber+1, vNumber+2, vNumber, vNumber+2, vNumber+3];
        vNumber = vNumber + 4;
        vertices.push(tI);
      }

      vertices = vertices.flat();

      return new Uint8Array(vertices);
    }

    var triangleIndices = cylinderTriangleIndicesGenerator(numberOfVerticesInXY,1);


    // var triangleIndices = new Uint8Array( // CHANGED
    //     [  1, 2, 0,   0, 3, 2,    // front
    //        4, 5, 6,   4, 6, 7,    // right
    //        8, 9,10,   8,10,11,    // top
    //       12,13,14,  12,14,15]); // back
    

    // we need to put the vertices into a buffer so we can
    // block transfer them to the graphics hardware
    var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3; // CHANGED
    //trianglePosBuffer.numItems = 24; // CHANGED
    trianglePosBuffer.numItems = 4 * numberOfVerticesInXY; // CHANGED
    
    // a buffer for normals
    var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3; // CHANGED
    //triangleNormalBuffer.numItems = 24; // CHANGED
    triangleNormalBuffer.numItems = 4* numberOfVerticesInXY; // CHANGED
    
    // a buffer for colors
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    colorBuffer.itemSize = 3; // CHANGED
    //colorBuffer.numItems = 24; // CHANGED
    colorBuffer.numItems = 4* numberOfVerticesInXY; // CHANGED

    // a buffer for textures
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
    textureBuffer.itemSize = 2; // CHANGED
    //textureBuffer.numItems = 24; // CHANGED
    textureBuffer.numItems = 4* numberOfVerticesInXY; // CHANGED

    // a buffer for indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);    

    // Set up texture
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image1 = new Image();

    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image2 = new Image();

    var texture3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image3 = new Image();

    function initTextureThenDraw() // CHANGED
    {
      image1.onload = function() { loadTexture(image1,texture1); };
      image1.crossOrigin = "anonymous";
      image1.src = "https://farm6.staticflickr.com/5564/30725680942_e3bfe50e5e_b.jpg"; // dog
      //image1.src = "https://farm6.staticflickr.com/65535/51743905629_b4f643b3af_b.jpg";

      image2.onload = function() { loadTexture(image2,texture2); };
      image2.crossOrigin = "anonymous";
      //image2.src = "https://farm6.staticflickr.com/5726/30206830053_87e9530b48_b.jpg"; // checkered box
      image2.src = "https://farm6.staticflickr.com/5323/30998511026_c90053af9c_o.jpg"; // bump
      

      image3.onload = function() { loadTexture(image3,texture3); };
      image3.crossOrigin = "anonymous";
      image3.src = "https://live.staticflickr.com/65535/50641908943_f6ebfef28d_o.jpg"; // circle
      //image3.src = "https://farm6.staticflickr.com/65535/50642695166_f0396c190a_m.jpg";
    

      window.setTimeout(draw,200);
    }

    function loadTexture(image,texture)
    {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Option 1 : Use mipmap, select interpolation mode
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

      // Option 2: At least use linear filters
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Optional ... if your shader & texture coordinates go outside the [0,1] range
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // Scene (re-)draw routine
    function draw() {
    
        // Translate slider values to angles in the [-pi,pi] interval
        var angle1 = slider1.value*0.01*Math.PI;
        var angle2 = slider2.value*0.01*Math.PI;
    
        // Circle around the y-axis
        var eye = [400*Math.sin(angle1),150.0,400.0*Math.cos(angle1)];
        var target = [0,0,0];
        var up = [0,1,0];
    
        var tModel = mat4.create();
        mat4.fromScaling(tModel,[100,100,100]);
        mat4.rotate(tModel,tModel,angle2,[1,1,1]);
      
        var tCamera = mat4.create();
        mat4.lookAt(tCamera, eye, target, up);      

        var tProjection = mat4.create();
        mat4.perspective(tProjection,Math.PI/4,1,10,1000);
      
        var tMV = mat4.create();
        var tMVn = mat3.create();
        var tMVP = mat4.create();
        mat4.multiply(tMV,tCamera,tModel); // "modelView" matrix
        mat3.normalFromMat4(tMVn,tMV);
        mat4.multiply(tMVP,tProjection,tMV);
      
        // Clear screen, prepare for rendering
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Set up uniforms & attributes
        gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
        gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
        gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
                 
        gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
        gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
          gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
          gl.FLOAT,false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize,
          gl.FLOAT, false, 0, 0);

	    // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.activeTexture(gl.TEXTURE1); // gl.TEXTURE1 == texture2 checkered box
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.activeTexture(gl.TEXTURE2); 
        gl.bindTexture(gl.TEXTURE_2D, texture3);

        // Do the drawing
        gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
        

    }

    function pepsi(){
          
      return null;
    }

    slider1.addEventListener("input",draw);
    slider2.addEventListener("input",draw);
    button1.addEventListener("click", pepsi);
    initTextureThenDraw();
}

window.onload=start;





