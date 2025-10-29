import dynamic from "next/dynamic";
const LearnApp = dynamic(() => import("../components/LearnApp"), { ssr: false });
export default function Page(){ return <LearnApp />; }
