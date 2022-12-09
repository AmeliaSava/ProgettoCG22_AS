	MatrixStack = function (){	
		var m = glMatrix.mat4.create();
		this._l  = 1;
		this._m  = m;
		this._s  = [ m ];
}
MatrixStack.prototype = {

	get size() {
		return this._l;
	},

	get matrix() {
		return this._m.slice();
	},

	get inverse() {
		return (glMatrix.mat4.invert(glMatrix.mat4.create(),this._m).slice()) ;
	},

	get transpose() {
		return (glMatrix.mat4.transpose(glMatrix.mat4.create(),this._m).slice() );
	},

	get inverseTranspose() {
		return (glMatrix.mat4.transpose(this.inverse).slice()) ;
	},


	push : function () {
		var m = this._m.slice();
		this._s.push(m);
		this._l++;
		this._m = m;
	},

	pop : function () {
		if (this._l <= 1) return;
		this._s.pop();
		this._l--;
		this._m = this._s[this._l - 1];
	},

	load : function (m) {
		m1 = m.slice();
		this._s[this._l - 1] = m1;
		this._m = m1;
	},

	loadIdentity : function () {
		var m = glMatrix.mat4.create();
		this._s[this._l - 1] = m;
		this._m = m;
	},

	multiply : function (m) {
		glMatrix.mat4.multiply(this._m,this._m, m);
	},
};