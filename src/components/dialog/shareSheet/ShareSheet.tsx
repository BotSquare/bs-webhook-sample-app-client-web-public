import { useEffect, useState } from 'react';
import './ShareSheet.scss';

interface Props {
    show: boolean;
    onClose?: () => void;
}

const ShareSheet: React.FC<Props> = ({ show, onClose }) => {
    const [url, setURL] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setURL(window.location.href);
    }, []);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const handleCopy = async () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        await delay(5000);
        setCopied(false);
    };

    const handleFocus = () => {
        document.getElementById('prevent-tab')?.focus();
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <>
            {show &&
                <div className='share-sheet-container' >
                    <div className='share-sheet-backdrop' onClick={handleClose} />
                    <div className='share-sheet-main'>
                        <div className='share-sheet-title'>
                            <h1>Share URL</h1>
                            <i className='bi bi-x' onClick={handleClose}  tabIndex={0} id={'prevent-tab'}></i>
                        </div>
                        <div className='share-sheet-body'>
                            <h2>Please copy the link and share:</h2>
                            <input type='normal' value={url} disabled />
                        </div>      
                        <div className='share-sheet-divider' />                      
                        <div className='share-sheet-button'>
                            {copied ?
                                <button className='after'>
                                    Link copied!
                                </button> :
                                <button className='before' onClick={handleCopy}>
                                    <i className='bi bi-link' />
                                    &nbsp;Copy link
                                </button>
                            }
                        </div>
                        <span tabIndex={0} onFocus={handleFocus} />
                    </div>
                </div>
            }
        </>
    );
};

export default ShareSheet;
