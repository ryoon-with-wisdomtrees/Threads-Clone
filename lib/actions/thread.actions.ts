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

export async function fetchThreadById(id: string) {
  connectToDB();
  try {
    //TODO: populate Community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    //adding a comment

    //1. Id로 original Thread 찾기
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread Not Found");
    }
    //2. Create a new Thread with the comment

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    //3. Save the new thread
    const savedCommentThread = await commentThread.save();

    //4. Update the original thread to include the new Comment
    originalThread.children.push(savedCommentThread._id);

    //5. Save the original thread
    await originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}
