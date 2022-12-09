function Quadrilateral(quad,scale) {

	var nv = 4;
	this.vertices = new Float32Array(nv  * 3);
	for(var i = 0; i < nv*3;++i)
		this.vertices[i] = quad[i];
	
	this.triangleIndices = new Uint16Array(2*3);

 
	this.triangleIndices[0] = 0;
	this.triangleIndices[1] = 1;
	this.triangleIndices[2] = 2;

	this.triangleIndices[3] = 0;
	this.triangleIndices[4] = 2;
	this.triangleIndices[5] = 3;
	

	this.numVertices  = 4;
	this.numTriangles = 2;
};