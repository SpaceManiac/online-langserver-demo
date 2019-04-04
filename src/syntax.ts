import { languages } from 'monaco-editor';

export const languageConfig: languages.LanguageConfiguration = {
    "comments": {
        "lineComment": "//",
        "blockComment": ["/*", "*/"]
    },
    "brackets": [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
    ],
    "autoClosingPairs": [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "\"", close: "\"" },
        { open: "'", close: "'" }
    ],
    "surroundingPairs": [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "\"", close: "\"" },
        { open: "'", close: "'" }
    ]
};

export const monarch: languages.IMonarchLanguage = {
    ignoreCase: false,
    defaultToken: "invalid",
    brackets: [
        { open: "{", close: "}", token: "delimiter.curly" },
        { open: "[", close: "]", token: "delimiter.square" },
        { open: "(", close: ")", token: "delimiter.parenthesis" },
    ],

    // Operators, except for accesses, paths, and brackets.
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    operators: [
        "%", "%=", "&", "&&", "&=", "*", "**", "*=", "+", "++", "+=",
        "-", "--", "-=", "/", "/=", "<", "<<", "<<=", "<=", "<>", "=",
        ">", ">=", ">>", ">>=", "?", "^", "^=", "|", "|=", "||", "~", "~!", "~="
    ],

    // Keywords cannot be variable or type names.
    keywords: [
        // Expression pieces.
        "as", "in", "to",
        // `instruction not allowed here`, or causes the parser to get lost.
        "if", "else", "while", "for", "spawn",
        "switch", "try", "catch", "set", "break", "continue", "return",
        "throw", "goto", "var", "call", "del",
        // As a var: `invalid proc/var name: reserved word`.
        // As a type: `instruction not allowed here`.
        "new",
    ],

    // Pseudo-keywords: syntactic special behavior, but can be indentifiers.
    low_keywords: [
        // Syntax elements.
        "step",
        // "proc" and "verb" can be variable names, but not type names.
        "proc", "verb",
        // Special forms (global procs with syntactic oddities).
        "input", "locate", "pick", "arglist",
        // `duplicate defintion: conflicts with built-in variable`
        // Acceptable as a type name.
        // Bug: acceptable as a parameter name.
        "null", "src", "args", "usr",
        // Variable modifiers: vars cannot be declared of a type with these in
        // the name.
        "static", "global", "const", "tmp",
    ],

    // The built-in type names.
    types: [
        "area",
        "atom", "atom/movable",
        "client",
        "database", "database/query",
        "datum",
        "exception",
        "icon",
        "image",
        "list",
        "matrix",
        "mob",
        "mutable_appearance",
        "obj",
        "regex",
        "savefile",
        "sound",
        "turf",
        "world",
    ],

    tokenizer: {
        /*
        identifier         entity           constructor
        operators          tag              namespace
        keyword            info-token       type
        string             warn-token       predefined
        string.escape      error-token      invalid
        comment            debug-token
        comment.doc        regexp
        constant           attribute

        delimiter .[curly,square,parenthesis,angle,array,bracket]
        number    .[hex,octal,binary,float]
        variable  .[name,value]
        meta      .[content]
        */
        root: [
            // identifiers and keywords
            [/\w+/, {
                cases: {
                    '@keywords': 'keyword',
                    '@low_keywords': 'key',
                    '@types': 'type.identifier',
                    '@default': 'identifier',
                }
            }],

            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            { include: '@whitespace' },

            // interpolated string opener
            [/\]/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
            // ordinary string opener
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            ["@symbols", {
                cases: {
                    '@operators': 'operators',
                    '@default': '',
                }
            }],
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],

        string: [
            [/[^[\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
            [/\[/, { token: 'string.quote', bracket: '@open', next: '@root' }],
        ],
    }
} as any;
