import Chat from "@/components/chat";

export default function Page() {
  return <Chat api="/api/corporate" chat_url="/corporate/chat" features_url="/corporate/features" how_it_works_url="/corporate/how-it-works" />;
}
