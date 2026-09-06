import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudRain,
  CloudSun,
  Droplets,
  FileImage,
  Globe2,
  LayoutDashboard,
  Leaf,
  ListTodo,
  MessageCircle,
  MessageSquare,
  Heart,
  Send,
  Users,
  ImagePlus,
  Bookmark,
  PenLine,
  UserPlus,
  Repeat2,
  MapPin,
  Menu,
  MoreHorizontal,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Sprout,
  SunMedium,
  UploadCloud,
  Wind,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Diagnose crop", icon: ScanLine, badge: "AI" },
  { label: "My farms", icon: Sprout },
  { label: "Tasks", icon: ListTodo, count: 3 },
  { label: "Disease library", icon: BookOpen },
  { label: "Community", icon: Users, count: 12 },
];

const forecast = [
  { day: "Today", temp: "22°", icon: CloudSun, rain: "35%" },
  { day: "Tue", temp: "20°", icon: CloudRain, rain: "70%" },
  { day: "Wed", temp: "23°", icon: SunMedium, rain: "15%" },
  { day: "Thu", temp: "21°", icon: CloudRain, rain: "55%" },
  { day: "Fri", temp: "24°", icon: SunMedium, rain: "10%" },
];

const diseases = [
  { name: "Late blight", swahili: "Mnyauko wa kuchelewa", type: "Fungal disease", color: "bg-[#e7f1e8] text-[#1d6847]", dot: "bg-[#4fa36d]" },
  { name: "Bacterial wilt", swahili: "Mnyauko wa bakteria", type: "Bacterial disease", color: "bg-[#fbede4] text-[#a35c34]", dot: "bg-[#db8257]" },
  { name: "Potato leafroll", swahili: "Virusi vya kukunja majani", type: "Viral disease", color: "bg-[#efebf8] text-[#7452a2]", dot: "bg-[#9a78cb]" },
];

