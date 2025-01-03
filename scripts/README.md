# Scripts

## `audio4web`

Converts an MP3/WAV file to a `.webm` file for upload.

Install FFmpeg first:

```sh
brew install ffmpeg
```

Then:

```sh
chmod +x ./audio4web.sh
```

And then:

```sh
./audio4web.sh my_file.mp3
```

This will produce `my_file.webm` at a fraction of the size.
