import { ComponentFixture } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { fireEvent, screen } from '@testing-library/dom';
import { AudioVisualizer } from './audio-visualizer';

// Mock Web APIs that Jest doesn't provide
global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(() => ({
        connect: jest.fn(() => {
            return {
                connect: jest.fn(),
            };
        }),
        getByteFrequencyData: jest.fn(),
        frequencyBinCount: 256,
    })),
    createMediaElementSource: jest.fn(() => ({
        connect: jest.fn(() => {
            return {
                connect: jest.fn(),
            };
        }),
    })),
    destination: {},
    state: 'suspended',
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
}));
global.cancelAnimationFrame = jest.fn();
global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 16)); // Simulate 60fps animation

describe('AudioVisualizer', () => {
    let component: AudioVisualizer;
    let fixture: ComponentFixture<AudioVisualizer>;

    beforeEach(async () => {
        const rendered = await render(AudioVisualizer, {
            inputs: {
                src: 'myfile.wav',
            },
        });
        fixture = rendered.fixture;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    test('should create the component', () => {
        expect(component).toBeTruthy();
    });

    test('should initialize with default values', () => {
        expect(component.playing()).toBe(false);
        expect(component.frequencies()).toEqual([]);
        expect(component.barCount()).toBe(64);
    });

    test('should update bars computed signal correctly', () => {
        component.frequencies.set(Array(512).fill(100)); // Simulate uniform frequency data
        expect(component.bars()).toHaveLength(64);
        expect(component.bars()[0]).toBeGreaterThan(0);
    });

    test('should set playing signal when audio starts', async () => {
        const audioElement = screen.getByRole('audio') as HTMLAudioElement;

        // Simulate audio starting
        fireEvent.play(audioElement);

        expect(component.playing()).toBe(true);
    });

    test('should unset playing signal when audio pauses', async () => {
        const audioElement = screen.getByRole('audio') as HTMLAudioElement;

        // Simulate play event first
        fireEvent.play(audioElement);
        expect(component.playing()).toBe(true);

        // Now simulate pause event
        fireEvent.pause(audioElement);
        expect(component.playing()).toBe(false);
    });

    test('should emit ended event when audio finishes playing', async () => {
        const audioElement = screen.getByRole('audio') as HTMLAudioElement;
        const endedSpy = jest.spyOn(component.ended, 'emit');

        // Simulate audio finishing
        fireEvent.ended(audioElement);

        expect(component.playing()).toBe(false);
        expect(endedSpy).toHaveBeenCalled();
    });

    test('should correctly play audio when play() is called', async () => {
        const audioElement = screen.getByRole('audio') as HTMLAudioElement;
        jest.spyOn(audioElement, 'play').mockImplementation(() =>
            Promise.resolve(),
        );

        component.play();
        expect(audioElement.play).toHaveBeenCalled();
    });

    test('should correctly stop audio when stop() is called', async () => {
        const audioElement = screen.getByRole('audio') as HTMLAudioElement;
        jest.spyOn(audioElement, 'pause').mockImplementation(() => {});

        // Manually simulate the play event first
        fireEvent.play(audioElement); // This triggers `onPlay()`, setting `playing()` to true
        expect(component.playing()).toBe(true);

        // Now test stop() (it should call pause)
        component.stop();
        expect(audioElement.pause).toHaveBeenCalled();

        // Manually simulate the pause event
        fireEvent.pause(audioElement); // This triggers `onPause()`, setting `playing()` to false
        expect(component.playing()).toBe(false);
    });

    test('should update frequencies when visualizer is active', () => {
        // Mock AnalyserNode
        const mockAnalyser = {
            getByteFrequencyData: jest.fn((data: Uint8Array) => {
                data.set(Array(256).fill(128)); // Simulate uniform frequencies
            }),
            frequencyBinCount: 256,
        } as unknown as AnalyserNode;

        component['_analyser'] = mockAnalyser;
        component['_dataArray'] = new Uint8Array(256);

        component['_updateBars']();
        expect(component.frequencies()).toEqual(Array(256).fill(128));
    });

    test('should stop animation frame when stopping visualizer', () => {
        // Simulate an animation frame ID
        component['_animationId'] = 123;

        // Mock cancelAnimationFrame
        global.cancelAnimationFrame = jest.fn();

        component['_stopVisualizer']();
        expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
        expect(component['_animationId']).toBeUndefined();
    });
});
