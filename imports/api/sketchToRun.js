const p5Convert = require('p5-global2instance')

export default function sketchToRun(sourceCode, customName) {
    const paramsToPass = {      //This is the 2nd parameter to pass to p5Convert which
                                //includes the custom name of the sketch 
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
    
    let output = p5Convert(sourceCode, paramsToPass); //output contains the instance code with custom name
    return Function(customName, output);    //Return an instance mode p5 function
}