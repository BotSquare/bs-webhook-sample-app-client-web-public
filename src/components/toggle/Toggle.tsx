import './Toggle.scss';

interface Props {
    isOn: boolean
    setIsOn: (isOn: boolean) => void
}

const Toggle: React.FC<Props> = ({ isOn, setIsOn }) => {
    return(
        <div className={`toggle ${isOn ? 'on' : 'on'}`} onClick={() => setIsOn(isOn)}>
            <div className={`toggle-circle ${isOn ? 'on' : 'off'}`}/>
        </div>
    );
};

export default Toggle;