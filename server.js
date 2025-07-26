const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mysql = require("mysql2");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// MariaDB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodechat'
});


app.get("/users", (req, res) => {
    const userId = parseInt(req.query.userId, 10);
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    const sql = `
        SELECT 
            u.id,
            u.name,
            u.avatar,
            m.message,
            m.createdAt
        FROM (
            SELECT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END AS user_id,
                MAX(id) as last_msg_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY user_id
        ) latest
        JOIN messages m ON m.id = latest.last_msg_id
        JOIN users u ON u.id = latest.user_id
        ORDER BY m.createdAt DESC
    `;

    const query = mysql.format(sql, [userId, userId, userId]);
    

    db.query(sql, [userId, userId, userId], (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(result);
    });
});





app.get("/messages/:senderId/:receiverId", (req, res) => {
    const { senderId, receiverId } = req.params;
    const sql = `
        SELECT id, username, message, receiver_id, sender_id,createdAt
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY createdAt ASC
    `;

    db.query(sql, [senderId, receiverId, receiverId, senderId], (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results); // ✅ Just send the result array, NOT [results]
    });
});



io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
        const sql = "INSERT INTO messages (username ,sender_id, receiver_id, message , createdAt) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [data.username, data.sender_id, data.receiver_id, data.input, data.createdAt], (err, result) => {
            if (err) {
                console.error("Error saving message:", err);
                return;
            }

            // Emit to receiver only
            socket.to(data.receiver).emit("receive_message", data);
            socket.emit("receive_message", data);
        });
    });

    // Join socket room based on userId
    socket.on("join_room", (userId) => {
        socket.join(userId);
    });
});


server.listen(3000, () => {
    console.log("Server running on port 3000");
});
