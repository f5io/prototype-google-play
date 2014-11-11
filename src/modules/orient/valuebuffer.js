function ValueBuffer(samples) {
	this.samples = samples;
	this.initBuffer();
}

ValueBuffer.prototype.initBuffer = function() {
	this.index = 0;
	this.buffer = [];
	this.value = 0;
	for (var i = 0; i < this.samples; i++) this.buffer.push(0);
};

ValueBuffer.prototype.update = function(val) {
	var last = this.buffer[this.index];
	var delta = val - last;
	this.index++;
	if (this.index === this.samples) this.index = 0;
	this.buffer[this.index] = delta;
};

ValueBuffer.prototype.sum = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + val;
	}, 0);
};

ValueBuffer.prototype.sumPos = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + (val > 0 ? val : 0);
	}, 0);
};

ValueBuffer.prototype.sumNeg = function() {
	return this.buffer.reduce(function(prev, val) {
		return prev + (val < 0 ? val : 0);
	}, 0);
};

ValueBuffer.prototype.average = function() {
	return this.sum() / this.samples;
};

ValueBuffer.prototype.smooth = function(smoothing) {
	this.value = this.buffer[0];
	for (var i = 1; i < this.samples; i++) {
		this.value += (this.buffer[i] - this.value) / smoothing;
	}
	return this.value;
};

ValueBuffer.prototype.clear = function() {
	for (var i = 0; i < this.samples; i++) this.buffer.push(0);
	this.index = 0;
};

ValueBuffer.prototype.last = function() {
	return this.buffer[this.index];
};

module.exports = ValueBuffer;
