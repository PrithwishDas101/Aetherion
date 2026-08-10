const connections = new Map();

const addConnection = userId => {

    const id = String(userId);

    const currentCount =
        connections.get(id) || 0;

    connections.set(
        id,
        currentCount + 1
    );

    return currentCount === 0;
};

const removeConnection = userId => {

    const id = String(userId);

    const count = connections.get(id) || 0;

    if (count <= 1) {

        connections.delete(id);

        return {
            becameOffline: true,
            lastSeen: new Date(),
        };

    }

    connections.set(
        id,
        count - 1
    );

    return {
        becameOffline: false,
        lastSeen: null,
    };

};

const isOnline = userId => {

    return connections.has(
        String(userId)
    );

};

const getOnlineUsers = () => {

    return [
        ...connections.keys()
    ];

};

export { addConnection, removeConnection, isOnline, getOnlineUsers };