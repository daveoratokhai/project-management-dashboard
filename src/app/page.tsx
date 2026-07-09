import { redirect } from "next/navigation";

// The board view has been removed; the projects dashboard is the app home.
export default function Home() {
  redirect("/projects");
}
