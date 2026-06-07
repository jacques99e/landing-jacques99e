import { redirect } from "next/navigation";
import { resolveAppUrlServer } from "@/lib/public-urls";

export default function AppRedirectPage() {
  redirect(`${resolveAppUrlServer()}/login`);
}
