"use server";
// /**
// database actions through the browser side one reason is course cross origin requests.
//  it doesn't allow it. that's why we develop apis and new servers.
//  Databases are mostly server or API services.
//  So this simple next.js 'use server directive' makes it all work
// */
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  console.log(`author: ${author}`);
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    //업데이트 유저모델. 스레드작성과 동시에 누가 그 스레드 작성했는지 기록
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  //Skip할 포스트의 갯수 계산
  const skipAmount = (pageNumber - 1) * pageSize;

  //Fetch the post that have no parents(top-level Threads)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        //recursion~~~~ 코멘트 갖고오고 싶으니까 ㅎㅅㅎ
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // 코멘트를 제외한 탑레벨 스레드만긁어온다.

  const posts = await postsQuery.exec();
  const isNext = totalPostsCount > skipAmount + posts.length;
  return { posts, isNext };
}
