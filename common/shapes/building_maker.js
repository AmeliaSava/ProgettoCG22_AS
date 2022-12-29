function BuildingMaker(b) {
	this.name = "Building";

	var nv = b.pointsCount;
	this.vertices = new Float32Array(nv * 2 * 3);

	var vertexOffset = 0;
	for (var i=0; i<nv; ++i) {
		var v = b.positionAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	for (var i=0; i<nv; ++i) {
		var v = b.positionAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = b.heightAt(i);
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	this.triangleIndices = new Uint16Array(3 * (2 * nv + nv - 2));

	var triangleOffset = 0;
	for (var i=0; i<nv; ++i) {
		this.triangleIndices[triangleOffset + 0] = i;
		this.triangleIndices[triangleOffset + 1] = nv+ (i+1)%nv;
		this.triangleIndices[triangleOffset + 2] = (i + 1) % nv;
		triangleOffset += 3;

		this.triangleIndices[triangleOffset + 0]  = i ;
		this.triangleIndices[triangleOffset + 1]  =nv+ i ;
		this.triangleIndices[triangleOffset + 2]  =nv+ (i+1)%nv;
		triangleOffset += 3;
	}
	
	/* triangles for the roof */
	for (var i=0; i<(nv-2); ++i) {
		this.triangleIndices[triangleOffset + 0] = nv;
		this.triangleIndices[triangleOffset + 1] = nv + (i + 2) % nv;
		this.triangleIndices[triangleOffset + 2] = nv + (i + 1) ;
		triangleOffset += 3;
	}

	this.numVertices  = nv*2;
	this.numTriangles = this.triangleIndices.length / 3;
};

function BuildingMaker_texCoordsFacades(b,scale) {
	this.name = "TexturedFacades";

	var nv = b.pointsCount;
	this.vertices = new Float32Array((nv+1) * 2 * 3);
	
	var vertexOffset = 0;
	for (var i=0; i<nv; ++i) {
		var v = b.positionAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}
	
	{
		var v = b.positionAt(0);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = v[1];
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	
	for (var i=0; i<nv; ++i) {
		var v = b.positionAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = b.heightAt(i);
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}
	
	{
		var v = b.positionAt(0);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = b.heightAt(0);
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}
	
	this.texCoords = new Float32Array((nv+1) * 2 * 2);
	var d = 0.0;
	var v = b.positionAt(0);
	var lp = [v[0],v[1],v[2]];
	vertexOffset = 0;
	for (var i=0; i<nv+1; ++i) {
		var v = b.positionAt(i%nv);
		d = d + Math.sqrt( ( lp[0]-v[0])*( lp[0]-v[0])+(lp[1]-v[1])*(lp[1]-v[1])+(lp[2]-v[2])*(lp[2]-v[2]));
		lp = v;
		this.texCoords[vertexOffset + 0] = d*scale;
		this.texCoords[vertexOffset + 1] = 0;
		
		this.texCoords[(nv+1)*2+vertexOffset + 0] = d*scale;
		this.texCoords[(nv+1)*2+vertexOffset + 1] = b.heightAt(i%nv)*scale;
		
		vertexOffset += 2;
	}
	
	this.triangleIndices = new Uint16Array(3 * (2 * nv ));


	var triangleOffset = 0;
	for (var i=0; i<nv; ++i) {
		this.triangleIndices[triangleOffset + 0] = i ;
		this.triangleIndices[triangleOffset + 1] = nv+1+ i+1;
		this.triangleIndices[triangleOffset + 2] = i+1 ;
		triangleOffset += 3;

		this.triangleIndices[triangleOffset + 0]  = i;
		this.triangleIndices[triangleOffset + 1]  = nv+1+ i;
		this.triangleIndices[triangleOffset + 2]  = nv+1+ i+1;
		triangleOffset += 3;
	}
	

	this.numVertices  = (nv+1)*2;
	this.numTriangles = this.triangleIndices.length / 3;
};

function BuildingMaker_texCoordsRoof(b,scale) {
	this.name = "TexturedRoof";

	var nv = b.pointsCount;
	this.vertices = new Float32Array( nv * 2 * 3);
	
	var vertexOffset = 0;
	
	for (var i=0; i<nv; ++i) {
		var v = b.positionAt(i);
		this.vertices[vertexOffset + 0] = v[0];
		this.vertices[vertexOffset + 1] = b.heightAt(i);
		this.vertices[vertexOffset + 2] = v[2];
		vertexOffset += 3;
	}

	var min_u = this.vertices[0]; 	
	var max_u = this.vertices[0]; 	
	var min_v = this.vertices[2]; 	
	var max_v =  this.vertices[2]; 	
	for (var i=0; i<nv; ++i) {
		var curr_u = this.vertices[3*i];
		var curr_v = this.vertices[3*i+2];
		if(curr_u > max_u ) 
			{ max_u = curr_u;}
				else 
			if(curr_u < min_u ) { min_u = curr_u;}
		
		if(curr_v > max_v ) 
			{ max_v =curr_v;}
				else 
			if(curr_v < min_v ) { min_v = curr_v;}
	}	
	max_u=max_u-min_u;
	max_v=max_v-min_v;

	
	vertexOffset = 0;
	this.texCoords = new Float32Array( nv * 2);
	for (var i=0; i<nv; ++i) {
		this.texCoords[vertexOffset + 0] = scale*(this.vertices[3*i] - min_u)/max_u;
		this.texCoords[vertexOffset + 1] = scale*(this.vertices[3*i+2] - min_v)/max_v;
		vertexOffset += 2;
	}

	this.texCoords[0] = 0.0;
	this.texCoords[1] = 0.0;
	this.texCoords[2] = 1.0;
	this.texCoords[3] = 0.0;
	this.texCoords[4] = 1.0;
	this.texCoords[5] = 1.0;
	this.texCoords[6] = 0.0;
	this.texCoords[7] = 1.0;

	
	this.triangleIndices = new Uint16Array(3 * ( nv - 2));

	var triangleOffset = 0; 
	/* triangles for the roof */
	for (var i=0; i<(nv-2); ++i) {
		this.triangleIndices[triangleOffset + 0] =		0;
		this.triangleIndices[triangleOffset + 1] =  (i + 2)%nv ;
		this.triangleIndices[triangleOffset + 2] =   i + 1;
		triangleOffset += 3;
	}

	this.numVertices  =  nv;
	this.numTriangles = this.triangleIndices.length / 3;
};