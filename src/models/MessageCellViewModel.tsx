
export enum Language {
    swift = 'swift', 
    kotlin = 'kotlin', 
    python = 'python', 
    cpp = 'c++',
    c = 'c',
    javascript = 'javascript', 
    typescript = 'typescript', 
    csharp = 'c#',
    golang = 'golang',
    go = 'go',
    ruby = 'ruby',
    bash = 'bash',
    xml = 'xml', 
    json = 'json', 
    other = 'other'
}

export const addXmlStyle = (text: string) => {
    const versionColor = '#7AADE4';
    const tagColor = '#CD7380';
    const keyColor = '#BD9E7A';
    const valueColor = '#A0B683';
    const commentColor = '#7A7A7A';

    const versionTags = new Set<string>();
    const startTags = new Set<string>();
    const endTags = new Set<string>();
    const commentTags = new Set<string>();

    let str = text;

    while (true) {
        const start = text.indexOf('<');
        const end = text.indexOf('>');

        if (start === -1 || end === -1) { break; }
        
        const tag = text.slice(start, end + 1);

        if (text[start + 1] === '/') {
            endTags.add(tag);
        } else if (text[start + 1] === '?') {
            versionTags.add(tag);
        } else if (text[start + 1] === '!') {
            commentTags.add(tag);
        } else {
            startTags.add(tag);
        } 

        text = text.slice(end + 1); 
    }

    versionTags.forEach(tag => {
        const comment = tag.slice(1, -1);
        str = str.replaceAll(tag, `<span style="color:${versionColor};"><</span>` + `<span style="color:${versionColor};">${comment}</span>` + `<span style="color:${versionColor};">></span>`);
    });

    startTags.forEach(tag => {
        const content = tag.slice(1,-1).split(' ');
        const name = content[0];
        let id = '';

        if (content.length > 1) {
            const variable = content[1].split('=');
            id = ' '+ `<span style="color:${keyColor};">${variable[0]}</span><span style="color:white;">=</span><span style="color:${valueColor};">${variable[1]}</span>`;
        }

        str = str.replaceAll(tag, `<<span style="color:${tagColor};">${name + id}</span>>`);
    });

    endTags.forEach(tag => {
        const name = tag.slice(2,-1);
        str = str.replaceAll(tag, `<<span style="color:white;">/</span><span style="color:${tagColor};">${name}</span>>`);
    });

    commentTags.forEach(tag => {
        const name = tag.slice(1,-1);
        str = str.replaceAll(tag, `<span style="color:${commentColor};"><</span><span style="color:${commentColor};">${name}</span><span style="color:${commentColor};">></span>`);
    });

    return str;
};

    // list league members in a json code block

export const addJsonStyle = (text: string) => {
    const keyColor = '#C4996B';
    const valueColor = '#A1C280';

    const keys = new Set<string>();
    const values = new Set<string>();

    let str = text;

    text = text.replace(/{|}|\[|\]|/g, '');

    let entries = text.split('\n');
    entries = entries.map(entry => entry.trim());
    entries = entries.filter(entry => (entry !== '' && entry !== ','));

    entries.forEach(entry => {
        const pair = entry.split(':');

        keys.add(pair[0]);

        if (pair.length > 1 && pair[1] !== '') {
            const value = pair[1];

            if (value.endsWith(',')) {
                values.add(value.slice(0, -1));
            } else {
                values.add(value);
            }
        }
    });

    keys.forEach(key => {
        str = str.replaceAll(key, `<span style="color:${keyColor};">${key}</span>`);
    });

    values.forEach(value => {
        str = str.replaceAll(value, `<span style="color:${valueColor};">${value}</span>`);
    });

    return str;
};

export const addLanguageStyle = (text: string, language: Language) => {
    const exceptions = 'ruby|go|golang|csharp|bash'.split('|');
    if (language === Language.other || exceptions.includes(language)) { return text; }

    text = checkForExceptions(text);
    text = checkForFunctionName(text, language);
    text = checkForKeywords(text, language);
    text = checkForVariableClass(text, language);
    text = checkForPrint(text, language);
    text = checkForString(text, language);
    text = checkForComment(text, language);

    if (language === Language.cpp || language === Language.c) {
        text = checkForImport(text, language);
    }
    
    return text;
};

const applyColor = (text: string, keywords: string[], color: string) => {
    let str = text;

    keywords.forEach(word => {
        str = str.replace(new RegExp('\\b'+word+'\\b','g'), `<span style='color:${color};'>${word}</span>`);
    });

    return str;
};

const applyColorAll = (text: string, keywords: string[], color: string) => {
    let str = text;

    keywords.forEach(word => {
        str = str.replaceAll(word, `<span style='color:${color};'>${word}</span>`);
    });

    return str;
};

