import ProfileHeader from "@/components/shared/ProfileHeader";
import { communityTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import UserCard from "@/components/cards/UserCard";

async function page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const commDetail = await fetchCommunityDetails(params.id);

  return (
    <section>
      <ProfileHeader
        accountId={commDetail.id}
        authUserId={user.id}
        name={commDetail.name}
        username={commDetail.username}
        imgUrl={commDetail.image}
        bio={commDetail.bio}
        type="Community"
      />
      <div className="mt-9">
        {/** shadcn으로 바로 간단하게 탭 만들 수 있었음. 누구든지 docs보면 적용하고 응용가능함*/}
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>
                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {commDetail?.threads?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="threads" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={commDetail._id}
              accountType="Community"
            />
          </TabsContent>
          <TabsContent value="members" className="w-full text-light-1">
            <section className="mt-9 flex flex-col gap-10">
              {commDetail?.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType="User"
                />
              ))}
            </section>
          </TabsContent>
          <TabsContent value="requests" className="w-full text-light-1">
            <ThreadsTab
              currentUserId={user.id}
              accountId={commDetail._id}
              accountType="Community"
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default page;
