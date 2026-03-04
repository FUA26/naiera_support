import Image from "next/image";

export default function Icon() {
  return (
    <Image
      src="/logo.svg"
      alt="Naiera Logo"
      width={108}
      height={108}
      priority
    />
  );
}