const applyStringColor = (text: string, quotes: string[], strings: string[], color: string) => {
    quotes.forEach((quote, index) => { 
        text = text.replaceAll(quote, `<span style='color:${color};'>${strings[index]}</span>`);
    });

    return text;
};

const checkForExceptions = (text: string) => {
    return text.replaceAll('..<', '<span>..</span><span><</span>');
};

const checkForKeywords = (text: string, language: Language) => {
    const colors: { [Name: string]: string } = { 
        'swift': '#EE82B1',
        'kotlin': '#C07C41',
        'python': '#C28F71',
        'c++': '#B08469',
        'c': '#B08469',
        'other': 'white'
    };

    const keywords: { [Name: string]: string[] } = { 
        'swift': 'associatedtype|class|deinit|enum|extension|fileprivate|func|import|init|inout|internal|let|open|operator|private|precedencegroup|protocol|public|rethrows|static|struct|subscript|typealias|var|break|case|catch|continue|default|defer|do|else|fallthrough|for|guard|if|in|repeat|return|throw|switch|where|while|Any|as|async|await|catch|false|is|nil|self|Self|super|throw|throws|true|try|associativity|convenience|didSet|dynamic|final|get|indirect|infix|lazy|left|mutating|none|nonmutating|optional|override|postfix|precedence|prefix|Protocol|required|right|set|some|Type|unowned|weak|willSet|@escaping'.split('|'),
        'kotlin': 'fun|object|class|for|if|else|while|when|return|class|enum|interface|var|val|const|in|!in|true|false|is|!is|do|try|throw|super|null|continue|break|this|typealias|typeof|as|as?|package|abstract|actual|annotation|companion|crossinline|data|expect|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|public|protected|public|reified|sealed|suspend|tailrec|vararg|,'.split('|'),
        'python': 'and|as|assert|break|class|continue|def|del|elif|else|endif|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield'.split('|'),
        'c++': 'class|struct|using|typename|for|if|else|return|override|explicit|,|;|auto|unsigned|char|int|double|string|bool|void|true|false|delete|nullptr|new|template|private|public|protected'.split('|'),
        'c': 'class|struct|using|typename|for|if|else|return|override|explicit|,|;|auto|unsigned|char|int|double|string|bool|void|true|false|delete|nullptr|new|template|private|public|protected'.split('|'),
        'other': 'function|func|fun|for|if|else|elif|while|switch|case|return|class|struct|enum|protocol|interface|type|static|let|var|val|const|guard|finally|module|in|true|True|false|False|is|not|do|try|catch|throw|def|console|any|super|public|private|protected|nil|null|new|continue|break|this|self|get|set|put|post|typeof|export|void|async|await'.split('|')
    };
    
    switch (language) {
        case Language.typescript:
        case Language.javascript:
            const jsWordList1 = 'import|export|class|function|this|new|let|var|await|=>'.split('|');
            const jsWordList2 = 'const|async|enum|interface|for|if|else|while|switch|case|return|break|default|type|debugger|typeof|from'.split('|');
            const jsWordList3 = 'console'.split('|');
            const jsKeywordColor1 = '#569BD5';
            const jsKeywordColor2 = '#FFADFA';
            const jsKeywordColor3 = '#9CDCFE';

            let firstChange = applyColor(text, jsWordList1, jsKeywordColor1);
            let secondChange = applyColor(firstChange, jsWordList2, jsKeywordColor2);
            return applyColor(secondChange, jsWordList3, jsKeywordColor3);
        case Language.c:
        case Language.cpp:
            text = text.replaceAll('<std::', `<span style='color:white;'><</span><span style='color:white;'>std</span></span><span style='color:white;'>::</span>`);
            return applyColor(text, keywords[language], colors[language]);
        default:
            // console.log('language', language, keywords[language]);
            return applyColor(text, keywords[language], colors[language]);
    }
};

const checkForVariableClass = (text: string, language: Language) => {
    const colors: { [Name: string]: string } = { 
        'swift': '#D5BBFA',
        'kotlin': '',
        'python': '#8888C2',
        'c++': '#D5BBFA',
        'c': '#D5BBFA',
        'javascript': '#60FFDF',
        'typescript': '#60FFDF',
        'other': 'white'
    };

    const types: { [Name: string]: string[] } = { 
        'swift': 'Int|String|Double|Float|Bool|Boolean|Void|Dictionary|Set|Optional|Result|Error|Task|Data|Date|URLSession'.split('|'),
        'kotlin': [],
        'python': 'str|int|object|print'.split('|'),
        'c++': 'node|Base|Derived'.split('|'),
        'c': 'node|Base|Derived'.split('|'),
        'javascript': 'string|number|Set|boolean|Boolean|Map|RegExp'.split('|'),
        'typescript': 'string|number|Set|boolean|Boolean|Map|RegExp'.split('|'),
        'other': []
    };
    
    return applyColor(text, types[language], colors[language]);
};

