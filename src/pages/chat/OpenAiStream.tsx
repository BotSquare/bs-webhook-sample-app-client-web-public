import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShareSheet from '../../components/dialog/shareSheet/ShareSheet';
import DisconnectAlert from '../../components/disconnectAlert/DisconnectAlert';
import MessageCell, { MessageType, StreamMessage } from '../../components/messageCell/MessageCell';
import MessageWaitingCell from '../../components/messageWaitingCell/MessageWaitingCell';
import Toggle from '../../components/toggle/Toggle';
import SampleAppService, { BotInfo, SaWsMessage } from '../../services/SampleApp';
import './OpenAiStream.scss';

const OpenAiStream: React.FC = () => {
    const navigate = useNavigate();
    const { session_id } = useParams();
    const [isOn, setIsOn] = useState(false);
    const [botInfo, setBotInfo] = useState<BotInfo>();
    const [showWaiting, setShowWaiting] = useState(false);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    const [disconnectCheck, setDisconnectCheck] = useState(false);
    const [disconnectMessage, setDisconnectMessage] = useState('');
    const [messageList, setMessageList] = useState<StreamMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [textAreaHeight, setTextAreaHeight] = useState(44);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const iphoneCheck = navigator.userAgent.includes('iPhone') || navigator.platform === 'iPhone';

    // Starts initializing connection to websocket on startup
    useEffect(() => {
        initiateConnection();
    }, []);
    
    // Dynamically controlling the height of the textfield with number of input lines
    useEffect(() => {
        const count = userInput.split(/\r\n|\r|\n/).length - 1;
        setTextAreaHeight(44 + (count * 24));
    }, [userInput, setUserInput]);

    const initiateConnection = async () => {
        if (!session_id) throw new Error('Error: no session found');
        
        try {
            await SampleAppService.fetchSession(session_id);
            await SampleAppService.initiateConnection(
                session_id!, onMessage, 
                onConnected,
                onDisconnected, 
                (error) => console.log('WS on error', error)
            );          
            const data = await SampleAppService.fetchInfo(session_id);     
            setBotInfo(data.payload.bot);
        } catch {
            if (!navigator.onLine) {
                setDisconnectMessage('It looks like you are not connected to the internet, please try again later.');
            } else {
                setDisconnectMessage('There is a connection issue occurred, please try to reconnect');
            }
            setDisconnected(true);
        }
    };

    const onConnected = () => {
        console.log('WS on open');
        setDisconnected(false);
        setDisconnectCheck(false);
    };

    const onDisconnected = () => {
        console.log('WS on close');
        if (disconnectCheck) {
            setDisconnectMessage('There is a connection issue occurred, please try to reconnect');
            setDisconnected(true);
        } else {
            setDisconnectCheck(true);
            initiateConnection();
        }
    };

    const onMessage = (msg: SaWsMessage) => {
        console.log('on message', msg);
        if (msg.contentType == 'image') {
            postImageMessage(msg);
        } else if (msg.content !== undefined) {
            postStaticMessage(msg);
        } else if (msg.delta !== undefined) {
            updateStreamMessage(msg);
        } else {
            console.log('Error No Message');
        }
    };

    const postImageMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            const part = { type: MessageType.ImageType, content: msg.content! };
            let updatedItems = prevItems;
            updatedItems.push({ id: msg.id, index: prevItems.length, user: false, message: { parts: [part] }});
            return [...prevItems];
        });

        setShowWaiting(false);
    };

    const postStaticMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            const index = prevItems.length;
            const part = { type: MessageType.StringType, content: msg.content! };
            const parts = (msg.content ?? '').split('```').map((part, index) => {
                if (index % 2 === 0) {
                    return { type: MessageType.StringType, content: part };
                } else {
                    const language = part.slice(0, part.indexOf('\n')).toLowerCase();
                    const checked = checkLanguage(language);
                    const languageList = 'swift|kotlin|python|javascript|typescript|c++|cpp|c|csharp|c#|js|ts|ruby|go|golang|bash|xml|json'.split('|');
                    
                    if (languageList.includes(language)) {
                        part = part.slice(part.indexOf('\n') + 1);
                    }

                    return { type: MessageType.CodeType, title: checked?.language, content: part };
                }
            });
            const message = { parts: parts };

            // console.log('static message', message);

            let updatedItems = prevItems;
            updatedItems.push({ id: msg.id + '-static', index: index, user: false, message: message });
            return [...prevItems];
        });

        setShowWaiting(false);
    };

    const updateStreamMessage = (msg: SaWsMessage) => {
        setMessageList(prevItems => {
            let index = prevItems.findIndex((message) => message.id === msg.id );
            index = index === -1 ? prevItems.length : index;

            let parts = index < prevItems.length ? prevItems[index].message.parts : [{ type: MessageType.StringType, content: '' }];
            
            let message = parts[parts.length - 1];

            const codeBlockStart = message.content.includes('```') && message.type !== MessageType.CodeType;
            const codeBlockEnd = message.content.includes('```') && message.type === MessageType.CodeType;

            if (codeBlockStart) {
                message.content = message.content.replace('```', '');
                parts[parts.length - 1] = message;
 
                parts.push({ type: MessageType.CodeType, content: msg.delta ?? '' });
            } else if (codeBlockEnd) {
                let update = message.content;
                message.content = update.replace('```', '');

                while (message.content.endsWith(`\n`) || message.content.endsWith(' ')) {
                    message.content = message.content.slice(0,-1);
                }

                parts[parts.length - 1] = message;

                while (parts[parts.length - 1].content === '' || parts[parts.length - 1].content === '↵') {
                    parts = parts.slice(0,-1);
                }

                parts.push({ type: MessageType.StringType, content: msg.delta ?? '' });
            } else {
                // console.log('current message', message);

                if (message.type === MessageType.CodeType && message.title === undefined && message.content.endsWith(`\n`)) {
                    // console.log('testing here', msg.delta);
                    // console.log('testing title', message.content.split(`\n`)[0]);
                    const potentialTitle = checkLanguage(message.content.split(`\n`)[0]);

                    if (potentialTitle !== null) { 
                        const title = potentialTitle.language;
                        message.title = title; 
                        
                        if (message.content.startsWith(title)) {
                            message.content = message.content.slice(title.length);
                        }
                    }

                    message.content = message.content + msg.delta ?? '';
                } else {
                    const delta = msg.delta === '↵↵' ? '' : msg.delta;
                    const update = message.content + delta;
                    message.content = update.trimStart();

                    parts[parts.length - 1] = message;
                }
            }

            prevItems[index] = { id: msg.id, index: index, user: false, message: { parts: parts } };
            
            return [...prevItems];
        });

        setShowWaiting(false);

        console.log('message list', messageList);
    };

    const checkLanguage = (text?: string) => {
        // console.log('checking language', text);

        switch (text) {
            case 'swift':
                return { language: 'swift', text: '' };
            case 'func':
                return { language: 'swift', text: text };
            case 'kotlin':
                return { language: 'kotlin', text: '' };
            case 'fun':
                return { language: 'kotlin', text: text };
            case 'python':
                return { language: 'python', text: '' };
            case 'def':
                return { language: 'python', text: text };
            case 'typescript':
                return { language: 'typescript', text: '' };
            case 'javascript':
                return { language: 'javascript', text: '' };
            case 'js':
                return { language: 'javascript', text: '' };
            case 'cpp':
                return { language: 'c++', text: '' };
            case 'c': 
                return { language: 'c', text: '' };
            case 'csharp': 
                return { language: 'c#', text: '' };
            case 'ruby': 
                return { language: 'ruby', text: '' };
            case 'go': 
                return { language: 'go', text: '' };
            case 'golang': 
                return { language: 'golang', text: '' };
            case 'bash': 
                return { language: 'bash', text: '' };
            case '#include':
                return { language: 'c++', text: text };
            case 'java':
                return { language: 'java', text: '' };
            case 'import':
                return { language: 'java', text: text };
            case 'xml':
                return { language: 'xml', text: '' };
            case '<':
                return { language: 'xml', text: text };
            case 'json':
                return { language: 'json', text: '' };
            default:
                return null;
        }   
    };

    const sendMessage = async () => {
        const response = await SampleAppService.sendMessage(userInput);
        // console.log('message sent', response);
    };

    const navigateToLogin = () => {
        navigate('/');
    };

    const addMessage = () => {
        if (userInput === '') { return; }
        const input = userInput;
        setUserInput('');

        addUserMessage(input);
        sendMessage();
        setShowWaiting(true);
    };

    const addUserMessage = (input: string) => {
        // const test = { id: 'user', index: 0, user: true, message: [{ type: MessageType.StringType, content: input }] };
        const message = { parts: [{ type: MessageType.StringType, content: input }]};
        setMessageList(prevItems => [...prevItems, { id: 'user', index: prevItems.length, user: true, message: message }]);
    };

    const handleChange = (event: { target: { value: any; }; }) => {
        setUserInput(event.target.value);
    };

    const scrollToItem = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'auto'});
    };

    useEffect(() => {
        scrollToItem();
    }, [messageList, setMessageList]);

    return (
        <div className={`stream-main ${iphoneCheck ? 'iPhone' : ''}`}>
            <div className='stream-container'>
                <div>
                    <button className='stream-back-button' onClick={navigateToLogin} >
                        Back
                    </button>
                </div>
                <div className='stream-title'>
                    <h1>{botInfo?.name ?? 'Playground'}</h1>
                    <div className='stream-mode-switch'>
                        {/* <i className='bi bi-question-circle' />
                        <h2>Async Query</h2>
                        <h3 className='hide'>With this mode enabled, you can ask the AI ​​bot unlimited questions without being blocked ask other questions while our AI app is answering your question.</h3>
                        <Toggle isOn={isOn} setIsOn={setIsOn} /> */}
                    </div>
                    <button className='stream-share-button' onClick={() => setShowShareSheet(true)}>
                        Share
                    </button>
                </div>
                <div className='stream-chat-window'>
                    { 
                        messageList.map(stream => 
                            <MessageCell stream={stream} icon={botInfo?.icon}/>
                        )
                    }
                    <MessageWaitingCell isOn={showWaiting} icon={botInfo?.icon} />
                    <div ref={messagesEndRef} />
                </div>
                <div className='stream-input-bar'>
                    {disconnected &&
                        <DisconnectAlert message={disconnectMessage} action={initiateConnection} />                 
                    }
                    <div className={`stream-input-container ${disconnected ? 'disconnected' : 'connected'}`}>
                        <textarea 
                            style={{height: textAreaHeight}}
                            value={userInput} 
                            rows={1}
                            placeholder='Ask anything!' 
                            onChange={handleChange} 
                            disabled={disconnected}
                            onKeyDown={(e) => {
                                if (e.shiftKey && e.key === 'Enter') {
                                    console.log('test', userInput);
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addMessage();
                                }
                            }}
                        />
                        <button onClick={ addMessage } disabled={disconnected}>Send</button>
                    </div>
                </div>
            </div>
            <ShareSheet show={showShareSheet} onClose={() => setShowShareSheet(false)}/>
        </div>
    );
};

export default OpenAiStream;
