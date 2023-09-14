import mongoose, { model } from "mongoose";

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }], //하나의 스레드가 multiple thread를 가질 수 있다는 의미.
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);
//있으면 가져오고 없으면 만들고

export default Thread;
