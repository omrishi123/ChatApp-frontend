import React from 'react';

const ChatList = ({ chats }) => {
    return (
        <div>
            {chats.map((chat) => (
                <div key={chat.id}>
                    <img src={chat.profilePic || 'default-profile-pic.png'} alt="Profile" />
                    <p>{chat.name}</p>
                </div>
            ))}
        </div>
    );
};

export default ChatList;