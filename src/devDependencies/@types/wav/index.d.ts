
// Type definitions for wav 1.0
// Project: https://github.com/TooTallNate/node-wav
// Definitions by: GAD <https://github.com/gad-qq>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

import { Transform, TransformOptions } from 'stream';

export interface WavOptions extends TransformOptions {
    /** The number of channels. */
    channels?: number;
    /** The sample rate. */
    sampleRate?: number;
    /** The bit depth. */
    bitDepth?: number;
    /** The audio format code. */
    audioFormat?: number;
}

export class Writer extends Transform {
    constructor(options?: WavOptions);
}

export class Reader extends Transform {
    constructor(options?: WavOptions);
    on(event: 'format', listener: (format: Format) => void): this;
    on(event: 'data', listener: (data: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export interface Format {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    byteRate: number;
    blockAlign: number;
    bitDepth: number;
}
