import _courseQuran from "@/assets/course-quran.jpg";
const courseQuran = (_courseQuran as any).src || _courseQuran;
import _courseHadith from "@/assets/course-hadith.jpg";
const courseHadith = (_courseHadith as any).src || _courseHadith;
import _courseSirat from "@/assets/course-sirat.jpg";
const courseSirat = (_courseSirat as any).src || _courseSirat;
import _courseFiqh from "@/assets/course-fiqh.jpg";
const courseFiqh = (_courseFiqh as any).src || _courseFiqh;
import _coursePhysics from "@/assets/course-physics.jpg";
const coursePhysics = (_coursePhysics as any).src || _coursePhysics;
import _courseMath from "@/assets/course-math.jpg";
const courseMath = (_courseMath as any).src || _courseMath;
import _courseEnglish from "@/assets/course-english.jpg";
const courseEnglish = (_courseEnglish as any).src || _courseEnglish;
import _courseChemistry from "@/assets/course-chemistry.jpg";
const courseChemistry = (_courseChemistry as any).src || _courseChemistry;
import _courseReact from "@/assets/course-react.jpg";
const courseReact = (_courseReact as any).src || _courseReact;
import _coursePython from "@/assets/course-python.jpg";
const coursePython = (_coursePython as any).src || _coursePython;
import _courseDesign from "@/assets/course-design.jpg";
const courseDesign = (_courseDesign as any).src || _courseDesign;
import _courseMarketing from "@/assets/course-marketing.jpg";
const courseMarketing = (_courseMarketing as any).src || _courseMarketing;

export interface Category {
  id: string;
  name: string;
  description: string;
  courseCount: number;
  icon: string;
  parentId?: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  thumbnail: string;
  price: number;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  instructor: string;
  instructorBio?: string;
  level: "শিক্ষানবিস" | "মধ্যবর্তী" | "উন্নত";
  whatYouLearn?: string[];
  whoIsFor?: string[];
  problems?: { title: string; items: string[] }[];
  benefits?: string[];
  modules?: { title: string; description: string; lessons: string[]; duration: string }[];
  // === Builder extensions ===
  language?: string;
  published?: boolean;
  accessType?: "public" | "password" | "paid";
  password?: string;
  maxStudents?: number;
  enableDrip?: boolean;
  enableCertificate?: boolean;
  certificateTemplate?: string;
  prerequisites?: string[];
  isBundle?: boolean;
  bundleCourseIds?: string[];
  salePrice?: number;
  pricingType?: "free" | "one-time" | "subscription";
  subscriptionInterval?: "monthly" | "yearly";
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  summary?: string;
  order: number;
}

export interface Assignment {
  id: string;
  topicId: string;
  courseId: string;
  title: string;
  instructions?: string;
  maxPoints?: number;
  dueDays?: number;
  attachments?: string[];
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  topicId?: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  order: number;
  contentType?: "video" | "text" | "live";
  body?: string;
  attachments?: string[];
  isPreview?: boolean;
  dripDays?: number;
}

export interface QuizMeta {
  id: string;
  topicId: string;
  courseId: string;
  title: string;
  timeLimit?: number;
  passingScore?: number;
  attempts?: number;
  order: number;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type?: "mcq" | "true-false" | "short" | "fill";
}


export interface Enrollment {
  courseId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
}

