export const EVENT = {
    USER_CREATED: 'UserCreated',
    CHAT_MESSAGE_APPROVED: 'ChatMessageApproved',
    MESSAGE_SAVED: 'MessageSaved',
    USER_CONNECTED: 'UserConnected',
    SOCKET_MESSAGE: 'message',
    SEEN: 'seen',
    MESSAGE_READED: 'MessageReaded',
    MESSAGE_UPDATED: 'MessageUpdated',
    USERS_ADDED_TO_CHAT: 'UsersAddedToChat',
    USERS_REMOVED_FROM_CHAT: 'UsersRemovedFromChat',
    MESSAGE_SCHEDULED: 'MessageScheduled',
};

export const MESSAGE = {
    CREATE_USER: 'createUser',
    GENERATE_TOKEN: 'generateToken',
    GET_USER_CHATS: 'getChatIds',
    GET_CHAT_BY_ID: 'getChatById',
    GET_MESSAGE_BY_ID: 'getMessageById',
    REMOVE_MESSAGE_SOFT: 'removeMessageSoft',
    MARK_MESSAGE_AS_READ: 'markMessageAsRead',
    GET_USER_BY_ID: 'getUserById',
};

export const ERROR = {
    MAX_USERS: 'The maximum number of chat users has been exceeded',
    ACCESS_DENIED: 'You do not have permission to access this resource.',
    BANNED: 'Sorry, you are banned in this chat',
};
