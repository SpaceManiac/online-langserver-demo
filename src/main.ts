import * as monaco from 'monaco-editor';
import * as lc from 'monaco-languageclient';
import { createMessageConnection, Event } from 'vscode-jsonrpc';

const LANGUAGE_ID = 'dreammaker';
const MODEL_URI = 'inmemory://model.dm';
const MONACO_URI = monaco.Uri.parse(MODEL_URI);

let editor: monaco.editor.IStandaloneCodeEditor;

window.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return 'dist/json.worker.bundle.js';
		}
		if (label === 'css') {
			return 'dist/css.worker.bundle.js';
		}
		if (label === 'html') {
			return 'dist/html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return 'dist/ts.worker.bundle.js';
		}
		return 'dist/editor.worker.bundle.js';
    }
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
                console.log('<--', event.data);
                callback(JSON.parse(event.data));
            }
        },
        dispose() {}
    };
    let writer: lc.MessageWriter = {
        onError: Event.None,
        onClose: Event.None,
        write(msg: lc.Message) {
            console.log('-->', msg);
            worker.postMessage(JSON.stringify(msg));
        },
        dispose() {}
    };
    let messageConnection = createMessageConnection(reader, writer);

    let languageClient = new lc.MonacoLanguageClient({
        name: "DreamMaker Language Client",
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