export interface QuizAttempt {
  lessonId: string;
  courseId: string;
  score: number;
  total: number;
  passed: boolean;
  attemptedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const reviews: Review[] = [
  { id: "r1", courseId: "1", userName: "আবদুল করিম", rating: 5, comment: "শূন্য থেকে কুরআন পড়া শিখেছি। অসাধারণ পদ্ধতি! মাত্র ১০ দিনে আরবি বর্ণমালা থেকে সূরা পড়তে পারছি।", date: "2024-02-15" },
  { id: "r2", courseId: "1", userName: "ফাতিমা বেগম", rating: 5, comment: "তাজবীদ শেখার পর এখন শুদ্ধভাবে কুরআন তিলাওয়াত করতে পারি। আলহামদুলিল্লাহ!", date: "2024-03-01" },
  { id: "r3", courseId: "1", userName: "রফিকুল ইসলাম", rating: 5, comment: "বয়স ৪৫ হলেও এই কোর্সের মাধ্যমে কুরআন পড়া শিখেছি। সহজ পদ্ধতিতে শেখানো হয়।", date: "2024-03-10" },
  { id: "r4", courseId: "1", userName: "নুসরাত জাহান", rating: 4, comment: "নামাজের সূরাগুলোর অর্থ বুঝে পড়তে পারছি এখন। নামাজে মনোযোগ অনেক বেড়েছে।", date: "2024-03-15" },
  { id: "r5", courseId: "2", userName: "সাদিয়া আক্তার", rating: 5, comment: "হাদিস শেখার জন্য চমৎকার কোর্স। দৈনন্দিন জীবনে হাদিস প্রয়োগ করতে শিখেছি।", date: "2024-02-20" },
  { id: "r6", courseId: "3", userName: "তানভীর রহমান", rating: 5, comment: "ইসলামের ইতিহাস জানতে পেরে ঈমান আরো মজবুত হয়েছে।", date: "2024-02-28" },
  { id: "r7", courseId: "4", userName: "কামাল হোসেন", rating: 5, comment: "রিয়্যাক্ট শেখার জন্য এটা সেরা কোর্স। বাংলায় এত পরিষ্কার ব্যাখ্যা আর কোথাও পাইনি।", date: "2024-02-15" },
  { id: "r8", courseId: "5", userName: "রাফি আহমেদ", rating: 4, comment: "পাইথন শিখে ডেটা অ্যানালিসিস করতে পারছি। প্র্যাক্টিক্যাল প্রজেক্ট দিয়ে শেখানো হয়েছে।", date: "2024-03-05" },
  { id: "r9", courseId: "7", userName: "মারিয়া আক্তার", rating: 5, comment: "গ্রাফিক ডিজাইন শিখে এখন ফ্রিল্যান্সিং করছি। কোর্সটি আমার জীবন বদলে দিয়েছে!", date: "2024-03-12" },
  { id: "r10", courseId: "9", userName: "ইমরান হোসেন", rating: 5, comment: "HSC পদার্থবিজ্ঞান অনেক সহজ হয়ে গেছে। স্যারের পড়ানোর ধরণ অসাধারণ!", date: "2024-03-08" },
];

export const categories: Category[] = [
  { id: "islamic", name: "ইসলামিক", description: "কুরআন, হাদিস, ফিকহ এবং ইসলামি জ্ঞান", courseCount: 4, icon: "🕌" },
  { id: "academic", name: "একাডেমিক", description: "SSC, HSC, বিশ্ববিদ্যালয় ভর্তি পরীক্ষা", courseCount: 4, icon: "🎓" },
  { id: "skill", name: "স্কিল্ড", description: "ফ্রিল্যান্সিং, প্রোগ্রামিং, ডিজাইন", courseCount: 4, icon: "💡" },
];

export const courses: Course[] = [
  // ===== ইসলামিক কোর্স =====
  {
    id: "1",
    title: "শূন্য থেকে কুরআন শিখুন",
    description: "আরবি বর্ণমালা থেকে শুদ্ধভাবে কুরআন তিলাওয়াত এবং নামাজে সবচেয়ে বেশি পঠিত ১০ সূরার অনুধাবন শিখুন। সহজ পদ্ধতিতে যেকোনো বয়সীদের জন্য।",
    categoryId: "islamic",
    categoryName: "ইসলামিক",
    thumbnail: courseQuran,
    price: 1999,
    duration: "৩০ ঘণ্টা",
    lessonsCount: 30,
    studentsCount: 8023,
    rating: 4.9,
    instructor: "মাওলানা জাহিদ হাসান",
    instructorBio: "অভিজ্ঞ কুরআন শিক্ষক। হাজার হাজার শিক্ষার্থীকে কুরআন পড়া শিখিয়েছেন। সহজ পদ্ধতিতে শেখানোর জন্য পরিচিত।",
    level: "শিক্ষানবিস",
    whatYouLearn: [
      "আরবি বর্ণমালা চিনতে ও পড়তে পারবেন",
      "সহীহভাবে কুরআন তিলাওয়াত করতে পারবেন",
      "তাজবীদের মৌলিক নিয়ম আয়ত্ত করবেন",
      "নামাজে পঠিত ১০টি সূরার অর্থ বুঝবেন",
      "মাখরাজ ও সিফাত সঠিকভাবে প্রয়োগ করবেন",
      "সমাপ্তির সার্টিফিকেট পাবেন",
    ],
    problems: [
      { title: "একদমই পারি না", items: ["আরবি অক্ষর চিনতে পারি না", "কোথা থেকে শুরু করবো বুঝি না", "বয়স বেশি হওয়ায় শেখা হয়নি"] },
      { title: "শুদ্ধ হয় না", items: ["পড়তে পারি কিন্তু শুদ্ধ হয় না", "তাজবিদ জানি না", "শুদ্ধ কিনা শিওর না"] },
      { title: "অর্থ বুঝি না", items: ["ভালো পড়ি কিন্তু অর্থ বুঝি না", "নামাজে মনোযোগ থাকে না", "আগ্রহ হারিয়ে ফেলি"] },
    ],
    benefits: ["এক্সক্লুসিভ ভিডিও ক্লাস", "প্র্যাকটিস শিট ও অনুশীলন", "লাইভ প্রবলেম সলভিং সেশন", "সার্টিফিকেট অর্জনের সুযোগ"],
    whoIsFor: [
      "যারা একেবারেই কুরআন পড়তে পারেন না",
      "যারা পড়তে পারেন তবে শুদ্ধ হয় না",
      "যারা নামাজের সূরাগুলোর অর্থ বুঝতে চান",
      "যেকোনো বয়সের মানুষ — কোনো পূর্ব অভিজ্ঞতা লাগবে না",
    ],
    modules: [
      {
        title: "প্রাথমিক পাঠ",
        description: "যারা একেবারেই কুরআন পড়তে পারেন না, তাদের জন্য",
        lessons: ["কুরআন শিক্ষার গুরুত্ব ও প্রস্তুতি", "আরবী বর্ণমালা পরিচিতি", "মাখরাজ পরিচিতি ও প্রয়োগ", "হরকত ও তানবীন পরিচিতি", "সাকিন ও তাশদীদ পরিচিতি", "যুক্ত হরফ পরিচিতি", "ছোট ছোট শব্দের অনুশীলন", "বাক্য পঠন", "সূরা ফাতিহা দেখে দেখে তিলাওয়াত", "রিভিশন ও পুনরালোচনা"],
        duration: "১০ দিন",
      },
      {
        title: "বিশুদ্ধ পাঠ",
        description: "যারা কুরআন পড়তে জানেন তবে শুদ্ধ হয় না, তাদের জন্য",
        lessons: ["তাজভীদ পরিচিতি", "মাখরাজ ও সিফাতের প্রয়োগ", "মাদের বিবরণ", "নুন সাকিন ও তানবীন", "মীম সাকিন পরিচিতি", "লাম ও রা-এর বিশেষ নিয়ম", "ভারী ও হালকা হরফ", "ওয়াকফের বিবরণ", "ছোট সূরায় তাজবীদের প্রয়োগ", "রিভিশন ও পুনরালোচনা"],
        duration: "১০ দিন",
      },
      {
        title: "অনুধাবন পাঠ",
        description: "নামাযে বহুল পঠিত সূরাগুলোর অনুবাদ ও অনুধাবন",
        lessons: ["সূরা ফাতিহা", "সূরা দুহা", "সূরা ফীল", "সূরা কুরাইশ", "সূরা মাউন", "সূরা কাওসার", "সূরা কাফিরুন", "সূরা নাসর", "সূরা লাহাব", "সূরা নাস"],
        duration: "১০ দিন",
      },
    ],
  },
  {
    id: "2",
    title: "হাদিসের আলো — দৈনন্দিন জীবনে হাদিস",
    description: "দৈনন্দিন জীবনে প্রয়োজনীয় হাদিস শিখুন। নামাজ, রোজা, আচার-ব্যবহার, লেনদেন সম্পর্কিত গুরুত্বপূর্ণ হাদিস সমূহ।",
    categoryId: "islamic",
    categoryName: "ইসলামিক",
    thumbnail: courseHadith,
    price: 1499,
    duration: "২০ ঘণ্টা",
    lessonsCount: 20,
    studentsCount: 3250,
    rating: 4.8,
    instructor: "মাওলানা ইমাম উদ্দীন",
    instructorBio: "হাদিস বিশেষজ্ঞ ও ইসলামি স্কলার। বিভিন্ন মাদ্রাসা ও অনলাইনে হাদিস শিক্ষা দিয়ে আসছেন।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["নবীজি (সা.) এর দৈনন্দিন সুন্নাহ জানবেন", "নামাজ ও ইবাদতের সঠিক পদ্ধতি শিখবেন", "পারিবারিক ও সামাজিক আচরণের হাদিস জানবেন", "ব্যবসা ও লেনদেনের ইসলামি নিয়ম শিখবেন"],
    whoIsFor: ["যারা হাদিসের আলোকে জীবন পরিচালনা করতে চান", "সকল বয়সের মুসলিম ভাই-বোন", "ইসলামি জ্ঞান অর্জনে আগ্রহী সকলে"],
    problems: [
      { title: "হাদিস জানি না", items: ["কোন হাদিস সহীহ তা বুঝি না", "দৈনন্দিন সুন্নাহ জানি না", "হাদিসের উৎস জানি না"] },
      { title: "আমল করতে পারি না", items: ["জানি কিন্তু আমল করতে পারি না", "সঠিক পদ্ধতি জানি না", "মোটিভেশন পাই না"] },
      { title: "ভুল ধারণা আছে", items: ["জাল হাদিস চিনতে পারি না", "সঠিক ব্যাখ্যা জানি না", "বিভ্রান্তিতে পড়ি"] },
    ],
    benefits: ["সহীহ হাদিসের সংকলন", "দৈনন্দিন আমলের গাইড", "প্র্যাক্টিক্যাল উদাহরণ", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "হাদিস পরিচিতি", description: "হাদিসের মৌলিক ধারণা", lessons: ["হাদিস কী ও কেন গুরুত্বপূর্ণ", "হাদিসের প্রকারভেদ", "সহীহ হাদিস চেনার উপায়", "প্রসিদ্ধ হাদিস গ্রন্থ পরিচিতি"], duration: "৫ ঘণ্টা" },
      { title: "ইবাদতের হাদিস", description: "নামাজ, রোজা সম্পর্কিত হাদিস", lessons: ["নামাজের ফজিলত ও নিয়ম", "রোজার হাদিস", "যাকাত ও সদকার হাদিস", "হজ্বের হাদিস", "দোয়া ও যিকির"], duration: "৭ ঘণ্টা" },
      { title: "জীবনাচরণের হাদিস", description: "দৈনন্দিন জীবনের সুন্নাহ", lessons: ["খাবার ও পানীয়ের আদব", "পোশাক ও পরিচ্ছন্নতা", "ব্যবসা ও লেনদেন", "পারিবারিক জীবন", "সামাজিক আচরণ", "ভ্রমণ ও সফরের আদব"], duration: "৮ ঘণ্টা" },
    ],
  },
  {
    id: "3",
    title: "সীরাতুন্নবী — নবীজির জীবনী",
    description: "রাসূলুল্লাহ (সা.) এর জীবনী থেকে শিখুন — জন্ম থেকে ওফাত পর্যন্ত পূর্ণাঙ্গ সীরাত।",
    categoryId: "islamic",
    categoryName: "ইসলামিক",
    thumbnail: courseSirat,
    price: 999,
    duration: "১৫ ঘণ্টা",
    lessonsCount: 15,
    studentsCount: 2180,
    rating: 4.9,
    instructor: "মাওলানা জাহিদ হাসান",
    instructorBio: "অভিজ্ঞ ইসলামি ইতিহাসবিদ ও কুরআন শিক্ষক। ইসলামের ইতিহাস নিয়ে গভীর গবেষণা করেছেন।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["নবীজি (সা.) এর জীবনের গুরুত্বপূর্ণ ঘটনা জানবেন", "ইসলামের ইতিহাস বুঝবেন", "নবীজির আদর্শ থেকে শিক্ষা নেবেন", "সাহাবীদের জীবনী জানবেন"],
    whoIsFor: ["ইসলামের ইতিহাস জানতে আগ্রহী সকলে", "যারা নবীজির আদর্শ অনুসরণ করতে চান", "যেকোনো বয়সের মুসলিম"],
    problems: [
      { title: "ইতিহাস জানি না", items: ["নবীজির জীবনী সম্পর্কে ধারণা নেই", "ঘটনার ক্রম মনে থাকে না", "সঠিক তথ্য পাই না"] },
      { title: "শিক্ষা নিতে পারি না", items: ["ঘটনা জানি কিন্তু শিক্ষা বুঝি না", "বাস্তব জীবনে প্রয়োগ করতে পারি না", "অনুপ্রেরণা পাই না"] },
    ],
    benefits: ["পূর্ণাঙ্গ সীরাত কভারেজ", "সহজবোধ্য উপস্থাপনা", "ঐতিহাসিক প্রেক্ষাপট বিশ্লেষণ", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "জন্ম ও শৈশব", description: "নবীজির জন্ম থেকে নবুওয়াত পূর্ব জীবন", lessons: ["জন্মের পূর্বের আরব", "জন্ম ও শৈশবকাল", "যৌবনকাল ও বিয়ে", "নবুওয়াত প্রাপ্তি"], duration: "৪ ঘণ্টা" },
      { title: "মক্কী জীবন", description: "মক্কায় দাওয়াত ও সংগ্রাম", lessons: ["গোপন দাওয়াত", "প্রকাশ্য দাওয়াত", "কুরাইশদের বিরোধিতা", "তায়েফ সফর", "মিরাজ"], duration: "৫ ঘণ্টা" },
      { title: "মাদানী জীবন ও ওফাত", description: "হিজরত থেকে ওফাত", lessons: ["হিজরত", "মদিনা সনদ", "বদরের যুদ্ধ", "মক্কা বিজয়", "বিদায় হজ্ব", "ওফাত"], duration: "৬ ঘণ্টা" },
    ],
  },
  {
    id: "13",
    title: "ইসলামি ফিকহ — দৈনন্দিন মাসআলা",
    description: "নামাজ, রোজা, যাকাত, হজ্ব সহ দৈনন্দিন জীবনের বিভিন্ন মাসআলা-মাসায়েল সহজভাবে শিখুন।",
    categoryId: "islamic",
    categoryName: "ইসলামিক",
    thumbnail: courseFiqh,
    price: 1299,
    duration: "১৮ ঘণ্টা",
    lessonsCount: 18,
    studentsCount: 1890,
    rating: 4.7,
    instructor: "মাওলানা ইমাম উদ্দীন",
    instructorBio: "ফিকহ বিশেষজ্ঞ। দৈনন্দিন মাসআলা সহজ ভাষায় শেখানোর জন্য পরিচিত।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["নামাজের সকল মাসআলা জানবেন", "রোজা ও যাকাতের নিয়ম শিখবেন", "হালাল-হারামের বিধান বুঝবেন", "পারিবারিক আইন সম্পর্কে জানবেন"],
    whoIsFor: ["দৈনন্দিন মাসআলা জানতে আগ্রহী সকলে", "সঠিক ইসলামি জ্ঞান অর্জন করতে চান যারা", "নতুন মুসলিম বা ইসলাম শিখতে আগ্রহী"],
    problems: [
      { title: "মাসআলা জানি না", items: ["নামাজের সঠিক নিয়ম জানি না", "রোজার মাসআলা গুলিয়ে যায়", "যাকাতের হিসাব বুঝি না"] },
      { title: "বিভ্রান্তিতে আছি", items: ["কোনটা সঠিক মত বুঝি না", "ইন্টারনেটে ভিন্ন ভিন্ন মত পাই", "নির্ভরযোগ্য উৎস পাই না"] },
    ],
    benefits: ["সহজ ভাষায় মাসআলা", "দলিল-ভিত্তিক আলোচনা", "প্র্যাক্টিক্যাল উদাহরণ", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "তাহারাত ও নামাজ", description: "পবিত্রতা ও নামাজের বিধান", lessons: ["ওযু ও গোসলের নিয়ম", "তায়াম্মুমের বিধান", "নামাজের ফরজ ও ওয়াজিব", "বিভিন্ন নামাজের নিয়ম", "নামাজ ভঙ্গের কারণ", "সাহু সিজদা"], duration: "৬ ঘণ্টা" },
      { title: "রোজা ও যাকাত", description: "সিয়াম ও যাকাতের বিস্তারিত", lessons: ["রোজার ফরজ ও সুন্নাত", "রোজা ভাঙার কারণ", "ফিতরা ও কাফফারা", "যাকাতের নিসাব", "যাকাত বণ্টন"], duration: "৬ ঘণ্টা" },
      { title: "দৈনন্দিন মাসআলা", description: "জীবনের বিভিন্ন ক্ষেত্রের মাসআলা", lessons: ["খাদ্য ও পানীয়ের বিধান", "পোশাকের বিধান", "ব্যবসা ও লেনদেন", "বিবাহ ও পরিবার", "জানাযা ও দাফন", "ভ্রমণের মাসআলা", "সমসাময়িক মাসআলা"], duration: "৬ ঘণ্টা" },
    ],
  },

  // ===== একাডেমিক কোর্স =====
  {
    id: "9",
    title: "HSC পদার্থবিজ্ঞান সম্পূর্ণ কোর্স",
    description: "HSC পদার্থবিজ্ঞান ১ম ও ২য় পত্র সম্পূর্ণ সিলেবাস — তত্ত্ব, গাণিতিক সমস্যা এবং বোর্ড প্রশ্ন সমাধান।",
    categoryId: "academic",
    categoryName: "একাডেমিক",
    thumbnail: coursePhysics,
    price: 2499,
    duration: "৪০ ঘণ্টা",
    lessonsCount: 40,
    studentsCount: 4520,
    rating: 4.8,
    instructor: "প্রফেসর আনিসুর রহমান",
    instructorBio: "অভিজ্ঞ শিক্ষক ও পরীক্ষা বিশেষজ্ঞ। বছরের পর বছর শিক্ষার্থীদের সাফল্যের পথ দেখিয়েছেন।",
    benefits: ["বিষয়ভিত্তিক ভিডিও ক্লাস", "বোর্ড প্রশ্ন সমাধান", "মডেল টেস্ট ও প্র্যাক্টিস", "সার্টিফিকেট অর্জনের সুযোগ"],
    level: "মধ্যবর্তী",
    whatYouLearn: ["পদার্থবিজ্ঞানের মৌলিক ধারণা স্পষ্ট হবে", "গাণিতিক সমস্যা সমাধান করতে পারবেন", "বোর্ড পরীক্ষায় A+ পেতে প্রস্তুত হবেন", "CQ ও MCQ উভয় প্রশ্নে দক্ষ হবেন"],
    whoIsFor: ["HSC পরীক্ষার্থী", "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার্থী", "বিজ্ঞান বিভাগের শিক্ষার্থী"],
    problems: [
      { title: "পদার্থবিজ্ঞান কঠিন", items: ["সূত্র মনে থাকে না", "গাণিতিক সমস্যা পারি না", "কনসেপ্ট ক্লিয়ার হয় না"] },
      { title: "পরীক্ষায় খারাপ", items: ["CQ তে নম্বর কম আসে", "MCQ তে ভুল হয়", "সময়ে শেষ করতে পারি না"] },
    ],
    modules: [
      { title: "যান্ত্রবিদ্যা", description: "বল, গতি ও শক্তি", lessons: ["ভেক্টর ও স্কেলার", "নিউটনের গতিসূত্র", "কাজ, শক্তি ও ক্ষমতা", "মহাকর্ষ", "সরল ছন্দিত গতি", "তরল পদার্থ"], duration: "১২ ঘণ্টা" },
      { title: "তাপ ও আলো", description: "তাপগতিবিদ্যা ও আলোকবিদ্যা", lessons: ["তাপমাত্রা ও তাপ", "গ্যাসের ধর্ম", "তাপগতিবিদ্যা", "আলোর প্রতিফলন", "আলোর প্রতিসরণ", "আলোর বিচ্ছুরণ"], duration: "১৪ ঘণ্টা" },
      { title: "তড়িৎ ও আধুনিক পদার্থবিদ্যা", description: "তড়িৎ, চুম্বক ও আধুনিক পদার্থবিদ্যা", lessons: ["স্থির তড়িৎ", "চলতড়িৎ", "চুম্বকত্ব", "তড়িৎচুম্বকীয় আবেশ", "পরমাণু মডেল", "নিউক্লিয়ার পদার্থবিদ্যা", "সেমিকন্ডাক্টর", "বোর্ড প্রশ্ন সমাধান"], duration: "১৪ ঘণ্টা" },
    ],
  },
  {
    id: "10",
    title: "SSC গণিত — A+ গ্যারান্টি",
    description: "SSC গণিতের সম্পূর্ণ সিলেবাস — বীজগণিত, জ্যামিতি, পরিসংখ্যান সব বিষয়ে গভীর আলোচনা ও প্র্যাক্টিস।",
    categoryId: "academic",
    categoryName: "একাডেমিক",
    thumbnail: courseMath,
    price: 1999,
    duration: "৩৫ ঘণ্টা",
    lessonsCount: 35,
    studentsCount: 5680,
    rating: 4.7,
    instructor: "জাহিদুল ইসলাম",
    instructorBio: "গণিত বিশেষজ্ঞ। সহজ পদ্ধতিতে গণিত শেখানোর জন্য পরিচিত।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["বীজগণিতের সকল অধ্যায় আয়ত্ত করবেন", "জ্যামিতির প্রমাণ ও সমস্যা সমাধান শিখবেন", "পরিসংখ্যান ও সম্ভাবনা বুঝবেন", "বোর্ড পরীক্ষার জন্য সম্পূর্ণ প্রস্তুত হবেন"],
    whoIsFor: ["SSC পরীক্ষার্থী", "গণিতে দুর্বল যারা", "A+ লক্ষ্য যাদের"],
    problems: [
      { title: "গণিত কঠিন লাগে", items: ["সূত্র মনে থাকে না", "সমস্যা দেখলে ভয় পাই", "কোথা থেকে শুরু করবো বুঝি না"] },
      { title: "পরীক্ষায় ভালো হয় না", items: ["সময়ে শেষ করতে পারি না", "CQ তে নম্বর কম আসে", "MCQ তে কনফিউজড হই"] },
    ],
    benefits: ["অধ্যায়ভিত্তিক সমাধান", "বোর্ড প্রশ্ন বিশ্লেষণ", "মডেল টেস্ট", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "বীজগণিত", description: "সকল বীজগণিত অধ্যায়", lessons: ["সেট ও ফাংশন", "বীজগণিতীয় রাশি", "সূচক ও লগারিদম", "একচলবিশিষ্ট সমীকরণ", "অসমতা"], duration: "১২ ঘণ্টা" },
      { title: "জ্যামিতি", description: "সকল জ্যামিতি অধ্যায়", lessons: ["রেখা, কোণ ও ত্রিভুজ", "চতুর্ভুজ", "বৃত্ত", "ক্ষেত্রফল ও আয়তন", "স্থানাংক জ্যামিতি"], duration: "১২ ঘণ্টা" },
      { title: "পরিমিতি ও পরিসংখ্যান", description: "পরিমিতি ও পরিসংখ্যান", lessons: ["পরিমিতি", "ত্রিকোণমিতি", "পরিসংখ্যান", "সম্ভাবনা", "মডেল টেস্ট ও রিভিউ"], duration: "১১ ঘণ্টা" },
    ],
  },
  {
    id: "11",
    title: "বিশ্ববিদ্যালয় ভর্তি — ইংরেজি",
    description: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য সম্পূর্ণ ইংরেজি প্রস্তুতি — Grammar, Vocabulary, Comprehension।",
    categoryId: "academic",
    categoryName: "একাডেমিক",
    thumbnail: courseEnglish,
    price: 2999,
    duration: "২৫ ঘণ্টা",
    lessonsCount: 25,
    studentsCount: 3420,
    rating: 4.6,
    instructor: "শাহানা পারভীন",
    instructorBio: "ইংরেজি বিশেষজ্ঞ ও ভর্তি কোচ। হাজার হাজার শিক্ষার্থীকে বিশ্ববিদ্যালয়ে ভর্তি করিয়েছেন।",
    level: "উন্নত",
    whatYouLearn: ["English Grammar সম্পূর্ণ আয়ত্ত করবেন", "Vocabulary দ্রুত বাড়াবেন", "Reading Comprehension দক্ষতা অর্জন করবেন", "ভর্তি পরীক্ষার প্রশ্ন প্যাটার্ন বুঝবেন"],
    whoIsFor: ["বিশ্ববিদ্যালয় ভর্তিচ্ছু শিক্ষার্থী", "ইংরেজিতে দুর্বল যারা", "HSC পাস করা শিক্ষার্থী"],
    problems: [
      { title: "Grammar দুর্বল", items: ["Tense গুলিয়ে যায়", "Sentence Structure বুঝি না", "Parts of Speech চিনতে পারি না"] },
      { title: "Vocabulary কম", items: ["শব্দার্থ মনে থাকে না", "Synonym/Antonym পারি না", "Contextual meaning বুঝি না"] },
      { title: "Comprehension কঠিন", items: ["Passage পড়ে উত্তর দিতে পারি না", "সময়ে শেষ হয় না", "Inference করতে পারি না"] },
    ],
    benefits: ["ভর্তি পরীক্ষা ফোকাসড", "প্র্যাক্টিস টেস্ট", "শর্টকাট টেকনিক", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "Grammar Mastery", description: "সম্পূর্ণ English Grammar", lessons: ["Tense & Voice", "Narration", "Preposition & Conjunction", "Clause & Phrase", "Transformation", "Correction"], duration: "১০ ঘণ্টা" },
      { title: "Vocabulary Building", description: "শব্দভাণ্ডার সমৃদ্ধকরণ", lessons: ["Root Word Method", "Synonym & Antonym", "Analogy", "One Word Substitution", "Idioms & Phrases"], duration: "৮ ঘণ্টা" },
      { title: "Comprehension & Practice", description: "পঠন দক্ষতা ও অনুশীলন", lessons: ["Reading Comprehension", "Cloze Test", "Paragraph Writing", "Model Test 1", "Model Test 2", "Final Revision"], duration: "৭ ঘণ্টা" },
    ],
  },
  {
    id: "12",
    title: "HSC রসায়ন — সহজ পদ্ধতিতে",
    description: "HSC রসায়ন ১ম ও ২য় পত্র — জৈব রসায়ন, অজৈব রসায়ন, ভৌত রসায়ন সম্পূর্ণ কোর্স।",
    categoryId: "academic",
    categoryName: "একাডেমিক",
    thumbnail: courseChemistry,
    price: 2499,
    duration: "৩৮ ঘণ্টা",
    lessonsCount: 38,
    studentsCount: 2980,
    rating: 4.8,
    instructor: "ড. শফিকুল ইসলাম",
    instructorBio: "রসায়ন বিভাগের প্রবীণ অধ্যাপক। জটিল বিষয় সহজ করে শেখানোর দক্ষতায় সুপরিচিত।",
    level: "মধ্যবর্তী",
    whatYouLearn: ["রাসায়নিক বিক্রিয়া বুঝবেন", "জৈব যৌগের নামকরণ শিখবেন", "গাণিতিক সমস্যা সমাধান করবেন", "ল্যাব ওয়ার্ক ও ব্যবহারিক জ্ঞান অর্জন করবেন"],
    whoIsFor: ["HSC বিজ্ঞান বিভাগের শিক্ষার্থী", "মেডিকেল/ইঞ্জিনিয়ারিং ভর্তি প্রত্যাশী"],
    problems: [
      { title: "রসায়ন কঠিন", items: ["সমীকরণ মেলাতে পারি না", "জৈব রসায়ন বুঝি না", "গাণিতিক সমস্যা পারি না"] },
      { title: "মুখস্থ থাকে না", items: ["পর্যায় সারণি মনে রাখতে পারি না", "সূত্র ভুলে যাই", "বিক্রিয়া মনে থাকে না"] },
    ],
    benefits: ["অধ্যায়ভিত্তিক ভিডিও ক্লাস", "গাণিতিক সমাধান", "বোর্ড প্রশ্ন বিশ্লেষণ", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "ভৌত রসায়ন", description: "পরমাণু গঠন, রাসায়নিক বন্ধন", lessons: ["পরমাণু মডেল", "ইলেকট্রন বিন্যাস", "রাসায়নিক বন্ধন", "গ্যাসের ধর্ম", "তাপ রসায়ন", "রাসায়নিক সাম্যাবস্থা"], duration: "১৩ ঘণ্টা" },
      { title: "অজৈব রসায়ন", description: "মৌলিক ও যৌগের ধর্ম", lessons: ["পর্যায় সারণি", "s-block মৌল", "p-block মৌল", "d-block মৌল", "সমন্বয় যৌগ"], duration: "১২ ঘণ্টা" },
      { title: "জৈব রসায়ন", description: "জৈব যৌগের রসায়ন", lessons: ["জৈব রসায়নের ভূমিকা", "হাইড্রোকার্বন", "অ্যালকোহল ও ইথার", "অ্যালডিহাইড ও কিটোন", "কার্বক্সিলিক এসিড", "পলিমার", "বোর্ড প্রশ্ন সমাধান"], duration: "১৩ ঘণ্টা" },
    ],
  },

  // ===== স্কিল্ড কোর্স =====
  {
    id: "4",
    title: "রিয়্যাক্ট মাস্টারক্লাস",
    description: "React, hooks, context এবং আরও অনেক কিছু দিয়ে আধুনিক ওয়েব অ্যাপ তৈরি করুন। কম্পোনেন্ট আর্কিটেকচার এবং স্টেট ম্যানেজমেন্ট শিখুন।",
    categoryId: "skill",
    categoryName: "স্কিল্ড",
    thumbnail: courseReact,
    price: 4999,
    duration: "১২ ঘণ্টা ৩০ মি.",
    lessonsCount: 24,
    studentsCount: 1247,
    rating: 4.8,
    instructor: "Amar Talim",
    instructorBio: "অভিজ্ঞ সফটওয়্যার ইঞ্জিনিয়ার এবং প্রশিক্ষক। ১০+ বছরের ইন্ডাস্ট্রি অভিজ্ঞতা।",
    benefits: ["হ্যান্ডস-অন প্রজেক্ট", "কোড রিভিউ সেশন", "ইন্ডাস্ট্রি বেস্ট প্র্যাক্টিস", "সার্টিফিকেট অর্জনের সুযোগ"],
    level: "মধ্যবর্তী",
    whatYouLearn: ["React কম্পোনেন্ট আর্কিটেকচার শিখবেন", "হুকস ও স্টেট ম্যানেজমেন্ট আয়ত্ত করবেন", "রিয়েল-ওয়ার্ল্ড প্রজেক্ট তৈরি করবেন", "ইন্ডাস্ট্রি বেস্ট প্র্যাক্টিস জানবেন"],
    whoIsFor: ["ওয়েব ডেভেলপমেন্ট শিখতে আগ্রহী", "JavaScript বেসিক জানেন যারা", "ফ্রিল্যান্সিং বা চাকরি করতে চান যারা"],
    problems: [
      { title: "কোডিং পারি না", items: ["কোথা থেকে শুরু করবো বুঝি না", "টিউটোরিয়াল দেখে শিখতে পারি না", "প্রজেক্ট করতে গেলে আটকে যাই"] },
      { title: "চাকরি পাচ্ছি না", items: ["পোর্টফোলিও নেই", "ইন্টারভিউতে ফেইল করি", "রিয়েল প্রজেক্ট অভিজ্ঞতা নেই"] },
    ],
    modules: [
      { title: "React Fundamentals", description: "React এর মৌলিক ধারণা", lessons: ["React পরিচিতি ও সেটআপ", "JSX ও কম্পোনেন্ট", "Props ও State", "Event Handling", "Conditional Rendering", "Lists ও Keys"], duration: "৪ ঘণ্টা" },
      { title: "Advanced React", description: "অ্যাডভান্সড কনসেপ্ট", lessons: ["Hooks (useState, useEffect)", "Custom Hooks", "Context API", "useReducer", "Performance Optimization", "Error Boundaries"], duration: "৪ ঘণ্টা" },
      { title: "Real Projects", description: "বাস্তব প্রজেক্ট তৈরি", lessons: ["Todo App", "E-commerce Dashboard", "Blog Application", "API Integration", "Authentication", "Deployment"], duration: "৪ ঘণ্টা ৩০ মি." },
    ],
  },
  {
    id: "5",
    title: "ডেটা সায়েন্সের জন্য পাইথন",
    description: "pandas, numpy, matplotlib এবং scikit-learn দিয়ে বাস্তব-জীবনের ডেটা বিশ্লেষণ প্রকল্পে পাইথন আয়ত্ত করুন।",
    categoryId: "skill",
    categoryName: "স্কিল্ড",
    thumbnail: coursePython,
    price: 5999,
    duration: "১৮ ঘণ্টা ১৫ মি.",
    lessonsCount: 32,
    studentsCount: 2103,
    rating: 4.9,
    instructor: "Amar Talim",
    instructorBio: "অভিজ্ঞ ডেটা সায়েন্টিস্ট ও প্রশিক্ষক। বড় বড় কোম্পানিতে ডেটা বিশ্লেষণের অভিজ্ঞতা।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["পাইথন প্রোগ্রামিং বেসিক থেকে অ্যাডভান্সড", "Pandas ও NumPy দিয়ে ডেটা ম্যানিপুলেশন", "ডেটা ভিজুয়ালাইজেশন শিখবেন", "মেশিন লার্নিং এর ভূমিকা"],
    whoIsFor: ["ডেটা সায়েন্সে ক্যারিয়ার গড়তে চান", "প্রোগ্রামিং শিখতে আগ্রহী", "বিশ্লেষণাত্মক চিন্তা করতে পছন্দ করেন"],
    problems: [
      { title: "প্রোগ্রামিং পারি না", items: ["কোড লিখতে ভয় পাই", "লজিক বুঝতে পারি না", "Error দেখলে হতাশ হই"] },
      { title: "ডেটা বুঝি না", items: ["ডেটা কিভাবে বিশ্লেষণ করবো জানি না", "চার্ট বানাতে পারি না", "ML কঠিন মনে হয়"] },
    ],
    benefits: ["প্র্যাক্টিক্যাল প্রজেক্ট", "ডেটাসেট সরবরাহ", "জব সাপোর্ট", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "Python Basics", description: "পাইথনের মৌলিক ধারণা", lessons: ["Python Setup & Syntax", "Variables & Data Types", "Control Flow", "Functions", "OOP Basics", "File Handling"], duration: "৬ ঘণ্টা" },
      { title: "Data Analysis", description: "ডেটা বিশ্লেষণ", lessons: ["NumPy Fundamentals", "Pandas DataFrames", "Data Cleaning", "Data Manipulation", "Exploratory Data Analysis"], duration: "৬ ঘণ্টা" },
      { title: "Visualization & ML", description: "ভিজুয়ালাইজেশন ও মেশিন লার্নিং", lessons: ["Matplotlib Basics", "Seaborn Advanced Charts", "ML Introduction", "Linear Regression", "Classification", "Project: Real Dataset Analysis"], duration: "৬ ঘণ্টা ১৫ মি." },
    ],
  },
  {
    id: "7",
    title: "গ্রাফিক ডিজাইন মাস্টারক্লাস",
    description: "Adobe Photoshop, Illustrator এবং Canva দিয়ে প্রফেশনাল গ্রাফিক ডিজাইন শিখুন। লোগো, ব্যানার, সোশ্যাল মিডিয়া পোস্ট তৈরি করুন।",
    categoryId: "skill",
    categoryName: "স্কিল্ড",
    thumbnail: courseDesign,
    price: 3499,
    duration: "১৫ ঘণ্টা",
    lessonsCount: 22,
    studentsCount: 1856,
    rating: 4.7,
    instructor: "মাহমুদ হাসান",
    instructorBio: "প্রফেশনাল গ্রাফিক ডিজাইনার। ৮+ বছর ফ্রিল্যান্সিং এবং ট্রেইনিং অভিজ্ঞতা।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["Photoshop এর টুলস ও টেকনিক আয়ত্ত করবেন", "প্রফেশনাল লোগো ডিজাইন করবেন", "সোশ্যাল মিডিয়া কন্টেন্ট তৈরি করবেন", "ফ্রিল্যান্সিং এর জন্য পোর্টফোলিও তৈরি করবেন"],
    whoIsFor: ["গ্রাফিক ডিজাইনে আগ্রহী", "ফ্রিল্যান্সিং শুরু করতে চান", "নিজের ব্যবসার জন্য ডিজাইন করতে চান"],
    problems: [
      { title: "ডিজাইন পারি না", items: ["টুলস ব্যবহার জানি না", "ক্রিয়েটিভ আইডিয়া আসে না", "কালার কম্বিনেশন বুঝি না"] },
      { title: "ইনকাম হচ্ছে না", items: ["ক্লায়েন্ট পাচ্ছি না", "পোর্টফোলিও নেই", "প্রাইসিং বুঝি না"] },
    ],
    benefits: ["প্র্যাক্টিক্যাল প্রজেক্ট", "ডিজাইন রিসোর্স ফ্রি", "ফ্রিল্যান্সিং গাইড", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "Photoshop Mastery", description: "ফটোশপ শিখুন", lessons: ["Interface পরিচিতি", "Selection Tools", "Layer Management", "Photo Editing", "Text Effects", "Banner Design"], duration: "৫ ঘণ্টা" },
      { title: "Illustrator & Logo", description: "লোগো ও ভেক্টর ডিজাইন", lessons: ["Illustrator Basics", "Shape Building", "Logo Design Process", "Typography", "Brand Identity"], duration: "৫ ঘণ্টা" },
      { title: "Social Media & Portfolio", description: "সোশ্যাল মিডিয়া ও পোর্টফোলিও", lessons: ["Social Media Post Design", "Story & Reel Templates", "Canva Masterclass", "Portfolio Building", "Freelancing Tips", "Client Management"], duration: "৫ ঘণ্টা" },
    ],
  },
  {
    id: "8",
    title: "ডিজিটাল মার্কেটিং A-Z",
    description: "SEO, SEM, Social Media Marketing, Email Marketing — ডিজিটাল মার্কেটিং এর সম্পূর্ণ গাইড।",
    categoryId: "skill",
    categoryName: "স্কিল্ড",
    thumbnail: courseMarketing,
    price: 3999,
    duration: "২০ ঘণ্টা",
    lessonsCount: 28,
    studentsCount: 2340,
    rating: 4.6,
    instructor: "শাহরিয়ার আলম",
    instructorBio: "ডিজিটাল মার্কেটিং এক্সপার্ট। জাতীয় ও আন্তর্জাতিক ক্লায়েন্টদের সাথে কাজের অভিজ্ঞতা।",
    level: "শিক্ষানবিস",
    whatYouLearn: ["SEO এর মাধ্যমে ওয়েবসাইট র্যাংক করবেন", "Facebook ও Google Ads চালাবেন", "Email Marketing ক্যাম্পেইন তৈরি করবেন", "Content Strategy তৈরি করবেন"],
    whoIsFor: ["ডিজিটাল মার্কেটিংয়ে ক্যারিয়ার গড়তে চান", "নিজের ব্যবসা প্রমোট করতে চান", "অনলাইনে ইনকাম করতে আগ্রহী"],
    problems: [
      { title: "মার্কেটিং বুঝি না", items: ["কোথা থেকে শুরু করবো জানি না", "SEO কী তা বুঝি না", "Ads চালাতে পারি না"] },
      { title: "রেজাল্ট আসছে না", items: ["ওয়েবসাইটে ট্রাফিক আসে না", "সোশ্যাল মিডিয়ায় রিচ কম", "বিক্রি বাড়ছে না"] },
    ],
    benefits: ["লাইভ ক্যাম্পেইন ডেমো", "টুলস ও রিসোর্স", "কেস স্টাডি বিশ্লেষণ", "সার্টিফিকেট অর্জনের সুযোগ"],
    modules: [
      { title: "SEO & Content", description: "সার্চ ইঞ্জিন অপ্টিমাইজেশন", lessons: ["SEO Fundamentals", "Keyword Research", "On-Page SEO", "Off-Page SEO", "Content Marketing", "Blog Writing"], duration: "৭ ঘণ্টা" },
      { title: "Social Media Marketing", description: "সোশ্যাল মিডিয়া মার্কেটিং", lessons: ["Facebook Marketing", "Instagram Growth", "YouTube Marketing", "LinkedIn for Business", "Social Media Strategy"], duration: "৭ ঘণ্টা" },
      { title: "Paid Ads & Analytics", description: "পেইড অ্যাডভার্টাইজিং", lessons: ["Facebook Ads Manager", "Google Ads", "Email Marketing", "Funnel Building", "Analytics & Reporting", "Campaign Optimization", "Final Project"], duration: "৬ ঘণ্টা" },
    ],
  },
];

