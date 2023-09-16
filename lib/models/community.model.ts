import mongoose, { model } from "mongoose";

const CommunitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  threads: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Thread" }, //One user can have murtiple Threads
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Community =
  mongoose.models.Community || mongoose.model("Community", CommunitySchema);
//있으면 가져오고 없으면 만들고

export default Community;
