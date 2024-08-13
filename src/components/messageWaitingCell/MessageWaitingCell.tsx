import './MessageWaitingCell.scss';
import ProfileIcon from '../profileIcon/ProfileIcon';

interface Props {
    isOn: Boolean
    icon?: string
}

const MessageWaitingCell: React.FC<Props> = ({ isOn, icon }) => {
    return(
        <>
            {isOn &&
                <div className='message-waiting-cell'>
                    <ProfileIcon imageUrl={icon || ''} />
                    <div className='waiting-cell-message'>
                        <div className='waiting-cell-dot dot-1'/>
                        <div className='waiting-cell-dot dot-2'/>
                        <div className='waiting-cell-dot dot-3'/>
                    </div>
                </div>
            }
        </>
    );
};

export default MessageWaitingCell;