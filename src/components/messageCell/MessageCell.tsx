import { useEffect, useState } from 'react';
import { addJsonStyle, addLanguageStyle, addXmlStyle, Language } from '../../models/MessageCellViewModel';
import ProfileIcon from '../profileIcon/ProfileIcon';
import './MessageCell.scss';

export type StreamMessage = {
    id: string
    index: number
    user: boolean
    message: MarkDownMessage
};

export type MarkDownMessage = {
    parts: MessagePart[]
};

export type MessagePart = {
    type: MessageType
    title?: string
    content: string
};

export enum MessageType {
    StringType, CodeType, ImageType
};

interface Props {
    stream: StreamMessage
    icon?: string
}

const MessageCell: React.FC<Props> = ({ stream, icon }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {       
        let items = document.querySelectorAll(`[id='${stream.id}']`);
        let message = stream.message.parts.filter(part => part.type === MessageType.CodeType);
        
        if (items.length > 0) {
            items.forEach((item, index) => {
                var str = message[index]?.content ?? '';
                const language: Language = checkLanguage(message[index]?.title ?? '');

                // console.log('before str', str);

                if (language === Language.xml) {
                    str = addXmlStyle(str);
                } else if (language === Language.json) {
                    str = addJsonStyle(str);
                } else {
                    str = addLanguageStyle(str, language);
                }
                
                console.log('language', language, message[index]?.title ?? '');
                // console.log('after', str);

                item.innerHTML = str;
            });
        }
    }, [stream]);

    const checkLanguage = (text?: string) => {
        switch (text) {
            case 'swift':
                return Language.swift;
            case 'kotlin': 
                return Language.kotlin;
            case 'python':
                return Language.python;
            case 'c++':
                return Language.cpp;
            case 'c':
                return Language.c;
            case 'javascript':
                return Language.javascript;
            case 'typescript':
                return Language.typescript;
            case 'xml':
                return Language.xml;
            case 'json':
                return Language.json;
            default:
                return Language.other;
        }
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const copyString = async (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        await delay(3000);
        setCopied(false);
    };

    return(
        <div className={`message-cell ${stream.user ? 'user-cell' : 'gpt-cell'}`}>
            {!stream.user && 
                <ProfileIcon imageUrl={icon || ''} />
            }
            <div className='cell-message-container'>
                <div className={`cell-message ${stream.user ? 'user' : 'gpt'}`}>
                    {   
                        stream.message.parts.map(part => 
                            <>
                                { part.type === MessageType.ImageType && 
                                    <div className='cell-message-image' >
                                        <img src={part.content} />
                                    </div>
                                }

                                { part.type === MessageType.StringType &&
                                    part.content
                                }

                                { part.type === MessageType.CodeType &&
                                    <pre>
                                        <div className='code-block-bar'>
                                            <h1>{part.title ?? ''}</h1>
                                            {copied ? 
                                                <h2>Copied!</h2> :
                                                <button onClick={() => copyString(part.content)}>copy</button>
                                            }
                                        </div>
                                        <code id={`${stream.id}`}>                                            
                                            {part.content}
                                        </code>
                                    </pre>
                                }
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default MessageCell;
