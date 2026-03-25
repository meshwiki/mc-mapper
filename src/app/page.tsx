import { Connect } from "@/components/Connect";
// import { getData } from "./actions";

export default async function Home() {
    // let data = await getData();
    // console.log("Data from CrateDB:", data);
    return (
        <div className="flex flex-col flex-1 items-stretch justify-start bg-zinc-50 font-sans dark:bg-black">
            <Connect />
        </div>
    );
}
