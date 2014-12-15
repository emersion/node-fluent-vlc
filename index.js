var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;

function VlcCommand(input) {
	if (!(this instanceof VlcCommand)) {
		return new VlcCommand(input);
	}

	EventEmitter.call(this);

	if (input) {
		this.input(input);
	}
}
util.inherits(VlcCommand, EventEmitter);
module.exports = VlcCommand;

VlcCommand.prototype.input = function (input) {
	this._input = input;
	return this;
};

VlcCommand.prototype.format = function (format) {
	this._outputFormat = format;
	return this;
};
VlcCommand.prototype.videoCodec = function (codec) {
	this._outputVideoCodec = codec;
	return this;
};
VlcCommand.prototype.audioCodec = function (codec) {
	this._outputAudioCodec = codec;
	return this;
};

VlcCommand.prototype.output = function (output) {
	this._output = output;
	return this;
};

VlcCommand.prototype.pipe = function (stream) {
	this.output(stream);
	return stream;
};

VlcCommand.prototype.addOption = function () {
	var opts = Array.prototype.slice.call(arguments);
	this._customOpts = (this._customOpts || []).concat(opts);
	return this;
};

VlcCommand.prototype._spawn = function (args, options) {
	var that = this;

	var command = VlcCommand.getVlcPath();
	var proc = spawn(command, args, options);

	proc.on('exit', function () {
		that.emit('exit');
	});
};
VlcCommand.prototype._getArguments = function () {
	var outputOpts = [];

	var transcode = [];
	if (this._outputVideoCodec) {
		transcode.push('vcodec='+this._outputVideoCodec);
	}
	if (this._outputAudioCodec) {
		transcode.push('acodec='+this._outputAudioCodec);
	}
	if (transcode.length) {
		outputOpts.push('transcode{'+transcode.join(',')+'}');
	}

	outputOpts.push('std{mux='+this._outputFormat+',access=file,dst='+this._output+'}');

	return [].concat(
		this._input,
		'--intf', 'dummy', // No UI
		this._customOpts || [],
		'--sout', '#'+outputOpts.join(':'), // Output args
		'vlc://quit' // Quit when finished
	);
};

VlcCommand.prototype.run = function (done) {
	this._spawn(this._getArguments());

	if (done) {
		this.once('exit', function () {
			done();
		});
	}

	return this;
};

// VLC path
var vlcPath = 'vlc';
VlcCommand.getVlcPath = function () {
	return process.env.VLC_PATH || vlcPath;
};
VlcCommand.setVlcPath = function (path) {
	vlcPath = path;
};