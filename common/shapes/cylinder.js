///// CYLINDER DEFINITION
/////
///// Resolution is the number of faces used to tesselate the cylinder.
///// Cylinder is defined to be centered at the origin of the coordinate axis, and lying on the XZ plane.
///// Cylinder height is assumed to be 2.0. Cylinder radius is assumed to be 1.0 .
function Cylinder (resolution) {

	this.name = "cylinder";
  
	  // vertices definition
	  ////////////////////////////////////////////////////////////
	  
	  this.vertices = new Float32Array(3*(2*resolution+2));
	  
	  var radius = 1.0;
	  var angle;
	  var step = 6.283185307179586476925286766559 / resolution;
	  
	  // lower circle
	  var vertexoffset = 0;
	  for (var i = 0; i < resolution; i++) {
	  
		  angle = -step * i;
		  
		  this.vertices[vertexoffset] = radius * Math.cos(angle);
		  this.vertices[vertexoffset+1] = 0.0;
		  this.vertices[vertexoffset+2] = radius * Math.sin(angle);
		  vertexoffset += 3;
	  }
	  
	  // upper circle
	  for (var i = 0; i < resolution; i++) {
	  
		  angle = -step * i;
		  
		  this.vertices[vertexoffset] = radius * Math.cos(angle);
		  this.vertices[vertexoffset+1] = 2.0;
		  this.vertices[vertexoffset+2] = radius * Math.sin(angle);
		  vertexoffset += 3;
	  }
	  
	  this.vertices[vertexoffset] = 0.0;
	  this.vertices[vertexoffset+1] = 0.0;
	  this.vertices[vertexoffset+2] = 0.0;
	  vertexoffset += 3;
	  
	  this.vertices[vertexoffset] = 0.0;
	  this.vertices[vertexoffset+1] = 2.0;
	  this.vertices[vertexoffset+2] = 0.0;
	  
	  
	  // triangles definition
	  ////////////////////////////////////////////////////////////
	  
	  this.triangleIndices = new Uint16Array(3*4*resolution);
	  
	  // lateral surface
	  var triangleoffset = 0;
	  for (var i = 0; i < resolution; i++)
	  {
		  this.triangleIndices[triangleoffset] = i;
		  this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
		  this.triangleIndices[triangleoffset+2] = (i % resolution) + resolution;
		  triangleoffset += 3;
		  
		  this.triangleIndices[triangleoffset] = (i % resolution) + resolution;
		  this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
		  this.triangleIndices[triangleoffset+2] = ((i+1) % resolution) + resolution;
		  triangleoffset += 3;
	  }
	  
	  // bottom of the cylinder
	  for (var i = 0; i < resolution; i++)
	  {
		  this.triangleIndices[triangleoffset] = i;
		  this.triangleIndices[triangleoffset+1] = (i+1) % resolution;
		  this.triangleIndices[triangleoffset+2] = 2*resolution;
		  triangleoffset += 3;
	  }
	  
	  // top of the cylinder
	  for (var i = 0; i < resolution; i++)
	  {
		  this.triangleIndices[triangleoffset] = resolution + i;
		  this.triangleIndices[triangleoffset+1] = ((i+1) % resolution) + resolution;
		  this.triangleIndices[triangleoffset+2] = 2*resolution+1;
		  triangleoffset += 3;
	  }
		  
	  this.numVertices = this.vertices.length/3;
	  this.numTriangles = this.triangleIndices.length/3;
  }