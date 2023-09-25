import { SignIn } from "@clerk/nextjs";
import style from "./signin.module.css";
import Image from "next/image";
export default function Page() {
  return (
    <div className={style.loginmain}>
      <div className={style.loginThreadlogo}>
        <picture className={style.pic}>
          <source
            src="/images/barcelona/ribbons/nonenglish-dark.webp"
            type="image/webp"
          />
          <Image
            alt=""
            height="510"
            src="/assets/nonenglish-dark.png"
            width="1785"
          />
        </picture>
        <div className={style.loginclerk}>
          <h1 className="head-text pl-8">New to Thread?</h1>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
