var fs = require('fs');
var vlc = require('..');

var cmd = vlc(fs.createReadStream('/home/simon/Videos/20-joints.mp4'));
cmd.format('ogg')
.videoCodec('theo')
.audioCodec('vorb')
.addOption('--sout-theora-quality=5', '--sout-vorbis-quality=1')
.output(fs.createWriteStream(__dirname+'/out.ogv'))
.run(function () {
	console.log('Done.');
});