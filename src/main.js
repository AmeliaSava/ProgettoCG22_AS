/*
* The FollowFromUpCamera always look at the car from a position abova right over the car
*/
FollowFromUpCamera = function(){

    /* the only data it needs is the position of the camera */
    this.frame = glMatrix.mat4.create();
    
    /* update the camera with the current car position */
    this.update = function(car_position){
      this.frame = car_position;
    }
  
    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
      let eye = glMatrix.vec3.create();
      let target = glMatrix.vec3.create();
      let up = glMatrix.vec4.create();
      
      glMatrix.vec3.transformMat4(eye, [0,50,0], this.frame);
      glMatrix.vec3.transformMat4(target, [0.0,0,0.0,1.0], this.frame);
      glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
      
      return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up);	
    }
}

ChaseCamera = function(){

  /* the only data it needs is the position of the camera */
  this.frame = glMatrix.mat4.create();
  
  /* update the camera with the current car position */
  this.update = function(car_position){
    this.frame = car_position;
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    let up = glMatrix.vec4.create();
    
    glMatrix.vec3.transformMat4(eye, [0,10,25], this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0,1.0], this.frame);
    glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up);	
  }
}

UserCamera = function(){

  let moveeye = glMatrix.vec3.fromValues(30,10,0);
  let movetarget = glMatrix.vec3.fromValues(0,0,0);
  let moveup = glMatrix.vec3.fromValues(0,0,0);
  
  mouseX = 0;
  mouseY = 0;
  
  /* update the camera */
  this.update = function(car_position){
    if(Renderer.car.control_keys["ArrowUp"])
    glMatrix.vec3.add(moveeye, moveeye, [0,-1,0]);
    if(Renderer.car.control_keys["ArrowDown"])
    glMatrix.vec3.add(moveeye, moveeye, [0,1,0]);
    if(Renderer.car.control_keys["ArrowLeft"])
    glMatrix.vec3.add(moveeye, moveeye, [1,0,0]);
    if(Renderer.car.control_keys["ArrowRight"])
    glMatrix.vec3.add(moveeye, moveeye, [-1,0,0]);
    if(Renderer.car.control_keys["r"])
    glMatrix.vec3.add(moveeye, moveeye, [0,-1,0]);
    if(Renderer.car.control_keys["f"])
    glMatrix.vec3.add(moveeye, moveeye, [0,1,0]);    
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    this.frame = glMatrix.mat4.create();
  // point of view
  let eye = glMatrix.vec3.create();
  // where to look
  let target = glMatrix.vec3.create();
  glMatrix.vec3.add(target, target, movetarget);
  // camera orientation
  let up = glMatrix.vec4.create();
  glMatrix.vec3.transformMat4(eye, moveeye, this.frame);
  glMatrix.vec3.transformMat4(target, [1.0,0.0,0.0,1.0], this.frame);
  glMatrix.vec4.transformMat4(up, [0.0,1.0,0.0,0.0], glMatrix.mat4.create());
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up.slice(0,3));	
  }
}

/* the main object to be implementd */
var Renderer = new Object();

/* array of cameras that will be used */
Renderer.cameras = [];
// add all the cameras
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
Renderer.cameras.push(new UserCamera());
// set the camera currently in use
Renderer.currentCamera = 0;

