import UserCard from "@/components/cards/UserCard";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";

import { profileTabs } from "@/constants";
import { fetchAllUsers, fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

async function page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  console.log(`userInfo: ${userInfo}`);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //All user fetch하기
  const allUsers = await fetchAllUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/** Search Bar */}
      <div className="mt-14 flex flex-col gap-9">
        {allUsers.users.length === 0 ? (
          <p className="no-result"> No users</p>
        ) : (
          <>
            {allUsers.users.map((member) => {
              return (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType="User"
                />
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}

export default page;
