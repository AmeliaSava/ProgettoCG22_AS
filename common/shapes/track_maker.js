function TrackMaker(track) {
	this.name = "Track";

	var nv = track.pointsCount-1;
	this.vertices = new Float32Array(nv * 2 * 3);

	var vertexOffset = 0;
	for (var i=0; i<nv; ++i) {
		var v = track.leftSideAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	for (var i=0; i<nv; ++i) {
		var v = track.rightSideAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	this.triangleIndices = new Uint16Array(nv * 3 * 2);

	var triangleoffset = 0;
	for (var i=0; i< nv ; ++i) {
		this.triangleIndices[triangleoffset + 0] = i ; 
		this.triangleIndices[triangleoffset + 1] = (i + 1)%nv;
		this.triangleIndices[triangleoffset + 2] = nv + (i+1) %nv;
		triangleoffset += 3;

		this.triangleIndices[triangleoffset + 0] = i ;
		this.triangleIndices[triangleoffset + 1] = nv + (i+1) %nv;
		this.triangleIndices[triangleoffset + 2] =nv + i;
		triangleoffset += 3;
	}

	this.numVertices  = nv*2;
	this.numTriangles = this.triangleIndices.length / 3;
};
