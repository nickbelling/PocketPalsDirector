import { Injectable } from '@angular/core';
import { Mp3Encoder } from '@breezystack/lamejs';
import { BaseGameDatabase } from '../base/database';
import {
    AVOIDING_THE_DMCA_STATE_DEFAULT,
    AvoidingTheDmcaQuestion,
    AvoidingTheDmcaState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class AvoidingTheDmcaDatabase extends BaseGameDatabase<
    AvoidingTheDmcaState,
    AvoidingTheDmcaQuestion
> {
    private _audioContext = new AudioContext();

    constructor() {
        super('games/avoiding-the-dmca', AVOIDING_THE_DMCA_STATE_DEFAULT);
    }

    /**
     * Retrieves the duration of the audio file in seconds.
     * @param audioFile The audio File object.
     * @returns A Promise that resolves to the duration in seconds.
     */
    public async getDuration(audioFile: File): Promise<number> {
        // Read the file as ArrayBuffer
        const arrayBuffer = await this._readFileAsArrayBuffer(audioFile);

        // Decode the audio data
        const audioBuffer =
            await this._audioContext.decodeAudioData(arrayBuffer);

        // Return the duration
        return audioBuffer.duration;
    }

    /**
     * Creates a 30-second MP3 preview clip from the original audio file with
     * fade-in and fade-out effects.
     * @param audioFile The original audio File object.
     * @param startingFrom The start time in seconds from where the clip should
     * begin.
     * @returns A Promise that resolves to a new MP3 File object representing
     * the preview clip.
     */
    public async getPreviewFile(
        audioFile: File,
        startingFrom: number,
    ): Promise<File> {
        // Read the file as ArrayBuffer
        const arrayBuffer = await this._readFileAsArrayBuffer(audioFile);

        // Decode the audio data
        const originalBuffer =
            await this._audioContext.decodeAudioData(arrayBuffer);

        // Calculate the start and end times
        const sampleRate = originalBuffer.sampleRate;
        const startSample = Math.floor(startingFrom * sampleRate);
        const endSample = Math.min(
            startSample + Math.floor(30 * sampleRate),
            originalBuffer.length,
        );

        // Extract the segment and apply fades
        const fadedBuffer = this._extractAndFade(
            originalBuffer,
            startSample,
            endSample,
            sampleRate,
        );

        // Encode to MP3
        const mp3Blob = this._encodeMP3(fadedBuffer);

        // Create a new File from the Blob
        const previewFile = new File(
            [mp3Blob],
            `preview_${audioFile.name.replace(/\.[^/.]+$/, '')}.mp3`,
            {
                type: 'audio/mp3',
            },
        );

        return previewFile;
    }

    /**
     * Reverses the audio in the given MP3 File and returns a new reversed MP3 File.
     * @param audioFile The original MP3 File object.
     * @returns A Promise that resolves to a new reversed MP3 File.
     */
    public async getReversedAudioFile(audioFile: File): Promise<File> {
        // Step 1: Read the file as ArrayBuffer
        const arrayBuffer = await this._readFileAsArrayBuffer(audioFile);

        // Step 2: Decode the audio data
        const originalBuffer =
            await this._audioContext.decodeAudioData(arrayBuffer);

        // Step 3: Reverse the audio data
        const reversedBuffer = this._reverseAudioBuffer(originalBuffer);

        // Step 4: Encode the reversed audio to MP3
        const mp3Blob = this._encodeMP3(reversedBuffer);

        // Step 5: Create a new File from the Blob
        const reversedFile = new File(
            [mp3Blob],
            `reversed_${audioFile.name.replace(/\.[^/.]+$/, '')}.mp3`,
            {
                type: 'audio/mp3',
            },
        );

        return reversedFile;
    }

    /**
     * Reads a File object as an ArrayBuffer.
     * @param file The File to read.
     * @returns A Promise that resolves to the ArrayBuffer of the file's data.
     */
    private _readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer.'));
                }
            };
            reader.onerror = () => {
                reject(new Error('Error reading file.'));
            };
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Extracts a segment from the AudioBuffer and applies fade-in and fade-out.
     * @param buffer The original AudioBuffer.
     * @param startSample The starting sample index.
     * @param endSample The ending sample index.
     * @param sampleRate The sample rate of the audio.
     * @returns A Float32Array containing the processed audio data.
     */
    private _extractAndFade(
        buffer: AudioBuffer,
        startSample: number,
        endSample: number,
        sampleRate: number,
    ): Float32Array {
        const numChannels = buffer.numberOfChannels;
        const segmentLength = endSample - startSample;
        const segmentData: Float32Array[] = [];

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer
                .getChannelData(channel)
                .slice(startSample, endSample);
            segmentData.push(channelData);
        }

        // Mix down to mono for simplicity (optional: handle stereo)
        let monoData: Float32Array;
        if (numChannels > 1) {
            monoData = new Float32Array(segmentLength);
            for (let i = 0; i < segmentLength; i++) {
                let sum = 0;
                for (let channel = 0; channel < numChannels; channel++) {
                    sum += segmentData[channel][i];
                }
                monoData[i] = sum / numChannels;
            }
        } else {
            monoData = segmentData[0];
        }

        // Apply fade-in and fade-out (1 second each)
        const fadeDuration = Math.min(1, monoData.length / sampleRate / 2); // 1 second or half the clip
        const fadeSamples = Math.floor(fadeDuration * sampleRate);

        for (let i = 0; i < fadeSamples; i++) {
            const fadeInFactor = i / fadeSamples;
            monoData[i] *= fadeInFactor;
        }

        for (let i = monoData.length - fadeSamples; i < monoData.length; i++) {
            if (i >= 0) {
                const fadeOutFactor = (monoData.length - i) / fadeSamples;
                monoData[i] *= fadeOutFactor;
            }
        }

        return monoData;
    }

    /**
     * Encodes a Float32Array to MP3 using lamejs.
     * @param samples The Float32Array containing audio samples.
     * @returns A Blob representing the MP3 file.
     */
    private _encodeMP3(samples: Float32Array): Blob {
        const mp3Encoder = new Mp3Encoder(
            1,
            this._audioContext.sampleRate,
            128,
        );
        const sampleBlockSize = 1152;
        const mp3Data: Uint8Array[] = [];

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
            const sampleChunk = samples.subarray(i, i + sampleBlockSize);
            // Convert Float32Array to Int16Array
            const buffer = new Int16Array(sampleChunk.length);
            for (let j = 0; j < sampleChunk.length; j++) {
                buffer[j] = Math.max(
                    -32768,
                    Math.min(32767, sampleChunk[j] * 32767),
                );
            }
            const mp3buf = mp3Encoder.encodeBuffer(buffer);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        const mp3buf = mp3Encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        const blob = new Blob(mp3Data, { type: 'audio/mp3' });
        return blob;
    }

    /**
     * Reverses the audio data in the given AudioBuffer.
     * @param buffer The original AudioBuffer.
     * @returns A new Float32Array containing the reversed audio data.
     */
    private _reverseAudioBuffer(buffer: AudioBuffer): Float32Array {
        const numChannels = buffer.numberOfChannels;
        const length = buffer.length;
        const reversedData: Float32Array[] = [];

        // Reverse each channel
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            const reversedChannel = new Float32Array(length);
            for (let i = 0; i < length; i++) {
                reversedChannel[i] = channelData[length - i - 1];
            }
            reversedData.push(reversedChannel);
        }

        // Mix down to mono (optional: handle stereo)
        let monoData: Float32Array;
        if (numChannels > 1) {
            monoData = new Float32Array(length);
            for (let i = 0; i < length; i++) {
                let sum = 0;
                for (let channel = 0; channel < numChannels; channel++) {
                    sum += reversedData[channel][i];
                }
                monoData[i] = sum / numChannels;
            }
        } else {
            monoData = reversedData[0];
        }

        return monoData;
    }
}
