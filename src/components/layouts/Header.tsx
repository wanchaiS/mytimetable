import { ContactUs } from "@/components/contact-us/ContactUs";

export default function Header() {
  // const handleLogout = () => {
  //   // TODO: Implement logout logic
  //   console.log("Logout clicked");
  // };

  return (
    <header className="flex h-15 items-center justify-between border-b border-(--border) bg-(--background) px-4">
      <div className="flex items-center">
        {/* <Button variant="ghost" size="icon">
          <Menu />
        </Button> */}
        <div className="ml-2 text-2xl font-bold text-(--primary)">
          Timetable<span className="text-blue-500">X</span>
        </div>
      </div>
      <ContactUs />
      {/* <UserProfile onLogout={handleLogout} /> */}
    </header>
  );
}
