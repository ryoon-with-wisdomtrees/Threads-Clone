import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <div className=" mt-10 mb-10 ">
        {" "}
        <h1 className="head-text text-left pl-8 pb-2">Sign Up.</h1>
        {/* <h1 className="text-light-2"></h1> */}
        <SignUp />
      </div>
    </>
  );
}
