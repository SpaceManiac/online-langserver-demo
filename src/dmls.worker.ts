import langserver from '../bin/dm-langserver.js';

let backlog: MessageEvent[] = [];
onmessage = (event: MessageEvent) => {
    console.log("pushing to backlog: ", event.data);
    backlog.push(event);
}

function realOnMessage(event: MessageEvent) {
    console.log("handling: ", event.data);

    let source = new TextEncoder().encode(event.data);
    let ptr = Module._malloc(source.byteLength);
    let target = new Uint8Array(Module.wasmMemory.buffer, ptr, source.byteLength);
    target.set(source);
    console.log("before _handle_input(", ptr, ",", source.byteLength, ")");
    Module._handle_input(ptr, source.byteLength);
    console.log("after _handle_input");
    Module._free(ptr);
}

interface Module {
    wasmMemory: {
        buffer: ArrayBuffer;
    };

    // imports
    _handle_input(ptr: number, len: number): void;
    _malloc(size: number): number;
    _free(ptr: number): void;
}

let Module: Module = langserver({
    locateFile: (x: string) => "../bin/" + x,
    setStatus: (x: string) => console.log("status :: ", x),
    postRun: () => {
        for (let message of backlog) {
            realOnMessage(message);
        }
        onmessage = realOnMessage;
        backlog = [];
    },

    // exports
    handle_output: (ptr: number, len: number) => {
        postMessage(new TextDecoder("utf-8").decode(new Uint8Array(Module.wasmMemory.buffer, ptr, len)));
    },
});
