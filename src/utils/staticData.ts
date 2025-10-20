// Static data exports to avoid Turbopack HMR issues
// Data is loaded from JSON files at build time

const projectsData = [
  {
    id: "1",
    Title: "Kalkulator Matematika - Bangun Datar & Ruang",
    Description:
      "Aplikasi web kalkulator matematika yang membantu menghitung luas dan keliling berbagai bangun datar serta volume bangun ruang. Dilengkapi dengan antarmuka yang user-friendly dan hasil perhitungan yang akurat untuk mendukung pembelajaran matematika.",
    Img: "/project/web-kalkulator.png",
    Demo: "https://kalkulator-matematika-klp4-l477-f3p57m6op.vercel.app/",
    Github: "https://github.com/SIRxRIS/Kalkulator-Matematika-klp4",
    TechStack: ["Next.js", "Node.js", "Tailwind CSS"],
    Features: [
      "Kalkulator luas bangun datar (persegi, persegi panjang, segitiga, lingkaran, dll)",
      "Kalkulator keliling bangun datar dengan rumus yang tepat",
      "Kalkulator volume bangun ruang (kubus, balok, tabung, kerucut, bola)",
      "Hasil perhitungan real-time saat input dimasukkan",
      "Panduan rumus matematika untuk setiap bangun",
    ],
  },
  {
    id: "DwNZnp62igoW0sswU7J4",
    Title: "Masjid Jawahiruzzarqa Web",
    Description:
      "Website resmi Masjid Jawahiruzzarqa yang menyediakan informasi lengkap tentang masjid, jadwal salat, kegiatan rutin, dan fasilitas. Dibangun dengan teknologi modern untuk memberikan pengalaman pengguna yang optimal.",
    Img: "/project/web-masjid-jawahiruzzarqa.png",
    Demo: "#",
    Github: "#",
    TechStack: ["React", "Node.js", "Tailwind CSS", "Firebase"],
    Features: [
      "Informasi lengkap tentang Masjid Jawahiruzzarqa",
      "Jadwal salat yang akurat dan terupdate",
      "Daftar kegiatan dan acara rutin masjid",
      "Galeri foto kegiatan masjid",
      "Sistem informasi berbasis website yang responsif",
    ],
  },
];

const certificatesData = [
  {
    id: "1",
    title: "Top 15 Teams Capstone Project",
    issuer: "Coding Camp 2025 - SMK",
    year: "2025",
    category: "Achievement",
    description:
      "Berhasil masuk dalam 15 tim terbaik dalam proyek capstone Coding Camp 2025",
    img: "/sertifikat/[Coding Camp 2025 - SMK] Best Capstone Project - FS079D5Y0137.pdf",
    type: "pdf",
  },
  {
    id: "2",
    title: "Coding Camp powered by DBS Foundation",
    issuer: "DBS Foundation",
    year: "2025",
    category: "Bootcamp",
    description:
      "Sertifikat completion untuk program Coding Camp yang berfokus pada Front-End dan Back-End Developer",
    img: "/sertifikat/[Coding Camp 2025] Certificate - FS079D5Y0137.pdf",
    type: "pdf",
  },
  {
    id: "3",
    title: "Belajar Back-End Pemula dengan JavaScript",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Menguasai konsep dasar back-end development menggunakan JavaScript dan Node.js",
    img: "/sertifikat/backend-pemula.pdf",
    type: "pdf",
  },
  {
    id: "4",
    title: "Belajar Dasar Git dengan GitHub",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Memahami konsep version control menggunakan Git dan GitHub untuk kolaborasi proyek",
    img: "/sertifikat/sertifikat_belajar-dasar-git-dengan-github.pdf",
    type: "pdf",
  },
  {
    id: "5",
    title: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Menguasai fundamental JavaScript termasuk sintaks, struktur data, dan konsep pemrograman",
    img: "/sertifikat/sertifikat_dicoding-javascript-baru.pdf",
    type: "pdf",
  },
  {
    id: "6",
    title: "Belajar Membuat Front-End Web untuk Pemula",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Mempelajari pengembangan front-end web menggunakan HTML, CSS, dan JavaScript",
    img: "/sertifikat/sertifikat_front-end_pemula.pdf",
    type: "pdf",
  },
  {
    id: "7",
    title: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Memahami konsep dasar pemrograman dan mindset seorang pengembang software",
    img: "/sertifikat/sertifikat_memulai_dasar_pemrograman_untuk_menjadi_pengembang_software.pdf",
    type: "pdf",
  },
  {
    id: "8",
    title: "Pengenalan ke Logika Pemrograman (Programming Logic 101)",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Mempelajari dasar-dasar logika pemrograman dan algoritma untuk problem solving",
    img: "/sertifikat/sertifikat_pengenalan_ke_logika_pemrograman.pdf",
    type: "pdf",
  },
  {
    id: "9",
    title: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Memahami konsep dasar pengembangan web dan teknologi web modern",
    img: "/sertifikat/sertifikat-dasar-pemrograman-web-baru.pdf",
    type: "pdf",
  },
  {
    id: "10",
    title: "Belajar Fundamental Front-End Web Development",
    issuer: "Dicoding Indonesia",
    year: "2025",
    category: "Course",
    description:
      "Menguasai fundamental front-end development dengan teknik dan tools modern",
    img: "/sertifikat/sertifikat-frontend-web-development.pdf",
    type: "pdf",
  },
];

export { projectsData, certificatesData };