const checkForFunctionName = (text: string, language: Language) => {
    const functionName = findFunction(text, language);

    // console.log('function names', functionName);

    const colors: { [Name: string]: string } = { 
        'swift': '#69AEC7',
        'kotlin': '#F6C77B',
        'python': '#68A1E7',
        'javascript': '#FDFFC5',
        'typescript': '#FDFFC5',
        'c++': '#7EA1DC',
        'c': '#7EA1DC',
        'other': 'white'
    };
            
    return applyColorAll(text, functionName, colors[language]);
};

const findFunction = (text: string, language: Language) => {
    let functionKeyword = '';

    switch (language) {
        case Language.swift:
            functionKeyword = 'func ';
            break;
        case Language.kotlin:
            functionKeyword = 'fun ';
            break;
        case Language.python:
            functionKeyword = 'def ';
            break;
        case Language.javascript:
        case Language.typescript:
            let jsFunctions = text
                .split(`\n`)
                .map(item => item.trimStart())
                .filter(item => item.includes('('))
                .map(item => {
                    const index = item.indexOf('(');
                    const name = item.slice(0, index);
                    return name;
                })
                .filter(item => !item.includes('.'))
                .filter(item => (item.split(' ').length === 1 || item.includes(' ')))
                .filter(item => (item !== 'for ' && item !== 'if ' && item !== 'else ' && item !== 'while '))
                .map(item => {
                    if (item.split(' ').length === 1) {
                        return item;
                    } else {
                        return item.split(' ')[1];
                    }
                })
                .filter(item => (item !== '' && item !== 'else' && item !== '='));
            
            // console.log('js functions', text);
            return jsFunctions;
        case Language.cpp:
            let fragments = text
                .split(`\n`)
                .filter(item => (item.trimStart().startsWith('int') || item.trimStart().startsWith('double') || item.trimStart().startsWith('string') || item.trimStart().startsWith('bool') || item.trimStart().startsWith('void')) && item.includes('('))
                .map(item => {
                    const name = item.trimStart().split(' ')[1];
                    const endIndex = name.indexOf('(');
                    return name.slice(0, endIndex);
                });

            return fragments;
        default:
            return ['none exist'];
    };

    let functions = text
        .split(`\n`)
        .filter(item => item.includes(functionKeyword))
        .map(item => {
            const index = item.indexOf(functionKeyword);
            const endIndex = item.indexOf('(');
            return item.slice(index, endIndex).split(' ')[1];
        });
    
    return functions;
};

const checkForImport = (text: string, language: Language) => {
    switch (language) {
        case Language.c:
        case Language.cpp:
            const imports = text.split(`\n`).filter(item => item.startsWith('#include'));
            const includeColor = '#A8A669';

            imports.forEach(item => {
                const packageColor = '#719A70';
                const name = item.slice(9);
                let updated = name;

                if (name.includes('<span style=')) {
                    updated = name.replace(`<span style='color:#B08469;'>`,'').replace('</span>','');
                }

                // console.log('part 1', name);
                text = text.replace(name, `<span style='color:${packageColor};'><</span><span style='color:${packageColor};'>${updated.slice(1,-1)}</span><span style='color:${packageColor};'>></span>`);
            });
            return text.replaceAll('#include', `<span style='color:${includeColor};'>#include</span>`);
        default:
            return text;
    }
};

const checkForPrint = (text: string, language: Language) => {
    const colors: { [Name: string]: string } = { 
        'swift': '#AB83E5',
        'kotlin': '',
        'python': '#8585C1',
        'c++': '',
        'c': '',
        'javascript': '#FDFFC5',
        'typescript': '#FDFFC5',
        'other': '#AB83E5'
    };

    const prints: {[Name: string]: string[] } = {
        'swift': 'print|fatalError'.split('|'),
        'kotlin': [],
        'python': 'print|RuntimeError'.split('|'),
        'c++': [],
        'c': [],
        'javascript': 'print|log'.split('|'),
        'typescript': 'print|log'.split('|'),
        'other': 'print|println|fatalError|log'.split('|')
    };

    return applyColor(text, prints[language], colors[language]);
};

