import {
    createServer
} from "http";
import {
    Server
} from "socket.io";
import {
    tokenService
} from "../../services/token.service.js";
import {
    prisma
} from "../prisma/connect.prisma.js";

export const initSocket = (app) => {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        /* options */
    });

    io.on("connection", (socket) => {
        console.log("socket", socket.id);

        socket.on("CREATE_ROOM", async (data, cb) => {
            try {
                const {
                    targetUserIds,
                    accessToken,
                    name
                } = data;

                const {
                    userId
                } = tokenService.verifyAccessToken(accessToken);
                const userExists = await prisma.users.findUnique({
                    where: {
                        id: userId
                    }
                })

                if (!userExists) {
                    throw new Error("User không tồn tại")
                }


                const targetUserIdsSet = new Set([...targetUserIds, userExists.id]);
                const targetUserIdsUnique = Array.from(targetUserIdsSet);

                if (targetUserIdsUnique.length === 2) {
                    // chat 1 - 1 chỉ tồn tại 1 group đặc trưng duy nhất
                    let chatGroup = await prisma.chatGroups.findFirst({
                        where: {
                            ChatGroupMembers: {
                                every: {
                                    userId: {
                                        in: targetUserIdsUnique
                                    }
                                }
                            }
                        }
                    })

                    if (!chatGroup) {
                        chatGroup = await prisma.chatGroups.create({
                            data: {
                                ownerId: userExists.id,
                            }
                        })

                        console.log("chatGroup mới được tạo", { chatGroup })
                        const result = await prisma.chatGroupMembers.createMany({
                            data: [
                                {userId: targetUserIdsUnique[0], chatGroupId: chatGroup.id},
                                {userId: targetUserIdsUnique[1], chatGroupId: chatGroup.id},
                            ]
                        })
                        console.log(result)
                    }

                    socket.join(`chat:${chatGroup.id}`)
                    cb({
                        status: "success",
                        message: "Tạo phòng thành công",
                        data: {
                            chatGroupId: chatGroup.id,
                        }
                    })
                } else {
                    // chat nhóm
                    const chatGroup = await prisma.chatGroups.create({
                        data: {
                            name: name,
                            ownerId: userExists.id,
                        },
                    });

                    await prisma.chatGroupMembers.createMany({
                        data: targetUserIdsUnique.map((userId) => {
                            return { userId: userId, chatGroupId: chatGroup.id };
                        }),
                    });

                    socket.join(`chat:${chatGroup.id}`);

                    cb({
                        status: "success",
                        message: "Tạo phòng thành công",
                        data: {
                            chatGroupId: chatGroup.id,
                        },
                    });
                }

                console.log("CREATE_ROOM", {
                    targetUserIds,
                    targetUserIdsUnique,
                    accessToken,
                    userId
                })
            } catch (err) {
                cb({
                    status: "error",
                    data: null,
                    message: err.message || "Lỗi không xác định"
                })
            }


        });

        socket.on("JOIN_ROOM", async (data, cb) => {
            const { chatGroupId, accessToken } = data;

            const { userId } = tokenService.verifyAccessToken(accessToken, { ignoreExpiration: true });
            const userExits = await prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!userExits) {
                throw new Error("User không tồn tại");
            }

            socket.join(`chat:${chatGroupId}`);

            console.log("tất cả các room", io.sockets.adapter.rooms);

            console.log("JOIN_ROOM", { chatGroupId, accessToken });
        });

        socket.on("SEND_MESSAGE", async (data) => {
            const { chatGroupId, message, accessToken } = data;

            const { userId } = tokenService.verifyAccessToken(accessToken, { ignoreExpiration: true });
            const userExists = await prisma.users.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!userExists) {
                throw new Error("User không tồn tại");
            }
            const createdAt = new Date().toISOString();

            io.to(`chat:${chatGroupId}`).emit(`SEND_MESSAGE`, {
                messageText: message,
                userIdSender: userExists.id,
                chatGroupId: chatGroupId,
                createdAt: createdAt,

            })

            await prisma.chatMessages.create({
                data: {
                    chatGroupId: chatGroupId,
                    messageText: message,
                    userIdSender: userExists.id,
                    createdAt: createdAt
                }
            })
            console.log("SEND_MESSAGE", { chatGroupId, message, accessToken })
        })
    });

    return httpServer;
}