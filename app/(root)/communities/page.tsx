import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";

import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  console.log(`userInfo: ${userInfo}`);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchCommunities({
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <>
      {" "}
      <section>
        <h1 className="head-text">Communities</h1>

        <div className="mt-5">
          <Searchbar routeType="communities" />
        </div>
        <div className="mt-9 flex flex-col gap-4">
          {result.communities.length === 0 ? (
            <p className="no-result"> No Result</p>
          ) : (
            <>
              {result.communities.map((comm) => {
                return (
                  <CommunityCard
                    key={comm.id}
                    id={comm.id}
                    name={comm.name}
                    username={comm.username}
                    imgUrl={comm.image}
                    bio={comm.bio}
                    members={comm.members}
                  />
                );
              })}
            </>
          )}
        </div>
      </section>
      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Page;