const checkForString = (text: string, language: Language) => {
    let index = 0;        
    let start = -1;
    let sentences = new Set<string>();
    
    if (language === Language.javascript || language === Language.typescript) {
        while (index < text.length) {
            if (text[index] === '`') {
                if (start === -1) {
                    start = index;
                } else {
                    const sentence = text.slice(start, index + 1);

                    sentences.add(sentence);
                    start = -1;
                }
            }
            index += 1;
        }
        
        index = 0;

        while (index < text.length) {
            if (text[index] === '\'' && text[index - 1] !== '=' && text[index - 1] !== ';') {
                if (start === -1) {
                    start = index;
                } else {
                    const sentence = text.slice(start, index + 1);

                    sentences.add(sentence);
                    start = -1;
                }
            }
            index += 1;
        }

        index = 0;
    } 

    while (index < text.length) {
        if (text[index] === '"') {
            if (start === -1) {
                start = index;
            } else {
                const sentence = text.slice(start, index + 1);

                sentences.add(sentence);
                start = -1;
            }
        }
        index += 1;
    }
    

    // console.log('sentences', Array.from(sentences));

    let quotes = Array.from(sentences);
    let strings = Array.from(sentences).map(sentence => {
        if (sentence.includes('<span style=')) {
            // console.log('b sentence', sentence);
            sentence = removeColor(sentence);
            // console.log('a sentence', sentence);
        }

        if (language === Language.kotlin) {
            const interpolations = sentence.split(' ').filter(item => item.startsWith('$'));
            interpolations.forEach(interpolation => {
                if (interpolation.endsWith('"')) { interpolation = interpolation.slice(0, -1); }
                sentence = sentence.replaceAll(interpolation, `<span style='color:#C07C41;'>$</span><span style='color:white;'>${interpolation.slice(1)}</span>`);
            });
        } else if (language === Language.python) {
            sentence = findInterpolations(sentence, '{', '}', 'white', '#C28F71');
        } else {
            sentence = findInterpolations(sentence, '\\(', ')', 'white', 'white');
            sentence = findInterpolations(sentence, '${', '}', '#569BD5', '#569BD5');
        }

        return sentence;
    });
    
    const colors: { [Name: string]: string } = { 
        'swift': '#EF8875',
        'kotlin': '#70865E',
        'python': '#67A871',
        'c++': '#699269',
        'c': '#699269',
        'javascript': '#CE9178',
        'typescript': '#CE9178',
        'other': 'white'
    };

    // console.log('sentences', strings);

    return applyStringColor(text, quotes, strings, colors[language]);
};

const findInterpolations = (text: string, startTag: string, endTag: string, color: string, outerColor: string) => {
    let interpolations = new Set<string>();
    let sentence = text;

    while (sentence.includes(startTag)) {
        const start = sentence.indexOf(startTag);
        const end = sentence.indexOf(endTag) + 1;
        const interpolation = sentence.slice(start, end);
        
        interpolations.add(interpolation);
        sentence = sentence.replaceAll(interpolation, '');
    }

    interpolations.forEach(interpolation => {
        text = text.replaceAll(interpolation, `<span style='color:${outerColor};'>${startTag}</span><span style='color:${color};'>${interpolation.slice(startTag.length, -1)}</span><span style='color:${outerColor};'>${endTag}</span>`);
    });

    return text;
};

const removeColor = (text: string) => {
    const startTag = '<span style=';

    while (text.includes(startTag)) {
        const index = text.indexOf(startTag);
        const temp = text.slice(index);
        const tag = temp.slice(0, temp.indexOf('>') + 1);
        text = text.replace(tag, '');
    }

    text = text.replaceAll('</span>', '');
    return text;
};

const checkForComment = (text: string, language: Language) => {
    const colors: { [Name: string]: string } = { 
        'swift': '#818C97',
        'kotlin': '#808080',
        'python': '#5F6063',
        'c++': '#73737A',
        'c': '#73737A',
        'javascript': '#699955',
        'typescript': '#699955',
        'other': '#AB83E5'
    };

    const keyWord = language === Language.python ? '# ' : '//';

    let taggedComments = text
        .split(`\n`)
        .filter(item => item.includes(keyWord))
        .map(item => {
            const index = item.indexOf(keyWord);
            return item.slice(index);
        });
        
    let comments = taggedComments.map(item => {
        while (item.includes('<span style=')) {
            let str = item;
            const tagIndex = str.indexOf('<span style=');
            const startTag = str.slice(tagIndex, tagIndex + 29);
            item = str.replace(startTag, '');
            console.log('has tag', item);
        }

        return item.replaceAll('</span>', '');
    });

    // console.log('tagged comments', taggedComments);

    // console.log('comments', comments);

    taggedComments.forEach((comment, index) => {
        text = text.replace(comment, `<span style='color:${colors[language]};'>${comments[index]}</span>`);
    });

    return text;
};
