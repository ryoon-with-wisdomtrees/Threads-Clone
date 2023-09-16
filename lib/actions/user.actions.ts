"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";

// Destructuring하기 위한 인터페이스 Params
// 데이터를 넘겨주는 쪽에서 어떤 순서로 넘겨줘도 name으로 맵핑되기 때문에 less error하게 된다.
interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(`Failed to create/update user: ${error}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    // 유저아이디로 author가 해당아이디인 all the Threads 찾기.
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name username image id",
          },
        },
      ],
    });

    return threads;
    //TODO populate COmmunity
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchAllUsers({
  userId,
  pageNumber = 1,
  pageSize = 0,
  searchString = "",
  sortBy = "desc",
}: {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  sortBy?: SortOrder; //from 몽고디비   -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending';
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOption = { createdAt: sortBy };
    const usersQuery = User.find(query)
      .sort(sortOption)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCnt = await User.countDocuments(query);

    const users = await usersQuery.exec();
    const isNext = totalUsersCnt > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // 내가쓴 스레드 모두 보기~!
    const allMyThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids(replies 댓글) from the 'children' field
    const childThreadIds = allMyThreads.reduce((acc, allMyThread) => {
      return acc.concat(allMyThread.children);
    }, []);

    //find all the threads that user has replied to
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`error: ${error.message}`);
  }
}
