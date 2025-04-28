import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatHeader from './ChatHeader';
import Messages from './Messages';
import ChatFooter from './ChatFooter';

const Chat = () => {
    const [text, setText] = useState('');

    return (
        <Box>
            <ChatHeader />
            <Messages />
            <ChatFooter text={text} setText={setText} />
        </Box>
    );
};

export default Chat;