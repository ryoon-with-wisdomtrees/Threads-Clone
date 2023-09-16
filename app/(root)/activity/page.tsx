import {
  fetchAllUsers,
  fetchUser,
  getActivity,
} from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  console.log(`userInfo: ${userInfo}`);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //get Activity하기
  const activity = await getActivity(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((act) => {
              return (
                <Link key={act._id} href={`/thread/${act.parentId}`}>
                  <article className="activity-card">
                    <Image
                      src={act.author.image}
                      alt="Profile pic"
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                    <p className="!text-small-regular text-light-1">
                      <span className="mr-1 text-primary-500">
                        {act.author.name}
                      </span>
                      {"  "}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              );
            })}
          </>
        ) : (
          <p className="!text-base-regular text-light-3"> no activity yet</p>
        )}
      </section>
    </section>
  );
}

export default page;
