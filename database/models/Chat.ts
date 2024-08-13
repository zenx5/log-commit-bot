import mongoose, { Schema } from "mongoose";


const ChatSchema = new Schema({
    name: String,
    chatid: String,
    user: String,
    repo: String,
    token: String
})

const Chat = mongoose.model("Chat", ChatSchema)

export default Chat