export const lessons: Lesson[] = [
  // কুরআন কোর্স লেসন
  { id: "l1", courseId: "1", title: "কুরআন শিক্ষার গুরুত্ব ও প্রস্তুতি", description: "কেন কুরআন শিখবেন এবং কিভাবে প্রস্তুত হবেন", youtubeId: "dQw4w9WgXcQ", duration: "১২:৩০", order: 1 },
  { id: "l2", courseId: "1", title: "আরবী বর্ণমালা পরিচিতি", description: "আলিফ থেকে ইয়া পর্যন্ত সকল বর্ণ", youtubeId: "dQw4w9WgXcQ", duration: "১৮:৪৫", order: 2 },
  { id: "l3", courseId: "1", title: "মাখরাজ পরিচিতি ও প্রয়োগ", description: "সঠিক উচ্চারণের জন্য মাখরাজ শেখা", youtubeId: "dQw4w9WgXcQ", duration: "২২:১০", order: 3 },
  { id: "l4", courseId: "1", title: "হরকত ও তানবীন পরিচিতি", description: "যবর, যের, পেশ এবং তানবীন শেখা", youtubeId: "dQw4w9WgXcQ", duration: "২৫:০০", order: 4 },
  { id: "l5", courseId: "1", title: "সাকিন ও তাশদীদ পরিচিতি", description: "সাকিন ও তাশদীদের নিয়ম ও প্রয়োগ", youtubeId: "dQw4w9WgXcQ", duration: "১৫:৩০", order: 5 },
  // রিয়্যাক্ট কোর্স লেসন
  { id: "l6", courseId: "4", title: "রিয়্যাক্ট পরিচিতি", description: "রিয়্যাক্ট কী এবং কেন ব্যবহার করবেন?", youtubeId: "dQw4w9WgXcQ", duration: "২০:০০", order: 1 },
  { id: "l7", courseId: "4", title: "JSX এবং কম্পোনেন্ট", description: "JSX সিনট্যাক্স ও কম্পোনেন্ট তৈরি", youtubeId: "dQw4w9WgXcQ", duration: "২৮:১৫", order: 2 },
  // পাইথন কোর্স লেসন
  { id: "l8", courseId: "5", title: "পাইথন বেসিক", description: "ভেরিয়েবল, ডেটা টাইপ এবং কন্ট্রোল ফ্লো", youtubeId: "dQw4w9WgXcQ", duration: "২০:০০", order: 1 },
  { id: "l9", courseId: "5", title: "Pandas দিয়ে কাজ", description: "DataFrames, series, এবং ডেটা ম্যানিপুলেশন", youtubeId: "dQw4w9WgXcQ", duration: "২৮:১৫", order: 2 },
];

