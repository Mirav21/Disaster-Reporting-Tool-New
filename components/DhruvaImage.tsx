import Image from "next/image";
import DhruvaSetu from "../DhruvaSetu.svg";

export default function DhruvaImage() {
  return (
    <div className="scale-100">
      <Image src={DhruvaSetu} alt="Logo" className="rounded-[60%]" />
    </div>
  );
}
