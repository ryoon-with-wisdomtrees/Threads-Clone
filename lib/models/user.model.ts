import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  usename: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  location: String,
  threads: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Thread" }, //One user can have murtiple Threads
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community", //One user can belongs to many Comms.
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
//있으면 가져오고 없으면 만들고

export default User;
