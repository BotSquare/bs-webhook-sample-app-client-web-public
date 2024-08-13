import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import SampleAppService from '../../services/SampleApp';
import './Login.scss';

const { SAMPLE_APP_SERVICE_URL } = config;

// SAMPLE_APP_SERVICE_URL + /hook/ + sessionId

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [api, setAPI] = useState('');
    const [token, setToken] = useState('');
    const [sessionID, setSessionID] = useState('');

    const startChat = async () => {
        if (api === '' || token === '') { return; }

        await SampleAppService.startSession(api, token);

        setAPI('');
        setToken('');

        navigate(`/chat/${sessionID}`);
    };

    const handleAPIChange = (event: { target: { value: any; }; }) => {
        setAPI(event.target.value);
    };

    const handleTokenChange = (event: { target: { value: any; }; }) => {
        setToken(event.target.value);
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const copyString = async () => {
        const api = SAMPLE_APP_SERVICE_URL + '/hook/' + sessionID;
        navigator.clipboard.writeText(api);
        setCopied(true);
        await delay(3000);
        setCopied(false);
    };

    const initialize = async () => {
        const sessionID = await SampleAppService.createSession();
        setSessionID(sessionID);
    };

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        console.log('check session id', sessionID);
    }, [sessionID, setSessionID]);

    return (
        <div className='login-main'>
            <div className='login-main-content-wrapper'>
                <div className='login-title'>
                    BotSquare Playground
                </div>
                <div className='login-container'>

                    <div className='login-steps'>
                        <h1>Quick start guide</h1>

                        <strong>Step 1: Workflow Setup</strong>
                        <ul>
                            <li>Open <a href='https://developer.botsquare.ai' target='_blank' rel='noreferrer'>BotSquare Dev Portal</a>, design your workflow, and publish</li>
                        </ul>
                        <strong>Step 2: Enable Webhooks</strong>
                        <ul>
                            <li>Navigate to your workflow's deployment page</li>
                            <li>Paste the provided "Webhook URL" into its field and click "Enable Webhooks"</li>
                        </ul>
                        <strong>Step 3: API Integration</strong>
                        <ul>
                            <li>Copy the "API URL" and "Bearer Token" into their respective fields below</li>
                        </ul>
                        <strong>Step 4: Test the App</strong>
                        <ul>
                            <li>Click the "Chat now" button to start using the playground</li>
                        </ul>
                    </div>

                    <div className='login-webhook-url-container'>
                        <h1>Webhook URL</h1>
                        <div className='url-container'>
                            <h2>{SAMPLE_APP_SERVICE_URL + '/hook/' + sessionID}</h2>
                            {copied ?
                                <h3>Copied!</h3> :
                                <button onClick={copyString}>
                                    <i className='bi bi-copy' />
                                </button>
                            }
                        </div>
                    </div>

                    <div className='login-input-container'>
                        <h1>API URL</h1>
                        <input
                            value={api}
                            placeholder='Paste API URL here...'
                            onChange={handleAPIChange}
                        />
                        <h1>Bearer token</h1>
                        <input
                            value={token}
                            placeholder='Paste bearer token here...'
                            onChange={handleTokenChange}
                        />
                        <div className='login-button-container'>
                            <button onClick={startChat}>Chat now</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className='tutorial-container'>
                <h1>Watch video tutorial</h1>
                <iframe width='550' height='330' src={`https://www.youtube.com/embed/Ln0kZRwFBps`} title='YouTube video player' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;' />
            </div> */}
        </div>
    );
};

export default Login;
