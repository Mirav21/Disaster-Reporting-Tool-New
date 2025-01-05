import Image from "next/image";
import DhruvaSetu from "../DhruvaSetu.svg";

export default function DhruvaImage() {
  return (
    <div className="scale-125">
      <Image src={DhruvaSetu} alt="Logo" className="rounded-[10%]" />
    </div>
  );
}
