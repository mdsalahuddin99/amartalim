import type { BookRecord } from "@/types/book";
import _bookTafseer from "@/assets/book-tafseer.jpg";
const bookTafseer = (_bookTafseer as any).src || _bookTafseer;
import _bookHadith from "@/assets/book-hadith.jpg";
const bookHadith = (_bookHadith as any).src || _bookHadith;
import _bookSirat from "@/assets/book-sirat.jpg";
const bookSirat = (_bookSirat as any).src || _bookSirat;
import _bookFiqh from "@/assets/book-fiqh.jpg";
const bookFiqh = (_bookFiqh as any).src || _bookFiqh;
import _bookSahaba from "@/assets/book-sahaba.jpg";
const bookSahaba = (_bookSahaba as any).src || _bookSahaba;
import _bookDua from "@/assets/book-dua.jpg";
const bookDua = (_bookDua as any).src || _bookDua;
import _bookHistory from "@/assets/book-history.jpg";
const bookHistory = (_bookHistory as any).src || _bookHistory;
import _bookAqeedah from "@/assets/book-aqeedah.jpg";
const bookAqeedah = (_bookAqeedah as any).src || _bookAqeedah;

export const seedBooks: BookRecord[] = [
  {
    id: "b1",
    title: "তাফসীর ইবনে কাসীর (সংক্ষিপ্ত)",
    author: "ইমাম ইবনে কাসীর (রহ.)",
    cover: bookTafseer,
    category: "ই-বুক",
    subcategory: "তাফসীর",
    description: "কুরআনুল কারীমের সর্বাধিক গ্রহণযোগ্য তাফসীর গ্রন্থ। এই সংক্ষিপ্ত সংস্করণে প্রতিটি সূরার মূল ব্যাখ্যা সহজ বাংলায় উপস্থাপন করা হয়েছে।",
    pages: 320, rating: 4.9, readers: 15200, publishDate: "২০২৩",
    language: "বাংলা", isFree: true, status: "published",
    chapters: [
      { title: "ভূমিকা ও তাফসীর পরিচিতি", content: "তাফসীর শব্দের আভিধানিক অর্থ হলো ব্যাখ্যা করা, উন্মোচন করা। পারিভাষিক অর্থে কুরআনুল কারীমের আয়াতসমূহের অর্থ, তাৎপর্য ও প্রেক্ষাপট ব্যাখ্যা করাকে তাফসীর বলে।" },
      { title: "সূরা আল-ফাতিহার তাফসীর", content: "সূরা আল-ফাতিহা কুরআনের প্রথম সূরা। এটি মক্কায় অবতীর্ণ হয়েছে। এর আয়াত সংখ্যা ৭টি।" },
    ],
  },
  {
    id: "b2", title: "রিয়াদুস সালেহীন", author: "ইমাম নববী (রহ.)",
    cover: bookHadith, category: "ই-বুক", subcategory: "হাদিস",
    description: "দৈনন্দিন জীবনে প্রয়োজনীয় হাদিস সংকলন।",
    pages: 450, rating: 4.8, readers: 12800, publishDate: "২০২৩",
    language: "বাংলা", isFree: true, status: "published",
    chapters: [{ title: "ইখলাস ও নিয়্যত অধ্যায়", content: "নিশ্চয়ই প্রতিটি কাজ নিয়্যতের উপর নির্ভরশীল।" }],
  },
  {
    id: "b3", title: "আর-রাহীকুল মাখতূম (সীরাতুন্নবী)", author: "শাইখ সফিউর রহমান মুবারকপুরী",
    cover: bookSirat, category: "জীবনী", subcategory: "নবী জীবনী",
    description: "রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের পূর্ণাঙ্গ জীবনী।",
    pages: 580, rating: 5.0, readers: 18500, publishDate: "২০২২",
    language: "বাংলা", isFree: true, status: "published",
    chapters: [{ title: "নবীজির জন্ম ও শৈশব", content: "রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম ৫৭০ খ্রিস্টাব্দে রবিউল আউয়াল মাসে মক্কায় জন্মগ্রহণ করেন।" }],
  },
  {
    id: "b4", title: "ফিকহুস সুন্নাহ", author: "শাইখ সাইয়্যেদ সাবেক",
    cover: bookFiqh, category: "ই-বুক", subcategory: "ফিকহ",
    description: "ইসলামী শরীয়তের ব্যবহারিক বিধি-বিধান।",
    pages: 380, rating: 4.7, readers: 9800, publishDate: "২০২৩",
    language: "বাংলা", isFree: false, status: "published",
    chapters: [{ title: "পবিত্রতা অধ্যায়", content: "পবিত্রতা ঈমানের অর্ধেক।" }],
  },
  {
    id: "b5", title: "সাহাবীদের জীবনকথা", author: "ড. আব্দুর রহমান রাফাত পাশা",
    cover: bookSahaba, category: "জীবনী", subcategory: "সাহাবা জীবনী",
    description: "রাসূলুল্লাহ (সা.)-এর প্রিয় সাহাবীদের অনুপ্রেরণামূলক জীবনী।",
    pages: 420, rating: 4.9, readers: 14200, publishDate: "২০২৩",
    language: "বাংলা", isFree: true, status: "published",
    chapters: [{ title: "আবু বকর সিদ্দীক (রা.)", content: "আবু বকর সিদ্দীক (রা.) ছিলেন ইসলামের প্রথম খলিফা।" }],
  },
  {
    id: "b6", title: "হিসনুল মুসলিম (দুআ ও আযকার)", author: "শাইখ সাঈদ ইবনে আলী আল-কাহতানী",
    cover: bookDua, category: "ই-বুক", subcategory: "দুআ",
    description: "দৈনন্দিন জীবনের প্রয়োজনীয় দুআ ও আযকার সংকলন।",
    pages: 180, rating: 4.8, readers: 22000, publishDate: "২০২৪",
    language: "বাংলা-আরবি", isFree: true, status: "published",
    chapters: [{ title: "ঘুম থেকে জাগার দুআ", content: "আলহামদু লিল্লাহিল্লাযী আহইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশূর।" }],
  },
  {
    id: "b7", title: "ইসলামী সভ্যতার ইতিহাস", author: "ড. মুস্তাফা আস-সিবাঈ",
    cover: bookHistory, category: "ই-বুক", subcategory: "ইতিহাস",
    description: "ইসলামী সভ্যতার উত্থান, বিকাশ ও অবদান।",
    pages: 340, rating: 4.6, readers: 7600, publishDate: "২০২৩",
    language: "বাংলা", isFree: false, status: "published",
    chapters: [{ title: "ইসলামী সভ্যতার ভিত্তি", content: "ইসলামী সভ্যতা বিশ্বের অন্যতম মহান সভ্যতা।" }],
  },
  {
    id: "b8", title: "আকীদাতুল ইসলামিয়্যাহ", author: "শাইখ মুহাম্মাদ ইবনে সালেহ আল-উসাইমীন",
    cover: bookAqeedah, category: "ই-বুক", subcategory: "আকীদা",
    description: "ইসলামী বিশ্বাসের মৌলিক বিষয়সমূহ।",
    pages: 260, rating: 4.7, readers: 8900, publishDate: "২০২৪",
    language: "বাংলা", isFree: true, status: "published",
    chapters: [{ title: "তাওহীদের পরিচয়", content: "তাওহীদ শব্দের অর্থ একত্ববাদ।" }],
  },
];
