"use client";

import { useState, useEffect, useMemo } from "react";
// import pengumumanPdf from "../assets/file/pengumuman_mitra.pdf";

const PESERTA_LULUS = [
  { id: "150723110014", nama: "Kurnia Alfajar" },
  { id: "150722100181", nama: "Repka" },
  { id: "150725110001", nama: "Fika Aryani" },
  { id: "150722030015", nama: "Budi Santoso" },
  { id: "150724100023", nama: "Al Mubarak" },
  { id: "150725110002", nama: "Uswatun Hasanah" },
  { id: "150723110026", nama: "Sanusi" },
  { id: "150722010060", nama: "Nova Rifa'i" },
  { id: "150722010050", nama: "Budianto" },
  { id: "150722090044", nama: "Siti Lestari" },
  { id: "150722090120", nama: "M. Azharul Azizi" },
  { id: "150725110005", nama: "Nurmala Sari" },
  { id: "150725110006", nama: "M Rizki Alfiqri" },
  { id: "340222100948", nama: "Yusuf Eka Saputra" },
  { id: "150725110007", nama: "Nurlatifah" },
  { id: "150725110008", nama: "Diana" },
  { id: "150722100205", nama: "Nur Zakiah" },
  { id: "150725110010", nama: "M. Gunawan" },
  { id: "150725110011", nama: "Pradina Olyvia Muslimah" },
  { id: "150723030051", nama: "Sofian" },
  { id: "150725110012", nama: "Muhammad Mema" },
  { id: "150723030012", nama: "Rizqey Anjani" },
  { id: "150725050015", nama: "M. Akbar Fahlezi" },
  { id: "150722100008", nama: "Nurfitriana" },
  { id: "150722100045", nama: "Rizki Dimas Syah" },
  { id: "150725110013", nama: "Yogi Permana" },
  { id: "150725110014", nama: "Widya Gustini" },
  { id: "150723110182", nama: "Rio Tri Yulianto" },
  { id: "150725110015", nama: "Dede Andriani" },
  { id: "150725110016", nama: "Raziq Fajarudin" },
  { id: "150725110017", nama: "Julia Wardani" },
  { id: "150725110018", nama: "Irma Lusiana" },
  { id: "150722090050", nama: "Muhammad Hardi" },
  { id: "150722100203", nama: "M. Zain Hidayat" },
  { id: "150725050016", nama: "Rfiki Apriandi" },
  { id: "150725110020", nama: "Dea Anggraini" },
  { id: "150725110021", nama: "M Fadli Ansorey" },
  { id: "150725110022", nama: "Gama Fikwan Syuhada" },
  { id: "150722110005", nama: "Melisa" },
  { id: "150722100042", nama: "Muji Asih" },
  { id: "150722010017", nama: "Abidin" },
  { id: "150724100029", nama: "Riyan Arista" },
  { id: "150723030078", nama: "Misnawati" },
  { id: "150723110128", nama: "Fajar Septiadi" },
  { id: "150725110028", nama: "Syukor 17" },
  { id: "150725110023", nama: "Anugrah Ilham Ramadhan Lubis" },
  { id: "150722030040", nama: "M. Fadli" },
  { id: "150725110025", nama: "Mahrani" },
  { id: "150722110003", nama: "Nadiya Hermika" },
  { id: "150723110120", nama: "Eko Gunawan" },
  { id: "150722100060", nama: "Ratna Sari" },
  { id: "150725110027", nama: "M. Hidayatullah" },
  { id: "150723030018", nama: "Pujiono" },
  { id: "150725110029", nama: "Andi Saputra" },
  { id: "150722100066", nama: "Nurlela Wati" },
  { id: "150722010052", nama: "Prengki Suito" },
  { id: "150722010040", nama: "Budi Setiawan" },
  { id: "150724100032", nama: "Yusnita" },
  { id: "150722090025", nama: "Rizka Aryana" },
  { id: "150722090085", nama: "M. Habibi" },
  { id: "150725110030", nama: "Nur Aina" },
  { id: "150725110031", nama: "Elvi Liza Oktavia" },
  { id: "150725110034", nama: "Kamalia" },
  { id: "150725110035", nama: "Gialang Harfani Sutra" },
  { id: "150722010031", nama: "Sudirman" },
  { id: "150722090015", nama: "Muhammad Ridho" },
  { id: "150725110036", nama: "Yunita Wulandari" },
  { id: "150722100103", nama: "Tamiya Agustina" },
  { id: "150723060021", nama: "Khoirul Maulana" },
  { id: "150723110005", nama: "Siti Aminatul Khoiriyah" },
  { id: "150722090094", nama: "Ahmad Al Hafizh Baihaqi" },
  { id: "150723040006", nama: "Budi Irawan" },
  { id: "150723060020", nama: "Fadilatul Auliya" },
  { id: "150722050007", nama: "Venny" },
  { id: "150723060016", nama: "Muhammad Syariful Irsyad" },
  { id: "150723030042", nama: "Reza H. A" },
  { id: "150725050018", nama: "Rizaldi Syaputra" },
  { id: "150722100003", nama: "Riza Fahlevi" },
  { id: "150722100037", nama: "Muhammad Yusra Yusuf" },
  { id: "150722030074", nama: "Uni Hendrawan" },
  { id: "150723110200", nama: "Alma Dian" },
  { id: "150725110040", nama: "Umi Imroah" },
  { id: "150725050004", nama: "Nurhuda Septiaini Z" },
  { id: "150723060010", nama: "Deasy Selvira" },
  { id: "150725110041", nama: "Ria Latifah Anwar" },
  { id: "150725110042", nama: "Muhammad Alhafiz Dinanda" },
  { id: "150725110043", nama: "Muhammad Syafei" },
  { id: "150725110045", nama: "Resti Septiani" },
  { id: "150725110046", nama: "Siti Fatimah" },
  { id: "150725110047", nama: "Febil Nugraha Ilham" },
  { id: "150722100022", nama: "Muhammad Fijriani" },
  { id: "150723110153", nama: "Muslimin" },
  { id: "150725110049", nama: "Rizki Saputra" },
  { id: "150723110136", nama: "Dhea Khairunnisa" },
  { id: "150725110050", nama: "Aniisa Fitriya" },
  { id: "150722090039", nama: "Andah Permata Sari" },
  { id: "150725110052", nama: "Ramanda Elsa Kurnia" },
  { id: "150725110051", nama: "Hapipah" },
  { id: "150722030077", nama: "Budiman" },
  { id: "150722100073", nama: "Muhammad Nurun Ni'am" },
  { id: "150722010056", nama: "Muhammad Saukani" },
  { id: "150723110201", nama: "Fira Rahmawati" },
  { id: "150722100081", nama: "Miftahul Aulia" },
  { id: "150725110055", nama: "Dina Mawardah" },
  { id: "150723110119", nama: "Ramadhaniati Mafaza" },
  { id: "150722090122", nama: "Mahyuddin" },
  { id: "150723030025", nama: "Ardhita Dianda Noveri" },
  { id: "150723030019", nama: "Fera Jayanti" },
  { id: "150722100049", nama: "KMS Rizki Ananda" },
  { id: "150722100201", nama: "Selamet" },
  { id: "150725110058", nama: "Muhammad Hendrico Rizki Darmawan" },
  { id: "150722100178", nama: "Nur Anita" },
  { id: "150725110059", nama: "Muhamad Ilham Pahroji" },
  { id: "150722030035", nama: "Razli" },
  { id: "150722030071", nama: "Juraidah" },
  { id: "150722100164", nama: "Nur Aini" },
  { id: "150723060022", nama: "Arimbi" },
  { id: "150725110060", nama: "Chyntya Angelina Putri Nainggolan" },
  { id: "150725110061", nama: "Sindi Fitria" },
  { id: "150725110063", nama: "Muhammad Ali Akbar" },
  { id: "150723060009", nama: "Miftahul Adawiyah" },
  { id: "150722110015", nama: "Tri Puji Lestari" },
  { id: "150722010055", nama: "Dahlimi" },
  { id: "150722010046", nama: "Hery Kiswanto" },
  { id: "150722100090", nama: "Juliyanto" },
  { id: "150723060007", nama: "Emia Anggundary" },
  { id: "150725110067", nama: "Melissa Erdawiyah" },
  { id: "150725110066", nama: "Siti Maisarah" },
  { id: "150725110068", nama: "Rosdiana" },
  { id: "150725110069", nama: "Nur Aini" },
  { id: "150723110151", nama: "Mardiansa" },
  { id: "150722030005", nama: "Ratih Puspita Sari" },
  { id: "150722010066", nama: "Abd. Mubarak Saputra" },
  { id: "150722090163", nama: "Muhammad Iqbal" },
  { id: "150723110057", nama: "Paujiah" },
  { id: "150722090168", nama: "Pangestu Noto Susanto" },
  { id: "150723060008", nama: "Khairiah" },
  { id: "150725050013", nama: "Khoirul Muhairin" },
  { id: "150723110148", nama: "Mufriha Mardhiyati Syihap" },
  { id: "150725110070", nama: "Raffles Prastya" },
  { id: "150722030003", nama: "Yunus" },
  { id: "150722030025", nama: "Taufiw Rahman" },
  { id: "150722030065", nama: "Sofyan Ali" },
  { id: "150722030004", nama: "Siti Nur Azizah" },
  { id: "150725110072", nama: "Hagusmori Alkabir" },
  { id: "150725110073", nama: "Nur Ajizah" },
  { id: "150725110075", nama: "Astika Zahra Wulandari" },
  { id: "150722100179", nama: "Edi Sutrisno" },
  { id: "150725110077", nama: "M. Akbar" },
  { id: "150725110076", nama: "M. Azmi" },
  { id: "150723110184", nama: "Sumardi" },
  { id: "150725110078", nama: "M. Yunus" },
  { id: "150722030054", nama: "Ahmad Muhajir" },
  { id: "150725110079", nama: "Wirdatul Awaliyah Haryani" },
  { id: "150722100169", nama: "Mukhtar" },
  { id: "150725110080", nama: "Nur Sri Puja" },
  { id: "150722030031", nama: "Muhammad Firmansyah" },
  { id: "150725110081", nama: "Nur Azizah" },
  { id: "150722110004", nama: "Muhammad Irfan" },
  { id: "150725110082", nama: "Raja Dwi Anugrah" },
  { id: "150725110083", nama: "Sidik Wahyudi" },
  { id: "150725110084", nama: "Muhammad Reza Adha" },
  { id: "150722090146", nama: "Zulfahri" },
  { id: "150722030084", nama: "Juliandri" },
  { id: "150725110085", nama: "M. Supempri" },
  { id: "150722090105", nama: "Arni Yannur" },
  { id: "150725050009", nama: "Sabarudin" },
  { id: "150722020020", nama: "Roni Jumroni" },
  { id: "150725050010", nama: "Tissa Cantika" },
  { id: "150725110088", nama: "Nurdin Hairi" },
  { id: "150722090019", nama: "Putri Sriwahyuni" },
  { id: "150723020003", nama: "M. Raihan Ramadhan" },
  { id: "150722100161", nama: "Endang Sri Wahyuni" },
  { id: "150723030059", nama: "Sofyan Ali" },
  { id: "150722090107", nama: "Yayuk Sulistiwati" },
  { id: "150723030070", nama: "Arisman" },
  { id: "150725110090", nama: "Misye Kurnia Sari" },
  { id: "150725110091", nama: "Muhammad Nur Adli Ardana" },
  { id: "150725110092", nama: "Satria" },
  { id: "150723110041", nama: "Lina Hartati" },
  { id: "150722090106", nama: "M. Saleh" },
  { id: "150725110094", nama: "Ozi Kurnia" },
  { id: "150722010003", nama: "Ahmad Nova Hariyanto" },
  { id: "150722090001", nama: "Heriyanto" },
  { id: "150725110095", nama: "Sella Yalyanah" },
  { id: "150722020013", nama: "Sandika Saputra" },
  { id: "150725110096", nama: "Desi Nurmala Sari" },
  { id: "150722100084", nama: "Nurhidayatul Istiqomah" },
  { id: "150723030029", nama: "Apriliani Kartika Candra" },
  { id: "150723030022", nama: "Joko Priatmojo" },
  { id: "150725110098", nama: "Nur Linda" },
  { id: "150722020025", nama: "Abdi Zahrudin" },
  { id: "150725110099", nama: "Irma Yanti" },
  { id: "150725110100", nama: "Fitriyani" },
  { id: "150722100115", nama: "Khayatul Khasanah" },
  { id: "150722090181", nama: "Sabri" },
  { id: "150725110102", nama: "Tri Rahayu" },
  { id: "150723110191", nama: "Darmawan" },
  { id: "150725110101", nama: "Habibullah" },
  { id: "150725110105", nama: "Jeni Nurrahma Wati" },
  { id: "150725110104", nama: "Purmawamti" },
  { id: "150722100095", nama: "Sunan Ali" },
  { id: "150722090055", nama: "Prasetiyo" },
  { id: "150725110106", nama: "Ricky Maulana Sinurat" },
  { id: "150725110107", nama: "Silvia Novriani" },
  { id: "150723030069", nama: "Muhammad Fadhilah Rasyid" },
  { id: "150725110108", nama: "Dewi Wulandari" },
  { id: "150725110109", nama: "M.Hafid" },
  { id: "150722090023", nama: "Lastri Yani" },
  { id: "150722030019", nama: "Haryo Suseno" },
  { id: "150722010002", nama: "Joni Wahyudi" },
  { id: "150722100158", nama: "Nursehat" },
  { id: "150722090132", nama: "Yudha Putra" },
  { id: "150725110112", nama: "Dian Dita Meiliana Putri" },
  { id: "150722090017", nama: "M.Iqbal Lahmi" },
  { id: "150725110113", nama: "Anggy Kustiansyah" },
  { id: "150722020002", nama: "Iskandar Muda Siregar" },
  { id: "150725110114", nama: "Surya Ningsih" },
  { id: "150723110064", nama: "Ahmad Khairul Faizin" },
  { id: "150725110115", nama: "Bela Opilaputri" },
  { id: "150722090086", nama: "Muhammad Amahdi" },
  { id: "150725110116", nama: "Yucky Febzia Darista" },
  { id: "150725110117", nama: "Indah Selviandri" },
  { id: "150722010020", nama: "Lerman Master T" },
  { id: "150722090131", nama: "Yetsi Mardiastuti" },
  { id: "150722090020", nama: "M. Syahir" },
  { id: "150725110118", nama: "M. Diki Setiawan" },
  { id: "150725110119", nama: "Muhammad Haikal Ramadhan" },
  { id: "150725110120", nama: "Nurhaviza Dwi Ananda" },
  { id: "150725110121", nama: "Fawzan Amry Aldiny Harahap" },
  { id: "150722100126", nama: "Tri Susanti" },
  { id: "150723110006", nama: "Susi Rahayu" },
  { id: "150722100124", nama: "Ardiansyah" },
  { id: "150722090183", nama: "Endang Kaswati" },
  { id: "150723030001", nama: "Rasidah Fatmala" },
  { id: "150722030007", nama: "Zamrati" },
  { id: "150722090018", nama: "Yandi" },
  { id: "150724100019", nama: "Tri Setiyani" },
  { id: "150122030013", nama: "Sintia Dwi Putri" },
  { id: "150724100037", nama: "Lia Ratnasari" },
  { id: "150722030001", nama: "Nova Ardila" },
  { id: "150725110124", nama: "Priska Erlyana" },
  { id: "150722090052", nama: "Tommi Rudianto" },
  { id: "150725110125", nama: "Desi Pratiwi" },
  { id: "150725110126", nama: "Ikaya Khadrotun Daniya" },
  { id: "150722020010", nama: "Ihsan Adhitia Rahman" },
  { id: "150725110127", nama: "Mahmud" },
  { id: "150722010016", nama: "Wiwit Ardianto" },
  { id: "150725110129", nama: "Hanifa Al Izati" },
  { id: "150725110130", nama: "Aulia Rahman" },
  { id: "150725110131", nama: "Siti Hajrah" },
  { id: "150722090130", nama: "Santi Yusnita" },
  { id: "150722090038", nama: "Wina Setiawati" },
  { id: "150725110132", nama: "Adila Fitri" },
  { id: "150725110133", nama: "Dandi Barianto" },
  { id: "150722030018", nama: "Tuperi" },
  { id: "150722010069", nama: "Ahmad Budairi" },
  { id: "150725050006", nama: "Hesti Purboning Rahayu" },
  { id: "150722090027", nama: "Yuslim" },
  { id: "150725110134", nama: "Hendri Rusadi" },
  { id: "150722030029", nama: "Roni" },
  { id: "150722110021", nama: "Rizko" },
  { id: "150722060003", nama: "Nurasiah" },
  { id: "150725110137", nama: "Khoirum Niswah" },
  { id: "150725110138", nama: "Siti Fatimah" },
  { id: "150723110004", nama: "Zainurrohman" },
  { id: "150722020001", nama: "Syarifah Hasnah" },
  { id: "150725110139", nama: "Ariana Herawati" },
  { id: "150725110140", nama: "Khanaya Salsabilla" },
  { id: "150724100021", nama: "M Anwar Ardi Bily" },
  { id: "740323070001", nama: "Siti Patimah" },
  { id: "150723030058", nama: "Ahmad Husaini" },
  { id: "150725110141", nama: "Dinda Putri Lestari" },
  { id: "150725110142", nama: "Mahrus" },
  { id: "150725110143", nama: "Ervita Mahendry" },
  { id: "150724100031", nama: "Nur Hasanah" },
  { id: "150722100160", nama: "M.Saman" },
  { id: "150725110144", nama: "Muhammad Arfinas" },
  { id: "150722100043", nama: "Raudatul Jannah" },
  { id: "150725110145", nama: "M. Nazir. S" },
  { id: "150722100036", nama: "Salahudin" },
  { id: "150722100194", nama: "Linda Sari" },
  { id: "150725110146", nama: "M.Ridwan" },
  { id: "150722030044", nama: "Jumsinah" },
  { id: "150724100016", nama: "Rahmad Azmi" },
  { id: "150723030061", nama: "Misari" },
  { id: "150725110147", nama: "M Luqman Hakim" },
  { id: "150725110148", nama: "Tri Mutia Nur Huda" },
  { id: "150722100030", nama: "Pakhruddin" },
  { id: "150725110150", nama: "Nurmita" },
  { id: "150723090003", nama: "Resti Mardayati" },
  { id: "150725110152", nama: "Dian Fitriani" },
  { id: "150722090135", nama: "Fitri Ramadani" },
  { id: "150723030010", nama: "Maya Hartati" },
  { id: "150725110154", nama: "Karina Mardatila Putri" },
  { id: "150723110100", nama: "Dimas Prabowo, S.H." },
  { id: "150722100072", nama: "Yeni Afrila" },
  { id: "150725110157", nama: "M.Rizqi Valdi Nusandika" },
  { id: "150722090101", nama: "Mei Yunida Nur Fitri" },
  { id: "150725110158", nama: "Ernita Maddalena Marpaung" },
  { id: "150725110159", nama: "M. Rifqi Riyanda" },
  { id: "150725110160", nama: "Dimas Anugrah Trivergus" },
  { id: "150722100156", nama: "Kaspul Anwar" },
  { id: "150725110161", nama: "Sulistiarini" },
  { id: "150722100070", nama: "Astri Maryani" },
  { id: "150725110162", nama: "Solihin" },
  { id: "150722090092", nama: "Dede Irawan" },
  { id: "150725110167", nama: "Murniawati" },
  { id: "150725110164", nama: "Ayu Rahayu" },
  { id: "150725110165", nama: "Aldo Putra Nugraha" },
  { id: "150725110166", nama: "Elis Nurjana" },
  { id: "150722020028", nama: "Robin" },
  { id: "150725110169", nama: "Enjelina Situmeang" },
  { id: "150725110170", nama: "Muhammad Ikbal Siham" },
  { id: "150722030055", nama: "Maimunah" },
  { id: "150723110056", nama: "Khamidun" },
  { id: "150724100017", nama: "M Hasan" },
  { id: "150722090077", nama: "M. Ali" },
  { id: "150722030009", nama: "Wahidin Sapuan" },
  { id: "150722030012", nama: "Ziat Ali Riski" },
  { id: "150723030020", nama: "Ahmad Syafi'i" },
  { id: "150723030048", nama: "Apsanrizkipratama" },
  { id: "150725110172", nama: "Natasha" },
  { id: "150725110173", nama: "Siti Nurhasanah" },
  { id: "150722030056", nama: "Ibnu Hajar" },
  { id: "150722090070", nama: "Hardian Susanto" },
  { id: "150523110331", nama: "Hermawansyah" },
  { id: "150725110175", nama: "Retno Tri Anggraini Setiowati" },
  { id: "150725110179", nama: "Anwari" },
  { id: "150722100113", nama: "Hendra Kelana" },
  { id: "150722030082", nama: "Asdarmawi" },
  { id: "150725110176", nama: "Malbupon Saputra" },
  { id: "150725110177", nama: "Novi Yanti" },
  { id: "150722030023", nama: "Bagus Ansori" },
  { id: "150725110178", nama: "Syahril" },
  { id: "150725110180", nama: "Kurniati" },
  { id: "150722090041", nama: "Rizki Nadya Faradilla" },
  { id: "150723110154", nama: "Annisa Welni" },
  { id: "150722110014", nama: "Andika Saputra" },
  { id: "150725110184", nama: "Erni Erawati" },
  { id: "150722100134", nama: "Ahmad Syukri" },
  { id: "150722030059", nama: "Erwinsyah" },
  { id: "150724100003", nama: "Muhammad Afif" },
  { id: "150722090176", nama: "Lisna Khairiyah S" },
  { id: "150722100018", nama: "Adi" },
  { id: "150725110186", nama: "Bahrul Ulum" },
  { id: "150725110187", nama: "Marito Manurung" },
  { id: "150722100204", nama: "Firman Supratman" },
  { id: "150722090013", nama: "Yessy Husnul Khatimah" },
  { id: "150723030060", nama: "Susi Wahyuni" },
  { id: "150725110190", nama: "Saiful Anwar" },
  { id: "150725110192", nama: "Putri Rizkiah" },
  { id: "150725110191", nama: "Muhammad Fauzan Al Anshari" },
  { id: "150725110193", nama: "Agie Raje Depati" },
  { id: "150722090178", nama: "M. Junaidi" },
  { id: "150722110013", nama: "Nuraini" },
  { id: "150725110196", nama: "Ramalia" },
];