export const quizQuestions: QuizQuestion[] = [
  { id: "q1", lessonId: "l1", question: "কুরআনের মোট সূরা কতটি?", options: ["১০০", "১১০", "১১৪", "১২০"], correctAnswer: 2 },
  { id: "q2", lessonId: "l1", question: "কুরআনের প্রথম সূরার নাম কী?", options: ["সূরা বাকারা", "সূরা ফাতিহা", "সূরা নাস", "সূরা ইখলাস"], correctAnswer: 1 },
  { id: "q3", lessonId: "l2", question: "আরবি বর্ণমালায় মোট কতটি হরফ আছে?", options: ["২৬", "২৮", "২৯", "৩০"], correctAnswer: 2 },
  { id: "q4", lessonId: "l6", question: "রিয়্যাক্ট কী?", options: ["একটি ডেটাবেস", "UI তৈরির জন্য একটি জাভাস্ক্রিপ্ট লাইব্রেরি", "একটি CSS ফ্রেমওয়ার্ক", "একটি সার্ভার ভাষা"], correctAnswer: 1 },
  { id: "q5", lessonId: "l6", question: "রিয়্যাক্ট কে তৈরি করেছে?", options: ["গুগল", "ফেসবুক (মেটা)", "মাইক্রোসফট", "অ্যাপল"], correctAnswer: 1 },
];

