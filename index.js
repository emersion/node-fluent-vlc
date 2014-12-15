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
VlcCommand.prototype.videoCodec = function (codec, opts) {
	this._outputVideoCodec = codec;
	this._outputVideoOpts = opts;
	return this;
};
VlcCommand.prototype.audioCodec = function (codec, opts) {
	this._outputAudioCodec = codec;
	this._outputAudioOpts = opts;
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
	
	console.log('Starting VLC...', args);

	var command = VlcCommand.getVlcPath();
	var proc = spawn(command, args, options);

	if (typeof this._input != 'string') {
		this._input.resume();
		this._input.pipe(proc.stdin);
	}
	if (typeof this._output != 'string') {
		proc.stdout.pipe(this._output);
	}

	proc.on('exit', function () {
		that.emit('exit');
	});

	proc.stderr.setEncoding('utf-8');
	proc.stderr.on('data', function (data) {
		process.stderr.write(data); // TODO: stderr handler
	});
};
VlcCommand.prototype._getArguments = function () {
	var input = '';
	if (typeof this._input == 'string') {
		input = this._input;
	} else {
		input = '-';
	}

	var outputOpts = [];

	var transcode = [];
	if (this._outputVideoCodec) {
		transcode.push('vcodec='+this._outputVideoCodec);
		if (this._outputVideoOpts) {
			for (var name in this._outputVideoOpts) {
				transcode.push(name+'='+this._outputVideoOpts[name]);
			}
		}
	}
	if (this._outputAudioCodec) {
		transcode.push('acodec='+this._outputAudioCodec);
		if (this._outputAudioOpts) {
			for (var name in this._outputAudioOpts) {
				transcode.push(name+'='+this._outputAudioOpts[name]);
			}
		}
	}
	if (transcode.length) {
		outputOpts.push('transcode{'+transcode.join(',')+'}');
	}

	var output = ['access=file'];
	if (this._outputFormat) {
		output.push('mux='+this._outputFormat);
	}
	if (typeof this._output == 'string') {
		output.push('dst='+this._output);
	} else {
		output.push('dst=-');
	}
	outputOpts.push('std{'+output.join(',')+'}');

	return [].concat(
		input,
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