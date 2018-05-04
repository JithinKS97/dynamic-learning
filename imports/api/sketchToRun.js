import p5Convert from 'p5-global2instance';

export default function sketchToRun(sourceCode, customName) {
    const paramsToPass = {
        esprima: {
            range: true,
            loc: true,
            tolerant: true,
            comment: true
        },

        escodegen: {
            format: {
                indent: {
                    style: '  ',
                    base: 0,
                    adjustMultilineComment: true
                },
                newline: '\n',
                space: ' ',
                quotes: 'auto',
                parentheses: true,
                semicolons: false,
                safeConcatenation: true
            },
            sourceMap: true,
            sourceMapWithCode: true,
            comment: false
        },
        instance: customName
    }
    let output = p5Convert(sourceCode, paramsToPass);
    return Function(customName, output);
}