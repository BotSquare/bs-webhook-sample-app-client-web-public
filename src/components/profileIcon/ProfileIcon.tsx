import React from 'react';

interface ProfileIconProps {
    imageUrl: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = React.memo(({ imageUrl }) => {
    return <img src={imageUrl} alt='profile icon' />;
});

export default ProfileIcon;