export default function Home() {
  const [activeView, setActiveView] = useState("Overview");
  const [language, setLanguage] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [story, setStory] = useState("");
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [posts, setPosts] = useState([
    { id: 1, name: "Agnes Wanjiku", handle: "@agnes_grows", initials: "AW", tone: "bg-[#e6f0c8] text-[#5d7442]", time: "18 min", text: "The rains finally came to Nyeri 🌧️ I’m holding off irrigation for now and scouting the lower leaves twice a day. Sharing in case anyone else is seeing the same weather pattern.", tags: ["#lateblight", "#potatotips"], likes: 18, comments: 6 },
    { id: 2, name: "Peter Njoroge", handle: "@peter_njoroge", initials: "PN", tone: "bg-[#f1dfcf] text-[#a25f3d]", time: "1 hr", text: "First harvest from our Shangi plot is looking good! The biggest lesson this season: healthy seed and early scouting make a huge difference.", tags: ["#harvestday", "#shangi"], likes: 31, comments: 9 },
    { id: 3, name: "Mary Wambui", handle: "@mary_farm", initials: "MW", tone: "bg-[#e6e0f1] text-[#765f9f]", time: "3 hr", text: "Does anyone have an organic approach for aphids? I’d love to compare what is working in different counties before I spray.", tags: ["#askfarmers"], likes: 12, comments: 14 },
  ]);
  const fileInput = useRef<HTMLInputElement>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const chooseFile = (file?: File) => {
    if (!file) return;
    setSelectedFile(file.name);
    notify("Photo ready — AI scan can start here in the next build.");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f0] text-[#1b2d24]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[246px] shrink-0 flex-col border-r border-[#e1e6dc] bg-[#fbfcf8] px-5 py-6 lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#153d2c] text-[#dff38c] shadow-[0_6px_18px_rgba(21,61,44,0.18)]">
              <Leaf size={21} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-display text-[19px] font-semibold leading-none tracking-[-0.04em] text-[#153d2c]">Mavuno</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a9a8e]">Potato care</p>
            </div>
          </div>

          <div className="mt-12 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a0aca1]">Workspace</div>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeView === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveView(item.label);
                    if (item.label === "Community") {
                      document.getElementById("community")?.scrollIntoView({ behavior: "smooth" });
                    } else if (item.label !== "Overview") {
                      notify(`${item.label} is ready for the next build.`);
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${selected ? "bg-[#e6f1df] text-[#1d6847] shadow-[inset_3px_0_0_#397654]" : "text-[#708076] hover:bg-[#f0f4ed] hover:text-[#1d6847]"}`}
                >
                  <Icon size={17} strokeWidth={selected ? 2.3 : 1.9} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className="rounded-md bg-[#d8ec75] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-[#395526]">{item.badge}</span>}
                  {item.count && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3a36f] px-1.5 text-[10px] font-bold text-white">{item.count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#153d2c] p-4 text-white shadow-[0_14px_28px_rgba(21,61,44,0.15)]">
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d8ec75] text-[#193c2d]"><ShieldCheck size={16} /></div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[#dbeab6]">PROTOTYPE</span>
            </div>
            <p className="mt-3 font-display text-[17px] font-medium leading-tight">Grow with confidence.</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#b5cab9]">Simple crop intelligence for every growing season.</p>
            <button onClick={() => notify("Advisor chat will be connected in the next build.")} className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#d8ec75] transition-transform hover:translate-x-0.5">Talk to an advisor <ArrowUpRight size={13} /></button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-[#e4e8df] bg-[#fbfcf8]/80 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
            <div className="flex items-center gap-3">
              <button className="rounded-xl p-2 text-[#587064] hover:bg-[#edf2e9] lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
              <div className="lg:hidden">
                <p className="font-display text-[19px] font-semibold tracking-[-0.04em] text-[#153d2c]">Mavuno</p>
              </div>
              <div className="hidden items-center gap-2 text-[12px] font-medium text-[#8a9a8e] sm:flex"><MapPin size={14} className="text-[#d78351]" /> Nyeri, Kenya <ChevronDown size={14} /></div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-5">
              <button onClick={() => setLanguage(language === "EN" ? "SW" : "EN")} className="hidden items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-bold text-[#6f7e72] transition-colors hover:bg-[#edf2e9] sm:flex"><Globe2 size={15} /> {language} <ChevronDown size={13} /></button>
              <button onClick={() => notify("You’re all caught up for now.")} className="relative rounded-xl p-2 text-[#64776a] transition-colors hover:bg-[#edf2e9]" aria-label="Notifications"><Bell size={19} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#df8754] ring-2 ring-[#fbfcf8]" /></button>
              <div className="hidden h-8 w-px bg-[#e0e6dd] sm:block" />
              <button onClick={() => notify("Profile settings will be available soon.")} className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-[#edf2e9]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9e8b9] font-display text-[13px] font-semibold text-[#426144]">JM</div>
                <div className="hidden text-left sm:block"><p className="text-[12px] font-bold text-[#30473a]">Jane Mwangi</p><p className="text-[10px] text-[#91a095]">Farmer account</p></div>
                <ChevronDown size={14} className="hidden text-[#829289] sm:block" />
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1430px] px-5 pb-12 pt-8 sm:px-8 lg:px-12 lg:pt-10">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#9ba79a]"><span className="h-1.5 w-1.5 rounded-full bg-[#73a95d]" /> Sunday, 06 September 2026</p>
                <h1 className="font-display text-[36px] font-semibold leading-[1.04] tracking-[-0.055em] text-[#193b2b] sm:text-[44px]">Good morning, Jane <span className="text-[#90a87b]">↗</span></h1>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#78897d]">Here’s what’s happening on your farm today. Your crops are looking <span className="font-bold text-[#3c754f]">healthy</span>.</p>
              </div>
              <button onClick={() => notify("New farm form opened — backend connection comes next.")} className="flex w-fit items-center gap-2 rounded-xl bg-[#153d2c] px-4 py-3 text-[12px] font-bold text-white shadow-[0_9px_20px_rgba(21,61,44,0.16)] transition-all hover:bg-[#245d43] active:scale-[0.97]"><Plus size={16} /> Add a farm</button>
            </div>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.85fr)]">
              <div className="relative overflow-hidden rounded-[24px] bg-[#dce9c8] p-6 shadow-[0_14px_34px_rgba(60,86,54,0.07)] sm:p-7">
                <div className="pointer-events-none absolute -right-5 -top-12 h-56 w-56 rounded-full border-[24px] border-[#cfe0b8] opacity-70" />
                <div className="pointer-events-none absolute -bottom-24 right-16 h-48 w-48 rounded-full border-[18px] border-[#d2e3bd] opacity-80" />
                <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                  <div className="max-w-[360px]">
                    <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#5f7d5c]"><CloudRain size={15} /> Field conditions</div>
                    <h2 className="font-display text-[31px] font-semibold leading-[1.06] tracking-[-0.045em] text-[#1c4a35] sm:text-[36px]">Rain is on the way.</h2>
                    <p className="mt-3 text-[13px] leading-relaxed text-[#5a765a]">Good conditions for your potato crop, but watch out for late blight after the rain.</p>
                    <button onClick={() => notify("Weather advisory details opened.")} className="mt-6 flex items-center gap-2 text-[12px] font-extrabold text-[#296442]">View weather advisory <ArrowUpRight size={15} /></button>
                  </div>
                  <div className="flex items-end gap-5 lg:pr-3">
                    <div><p className="font-display text-[64px] font-medium leading-none tracking-[-0.08em] text-[#204f39]">22°</p><p className="mt-2 text-[12px] font-semibold text-[#668065]">Feels like 21°</p></div>
                    <div className="mb-1 h-16 w-px bg-[#b9cfa9]" />
                    <div className="space-y-2 text-[11px] font-semibold text-[#668065]"><p className="flex items-center gap-2"><Droplets size={14} className="text-[#6e9d9e]" /> Humidity 71%</p><p className="flex items-center gap-2"><Wind size={14} className="text-[#819d75]" /> Wind 12 km/h</p></div>
                  </div>
                </div>
                <div className="relative mt-8 grid grid-cols-5 divide-x divide-[#bfd3ad] border-t border-[#bfd3ad] pt-5">
                  {forecast.map((item, index) => { const Icon = item.icon; return <div key={item.day} className={`text-center ${index === 0 ? "text-[#245b3f]" : "text-[#668065]"}`}><p className="text-[10px] font-bold">{item.day}</p><Icon size={18} className="mx-auto my-2" /><p className="font-display text-[18px] font-semibold">{item.temp}</p><p className="mt-1 text-[10px] font-bold opacity-75">{item.rain} rain</p></div>; })}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[24px] bg-[#153d2c] p-6 text-white shadow-[0_14px_34px_rgba(21,61,44,0.13)] sm:p-7">
                <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full border-[19px] border-[#2b6044] opacity-70" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8ec75] text-[#234a35]"><ScanLine size={20} /></div><span className="rounded-full border border-[#52765b] bg-[#25543b] px-2.5 py-1 text-[9px] font-extrabold tracking-[0.13em] text-[#d8ec75]">AI POWERED</span></div>
                  <div className="mt-10"><h2 className="font-display text-[28px] font-semibold leading-[1.08] tracking-[-0.045em]">Is something wrong<br className="hidden sm:block" /> with your crop?</h2><p className="mt-3 max-w-[290px] text-[12px] leading-relaxed text-[#b2cbb5]">Upload a photo of a leaf or tuber and get a quick health check.</p></div>
                  <div className="mt-6 flex flex-wrap items-center gap-3"><button onClick={() => fileInput.current?.click()} className="flex items-center gap-2 rounded-xl bg-[#d8ec75] px-4 py-3 text-[12px] font-extrabold text-[#244c36] transition-all hover:bg-[#e5f691] active:scale-[0.97]"><UploadCloud size={16} /> {selectedFile ? "Change photo" : "Upload photo"}</button><input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} /><button onClick={() => notify("How diagnosis works: upload → scan → treatment plan.")} className="text-[11px] font-bold text-[#d2e2ca] underline decoration-[#587962] underline-offset-4">How it works</button></div>
                </div>
              </div>
            </section>

            <section className="mt-7 grid gap-5 md:grid-cols-3">
              <div className="rounded-[20px] border border-[#e5e9e0] bg-[#fbfcf8] p-5 shadow-[0_8px_24px_rgba(45,72,49,0.035)]"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#99a69c]">Crop health</p><p className="mt-3 font-display text-[36px] font-semibold tracking-[-0.055em] text-[#204f39]">87<span className="text-[20px] text-[#94a399]">/100</span></p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f1dc] text-[#4b9861]"><Leaf size={19} /></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7ece3]"><div className="h-full w-[87%] rounded-full bg-[#65a46a]" /></div><div className="mt-2 flex justify-between text-[10px] font-semibold text-[#849286]"><span>Across 3 fields</span><span className="text-[#4b9861]">+4 this week</span></div></div>
              <div className="rounded-[20px] border border-[#e5e9e0] bg-[#fbfcf8] p-5 shadow-[0_8px_24px_rgba(45,72,49,0.035)]"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#99a69c]">Next task</p><p className="mt-3 font-display text-[25px] font-semibold tracking-[-0.04em] text-[#204f39]">Scout field B</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbecdc] text-[#bf6d41]"><CalendarDays size={18} /></div></div><div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#bf6d41]"><span className="h-1.5 w-1.5 rounded-full bg-[#d47e4f]" /> Today, 2:00 PM <span className="ml-auto font-semibold text-[#89968b]">30 min</span></div></div>
              <div className="rounded-[20px] border border-[#e5e9e0] bg-[#fbfcf8] p-5 shadow-[0_8px_24px_rgba(45,72,49,0.035)]"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#99a69c]">Active fields</p><p className="mt-3 font-display text-[36px] font-semibold tracking-[-0.055em] text-[#204f39]">3</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8e9f6] text-[#7771ac]"><Sprout size={19} /></div></div><div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#849286]"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#70a268] text-white"><Check size={11} /></span> All crops have a planting record</div></div>
            </section>

            <section className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(350px,0.8fr)]">
              <div>
                <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ba79a]">Your fields</p><h2 className="mt-1 font-display text-[25px] font-semibold tracking-[-0.04em] text-[#214633]">Crop health overview</h2></div><button onClick={() => setActiveView("My farms")} className="flex items-center gap-1 text-[11px] font-bold text-[#387452]">View all fields <ChevronRight size={15} /></button></div>
                <div className="overflow-hidden rounded-[20px] border border-[#e5e9e0] bg-[#fbfcf8] shadow-[0_8px_24px_rgba(45,72,49,0.035)]"><div className="hidden grid-cols-[1.5fr_1fr_0.8fr_0.7fr] gap-3 border-b border-[#e9ede6] bg-[#f7f9f4] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0aca1] sm:grid"><span>Field name</span><span>Variety</span><span>Planting date</span><span>Status</span></div><div className="divide-y divide-[#edf0ea]">{[{ field: "Kiamaina North", size: "1.2 acres", variety: "Shangi", date: "12 Aug 2026", score: "92", tag: "Excellent", color: "text-[#4a955f] bg-[#e5f1df]" }, { field: "Kiamaina East", size: "0.8 acres", variety: "Tigoni", date: "18 Aug 2026", score: "84", tag: "Good", color: "text-[#bd713e] bg-[#fbeddf]" }, { field: "Rware Valley", size: "2.1 acres", variety: "Shangi", date: "24 Aug 2026", score: "86", tag: "Good", color: "text-[#bd713e] bg-[#fbeddf]" }].map((row) => <button key={row.field} onClick={() => notify(`${row.field} selected.`)} className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f7faf4] sm:grid-cols-[1.5fr_1fr_0.8fr_0.7fr] sm:items-center"><div><p className="text-[13px] font-bold text-[#355141]">{row.field}</p><p className="mt-1 text-[10px] font-medium text-[#9aa69c]">{row.size}</p></div><p className="hidden text-[12px] font-semibold text-[#63776a] sm:block">{row.variety}</p><p className="hidden text-[11px] font-medium text-[#829086] sm:block">{row.date}</p><div className="flex items-center justify-between sm:block"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.color}`}>{row.score} · {row.tag}</span><ChevronRight size={15} className="text-[#a4b0a5] sm:hidden" /></div></button>)}</div></div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9ba79a]">Stay informed</p><h2 className="mt-1 font-display text-[25px] font-semibold tracking-[-0.04em] text-[#214633]">Disease library</h2></div><button onClick={() => setActiveView("Disease library")} className="flex items-center gap-1 text-[11px] font-bold text-[#387452]">Explore library <ChevronRight size={15} /></button></div>
                <div className="overflow-hidden rounded-[20px] border border-[#e5e9e0] bg-[#fbfcf8] shadow-[0_8px_24px_rgba(45,72,49,0.035)]"><div className="border-b border-[#edf0ea] px-5 py-4"><div className="flex items-center gap-2 rounded-xl bg-[#f3f6ef] px-3 py-2.5 text-[#8d9b90]"><Search size={15} /><input aria-label="Search disease library" placeholder="Search diseases or symptoms" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#a2aea4]" onChange={() => undefined} /></div></div><div className="divide-y divide-[#edf0ea]">{diseases.map((disease) => <button key={disease.name} onClick={() => notify(`${disease.name} details selected.`)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#f7faf4]"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${disease.color}`}><span className={`h-2.5 w-2.5 rounded-full ${disease.dot}`} /></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-[#3a5143]">{disease.name}</span><span className="mt-0.5 block truncate text-[10px] font-medium text-[#99a69d]">{disease.swahili}</span></span><ChevronRight size={15} className="text-[#aab4aa]" /></button>)}</div><button onClick={() => setActiveView("Disease library")} className="flex w-full items-center justify-center gap-2 border-t border-[#edf0ea] px-5 py-3.5 text-[11px] font-bold text-[#387452]">View all 22 diseases <ArrowUpRight size={14} /></button></div>
              </div>
            </section>

            <section className="mt-9 overflow-hidden rounded-[23px] bg-[#f2e5d9] shadow-[0_10px_26px_rgba(123,83,48,0.06)]"><div className="grid lg:grid-cols-[1.15fr_0.85fr]"><div className="relative min-h-[205px] overflow-hidden p-6 sm:p-8"><div className="absolute inset-0 bg-gradient-to-r from-[#f2e5d9] via-[#f2e5d9]/90 to-[#f2e5d9]/10" /><div className="absolute inset-y-0 right-0 hidden w-[55%] sm:block bg-cover bg-center opacity-90 mix-blend-multiply" style={{ backgroundImage: "url('/manus-storage/potato-field_7fde454e.jpg')" }} /><div className="relative max-w-[420px] lg:max-w-[350px]"><div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#a3653e]"><BookOpen size={14} /> Mavuno field note · 01</div><h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.04em] text-[#6d3f27]">Keep an eye on lower leaves this week.</h2><p className="mt-2 text-[12px] leading-relaxed text-[#956a51]">Wet weather can create the right conditions for late blight. Scout early and avoid watering leaves.</p><button onClick={() => notify("Field note opened.")} className="mt-5 flex items-center gap-1 text-[11px] font-extrabold text-[#a35c34]">Read the full note <ArrowUpRight size={14} /></button></div></div><div className="flex items-center justify-between gap-4 bg-[#e9d5c5] p-6 sm:p-8"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#a3755e]">Quick action</p><h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-0.035em] text-[#74452e]">Log a field visit</h3><p className="mt-1 text-[11px] text-[#a47760]">Record what you see while scouting.</p></div><button onClick={() => notify("Field visit log opened.")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a96540] text-white shadow-[0_8px_16px_rgba(130,79,44,0.2)] transition-all hover:bg-[#8d5132] active:scale-[0.96]"><Plus size={19} /></button></div></div></section>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#e0e7dc] bg-[#fbfcf8]/95 px-2 py-2 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-md items-center justify-around"><button onClick={() => setActiveView("Overview")} className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] font-bold ${activeView === "Overview" ? "text-[#2d704b]" : "text-[#95a196]"}`}><LayoutDashboard size={18} /> Home</button><button onClick={() => { setActiveView("Diagnose crop"); fileInput.current?.click(); }} className="-mt-6 flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full border-4 border-[#f5f6f0] bg-[#153d2c] text-[9px] font-bold text-[#d8ec75] shadow-[0_7px_18px_rgba(21,61,44,0.23)]"><ScanLine size={19} /> Scan</button><button onClick={() => setActiveView("Tasks")} className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[9px] font-bold ${activeView === "Tasks" ? "text-[#2d704b]" : "text-[#95a196]"}`}><ListTodo size={18} /> Tasks</button></div></div>

      {menuOpen && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-[#153d2c]/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Close menu" /><aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[#fbfcf8] p-5 shadow-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#153d2c] text-[#dff38c]"><Leaf size={21} /></div><p className="font-display text-[19px] font-semibold text-[#153d2c]">Mavuno</p></div><button onClick={() => setMenuOpen(false)} className="rounded-xl p-2 text-[#7d8e81]"><X size={19} /></button></div><nav className="mt-10 space-y-1.5">{navItems.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => { setActiveView(item.label); setMenuOpen(false); if (item.label === "Community") window.setTimeout(() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" }), 0); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold ${activeView === item.label ? "bg-[#e6f1df] text-[#1d6847]" : "text-[#708076]"}`}><Icon size={17} />{item.label}</button>; })}</nav></aside></div>}

      {messagesOpen && <div className="fixed inset-0 z-50"><button className="absolute inset-0 bg-[#153d2c]/25 backdrop-blur-sm" onClick={() => setMessagesOpen(false)} aria-label="Close messages" /><aside className="absolute right-0 top-0 flex h-full w-full max-w-[390px] flex-col bg-[#fbfcf8] shadow-2xl"><div className="flex items-center justify-between border-b border-[#e6ebe2] px-5 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ba79a]">Private conversations</p><h3 className="mt-1 font-display text-[25px] font-semibold tracking-[-0.04em] text-[#214633]">Messages</h3></div><button onClick={() => setMessagesOpen(false)} className="rounded-xl p-2 text-[#7d8e81] hover:bg-[#edf2e9]"><X size={19} /></button></div><div className="border-b border-[#e6ebe2] px-5 py-4"><div className="flex items-center gap-2 rounded-xl bg-[#f0f5ed] px-3 py-2.5 text-[#8d9b90]"><Search size={15} /><input placeholder="Search conversations" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#a2aea4]" /></div></div><div className="divide-y divide-[#edf0ea]">{[{ initials: "EK", name: "Esther Kamau", message: "That organic spray worked well...", time: "10m", tone: "bg-[#f1e4c8] text-[#8f7042]", unread: true }, { initials: "DO", name: "David Otieno", message: "Are you planting Shangi this season?", time: "1h", tone: "bg-[#d9e8e8] text-[#4d7b7b]", unread: true }, { initials: "LN", name: "Lucy Njeri", message: "Thanks for sharing the field note.", time: "Yesterday", tone: "bg-[#e8dceb] text-[#795e8e]", unread: false }].map((chat) => <button key={chat.name} onClick={() => notify(`Opening chat with ${chat.name}.`)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#f5f8f2]"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${chat.tone}`}>{chat.initials}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[12px] font-bold text-[#405849]">{chat.name}</p><span className="text-[10px] text-[#a0aca1]">{chat.time}</span></div><p className="mt-1 truncate text-[11px] text-[#8b998e]">{chat.message}</p></div>{chat.unread && <span className="h-2 w-2 rounded-full bg-[#df8754]" />}</button>)}</div><div className="mt-auto border-t border-[#e6ebe2] p-5"><button onClick={() => notify("New conversation composer will be connected next.")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#153d2c] px-4 py-3 text-[12px] font-bold text-white hover:bg-[#245d43]"><PenLine size={15} /> New message</button></div></aside></div>}

      {toast && <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#153d2c] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(21,61,44,0.25)] lg:bottom-7"><CheckCircle2 size={16} className="text-[#d8ec75]" /> {toast}</div>}
    </div>
  );
}
