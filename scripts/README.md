# Scripts

Install FFmpeg first:

```sh
brew install ffmpeg
```

Then:

```sh
chmod +x ./*.sh
```

## `audio4web`

Converts an MP3/WAV file to a `.webm` file for upload.

```sh
./audio4web.sh my_file.mp3
```

This will produce `my_file.webm` at a fraction of the size.

## `image4web`

Converts an image (JPG/PNG/GIF/etc) file to a `.webp` file for upload.

```sh
./image4web.sh my_file.png
```

This will produce `my_file.webp` at a fraction of the size.

You can optionally provide a maximum width and height:

```sh
./image4web.sh my_file.png 300 300
```

This will produce `my_file.webp` with a maximum height and width of 300px, while
maintaining the same aspect ratio.
