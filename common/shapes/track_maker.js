function TrackMaker_texCoords(track,scale) {
	this.name = "TexturedTrack";

	var nv = track.pointsCount;
	
	/* create vertex position */
	this.vertices = new Float32Array((nv+1) * 2 * 3);

	var vertexOffset = 0;
	for (var i=0; i<nv+1; ++i) {
		var v = track.leftSideAt(i%nv);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	for (var i=0; i<nv+1; ++i) {
		var v = track.rightSideAt(i%nv);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	/* create texture coordinates */
	this.texCoords = new Float32Array((nv+1) * 2 * 2);
	var d = 0.0;
	var v = track.leftSideAt(0);
	var lp = [v[0],v[1],v[2]];
	
	vertexOffset = 0;
	for (var i=0; i<nv+1; ++i) {
		lp = v;
		var v = track.leftSideAt(i%nv);
		d = d + Math.sqrt( ( lp[0]-v[0])*( lp[0]-v[0])+(lp[1]-v[1])*(lp[1]-v[1])+(lp[2]-v[2])*(lp[2]-v[2]));
		this.texCoords[vertexOffset + 0] = 0.0;
		this.texCoords[vertexOffset + 1] = d*scale;
		vertexOffset += 2;
	}	
	
	d = 0.0;
	v = track.leftSideAt(0);
	lp = [v[0],v[1],v[2]];
	for (var i=0; i<nv+1; ++i) {
		lp = v;
		var v = track.leftSideAt(i%nv);
		d = d + Math.sqrt( ( lp[0]-v[0])*( lp[0]-v[0])+(lp[1]-v[1])*(lp[1]-v[1])+(lp[2]-v[2])*(lp[2]-v[2]));
		this.texCoords[vertexOffset + 0] = 1.0;
		this.texCoords[vertexOffset + 1] = d*scale;
		vertexOffset += 2;
	}	
	
	this.triangleIndices = new Uint16Array(nv * 3 * 2);

	var triangleoffset = 0;
	for (var i=0; i< nv ; ++i) {
		this.triangleIndices[triangleoffset + 0] = i;
		this.triangleIndices[triangleoffset + 1] = (nv+1)+i+1;
		this.triangleIndices[triangleoffset + 2] = i+1;
		triangleoffset += 3;

		this.triangleIndices[triangleoffset + 0] = i ;
		this.triangleIndices[triangleoffset + 1] = (nv+1)+i;
		this.triangleIndices[triangleoffset + 2] = (nv+1)+i+1;
		triangleoffset += 3;
	}

	this.numVertices  = nv;
	this.numTriangles = this.triangleIndices.length / 3;
};