export const enrollments: Enrollment[] = [
  { courseId: "1", progress: 60, completedLessons: ["l1", "l2", "l3"], enrolledAt: "2024-01-15" },
  { courseId: "5", progress: 25, completedLessons: ["l8"], enrolledAt: "2024-02-10" },
];

export const quizAttempts: QuizAttempt[] = [
  { lessonId: "l1", courseId: "1", score: 2, total: 2, passed: true, attemptedAt: "2024-01-20" },
  { lessonId: "l2", courseId: "1", score: 1, total: 1, passed: true, attemptedAt: "2024-01-25" },
];

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  completedCourses: number;
  status: "active" | "inactive";
  joinedAt: string;
}

export const mockStudents: Student[] = [
  { id: "s1", name: "রহিম উদ্দিন", email: "rahim@example.com", enrolledCourses: ["1", "4", "9"], completedCourses: 1, status: "active", joinedAt: "২০২৪-০১-১৫" },
  { id: "s2", name: "কামাল হোসেন", email: "kamal@example.com", enrolledCourses: ["1", "7"], completedCourses: 0, status: "active", joinedAt: "২০২৪-০২-০১" },
  { id: "s3", name: "সাদিয়া আক্তার", email: "sadia@example.com", enrolledCourses: ["1", "2", "10"], completedCourses: 2, status: "active", joinedAt: "২০২৪-০১-২০" },
  { id: "s4", name: "তানভীর রহমান", email: "tanvir@example.com", enrolledCourses: ["5"], completedCourses: 1, status: "active", joinedAt: "২০২৪-০২-১০" },
  { id: "s5", name: "নুসরাত জাহান", email: "nusrat@example.com", enrolledCourses: ["1", "9"], completedCourses: 0, status: "active", joinedAt: "২০২৪-০৩-০১" },
  { id: "s6", name: "আরিফ ইসলাম", email: "arif@example.com", enrolledCourses: ["7"], completedCourses: 1, status: "inactive", joinedAt: "২০২৪-০১-০৫" },
  { id: "s7", name: "ফাতেমা বেগম", email: "fatema@example.com", enrolledCourses: ["1", "8"], completedCourses: 0, status: "active", joinedAt: "২০২৪-০৩-১৫" },
  { id: "s8", name: "মাহমুদ হাসান", email: "mahmud@example.com", enrolledCourses: ["4", "5", "7", "10"], completedCourses: 3, status: "active", joinedAt: "২০২৪-০১-১০" },
];

export const mockUser = {
  id: "user-1",
  name: "রহিম উদ্দিন",
  email: "rahim@example.com",
  avatar: "",
  role: "student" as const,
};

export const mockAdmin = {
  id: "admin-1",
  name: "Amar Talim",
  email: "admin@amartalim.com",
  avatar: "",
  role: "admin" as const,
};

export const mockInstructor = {
  id: "instructor-1",
  name: "মুফতি আব্দুল্লাহ",
  email: "instructor@amartalim.com",
  avatar: "",
  role: "instructor" as const,
  bio: "১৫+ বছরের শিক্ষকতার অভিজ্ঞতা। ইসলামিক স্টাডিজ ও আরবি ভাষায় বিশেষজ্ঞ।",
  totalStudents: 1250,
  totalCourses: 4,
  totalEarnings: 125000,
};