/*
create the buffers for an object as specified in common/shapes/triangle.js
*/
Renderer.createObjectBuffers = function (gl, obj) {

  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  if(typeof obj.normals != 'undefined'){
    obj.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // Textures
  if(typeof obj.texCoords != 'undefined'){
    obj.texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  if(typeof obj.tangents != 'undefined'){
    obj.tangentsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.tangents, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  obj.indexBufferTriangles = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // create edges
  var edges = new Uint16Array(obj.numTriangles * 3 * 2);
  for (var i = 0; i < obj.numTriangles; ++i) {
    edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
    edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
  }

  obj.indexBufferEdges = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, fillColor) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.vertexAttribPointer(this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
  gl.enableVertexAttribArray(this.uniformShader.aNormalIndex);
  gl.vertexAttribPointer(this.uniformShader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);

  if(typeof obj.texCoords != 'undefined'){
    gl.uniform1i(this.uniformShader.uTextModeLocation, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);	
    gl.enableVertexAttribArray(this.uniformShader.aTexCoordsIndex);
    gl.vertexAttribPointer(this.uniformShader.aTexCoordsIndex, 2, gl.FLOAT, false, 0, 0);
  } else {
        gl.uniform1i(this.uniformShader.uTextModeLocation, 0);
        gl.disableVertexAttribArray(this.uniformShader.aTexCoordsIndex);
  }

  if( typeof obj.tangentsBuffer != 'undefined'){ 
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
    gl.enableVertexAttribArray(this.uniformShader.aTangentsIndex);
    gl.vertexAttribPointer(this.uniformShader.aTangentsIndex, 3, gl.FLOAT, false, 0, 0);
  }

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.uniform3fv(this.uniformShader.uColorLocation, fillColor);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("cubecar");

  Renderer.triangle = new Triangle();
  ComputeNormals(Renderer.triangle);
  Renderer.createObjectBuffers(gl, this.triangle);

  Renderer.cube = new Cube();
  ComputeNormals(Renderer.cube);
  Renderer.createObjectBuffers(gl, this.cube);

  Renderer.cylinder = new Cylinder(10);
  ComputeNormals(Renderer.cylinder);
  Renderer.createObjectBuffers(gl, this.cylinder);
  
  ComputeNormals(Game.scene.trackObj);
  Renderer.createObjectBuffers(gl,Game.scene.trackObj);
  ComputeNormals(Game.scene.groundObj);
  Renderer.createObjectBuffers(gl,Game.scene.groundObj);

  for (var i = 0; i < Game.scene.buildings.length; ++i){ 
    ComputeNormals(Game.scene.buildingsObjTex[i]);
    Renderer.createObjectBuffers(gl,Game.scene.buildingsObjTex[i]);
    ComputeNormals(Game.scene.buildingsObjTex[i].roof);
    Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof)
  }
  
  Renderer.loadTexture(gl,0,"../common/texture/street4.png");
  Renderer.loadTexture(gl,1,"../common/texture/facade1.jpg");
  Renderer.loadTexture(gl,2,"../common/texture/facade2.jpg");
  Renderer.loadTexture(gl,3,"../common/texture/facade3.jpg");
  Renderer.loadTexture(gl,4,"../common/texture/roof.jpg");
  Renderer.loadTexture(gl,5,"../common/texture/grass_tile.png");
  Renderer.loadTexture(gl,6,"../common/texture/headlight.png");
};

Renderer.loadTexture = function (gl,tu, url){
  var image = new Image();
  image.src = url;
  image.addEventListener('load',function(){	
      gl.activeTexture(gl.TEXTURE0+tu);
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
      //TODO
      //gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
      //gl.generateMipmap(gl.TEXTURE_2D);
  });
} 

/*
draw the car
*/
Renderer.drawCar = function (gl) {
  
  // matrix for transformations
  translate_matrix = glMatrix.mat4.create();
  rotate_matrix = glMatrix.mat4.create();
  scale_matrix = glMatrix.mat4.create();
  
  // drawing the body of the car
  cube_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromTranslation(translate_matrix, [0,3,-0.3]);
  glMatrix.mat4.fromScaling(scale_matrix, [1,1,2]);
  glMatrix.mat4.mul(cube_mat, translate_matrix, scale_matrix);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cube, [0.9, 0, 0.1]);
  Renderer.stack.pop();

  pipe_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.4,[0,1,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [0.7,4,6]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.2,1,0.2]);
  glMatrix.mat4.mul(pipe_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(pipe_mat, scale_matrix, pipe_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,pipe_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0,0.2,0.5]);
  Renderer.stack.pop();

  cabin_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.1,[1,0,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [1.4,5.7,3]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.7,0.7,0.7]);
  glMatrix.mat4.mul(cabin_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(cabin_mat, scale_matrix, cabin_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,cabin_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cube, [0.2,0.9,1]);
  Renderer.stack.pop();

  // wheels
  wheel_mat = glMatrix.mat4.create();
  wheel_speed = 0;
  glMatrix.mat4.fromRotation(rotate_matrix,3.14/2.0,[0,0,1]);
  glMatrix.mat4.fromScaling(scale_matrix, [1,1,1]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, scale_matrix);

  glMatrix.mat4.identity(cube_mat);

  // rotate the wheels according to speed
  glMatrix.mat4.fromRotation(rotate_matrix, Renderer.car.rotationAngle,[1,0,0]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, wheel_mat);

  // saving changes so the back wheels won't turn
  wheel_mat2 = glMatrix.mat4.clone(wheel_mat);

  // front wheels
  // rotate according to wheel angles
  glMatrix.mat4.fromRotation(rotate_matrix,Renderer.car.wheelsAngle * 0.6,[0,1,0]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, wheel_mat);

  // attach wheels to the car
  glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,1.6,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[2.8,1.6,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0]);
  Renderer.stack.pop(); 

  // back wheels
  // making back wheels bigger
  glMatrix.mat4.fromScaling(scale_matrix,[1,1.8,2]);
  glMatrix.mat4.mul(wheel_mat2,scale_matrix,wheel_mat2);

  glMatrix.mat4.fromTranslation(translate_matrix,[-1,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat2);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[3,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat2);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0]);
  Renderer.stack.pop();
};


