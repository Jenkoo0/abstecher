import { createFileRoute } from "@tanstack/react-router";
import { Abstecher } from "@/components/Abstecher";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Abstecher />;
}
