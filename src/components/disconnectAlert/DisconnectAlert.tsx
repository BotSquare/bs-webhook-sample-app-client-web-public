import React from 'react';
import './DisconnectAlert.scss';

interface Props {
    message: string
    action: () => void
}

const DisconnectAlert: React.FC<Props> = ({ message, action }) => {
    return(
        <div className='disconnect-alert-container'>
            <h1>
                <i className='bi bi-exclamation-triangle' />
                &nbsp;&nbsp;{message}
            </h1>
            <button onClick={ action }>Reconnect</button>
        </div>
    );
};

export default DisconnectAlert;