const PER_PAGE = 10;

export default function PengumumanAkhir() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PESERTA_LULUS;
    return PESERTA_LULUS.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startNo = (page - 1) * PER_PAGE + 1;

  const pageButtons = () => {
    const range = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { range.push(1); if (left > 2) range.push("..."); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) { if (right < totalPages - 1) range.push("..."); range.push(totalPages); }
    return range;
  };

  // Data stat cards — pisahkan agar card PDF bisa punya logika klik sendiri
  const statCards = [
    { icon: "👥", label: "Total Peserta Lulus", val: PESERTA_LULUS.length, href: null },
    { icon: "📅", label: "Tanggal Pengumuman", val: "13 Mei 2026", href: null },
    { icon: "⏭️", label: "Tahap Selanjutnya", val: "Seleksi Kompetensi", href: null },
    // { icon: "📢", label: "Surat Resmi Hasil", val: "Rekrutmen Mitra 1507", href: pengumumanPdf },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff8f0 0%, #fff3e8 50%, #ffecd6 100%)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #F28C28 0%, #e07820 60%, #c96610 100%)",
          padding: "40px 24px 32px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(242,140,40,0.35)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-24px)",
          transition: "all 0.7s ease",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: "999px",
            padding: "6px 18px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.95)", fontWeight: "600", letterSpacing: "1px" }}>
            REKRUTMEN MITRA BPS 2026
          </span>
        </div>

        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏆</div>

        <h1
          style={{
            color: "white",
            fontSize: "clamp(20px, 4vw, 28px)",
            fontWeight: "900",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 8px",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Pengumuman Hasil Seleksi Akhir
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", margin: 0 }}>
          Nomor: B-404/1507/HM.240/2025 — Daftar peserta yang dinyatakan <strong>LULUS</strong> Rekrutmen Mitra Statistik BPS Tahun 2026
        </p>

        {/* Stat Cards */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          {statCards.map((s, i) => {
            const cardStyle = {
              background: "rgba(255,255,255,0.18)",
              borderRadius: "12px",
              padding: "12px 20px",
              minWidth: "140px",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              textDecoration: "none",
              display: "block",
              transition: "all 0.2s ease",
            };

            const inner = (
              <>
                <div style={{ fontSize: "20px", marginBottom: "2px" }}>{s.icon}</div>
                <div style={{ color: "white", fontWeight: "800", fontSize: "16px" }}>{s.val}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>{s.label}</div>
                {s.href && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "999px",
                      padding: "2px 10px",
                      display: "inline-block",
                    }}
                  >
                    Lihat PDF ↗
                  </div>
                )}
              </>
            );

            // Card PDF — pakai <a>, card biasa pakai <div>
            if (s.href) {
              return (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={cardStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.32)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.cursor = "pointer";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {inner}
                </a>
              );
            }

            return (
              <div key={i} style={cardStyle}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* KONTEN */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px 16px 60px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease 0.2s",
        }}
      >
        {/* Info Banner */}
        <div
          style={{
            background: "#fff9f0",
            border: "1.5px solid #F28C28",
            borderLeft: "5px solid #F28C28",
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
            Peserta yang namanya tercantum di bawah ini dinyatakan <strong>LULUS</strong> Rekrutmen Mitra Statistik BPS Kab. Tanjung Jabung Barat Tahun 2026.
            Pengumuman ini bersifat mutlak dan tidak dapat diganggu gugat.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "#F28C28",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Cari nama atau Sobat ID..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 46px",
              borderRadius: "12px",
              border: "2px solid #fde9cc",
              fontSize: "15px",
              outline: "none",
              background: "white",
              boxSizing: "border-box",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: "0 2px 8px rgba(242,140,40,0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#F28C28";
              e.target.style.boxShadow = "0 0 0 4px rgba(242,140,40,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#fde9cc";
              e.target.style.boxShadow = "0 2px 8px rgba(242,140,40,0.08)";
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "999px",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Info hasil */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            {search
              ? <>Ditemukan <strong style={{ color: "#F28C28" }}>{filtered.length}</strong> dari {PESERTA_LULUS.length} peserta</>
              : <>Menampilkan <strong style={{ color: "#F28C28" }}>{startNo}–{Math.min(page * PER_PAGE, filtered.length)}</strong> dari <strong style={{ color: "#1f2937" }}>{filtered.length}</strong> peserta</>
            }
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
            Halaman {page} / {totalPages || 1}
          </p>
        </div>

        {/* Tabel */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid #fde9cc",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #F28C28, #e07820)" }}>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", width: "52px" }}>
                    NO
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", width: "150px" }}>
                    SOBAT ID
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px" }}>
                    NAMA PESERTA
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "white", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", width: "110px" }}>
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: "15px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                      Tidak ditemukan hasil untuk "<strong>{search}</strong>"
                    </td>
                  </tr>
                ) : (
                  paginated.map((peserta, i) => {
                    const globalNo = startNo + i;
                    const isEven = i % 2 === 0;
                    return (
                      <tr
                        key={peserta.id + globalNo}
                        style={{ background: isEven ? "white" : "#fffaf5", transition: "background 0.15s" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#fff3e0")}
                        onMouseOut={(e) => (e.currentTarget.style.background = isEven ? "white" : "#fffaf5")}
                      >
                        <td style={{ padding: "13px 16px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#F28C28", borderBottom: "1px solid #fef3e2" }}>
                          {globalNo}
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "12px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #fef3e2", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                          {search.trim() ? highlightMatch(peserta.id, search.trim()) : peserta.id}
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: "600", color: "#1f2937", borderBottom: "1px solid #fef3e2" }}>
                          {search.trim() ? highlightMatch(peserta.nama, search.trim()) : peserta.nama}
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: "1px solid #fef3e2" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#dcfce7", color: "#15803d", fontWeight: "700", fontSize: "11px", padding: "4px 12px", borderRadius: "999px", letterSpacing: "0.5px" }}>
                            ✓ LULUS
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINASI */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "9px 16px", borderRadius: "10px", border: "2px solid #fde9cc", background: page === 1 ? "#f9fafb" : "white", color: page === 1 ? "#d1d5db" : "#F28C28", fontWeight: "700", fontSize: "14px", cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              ‹
            </button>

            {pageButtons().map((btn, i) =>
              btn === "..." ? (
                <span key={`e-${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: "14px" }}>…</span>
              ) : (
                <button
                  key={btn}
                  onClick={() => setPage(btn)}
                  style={{ padding: "9px 14px", borderRadius: "10px", border: btn === page ? "2px solid #F28C28" : "2px solid #fde9cc", background: btn === page ? "#F28C28" : "white", color: btn === page ? "white" : "#374151", fontWeight: "700", fontSize: "14px", cursor: "pointer", minWidth: "40px", boxShadow: btn === page ? "0 4px 12px rgba(242,140,40,0.3)" : "none" }}
                >
                  {btn}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: "9px 16px", borderRadius: "10px", border: "2px solid #fde9cc", background: page === totalPages ? "#f9fafb" : "white", color: page === totalPages ? "#d1d5db" : "#F28C28", fontWeight: "700", fontSize: "14px", cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              ›
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#9ca3af", lineHeight: "1.7" }}>
          Pengumuman ini bersifat resmi dari <strong>BPS Kabupaten Tanjung Jabung Barat</strong>.<br />
          Untuk informasi lebih lanjut hubungi panitia rekrutmen.
        </p>
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#fde68a", color: "#92400e", borderRadius: "3px", padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}