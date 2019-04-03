import * as monaco from 'monaco-editor';
import * as lc from 'monaco-languageclient';
import { createMessageConnection, Event } from 'vscode-jsonrpc';
import monkeypatch from './monkeypatch';

monkeypatch();

const LANGUAGE_ID = 'dreammaker';

let editor: monaco.editor.IStandaloneCodeEditor;

window.MonacoEnvironment = {
	getWorkerUrl: () => "dist/editor.worker.bundle.js",
};

async function start() {
    monaco.languages.register({
        id: LANGUAGE_ID,
        aliases: ["dreammaker", "dm"],
        extensions: [".dm", ".dme", ".dmm"],
    });

    editor = monaco.editor.create(document.getElementById("editor-container")!, {
        value: "meme",
        language: "dreammaker",
        glyphMargin: true,
    });
    layout();
    window.addEventListener('resize', layout);

    lc.MonacoServices.install(editor);

    let worker = new Worker("dist/dmls.worker.bundle.js");
    let reader: lc.MessageReader = {
        onError: Event.None,
        onClose: Event.None,
        onPartialMessage: Event.None,
        listen(callback: (data: lc.Message) => void) {
            worker.onmessage = (event: MessageEvent) => {
                let json = JSON.parse(event.data);
                console.log("<--", json);
                callback(json);
            }
        },
        dispose() {}
    };
    let writer: lc.MessageWriter = {
        onError: Event.None,
        onClose: Event.None,
        write(msg: lc.Message) {
            console.log("-->", msg);
            worker.postMessage(JSON.stringify(msg));
        },
        dispose() {}
    };
    let messageConnection = createMessageConnection(reader, writer);

    let languageClient = new lc.MonacoLanguageClient({
        name: "DreamMaker Language Server",
        clientOptions: {
            documentSelector: [LANGUAGE_ID],
        },
        connectionProvider: {
            get(errorHandler, closeHandler) {
                return Promise.resolve(lc.createConnection(messageConnection, errorHandler, closeHandler));
            }
        }
    });
    languageClient.start();
}

function layout() {
    editor.layout({
        width: window.innerWidth,
        height: window.innerHeight - 50,
    });
}

window.addEventListener('load', start);
