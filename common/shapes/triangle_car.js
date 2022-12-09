function Triangle() {//line 1, listing 2.10
	this.name = "TriangleCar";
	this.vertices = new Float32Array([0.5,0.0,0.0, 0.0,0.0,-2.0, -0.5,0.0,0.0]);
	this.triangleIndices = new Uint16Array([0,1,2]);
	this.numVertices  = 3;
	this.numTriangles = 1;
};//line 7
