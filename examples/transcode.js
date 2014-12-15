var vlc = require('..');

var cmd = vlc('file:///home/simon/Videos/20-joints.mp4');
cmd.format('ogg')
.videoCodec('theo')
.audioCodec('vorb')
.addOption('--sout-theora-quality=5', '--sout-vorbis-quality=1')
.output(__dirname+'/out.ogv')
.run(function () {
	console.log('Done.');
});