Renderer.drawScene = function (gl) {

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;
  this.stack = new MatrixStack();

  gl.viewport(0, 0, width, height);
  
  gl.enable(gl.DEPTH_TEST);

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(this.uniformShader);
  
  gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false,glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));
  gl.uniform3fv(this.uniformShader.uLightDirectionLocation, Game.scene.weather.sunLightDirection);

  Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  
  // initialize the stack with the identity
  this.stack.loadIdentity();
  // multiply by the view matrix
  this.stack.multiply(invV);

  // drawing the car
  this.stack.push();
  // projection * viewport
  this.stack.multiply(this.car.frame);
  this.drawCar(gl);
  this.stack.pop();
  
  gl.uniformMatrix4fv(this.uniformShader.uModelLocation, false, this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
  gl.uniformMatrix4fv(this.uniformShader.uViewMatrixLocation, false, invV);

  // drawing the static elements (ground, track and buldings)
  gl.uniform1i(this.uniformShader.uSamplerLocation,5);
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2]);
  gl.uniform1i(this.uniformShader.uSamplerLocation,0);
 	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7]);
  
	for (var i in Game.scene.buildingsObj) {
    if(i%2 == 0) gl.uniform1i(this.uniformShader.uSamplerLocation,1);
    else if(i == 3 || i == 7) gl.uniform1i(this.uniformShader.uSamplerLocation,2);
          else gl.uniform1i(this.uniformShader.uSamplerLocation,3);
    this.drawObject(gl, Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8]);
  }
		
  gl.uniform1i(this.uniformShader.uSamplerLocation,4);
  for (var i in Game.scene.buildingsObj) 
    this.drawObject(gl, Game.scene.buildingsObjTex[i].roof, [0.9, 0.8, 0.7]);
  
  // drawing lamps
  let lamp_mat = glMatrix.mat4.create();
  let light_mat = glMatrix.mat4.create();
   
  for (var i = 0; i < Game.scene.lamps.length; ++i) {
    glMatrix.mat4.identity(lamp_mat);
    Renderer.stack.push();
    Renderer.stack.multiply(glMatrix.mat4.fromTranslation(lamp_mat,Game.scene.lamps[i].position));
    Renderer.stack.multiply(glMatrix.mat4.fromScaling(lamp_mat, [0.2, 4, 0.2]));
    gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
    this.drawObject(gl, this.cylinder, [0.0, 0.0, 0.0]);
    Renderer.stack.pop();
    let lamp_pos = glMatrix.vec3.create();
    glMatrix.vec3.add(lamp_pos, Game.scene.lamps[i].position, [0.0, 6.0, 0.0]);
    glMatrix.mat4.identity(light_mat);
    Renderer.stack.push();
    Renderer.stack.multiply(glMatrix.mat4.fromTranslation(light_mat, lamp_pos));
    Renderer.stack.multiply(glMatrix.mat4.fromScaling(light_mat, [0.5, 0.5, 0.5]));
    gl.uniformMatrix4fv(this.uniformShader.uModelViewLocation, false, this.stack.matrix);
    this.drawObject(gl, this.cube, [1, 1, 1]);
    Renderer.stack.pop();
    gl.uniform3fv(this.uniformShader.uLampPositionsLocation, lamp_pos);
  }

	gl.useProgram(null);
};



Renderer.Display = function () {
  Renderer.drawScene(Renderer.gl);
  window.requestAnimationFrame(Renderer.Display) ;
};


Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

  Renderer.gl.getExtension('OES_standard_derivatives');

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.uniformShader = new uniformShader(Renderer.gl);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('mouseup', on_mouseup,false);
  Renderer.canvas.addEventListener('mousedown', on_mouseup,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);

  Renderer.Display();
}

on_mouseup = function(e) {

}
on_mousedown = function(e) {

}
on_mouseMove = function(e){
  Renderer.cameras[2].mouseX = e.clientX;
  Renderer.cameras[2].mouseY = e.clientY;
}

on_ekey = function(){
  if(Renderer.currentCamera != 2) Renderer.currentCamera ++;
  else Renderer.currentCamera = 0;
}

on_keyup = function(e){
  if(e.key == 'e') on_ekey();
	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function(e){
	Renderer.car.control_keys[e.key] = true;
}

window.onload = Renderer.setupAndStart;



