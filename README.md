# Fluent VLC-API for Node.js

Inspired from [`fluent-ffmpeg`](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

## Installation

Via npm:
```
$ npm install fluent-vlc
```

## Usage

### Prerequisites

You will need VLC to be installed on your system.

If the `VLC_PATH` environment variable is set, it will be used as the full path to the `vlc` executable. Otherwise, it will attempt to call `vlc` directly (so it should be in your `PATH`).

### Creating a VLC command

The fluent-vlc module returns a constructor that you can use to instanciate VLC commands.

```js
var vlc = require('fluent-vlc');
var command = vlc();
```

You may pass an input URL or readable stream, a configuration object, or both to the constructor.
```js
var command = vlc('file:///path/to/file.avi');
var command = vlc(fs.createReadStream('/path/to/file.avi'));
```

### Specifying outputs

#### output(target): set the output

Sets the output of the command. The target argument may be an output filename, a URL or a writable stream (but at most one output stream may be used with a single command).

#### format(format): set output format

```js
vlc('file:///path/to/file.avi').format('flv');
```

#### audioCodec(format, [options]): set output audio codec

```js
vlc('file:///path/to/file.avi').audioCodec('vorb');
```

#### videoCodec(format, [options]): set output video codec

```js
vlc('file:///path/to/file.avi').videoCodec('theo');
```

### Misc

#### addOption(option...): add a custom VLC option

```js
vlc('file:///path/to/file.avi').format('ogg').videoCodec('theo').audioCodec('vorb').addOption('--sout-theora-quality=5', '--sout-vorbis-quality=1');
```