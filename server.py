#!/usr/bin/env python3
from http.server import *

class MyHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.wasm': 'application/wasm',
        '': 'text/plain',
    }

HTTPServer(('', 8000), MyHandler).serve_forever()
