import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}
const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  // Fetch profile Tabs~~~
  let result = await fetchUserPosts(accountId);
  console.log(`result???: ${result}`);
  if (!result) redirect("/");
  console.log(`r==========================`);
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => {
        console.log(`thread: ${thread}`);
        // return <h4 className="text-light-2">{res녀.username}</h4>;
        return (
          <ThreadCard
            key={thread._id}
            id={thread._id}
            currentUserId={currentUserId}
            parentId={thread.parentId}
            content={thread.text}
            author={
              accountType === "User"
                ? { name: result.name, image: result.image, id: result.id }
                : {
                    name: thread.autor.name,
                    image: thread.autor.image,
                    id: thread.autor.id,
                  }
            }
            community={thread.community}
            createdAt={thread.createdAt}
            comments={thread.children}
          />
        );
      })}
      {/* <h3>머징</h3> */}
    </section>
  );
};

export default ThreadsTab;
