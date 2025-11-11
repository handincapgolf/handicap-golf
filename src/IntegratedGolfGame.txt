import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Trophy,
  DollarSign,
  Play,
  Home,
  Users,
  Settings,
  BarChart3,
  ArrowLeft,
  Target,
  Camera,
  CircleDollarSign,
  Search
} from 'lucide-react';

// 球场数据库
const GOLF_COURSES = {
  "BUKIT_JALIL_GOLF_AND_COUNTRY_RESORT": {
    shortName: "BJGCR",
    fullName: "Bukit Jalil Golf & Country Resort",
    location: ["Bukit Jalil", "Kuala Lumpur", "Malaysia"]
    pars: [4,4,5,3,4,4,4,3,5, 4,5,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "99_East_Golf_Club": {
    shortName: "99EGC",
    fullName: "99 East Golf Club",
    location: ["Langkawi", "Kedah", "Malaysia"],
    pars: [5,3,4,4,4,5,4,4,3, 5,3,4,4,4,5,4,4,3],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "AMVERTON_COVE_GOLF_AND_ISLAND_RESORT": {
    shortName: "ACGIR",
    fullName: "Amverton Cove Golf & Island Resort",
    location: ["Carey Island", "Selangor", "Malaysia"],
    pars: [4,5,4,4,3,4,3,5,4, 5,4,3,4,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "AWANA_GENTING_HIGHLANDS": {
    shortName: "AGH",
    fullName: "Awana Genting Highlands",
    location: ["Genting Highlands", "Pahang", "Malaysia"],
    pars: [4,4,4,3,5,3,4,5,3, 4,4,5,5,4,3,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "Awana_Kijal_Golf_Beach_&_Spa_Resort": {
    shortName: "AKGBSR",
    fullName: "Awana Kijal Golf Beach & Spa Resort",
    location: ["Kijal", "Terengganu", "Malaysia"],
    pars: [4,4,5,3,4,4,3,4,5, 4,4,3,5,3,5,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BENTONG_GOLF_CLUB": {
    shortName: "BGC",
    fullName: "Bentong Golf Club",
    location: ["Bentong", "Pahang", "Malaysia"],
    pars: [4,4,4,3,4,3,5,4,5, 3,4,4,4,5,3,4,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BERJAYA_HILLS_GOLF_AND_COUNTRY_CLUB": {
    shortName: "BHGCC",
    fullName: "Berjaya Hills Golf & Country Club",
    location: ["Bukit Tinggi", "Pahang", "Malaysia"],
    pars: [4,5,3,4,4,3,4,5,4, 5,3,4,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BINTULU_GOLF_CLUB": {
    shortName: "BGC",
    fullName: "Bintulu Golf Club",
    location: ["Bintulu", "Sarawak", "Malaysia"],
    pars: [5,4,3,4,4,4,3,4,5, 4,3,4,4,4,5,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BLACK_FOREST_GOLF_AND_COUNTRY CLUB": {
    shortName: "BFGCC",
    fullName: "Black Forest Golf & Country Club",
    location: ["Rawang", "Selangor", "Malaysia"],
    pars: [4,5,3,4,4,5,3,4,4, 4,5,3,4,5,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BORNEO_GOLF&_COUNTRY CLUB": {
    shortName: "BGCC",
    fullName: "Borneo Golf & Country Club",
    location: ["Kuching", "Sarawak", "Malaysia"],
    pars: [4,4,5,4,3,5,4,3,4, 4,5,4,4,3,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BUKIT_BANANG_GOLF_AND_COUNTRY CLUB": {
    shortName: "BBGCC",
    fullName: "Bukit Banang Golf & Country Club",
    location: ["Banting", "Selangor", "Malaysia"],
    pars: [4,5,4,4,4,3,5,3,4, 4,5,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BUKIT_JALIL_GOLF_AND_COUNTRY_RESORT": {
    shortName: "BJGCR",
    fullName: "Bukit Jalil Golf & Country Resort",
    location: ["Bukit Jalil", "Kuala Lumpur", "Malaysia"],
    pars: [4,4,5,3,4,4,4,3,5, 4,5,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BUKIT_KEMUNING_GOLF_AND_COUNTRY_CLUB": {
    shortName: "BKGCC",
    fullName: "Bukit Kemuning Golf & Country Club",
    location: ["Shah Alam", "Selangor", "Malaysia"],
    pars: [4,3,5,4,4,3,4,4,5, 4,4,5,3,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BUKIT_TINGGI_GOLF_AND_COUNTRY CLUB": {
    shortName: "BTGCC",
    fullName: "Bukit Tinggi Golf & Country Club",
    location: ["Bukit Tinggi", "Pahang", "Malaysia"],
    pars: [4,5,3,4,4,3,4,5,4, 5,3,4,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "BUKIT_UNGGUL": {
  shortName: "BUCC",
  fullName: "Bukit Unggul Country Club",
  location: ["Dengkil", "Selangor", "Malaysia"],
  pars: [4,3,5,4,4,4,3,4,4, 5,4,4,4,3,5,4,3,4],
  blueTees: null,
  whiteTees: null,
  redTees: null
 },

  "THE_CLUB_AT_BUKIT_UTAMA": {
  shortName: "TCBU",
  fullName: "The Club @ Bukit Utama",
  location: ["Bandar Utama", "Selangor", "Malaysia"],
  pars: [4,3,4,3,4,4,5,3,4],  //
  blueTees: null,
  whiteTees: null,
  redTees: null
},

  "BUTTERWORTH_GOLF_CLUB": {
    shortName: "BGC",
    fullName: "Butterworth Golf Club",
    location: ["Butterworth", "Penang", "Malaysia"],
    pars: [4,4,5,3,4,4,5,3,4, 4,4,4,4,4,4,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "CINTA_SAYANG_GOLF_RESORT": {
    shortName: "CSGR",
    fullName: "Cinta Sayang Golf Resort",
    location: ["Sungai Petani", "Kedah", "Malaysia"],
    pars: [4,5,4,4,3,5,3,4,4, 4,4,5,3,5,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "CLEARWATER_SANCTUARY_GOLF_RESORT": {
    shortName: "CSGR",
    fullName: "Clearwater Sanctuary Golf Resort",
    location: ["Batu Gajah", "Perak", "Malaysia"],
    pars: [4,4,3,5,4,5,3,4,4, 4,3,4,5,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "DAIMAN_18_GOLF_CLUB": {
    shortName: "DGC",
    fullName: "Daiman 18 Golf Club",
    location: ["Johor Bahru", "Johor", "Malaysia"],
    pars: [4,5,3,4,5,3,4,4,4, 4,5,3,5,4,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "DALIT_BAY_GOLF_AND_COUNTRY CLUB": {
    shortName: "DBGCC",
    fullName: "Dalit Bay Golf & Country Club",
    location: ["Tuaran", "Sabah", "Malaysia"],
    pars: [4,4,5,3,5,4,4,3,4, 4,3,5,4,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "DAMAI_GOLF_AND_COUNTRY CLUB": {
    shortName: "DGCC",
    fullName: "Damai Golf And Country Club",
    location: ["Kuching", "Sarawak", "Malaysia"],
    pars: [5,4,3,4,4,3,4,5,4, 4,5,4,4,3,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "DAMAI_LAUT_GOLF_AND_COUNTRY CLUB": {
    shortName: "DLGCC",
    fullName: "Damai Laut Golf & Country Club",
    location: ["Lumut", "Perak", "Malaysia"],
    pars: [4,5,3,4,5,4,3,4,4, 4,5,4,3,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "DICKSON_BAY": {
    shortName: "DB",
    fullName: "Dickson Bay",
    location: ["Port Dickson", "Negeri Sembilan", "Malaysia"],
    pars: [4,5,3,4,4,5,4,3,4, 5,4,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "EASTWOOD_VALLEY_GOLF_AND_COUNTRY CLUB": {
    shortName: "EVGCC",
    fullName: "Eastwood valley golf and country club",
    location: ["Ipoh", "Perak", "Malaysia"],
    pars: [5,4,3,4,4,5,4,3,4, 5,4,4,3,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "FRASER_HILL_GOLF_COURSE": {
    shortName: "FHGC",
    fullName: "Fraser hill Golf Course",
    location: ["Fraser's Hill", "Pahang", "Malaysia"],
    pars: [4,3,5,4,3,3,4,3,3, 4,4,4,4,4,4,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "GREEN_ACRES_GOLF_AND_COUNTRY_RESORT": {
    shortName: "GAGCR",
    fullName: "Green Acres Golf & Country Resort",
    location: ["Shah Alam", "Selangor", "Malaysia"],
    pars: [4,5,3,4,4,4,4,3,5, 4,4,4,3,5,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "Gunung_Raya_Golf_Resort": {
    shortName: "GR",
    fullName: "Gunung Raya Golf Resort",
    location: ["Langkawi", "Kedah", "Malaysia"],
    pars: [4,5,4,3,4,4,3,5,4, 5,3,4,4,4,5,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "HORIZON_HILLS": {
    shortName: "HH",
    fullName: "Horizon Hills",
    location: ["Iskandar Puteri", "Johor", "Malaysia"],
    pars: [4,5,3,4,4,5,4,3,4, 4,4,3,5,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "IMPIAN_EMAS_GOLF_AND_COUNTRY CLUB": {
    shortName: "IEGCC",
    fullName: "Impian Emas Golf & country club",
    location: ["Kajang", "Selangor", "Malaysia"],
    pars: [4,5,3,4,4,3,5,4,4, 4,5,3,4,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "IMPIAN_GOLF_AND_COUNTRY CLUB": {
    shortName: "IGCC",
    fullName: "Impian Golf & Country Club",
    location: ["Kajang", "Selangor", "Malaysia"],
    pars: [4,3,5,4,5,4,3,4,4, 4,4,3,4,5,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "IOI_PALM_VILLA_GOLF_AND_COUNTRY RESORT": {
    shortName: "IPVGCR",
    fullName: "IOI Palm Villa Golf & Country Resort",
    location: ["Puchong", "Selangor", "Malaysia"],
    pars: [5,4,3,4,4,4,3,4,5, 4,5,3,4,4,3,4,3,6],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "JOHOR_GOLF_AND_COUNTRY CLUB": {
    shortName: "JGCC",
    fullName: "Johor Golf & Country Club",
    location: ["Johor Bahru", "Johor", "Malaysia"],
    pars: [4,4,4,3,5,5,4,3,4, 5,4,3,4,5,4,4,4,3],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KAJANG_HILL_GOLF_CLUB": {
    shortName: "KHGC",
    fullName: "Kajang Hill Golf Club",
    location: ["Kajang", "Selangor", "Malaysia"],
    pars: [5,4,4,3,5,3,4,4,4, 4,3,4,5,3,4,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_BUKIT_BESI": {
    shortName: "KGBB",
    fullName: "Kelab Golf Bukit Besi",
    location: ["Bukit Besi", "Terengganu", "Malaysia"],
    pars: [4,5,4,3,4,3,4,5,4, 4,5,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_DESA_DUNGUN": {
    shortName: "KGDD",
    fullName: "Kelab Golf Desa Dungun",
    location: ["Dungun", "Terengganu", "Malaysia"],
    pars: [4,5,4,3,4,4,4,3,5, 4,5,5,4,4,3,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_DIRAJA_PEKAN": {
    shortName: "KGDP",
    fullName: "Kelab Golf Diraja Pekan",
    location: ["Pekan", "Pahang", "Malaysia"],
    pars: [4,5,4,4,3,5,3,4,4, 4,3,4,5,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_DIRAJA_SERI_MENANTI": {
    shortName: "KGDSM",
    fullName: "Kelab Golf Diraja Seri Menanti",
    location: ["Kuala Pilah", "Negeri Sembilan", "Malaysia"],
    pars: [5,4,3,4,4,4,5,4,3, 5,3,4,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_KINTA": {
    shortName: "KGK",
    fullName: "Kelab Golf Kinta",
    location: ["Ipoh", "Perak", "Malaysia"],
    pars: [5,3,4,4,3,4,3,4,4, 4,4,5,3,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_KUALA_KANGSAR": {
    shortName: "KGKK",
    fullName: "Kelab Golf Kuala Kangsar",
    location: ["Kuala Kangsar", "Perak", "Malaysia"],
    pars: [4,3,4,4,5,3,4,4,4, 4,3,4,4,5,3,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_MIRI": {
    shortName: "KGM",
    fullName: "Kelab Golf Miri",
    location: ["Miri", "Sarawak", "Malaysia"],
    pars: [3,4,4,4,4,5,4,5,3, 4,4,3,4,4,4,3,5,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_SERI_SELANGOR": {
    shortName: "KGSS",
    fullName: "Kelab Golf Seri Selangor",
    location: ["Shah Alam", "Selangor", "Malaysia"],
    pars: [4,4,3,4,5,5,4,3,4, 4,4,3,5,3,4,4,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_SIBU": {
    shortName: "KGS",
    fullName: "Kelab Golf Sibu",
    location: ["Sibu", "Sarawak", "Malaysia"],
    pars: [4,5,3,4,5,5,3,3,4, 4,4,5,3,3,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_GOLF_SULTAN_AHMAD_SHAH_CAMERON": {
    shortName: "KGSAS-CH",
    fullName: "Kelab Golf Sultan Ahmad Shah Cameron Highlands",
    location: ["Cameron Highlands", "Pahang", "Malaysia"],
    pars: [5,4,4,3,4,4,5,3,4, 4,4,3,5,4,3,4,3,5],
    blueTees: [467,390,330,166,258,317,475,195,289, 340,375,170,485,385,130,310,150,475],
    whiteTees: [428,341,309,135,228,271,450,142,265, 320,355,150,465,375,110,295,120,450],
    redTees: [385,299,275,102,206,223,386,112,243, 300,340,130,420,345,95,275,110,400]
  },

  "KELAB_GOLF_UNIVERSITI_UTARA_MALAYSIA": {
    shortName: "KGUUM",
    fullName: "Kelab Golf Universiti Utara Malaysia",
    location: ["Sintok", "Kedah", "Malaysia"],
    pars: [5,4,5,3,4,3,4,4,4, 3,4,4,4,5,5,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_RAHMAN_PUTRA_MALAYSIA": {
    shortName: "KRPM",
    fullName: "Kelab Rahman Putra Malaysia",
    location: ["Sungai Buloh", "Selangor", "Malaysia"],
    pars: [4,4,4,3,5,3,5,4,4, 4,5,4,3,4,5,4,4,3],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_REKREASI_ANGKATAN_TENTERA": {
    shortName: "KRAT",
    fullName: "Kelab Rekreasi Angkatan Tentera",
    location: ["Kuala Lumpur", "Kuala Lumpur", "Malaysia"],
    pars: [4,3,4,3,3,5,4,4,3, 4,3,4,3,3,5,4,4,3],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_REKREASI_TENTERA_UDARA": {
    shortName: "KRTU",
    fullName: "Kelab Rekreasi Tentera Udara",
    location: ["Kuala Lumpur", "Kuala Lumpur", "Malaysia"],
    pars: [4,4,5,3,4,4,5,3,4, 4,4,5,3,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELAB_REKREASI_TENTERA_UDARA SUBANG": {
    shortName: "KRTUS",
    fullName: "Kelab Rekreasi Tentera Udara Subang",
    location: ["Subang", "Selangor", "Malaysia"],
    pars: [4,4,5,4,3,5,3,4,4, 5,3,4,4,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KELANTAN_GOLF_AND_COUNTRY CLUB": {
    shortName: "KGACC",
    fullName: "Kelantan Golf and Country Club",
    location: ["Kota Bharu", "Kelantan", "Malaysia"],
    pars: [4,3,5,4,4,3,5,4,4, 4,5,3,4,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KENINGAU_GOLF_AND_COUNTRY CLUB": {
    shortName: "KGCC",
    fullName: "Keningau Golf & Country Club",
    location: ["Keningau", "Sabah", "Malaysia"],
    pars: [5,3,4,4,3,5,4,4,4, 4,5,3,4,4,3,4,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KOTA_PERMAI_GOLF_AND_COUNTRY CLUB": {
    shortName: "KPGCC",
    fullName: "Kota Permai Golf & Country Club",
    location: ["Shah Alam", "Selangor", "Malaysia"],
    pars: [5,4,4,3,4,3,5,4,4, 4,4,5,4,3,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KOTA_SERIEMAS_GOLF_AND_COUNTRY CLUB": {
    shortName: "KSGCC",
    fullName: "Kota Seriemas Golf & Country Club",
    location: ["Nilai", "Negeri Sembilan", "Malaysia"],
    pars: [5,4,4,4,4,3,5,3,4, 5,4,4,4,3,5,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KUALA_KUBU_BARU_GOLF_AND_COUNTRY CLUB": {
    shortName: "KKBGCC",
    fullName: "Kuala Kubu Baru Golf & Country Club",
    location: ["Kuala Kubu Bharu", "Selangor", "Malaysia"],
    pars: [4,4,3,4,5,4,3,3,5, 4,3,4,4,3,4,4,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KUALA_TERENGGANU_GOLF_RESORT": {
    shortName: "KTGR",
    fullName: "Kuala Terengganu Golf Resort",
    location: ["Kuala Terengganu", "Terengganu", "Malaysia"],
    pars: [5,4,4,3,4,4,5,3,4, 5,3,4,4,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KUKUP_GOLF_RESORT": {
    shortName: "KGR",
    fullName: "Kukup Golf Resort",
    location: ["Kukup", "Johor", "Malaysia"],
    pars: [4,4,5,4,3,4,4,3,5, 5,4,4,3,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "KULIM_GOLF_AND_COUNTRY_RESORT": {
    shortName: "KGCR",
    fullName: "Kulim Golf & Country Resort",
    location: ["Kulim", "Kedah", "Malaysia"],
    pars: [4,4,3,5,4,4,3,5,4, 4,4,4,3,5,3,4,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "Kundang_Lakes_Country_Club": {
    shortName: "KLCC",
    fullName: "Kundang Lakes Country Club",
    location: ["Rawang", "Selangor", "Malaysia"],
    pars: [5,3,4,5,4,3,4,4,4, 5,3,4,5,4,3,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "LABUAN_INTERNATIONAL_GOLF CLUB": {
    shortName: "LIGC",
    fullName: "Labuan International Golf Club",
    location: ["Labuan", "Labuan", "Malaysia"],
    pars: [4,5,5,4,3,4,3,4,4, 5,4,4,3,5,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "LEMBAH_BERINGIN_GOLF CLUB": {
    shortName: "LBGC",
    fullName: "Lembah Beringin Golf Club",
    location: ["Kuala Lumpur", "Kuala Lumpur", "Malaysia"],
    pars: [4,5,4,3,4,4,5,3,4, 4,5,4,4,3,5,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "MAHKOTA_GOLF_AND_COUNTRY CLUB": {
    shortName: "MGCC",
    fullName: "Mahkota Golf & Country Club",
    location: ["Bandar Mahkota Cheras", "Selangor", "Malaysia"],
    pars: [4,3,4,4,5,4,4,3,5, 4,3,5,4,4,5,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "MARAN_HILL_GOLF_RESORT": {
    shortName: "MHGR",
    fullName: "Maran Hill Golf Resort",
    location: ["Maran", "Pahang", "Malaysia"],
    pars: [4,5,3,5,4,4,3,4,4, 5,4,4,3,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "MONTEREZ_GOLF_AND_COUNTRY CLUB": {
    shortName: "MGCC",
    fullName: "Monterez Golf & Country Club",
    location: ["Shah Alam", "Selangor", "Malaysia"],
    pars: [4,4,3,5,3,4,4,4,4, 5,4,3,5,4,3,4,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "MOUNTAIN_VIEW_GOLF_RESORT": {
    shortName: "MVGR",
    fullName: "Mountain View Golf Resort",
    location: ["Kajang", "Selangor", "Malaysia"],
    pars: [4,3,5,4,4,4,3,4,5, 4,5,4,3,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "NEXUS_GOLF_RESORT_KARAMBUNAI": {
    shortName: "NGRK",
    fullName: "Nexus Golf Resort Karambunai",
    location: ["Kota Kinabalu", "Sabah", "Malaysia"],
    pars: [5,4,3,4,3,4,4,4,5, 4,4,3,5,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "OCTVILLE__CHRISTINE_RESORT": {
    shortName: "OCR",
    fullName: "Octville - Christine Resort",
    location: ["Melaka", "Melaka", "Malaysia"],
    pars: [4,5,4,4,4,3,5,3,4, 4,4,5,3,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ORCHARD_GOLF_AND_COUNTRY CLUB": {
    shortName: "OGCC",
    fullName: "Orchard Golf And Country Club",
    location: ["Kota Tinggi", "Johor", "Malaysia"],
    pars: [5,4,4,4,3,5,4,3,4, 5,4,4,3,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PENANG_GOLF_CLUB": {
    shortName: "PGC",
    fullName: "Penang Golf Club",
    location: ["George Town", "Penang", "Malaysia"],
    pars: [4,4,5,4,3,5,4,3,4, 4,4,5,3,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PENANG_TURF_CLUB_GOLF_SECTION": {
    shortName: "PTCGS",
    fullName: "Penang Turf Club Golf Section",
    location: ["George Town", "Penang", "Malaysia"],
    pars: [4,4,4,3,4,4,4,4,3, 4,3,5,3,4,3,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PERANGSANG_TEMPLER_GOLF CLUB": {
    shortName: "PTGC",
    fullName: "Perangsang Templer Golf Club",
    location: ["Rawang", "Selangor", "Malaysia"],
    pars: [4,5,4,3,4,3,4,4,5, 4,3,4,4,4,5,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PERMAIPURA_GOLF_AND_COUNTRY CLUB": {
    shortName: "PGCC",
    fullName: "Permaipura Golf & Country Club",
    location: ["Keningau", "Sabah", "Malaysia"],
    pars: [4,4,3,4,5,3,5,4,4, 4,4,4,3,4,3,5,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PONDEROSA_GOLF_AND_COUNTRY CLUB": {
    shortName: "PGCC",
    fullName: "Ponderosa Golf & Country Club",
    location: ["Johor Bahru", "Johor", "Malaysia"],
    pars: [4,3,4,4,4,5,3,4,5, 4,5,3,4,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PORT_DICKSON_GOLF_AND_COUNTRY CLUB": {
    shortName: "PDGCC",
    fullName: "Port Dickson Golf & Country Club",
    location: ["Port Dickson", "Negeri Sembilan", "Malaysia"],
    pars: [4,4,4,3,4,3,5,4,5, 5,4,5,3,4,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "PUTRA_GOLF_CLUB": {
    shortName: "PGC",
    fullName: "Putra Golf Club",
    location: ["Seri Kembangan", "Selangor", "Malaysia"],
    pars: [5,4,4,3,4,5,4,3,4, 4,5,3,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_KAMPUNG_KUANTAN_GOLF CLUB": {
    shortName: "RKKGC",
    fullName: "Royal Kampung Kuantan Golf Club",
    location: ["Kuantan", "Pahang", "Malaysia"],
    pars: [4,5,3,4,4,4,3,5,4, 4,3,5,3,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_KEDAH_CLUB": {
    shortName: "RKC",
    fullName: "Royal Kedah Club",
    location: ["Alor Setar", "Kedah", "Malaysia"],
    pars: [4,5,4,3,4,5,3,4,4, 4,5,4,3,4,5,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_KG_KUANTAN_GOLF CLUB": {
    shortName: "RKKGC",
    fullName: "Royal Kg Kuantan Golf Club",
    location: ["Kuantan", "Pahang", "Malaysia"],
    pars: [4,5,3,4,4,4,3,5,4, 4,3,5,3,5,4,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_PAHANG_GOLF_CLUB": {
    shortName: "RPGC",
    fullName: "Royal Pahang Golf Club",
    location: ["Kuantan", "Pahang", "Malaysia"],
    pars: [5,4,4,4,3,5,4,3,4, 5,3,4,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_PALM_SPRINGS_GOLF_CLUBDICKSON_BAY_GOLF RESORT": {
    shortName: "RPSGCBGR",
    fullName: "Royal Palm Springs Golf Club/Dickson Bay Golf Resort",
    location: ["Port Dickson", "Negeri Sembilan", "Malaysia"],
    pars: [4,5,3,4,4,5,4,3,4, 5,4,4,3,4,4,3,5,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_PEKAN_GOLF_CLUB": {
    shortName: "RPGC",
    fullName: "Royal Pekan Golf Club",
    location: ["Pekan", "Pahang", "Malaysia"],
    pars: [4,5,4,4,3,5,3,4,4, 4,3,4,5,4,3,5,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_PERAK_GOLF_CLUB": {
    shortName: "RPGC",
    fullName: "Royal Perak Golf Club",
    location: ["Ipoh", "Perak", "Malaysia"],
    pars: [5,4,3,4,3,5,4,4,4, 5,4,4,3,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SABAH_GOLF_AND_COUNTRY CLUB": {
    shortName: "SGCC",
    fullName: "Sabah Golf & Country Club",
    location: ["Kota Kinabalu", "Sabah", "Malaysia"],
    pars: [4,5,4,4,3,5,4,3,4, 4,4,3,4,5,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SAMARAHAN_COUNTRY_CLUB": {
    shortName: "SCC",
    fullName: "Samarahan Country Club",
    location: ["Kota Samarahan", "Sarawak", "Malaysia"],
    pars: [4,4,3,5,3,4,4,5,4, 4,4,4,4,5,3,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "Sebana_Cove_Golf_&_Marina_Resort ": {
    shortName: "SCGMR",
    fullName: "Sebana Cove Golf & Marina Resort ",
    location: ["Kota Tinggi", "Johor", "Malaysia"],
    pars: [4,4,5,4,3,4,3,5,4, 4,5,4,4,3,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SELESA_HILLHOMES_AND_GOLF_RESORT": {
    shortName: "SHGR",
    fullName: "Selesa Hillhomes & golf resort",
    location: ["Hulu Langat", "Selangor", "Malaysia"],
    pars: [5,4,4,3,4,3,4,4,5, 4,3,5,3,4,5,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SENIBONG_GOLF_CLUB": {
    shortName: "SGC",
    fullName: "Senibong Golf Club",
    location: ["Johor Bahru", "Johor", "Malaysia"],
    pars: [4,3,4,4,3,4,5,3,5, 4,4,4,4,5,5,4,4,3],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SEREMBAN_INTERNATIONAL_GOLF CLUB": {
    shortName: "SIGC",
    fullName: "Seremban International Golf Club",
    location: ["Seremban", "Negeri Sembilan", "Malaysia"],
    pars: [4,3,5,4,4,5,4,4,3, 4,5,3,4,4,3,4,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SUNGAI_LONG_GOLF_AND_COUNTRY_CLUB": {
    shortName: "SLGCC",
    fullName: "Sungai Long Golf & Country Club",
    location: ["Kajang", "Selangor", "Malaysia"],
    location: ["Kajang", "Selangor", "Malaysia"],
    pars: [4,5,3,4,5,4,4,3,4, 4,4,5,4,3,5,4,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "SHANSHUI_GOLF_AND_COUNTRY CLUB": {
    shortName: "SGCC",
    fullName: "Shan-Shui Golf & Country Club",
    location: ["Setia Alam", "Selangor", "Malaysia"],
    pars: [4,4,3,4,5,4,5,3,4, 5,4,4,5,3,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "TAIPING_GOLF_RESORT": {
    shortName: "TGR",
    fullName: "Taiping Golf Resort",
    location: ["Taiping", "Perak", "Malaysia"],
    pars: [5,4,4,3,4,4,4,3,5, 4,4,4,4,3,4,5,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "TELUK_INTAN_GOLF_AND_COUNTRY CLUB": {
    shortName: "TIGCC",
    fullName: "Teluk Intan Golf & Country Club",
    location: ["Teluk Intan", "Perak", "Malaysia"],
    pars: [4,4,4,5,3,5,3,4,4, 4,5,4,3,4,4,5,3,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "TEMPLER_PARK_COUNTRY_AND_GOLF CLUB": {
    shortName: "TPCGC",
    fullName: "Templer Park Country & Golf Club",
    location: ["Rawang", "Selangor", "Malaysia"],
    pars: [5,3,4,4,4,4,5,3,4, 4,3,5,4,4,5,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "THE_MINES_RESORT_AND_GOLF CLUB": {
    shortName: "TMRGC",
    fullName: "The MINES Resort & Golf Club",
    location: ["Seri Kembangan", "Selangor", "Malaysia"],
    pars: [4,5,4,4,3,4,3,5,4, 4,3,5,4,4,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "TIOMAN_ISLAND_GOLF_CLUB": {
    shortName: "TIGC",
    fullName: "Tioman Island Golf Club",
    location: ["Pulau Tioman", "Pahang", "Malaysia"],
    pars: [4,3,5,4,4,4,3,4,5, 4,3,5,4,4,4,3,4,4],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "UPM_GOLF_CLUB": {
    shortName: "UGC",
    fullName: "UPM Golf Club",
    location: ["Serdang", "Selangor", "Malaysia"],
    pars: [5,4,4,4,5,3,4,3,4, 4,3,4,4,4,4,5,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "VILLEA_ROMPIN_RESORT_& GOLF": {
    shortName: "VRRG",
    fullName: "Villea Rompin Resort & Golf",
    location: ["Rompin", "Pahang", "Malaysia"],
    pars: [4,4,4,4,3,5,3,5,4, 4,5,3,4,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  },

  "ROYAL_SERI_MENANTI_GOLF_AND_COUNTRY CLUB": {
    shortName: "RSMGCC",
    fullName: "Royal Seri Menanti Golf & Country Club",
    location: ["Kuala Pilah", "Negeri Sembilan", "Malaysia"],
    pars: [5,4,3,4,4,4,5,4,3, 5,3,4,4,4,4,3,4,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  }
};

const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const icon = type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm animate-pulse`}>
      {icon}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, message, t, showScreenshotHint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4 leading-relaxed">{message}</h3>
        {showScreenshotHint && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Camera className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                {t('screenshotHint')}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {t('yes')}
          </button>
        </div>
      </div>
    </div>
  );
});

const HoleScoreConfirmDialog = memo(({ isOpen, onClose, onConfirm, hole, players, scores, rankings, gameMode, getHandicapForHole, pars, t, stake, prizePool, activePlayers }) => {
  if (!isOpen || !players) return null;

  let skinsWinner = null;
  let skinsAmount = 0;
  let netWinnings = 0;
  if (gameMode === 'skins' && Number(stake) > 0) {
    const par = pars[hole] || 4;
    const playerScores = players.map(p => ({
      player: p,
      score: scores[p] || par,
      netScore: (scores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    if (winners.length === 1) {
      skinsWinner = winners[0].player;
      skinsAmount = prizePool + (Number(stake) || 0) * activePlayers.length;
      netWinnings = skinsAmount - Number(stake);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {t('confirmHoleScore').replace('{hole}', hole)}
        </h3>
        
        {gameMode === 'skins' && Number(stake) > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            {skinsWinner ? (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('skinsWinner').replace('{player}', skinsWinner)}
                </div>
                <div className="text-center text-2xl font-bold text-purple-600 mt-1">
                  ${netWinnings}
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('holeTied')}
                </div>
                <div className="text-center text-sm text-purple-600 mt-1">
                  {t('poolGrows')}: ${prizePool + (Number(stake) || 0) * activePlayers.length}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">{t('holeScoresSummary')}</p>
          <div className="space-y-2">
            {(gameMode === 'matchPlay' || gameMode === 'skins') ? (
              players.map(player => {
                const score = scores[player] || (pars[hole] || 4);
                const handicap = getHandicapForHole(player, pars[hole] || 4);
                const netScore = score - handicap;
                
                return (
                  <div key={player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{player}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{score}</span>
                      {handicap > 0 && (
                        <div className="text-xs text-green-600">
                          {t('netScore')}: {netScore}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              rankings && rankings.map(r => (
                <div key={r.player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{r.player}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{r.score}</span>
                    {r.up && <span className="ml-1 text-xs text-yellow-600">(UP)</span>}
                    <div className="text-xs text-gray-600">
                      {r.finalRank === 1 ? t('winner') : t('rank').replace('{n}', r.finalRank)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
});

const PlayerInput = memo(({ index, value, placeholder, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(index, e.target.value);
  }, [index, onChange]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
    />
  );
});

const HandicapRow = memo(({ playerName, handicaps, onChange }) => {
  const handleParChange = useCallback((parType, value) => {
    onChange(playerName, parType, value);
  }, [playerName, onChange]);

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-3">
      <div className="text-sm font-semibold text-green-600 mb-2">
        {playerName}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 3</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par3 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par3', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 4</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par4 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par4', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 5</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par5 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par5', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
});

const ScoreDisplay = memo(({ score, par }) => {
  const diff = score - par;
  
  let colorClass = 'text-gray-900';
  if (diff <= -2) colorClass = 'text-purple-600';
  else if (diff === -1) colorClass = 'text-blue-600';
  else if (diff === 0) colorClass = 'text-gray-900';
  else if (diff === 1) colorClass = 'text-orange-600';
  else colorClass = 'text-red-600';
  
  return <span className={`font-semibold ${colorClass}`}>{score}</span>;
});

const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};

function IntegratedGolfGame() {
  const [lang, setLang] = useState('zh');
  const [currentSection, setCurrentSection] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null, showScreenshotHint: false });
  const [holeConfirmDialog, setHoleConfirmDialog] = useState({ isOpen: false, action: null });
  
  const [setupMode, setSetupMode] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseApplied, setCourseApplied] = useState(false);
  
  const [courseType, setCourseType] = useState('f18');
  const [holes, setHoles] = useState(courses.f18);
  const [pars, setPars] = useState(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
  
  const [gameMode, setGameMode] = useState('matchPlay');
  const [jumboMode, setJumboMode] = useState(false);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [stake, setStake] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [handicap, setHandicap] = useState('off');
  const [playerHandicaps, setPlayerHandicaps] = useState({});
  
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState({});  
  const [ups, setUps] = useState({});  
  const [allScores, setAllScores] = useState({});  
  const [allUps, setAllUps] = useState({});  
  const [totalMoney, setTotalMoney] = useState({});
  const [moneyDetails, setMoneyDetails] = useState({});
  const [completedHoles, setCompletedHoles] = useState([]);
  const [pendingRankings, setPendingRankings] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentHoleSettlement, setCurrentHoleSettlement] = useState(null);
  const [totalSpent, setTotalSpent] = useState({});
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const activePlayers = useMemo(() => {
    return playerNames.filter(name => name.trim());
  }, [playerNames]);

  // 从localStorage加载游戏状态
  useEffect(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      setHasSavedGame(true);
    }
  }, []);
useEffect(() => {
  if (currentSection === 'course') {
    setSearchQuery('');
    setSelectedCourse(null);
    setCourseApplied(false);
  }
}, [currentSection]);
  // 清除已保存的游戏
  const clearSavedGame = useCallback(() => {
    localStorage.removeItem('golfGameState');
    setHasSavedGame(false);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // 恢复游戏状态
  const resumeGame = useCallback(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        setLang(gameState.lang || 'zh');
        setCourseType(gameState.courseType || 'f18');
        setHoles(gameState.holes || courses.f18);
        setPars(gameState.pars || {});
        setGameMode(gameState.gameMode || 'matchPlay');
        setPlayerNames(gameState.playerNames || ['', '', '', '']);
        setStake(gameState.stake || '');
        setPrizePool(gameState.prizePool || '');
        setHandicap(gameState.handicap || 'off');
        setPlayerHandicaps(gameState.playerHandicaps || {});
        setCurrentHole(gameState.currentHole || 0);
        setScores(gameState.scores || {});
        setUps(gameState.ups || {});
        setAllScores(gameState.allScores || {});
        setAllUps(gameState.allUps || {});
        setTotalMoney(gameState.totalMoney || {});
        setMoneyDetails(gameState.moneyDetails || {});
        setCompletedHoles(gameState.completedHoles || []);
        setGameComplete(gameState.gameComplete || false);
        setCurrentHoleSettlement(gameState.currentHoleSettlement || null);
        setTotalSpent(gameState.totalSpent || {});
        setSelectedCourse(gameState.selectedCourse || null);
        setSetupMode(gameState.setupMode || 'auto');
        setJumboMode(gameState.jumboMode || false);
        setCurrentSection('game');
      } catch (error) {
        console.error('Failed to resume game:', error);
        showToast('恢复游戏失败', 'error');
      }
    }
  }, [showToast]);

  // 保存游戏状态到localStorage
  useEffect(() => {
    if (currentSection === 'game' && activePlayers.length > 0) {
      const gameState = {
        lang,
        courseType,
        holes,
        pars,
        gameMode,
        playerNames,
        stake,
        prizePool,
        handicap,
        playerHandicaps,
        currentHole,
        scores,
        ups,
        allScores,
        allUps,
        totalMoney,
        moneyDetails,
        completedHoles,
        gameComplete,
        currentHoleSettlement,
        totalSpent,
        selectedCourse,
        setupMode,
        jumboMode
      };
      localStorage.setItem('golfGameState', JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [currentSection, lang, courseType, holes, pars, gameMode, playerNames, stake, prizePool, 
      handicap, playerHandicaps, currentHole, scores, ups, allScores, allUps, totalMoney, 
      moneyDetails, completedHoles, gameComplete, currentHoleSettlement, totalSpent, 
      selectedCourse, setupMode, jumboMode, activePlayers.length]);

  const showConfirm = useCallback((message, action, showScreenshotHint = false) => {
    setConfirmDialog({ isOpen: true, message, action, showScreenshotHint });
  }, []);

  useEffect(() => {
    if (currentSection === 'scorecard') {
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    }
  }, [currentSection]);

const filteredCourses = useMemo(() => {
  if (!searchQuery.trim()) return [];
  
  // 将搜索词拆分成多个关键词
  const keywords = searchQuery.toLowerCase().trim().split(/\s+/);
  
  // 过滤并评分
  const coursesWithScore = Object.values(GOLF_COURSES)
    .map(course => {
      const fullNameLower = course.fullName.toLowerCase();
      const shortNameLower = course.shortName.toLowerCase();
      
      // 确保所有关键词都匹配
      const allKeywordsMatch = keywords.every(keyword => 
        fullNameLower.includes(keyword) || shortNameLower.includes(keyword)
      );
      
      if (!allKeywordsMatch) return null;
      
      // 计算匹配分数
      let score = 0;
      
      if (fullNameLower === searchQuery.toLowerCase()) score += 100;
      if (shortNameLower === searchQuery.toLowerCase()) score += 100;
      if (fullNameLower.startsWith(searchQuery.toLowerCase())) score += 50;
      if (shortNameLower.startsWith(searchQuery.toLowerCase())) score += 50;
      
      keywords.forEach(keyword => {
        if (fullNameLower.includes(keyword)) score += 10;
        if (shortNameLower.includes(keyword)) score += 5;
        if (fullNameLower.startsWith(keyword)) score += 5;
        if (shortNameLower.startsWith(keyword)) score += 3;
      });
      
      return { course, score };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .map(item => item.course);
  
  return coursesWithScore;
}, [searchQuery]);

  const getParColorClass = useCallback((par) => {
    if (par === 3) return 'bg-yellow-300 text-black';
    if (par === 5) return 'bg-orange-300 text-black';
    if (par === 6) return 'bg-red-400 text-black';
    return 'bg-gray-300 text-black';
  }, []);

  const t = useCallback((key) => {
    const translations = {
      zh: {
        title: 'HandinCap',
        subtitle: '让每一杆都算数',
        create: '创建新局',
        courseTitle: '球场设置',
        autoMode: '自动搜索',
        manualMode: '手动输入',
        searchPlaceholder: '搜索球场名称...',
        selectCourse: '选择球场',
        gameType: '比赛类型',
        setPar: '设置各洞PAR值',
        confirmCourse: '确认设置',
        playerTitle: '玩家设置',
        players: '玩家',
        player1: '玩家1',
        player2: '玩家2',
        player3: '玩家3',
        player4: '玩家4',
        player5: '玩家5',
        player6: '玩家6',
        player7: '玩家7',
        player8: '玩家8',
        enterName: '输入姓名',
        gameMode: '游戏模式',
        matchPlay: 'Match Play',
        win123: 'Win123',
        skins: 'Skins',
        stake: '底注',
        prizePool: '奖金池',
        penaltyPot: '罚金池',
        optional: '可选',
        enterStake: '输入金额（可选）',
        handicap: '差点',
        handicapSettings: '差点设置',
        off: '关',
        on: '开',
        back: '返回',
        start: '开始比赛',
        hole: '洞',
        par: 'PAR',
        nextHole: '确认成绩 →',
        currentMoney: '实时战况',
        poolBalance: '奖池余额',
        holeTied: '本洞平局',
        poolGrows: '下洞奖池',
        skinsWinner: '{player}赢得Skins！',
        holeSettlement: '该洞结算',
        netScore: '净杆',
        rank: '第{n}名',
        winner: '胜利',
        resume: '继续比赛',
        finishRound: '确认并结束',
        confirmHoleScore: '确认第{hole}洞成绩',
        holeScoresSummary: '各玩家成绩：',
        confirmPrev: '确定要返回上一洞吗？',
        cancel: '取消',
        yes: '确定',
        confirm: '确认',
        switchLang: 'English',
        noStake: '请输入底注金额',
        atLeast2: '请至少输入2名玩家',
        gameOver: '比赛结束！',
        backToHome: '回到首页',
        out: '前九',
        in: '后九',
        total: '计',
        totalScore: '总成绩',
        standardPar: '标准杆',
        finalSettlement: '最终结算',
        noScoreData: '还没有开始记分',
        f9: '前9洞',
        b9: '后9洞',
        f18: '前18洞',
        b18: '后18洞',
        f9Desc: '1-9洞',
        b9Desc: '10-18洞',
        f18Desc: '1-18洞标准',
        b18Desc: '10-18,1-9洞',
        saved: '已保存！',
        duplicateNames: '玩家名不可重复',
        screenshotHint: '建议您先截图保存成绩记录',
        totalLoss: '累计',
        totalPar: 'PAR',
        noCourses: '未找到球场',
        trySearch: '请尝试其他关键词',
        front9: '前九',
        back9: '后九',
        eagle: '老鹰',
        birdie: '小鸟',
        parLabel: '标准杆',
        bogey: '柏忌',
        doubleplus: '双柏忌+'
      },
      en: {
        title: 'HandinCap',
        subtitle: 'Just a Game',
        create: 'Create New Game',
        courseTitle: 'Course Setup',
        autoMode: 'Auto Search',
        manualMode: 'Manual Input',
        searchPlaceholder: 'Search course name...',
        selectCourse: 'Select Course',
        gameType: 'Game Type',
        setPar: 'Set PAR Values',
        confirmCourse: 'Confirm',
        playerTitle: 'Player Setup',
        players: 'Players',
        player1: 'Player 1',
        player2: 'Player 2',
        player3: 'Player 3',
        player4: 'Player 4',
        player5: 'Player 5',
        player6: 'Player 6',
        player7: 'Player 7',
        player8: 'Player 8',
        enterName: 'Enter name',
        gameMode: 'Game Mode',
        matchPlay: 'Match Play',
        win123: 'Win123',
        skins: 'Skins',
        stake: 'Stake',
        prizePool: 'Prize Pool',
        penaltyPot: 'Pot',
        optional: 'Optional',
        enterStake: 'Enter amount (optional)',
        handicap: 'Handicap',
        handicapSettings: 'Handicap Settings',
        off: 'Off',
        on: 'On',
        back: 'Back',
        start: 'Start Game',
        hole: 'Hole',
        par: 'PAR',
        nextHole: 'Confirm & Next',
        currentMoney: 'Live Standings',
        poolBalance: 'Pool Balance',
        holeTied: 'Hole Tied',
        poolGrows: 'Next hole pool',
        skinsWinner: '{player} wins the Skin!',
        holeSettlement: 'Hole Settlement',
        netScore: 'Net',
        rank: 'Rank {n}',
        winner: 'Winner',
        resume: 'Resume Game',
        finishRound: 'Confirm & Finish',
        confirmHoleScore: 'Confirm Hole {hole} Scores',
        holeScoresSummary: 'Player Scores:',
        confirmPrev: 'Go back to previous hole?',
        cancel: 'Cancel',
        yes: 'Yes',
        confirm: 'Confirm',
        switchLang: '中文',
        noStake: 'Please enter stake amount',
        atLeast2: 'Please enter at least 2 players',
        gameOver: 'Game Over!',
        backToHome: 'Back to Home',
        out: 'OUT',
        in: 'IN',
        total: 'Tot',
        totalScore: 'Total Score',
        standardPar: 'Par',
        finalSettlement: 'Final Settlement',
        noScoreData: 'No scores recorded yet',
        f9: 'Front 9',
        b9: 'Back 9',
        f18: 'Front 18',
        b18: 'Back 18',
        f9Desc: 'Holes 1-9',
        b9Desc: 'Holes 10-18',
        f18Desc: 'Standard 1-18',
        b18Desc: '10-18, 1-9',
        saved: 'Saved!',
        duplicateNames: 'Player names must be unique',
        screenshotHint: 'We recommend taking a screenshot to save your scores',
        totalLoss: 'Total',
        totalPar: 'PAR',
        noCourses: 'No courses found',
        trySearch: 'Try different keywords',
        front9: 'Front 9',
        back9: 'Back 9',
        eagle: 'Eagle',
        birdie: 'Birdie',
        parLabel: 'Par',
        bogey: 'Bogey',
        doubleplus: 'Double+'
      }
    };
    return translations[lang][key] || key;
  }, [lang]);

  const setCourse = useCallback((type) => {
    setCourseType(type);
    const newHoles = courses[type];
    setHoles(newHoles);
    
    if (selectedCourse) {
      const newPars = {};
      newHoles.forEach((hole, index) => {
        newPars[hole] = selectedCourse.pars[index] || 4;
      });
      setPars(newPars);
    } else {
      setPars(newHoles.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
    }
  }, [selectedCourse]);

  const setPar = useCallback((hole, par) => {
    setPars(prev => ({ ...prev, [hole]: par }));
  }, []);

  const confirmCourse = useCallback(() => {
    showToast(t('saved'));
    setCurrentSection('players');
  }, [showToast, t]);

  const selectAndApplyCourse = useCallback((course) => {
    setSelectedCourse(course);
    setCourseApplied(false);
    
    setCourseType('f18');
    const newHoles = courses.f18;
    setHoles(newHoles);
    
    const newPars = {};
    newHoles.forEach((hole, index) => {
      newPars[hole] = course.pars[index] || 4;
    });
    setPars(newPars);
    setCourseApplied(true);
    
    setSearchQuery('');
  }, []);

  const getVerticalArrangedHoles = useCallback(() => {
    const arranged = [];
    
    if (courseType === 'f9' || courseType === 'b9') {
      for (let i = 0; i < holes.length; i++) {
        arranged.push([holes[i], null]);
      }
    } else if (courseType === 'f18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    } else if (courseType === 'b18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    }
    
    return arranged;
  }, [holes, courseType]);

  const calculateTotalPar = useCallback(() => {
    return holes.reduce((sum, hole) => sum + (pars[hole] || 4), 0);
  }, [holes, pars]);

  const updatePlayerName = useCallback((index, value) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  const toggleJumboMode = useCallback(() => {
    setJumboMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setPlayerNames(['', '', '', '', '', '', '', '']);
      } else {
        setPlayerNames(['', '', '', '']);
      }
      return newMode;
    });
  }, []);

  const updatePlayerHandicap = useCallback((playerName, parType, value) => {
    setPlayerHandicaps(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        [parType]: value === '' ? undefined : value
      }
    }));
  }, []);

  const getScoreLabel = useCallback((netScore, par) => {
    const diff = netScore - par;
    let textKey, className;
    
    if (diff <= -2) {
      textKey = 'eagle';
      className = 'bg-purple-100 text-purple-700';
    } else if (diff === -1) {
      textKey = 'birdie';
      className = 'bg-blue-100 text-blue-700';
    } else if (diff === 0) {
      textKey = 'parLabel';
      className = 'bg-gray-100 text-gray-700';
    } else if (diff === 1) {
      textKey = 'bogey';
      className = 'bg-orange-100 text-orange-700';
    } else {
      textKey = 'doubleplus';
      className = 'bg-red-100 text-red-700';
    }
    
    return { text: t(textKey), class: className };
  }, [t]);

  const startGame = useCallback(() => {
    if (activePlayers.length < 2) {
      showToast(t('atLeast2'), 'error');
      return;
    }

    const uniqueNames = new Set(activePlayers);
    if (uniqueNames.size !== activePlayers.length) {
      showToast(t('duplicateNames'), 'error');
      return;
    }

    const stakeValue = Number(stake) || 0;
    
    if (gameMode === 'matchPlay') {
    } else if (gameMode === 'skins') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);
    } else if (gameMode === 'win123') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);
    }

    const initMoney = {};
    const initDetails = {};
    const initAllScores = {};
    const initSpent = {};
    
    activePlayers.forEach(player => {
      initMoney[player] = 0;
      initDetails[player] = { fromPool: 0, fromPlayers: {} };
      initAllScores[player] = {};
      initSpent[player] = 0;
      activePlayers.forEach(other => {
        if (other !== player) {
          initDetails[player].fromPlayers[other] = 0;
        }
      });
    });
    
    setTotalMoney(initMoney);
    setMoneyDetails(initDetails);
    setAllScores(initAllScores);
    setAllUps({});
    setTotalSpent(initSpent);
    setCurrentHole(0);  
    setScores({});
    setUps({});
    setCompletedHoles([]);
    setGameComplete(false);
    setCurrentHoleSettlement(null);
    setCurrentSection('game');
  }, [activePlayers, stake, gameMode, showToast, t]);

  const getHandicapForHole = useCallback((player, par = 4) => {
    if (handicap !== 'on') return 0;
    const handicaps = playerHandicaps[player];
    if (!handicaps) return 0;
    
    if (par === 3) return handicaps.par3 || 0;
    if (par === 4) return handicaps.par4 || 0;
    if (par === 5) return handicaps.par5 || 0;
    return 0;
  }, [handicap, playerHandicaps]);

  const calculateMatchPlay = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    const losers = playerScores.filter(p => p.netScore > minScore);
    
    const results = {};
    activePlayers.forEach(player => {
      results[player] = { money: 0 };
    });
    
    if (winners.length < activePlayers.length && stakeValue > 0) {
      const winAmount = (losers.length * stakeValue) / winners.length;
      winners.forEach(w => {
        results[w.player].money = winAmount;
      });
      losers.forEach(l => {
        results[l.player].money = -stakeValue;
      });
    }
    
    return results;
  }, [activePlayers, stake, pars, getHandicapForHole]);

  const calculateSkins = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    
    const currentPrizePool = Math.max(0, prizePool);
    
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    const results = {};
    let poolChange = 0;
    
    activePlayers.forEach(player => {
      results[player] = { 
        money: -stakeValue,
        fromPool: 0,
        spent: stakeValue
      };
    });
    
    const holeStake = stakeValue * activePlayers.length;
    
    if (winners.length === 1) {
      const winner = winners[0].player;
      const winAmount = currentPrizePool + holeStake;
      results[winner].money = winAmount - stakeValue;
      results[winner].fromPool = currentPrizePool;
      
      poolChange = -currentPrizePool;
    } else {
      poolChange = holeStake;
    }
    
    return { results, poolChange, isTied: winners.length > 1, winner: winners.length === 1 ? winners[0].player : null, winAmount: winners.length === 1 ? currentPrizePool + holeStake : 0 };
  }, [activePlayers, stake, pars, getHandicapForHole, prizePool]);

  const calculateWin123 = useCallback((holeScores, holeUps, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par),
      up: holeUps[p] || false
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    
    const uniqueScores = [...new Set(playerScores.map(p => p.netScore))];
    const rankings = [...playerScores];
    
    if (uniqueScores.length === 1) {
      rankings.forEach(r => r.finalRank = 1);
    } else if (uniqueScores.length === 2) {
      const firstScore = uniqueScores[0];
      rankings.forEach(r => {
        r.finalRank = r.netScore === firstScore ? 1 : 4;
      });
    } else if (uniqueScores.length === 3) {
      const firstScore = uniqueScores[0];
      const secondScore = uniqueScores[1];
      const firstCount = rankings.filter(r => r.netScore === firstScore).length;
      
      rankings.forEach(r => {
        if (r.netScore === firstScore) {
          r.finalRank = 1;
        } else if (r.netScore === secondScore) {
          r.finalRank = firstCount >= 3 ? 4 : 3;
        } else {
          r.finalRank = 4;
        }
      });
    } else {
      rankings.forEach((r, i) => r.finalRank = i + 1);
    }
    
    const results = {};
    let poolChange = 0;
    
    activePlayers.forEach(player => {
      results[player] = { money: 0, fromPool: 0 };
    });
    
    if (uniqueScores.length > 1) {
      rankings.forEach(r => {
        let penalty = 0;
        
        if (r.finalRank === 2) penalty = stakeValue;
        else if (r.finalRank === 3) penalty = stakeValue * 2;
        else if (r.finalRank === 4) penalty = stakeValue * 3;
        
        if (r.up) {
          if (r.finalRank === 1) {
            const poolWin = stakeValue * 6;
            results[r.player].money = poolWin;
            results[r.player].fromPool = poolWin;
            poolChange -= poolWin;
          } else {
            penalty = penalty * 2;
          }
        }
        
        if (r.finalRank > 1) {
          results[r.player].money = -penalty;
          poolChange += penalty;
        }
      });
    }
    
    return { results, poolChange, rankings };
  }, [activePlayers, stake, pars, getHandicapForHole]);

  const changeScore = useCallback((player, delta) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const current = scores[player] || par;
    const newScore = Math.max(1, current + delta);
    setScores(prev => ({ ...prev, [player]: newScore }));
    
    const newScores = { ...scores, [player]: newScore };
    const holeScores = {};
    const holeUps = {};
    
    activePlayers.forEach(p => {
      holeScores[p] = newScores[p] || par;
      holeUps[p] = ups[p] || false;
    });
    
    if (gameMode === 'matchPlay') {
      const settlement = calculateMatchPlay(holeScores, holeNum);
      setCurrentHoleSettlement(settlement);
    } else if (gameMode === 'skins') {
      const { results } = calculateSkins(holeScores, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holeUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [scores, currentHole, holes, pars, ups, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123]);

  const toggleUp = useCallback((player) => {
    setUps(prev => ({ ...prev, [player]: !prev[player] }));
    
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const holeScores = {};
    const newUps = { ...ups, [player]: !ups[player] };
    
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
    });
    
    if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, newUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [ups, currentHole, holes, pars, scores, activePlayers, gameMode, calculateWin123]);

  const proceedToNextHole = useCallback(() => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const currentHoleScores = {};
    const currentHoleUps = {};
    
    activePlayers.forEach(player => {
      currentHoleScores[player] = scores[player] || par;
      currentHoleUps[player] = ups[player] || false;
    });
    
    const newAllScores = { ...allScores };
    const newAllUps = { ...allUps };
    
    activePlayers.forEach(player => {
      if (!newAllScores[player]) newAllScores[player] = {};
      if (!newAllUps[player]) newAllUps[player] = {};
      newAllScores[player][holeNum] = currentHoleScores[player];
      newAllUps[player][holeNum] = currentHoleUps[player];
    });
    
    setAllScores(newAllScores);
    setAllUps(newAllUps);
    
    const stakeValue = Number(stake) || 0;
    let finalPrizePool = prizePool;
    
    if (stakeValue > 0 || gameMode === 'skins') {
      if (gameMode === 'matchPlay') {
        const settlement = calculateMatchPlay(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + settlement[player].money;
        });
        setTotalMoney(newTotalMoney);
        
      } else if (gameMode === 'skins') {
        const { results, poolChange } = calculateSkins(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        const newSpent = { ...totalSpent };
        
        activePlayers.forEach(player => {
          newSpent[player] = (newSpent[player] || 0) + (results[player].spent || 0);
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          
          if (results[player].fromPool) {
            newDetails[player].fromPool += results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        setTotalSpent(newSpent);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
        
      } else if (gameMode === 'win123') {
        const { results, poolChange } = calculateWin123(currentHoleScores, currentHoleUps, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          if (results[player].fromPool) {
            newDetails[player].fromPool = (newDetails[player].fromPool || 0) + results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
      }
    }
    
    setCompletedHoles([...completedHoles, holeNum]);
    
    if (currentHole >= holes.length - 1) {
      setGameComplete(true);
      showToast(t('gameOver'));
      setCurrentSection('scorecard');
    } else {
      setCurrentHole(currentHole + 1);
      setScores({});
      setUps({});
      setCurrentHoleSettlement(null);
    }
    
    setHoleConfirmDialog({ isOpen: false, action: null });
    setPendingRankings(null);
  }, [currentHole, holes, scores, ups, activePlayers, allScores, allUps, gameMode, totalMoney, moneyDetails, completedHoles, prizePool, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showToast, t, totalSpent]);

  const nextHole = useCallback(() => {
    if (gameMode === 'win123') {
      const holeNum = holes[currentHole];
      const par = pars[holeNum] || 4;
      const currentHoleScores = {};
      const currentHoleUps = {};
      
      activePlayers.forEach(player => {
        currentHoleScores[player] = scores[player] || par;
        currentHoleUps[player] = ups[player] || false;
      });
      
      const { rankings } = calculateWin123(currentHoleScores, currentHoleUps, holeNum);
      setPendingRankings(rankings);
    }
    setHoleConfirmDialog({ 
      isOpen: true, 
      action: proceedToNextHole
    });
  }, [gameMode, currentHole, holes, scores, ups, activePlayers, pars, calculateWin123, proceedToNextHole]);

  const prevHole = useCallback(() => {
    if (currentHole === 0) return;
    
    showConfirm(t('confirmPrev'), () => {
      const prevHoleIndex = currentHole - 1;
      const prevHoleNum = holes[prevHoleIndex];
      
      const prevScores = {};
      const prevUps = {};
      
      activePlayers.forEach(player => {
        if (allScores[player] && allScores[player][prevHoleNum]) {
          prevScores[player] = allScores[player][prevHoleNum];
        }
        if (allUps[player] && allUps[player][prevHoleNum]) {
          prevUps[player] = allUps[player][prevHoleNum];
        }
      });
      
      setScores(prevScores);
      setUps(prevUps);
      
      const stakeValue = Number(stake) || 0;
      const newTotalMoney = {};
      const newDetails = {};
      const newSpent = {};
      let newPrizePool = 0;
      
      activePlayers.forEach(player => {
        newTotalMoney[player] = 0;
        newSpent[player] = 0;
        newDetails[player] = { fromPool: 0, fromPlayers: {} };
        activePlayers.forEach(other => {
          if (other !== player) {
            newDetails[player].fromPlayers[other] = 0;
          }
        });
      });
      
      if (stakeValue > 0 || gameMode === 'skins') {
        for (let i = 0; i < prevHoleIndex; i++) {
          const holeNum = holes[i];
          const holeScores = {};
          const holeUps = {};
          
          activePlayers.forEach(player => {
            holeScores[player] = allScores[player]?.[holeNum] || (pars[holeNum] || 4);
            holeUps[player] = allUps[player]?.[holeNum] || false;
          });
          
          if (gameMode === 'matchPlay') {
            const settlement = calculateMatchPlay(holeScores, holeNum);
            activePlayers.forEach(player => {
              newTotalMoney[player] += settlement[player].money;
            });
          } else if (gameMode === 'skins') {
            const calculateSkinsForPrevHole = (holeScores, holeNum, currentPool) => {
              const stakeValue = Number(stake) || 0;
              const par = pars[holeNum] || 4;
              
              const playerScores = activePlayers.map(p => ({
                player: p,
                score: holeScores[p] || par,
                netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
              }));
              
              playerScores.sort((a, b) => a.netScore - b.netScore);
              const minScore = playerScores[0].netScore;
              const winners = playerScores.filter(p => p.netScore === minScore);
              
              const results = {};
              let poolChange = 0;
              
              activePlayers.forEach(player => {
                results[player] = { 
                  money: -stakeValue,
                  fromPool: 0,
                  spent: stakeValue
                };
              });
              
              const holeStake = stakeValue * activePlayers.length;
              
              if (winners.length === 1) {
                const winner = winners[0].player;
                const winAmount = currentPool + holeStake;
                results[winner].money = winAmount - stakeValue;
                results[winner].fromPool = currentPool;
                poolChange = -currentPool;
              } else {
                poolChange = holeStake;
              }
              
              return { results, poolChange };
            };
            
            const { results, poolChange } = calculateSkinsForPrevHole(holeScores, holeNum, newPrizePool);
            activePlayers.forEach(player => {
              newSpent[player] += results[player].spent || 0;
              newTotalMoney[player] += results[player].money;
              newDetails[player].fromPool += results[player].fromPool;
            });
            newPrizePool += poolChange;
          } else if (gameMode === 'win123') {
            const { results, poolChange } = calculateWin123(holeScores, holeUps, holeNum);
            activePlayers.forEach(player => {
              newTotalMoney[player] += results[player].money;
              if (results[player].fromPool) {
                newDetails[player].fromPool += results[player].fromPool;
              }
            });
            newPrizePool += poolChange;
          }
        }
      }
      
      setTotalMoney(newTotalMoney);
      setMoneyDetails(newDetails);
      setTotalSpent(newSpent);
      if (gameMode === 'win123' || gameMode === 'skins') {
        setPrizePool(newPrizePool);
      }
      
      setCompletedHoles(completedHoles.filter(h => h !== prevHoleNum));
      setCurrentHole(prevHoleIndex);
      setCurrentHoleSettlement(null);
      
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    });
  }, [currentHole, holes, activePlayers, allScores, allUps, completedHoles, gameMode, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showConfirm, t, getHandicapForHole]);

  const goHome = useCallback(() => {
    const resetGame = () => {
      clearSavedGame();
      setCurrentSection('home');
      setGameMode('matchPlay');
      setJumboMode(false);
      setPlayerNames(['', '', '', '']);
      setStake('');
      setPrizePool('');
      setHandicap('off');
      setPlayerHandicaps({});
      setCourseType('f18');
      setHoles(courses.f18);
      setPars(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
      setCurrentHole(0);
      setScores({});
      setUps({});
      setAllScores({});
      setAllUps({});
      setTotalMoney({});
      setMoneyDetails({});
      setTotalSpent({});
      setCompletedHoles([]);
      setGameComplete(false);
      setCurrentHoleSettlement(null);
      setSetupMode('auto');
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
    };

    if (gameComplete) {
      resetGame();
    } else {
      resetGame();
    }
  }, [gameComplete, clearSavedGame]);

  const getMedal = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {currentSection === 'home' && (
        <div className="flex justify-end items-center p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium shadow-sm"
          >
            {t('switchLang')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-3">
          
          {currentSection === 'home' && (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600">
                  {t('subtitle')}
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                {hasSavedGame && (
                  <button
                    onClick={resumeGame}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('resume')}
                  </button>
                )}
                <button
                  onClick={() => {
    setSearchQuery('');
    setSelectedCourse(null);
    setCourseApplied(false);
    setCurrentSection('course');
  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {t('create')}
                </button>
              </div>
            </div>
          )}

          {currentSection === 'course' && (
            <div className="space-y-4 py-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    {t('courseTitle')}
                  </h2>
                </div>
                
                <div className="flex rounded-lg border-2 border-green-600 overflow-hidden">
                  <button
                    onClick={() => setSetupMode('auto')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'auto'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    {t('autoMode')}
                  </button>
                  <button
                    onClick={() => setSetupMode('manual')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'manual'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {t('manualMode')}
                  </button>
                </div>
              </div>

              {setupMode === 'auto' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      {t('selectCourse')}
                    </h3>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => {
                            const coursePar = course.pars.reduce((sum, par) => sum + par, 0);
                            
                            return (
                              <div
                                key={course.shortName}
                                className="border border-gray-200 bg-white hover:border-green-300 hover:shadow-sm rounded-lg p-3 cursor-pointer transition"
                                onClick={() => selectAndApplyCourse(course)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-0.5">
                                      {course.fullName}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {course.shortName}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    <div className="text-xs text-gray-500">{t('totalPar')}</div>
                                    <div className="text-lg font-bold text-green-600">{coursePar}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">{t('noCourses')}</p>
                            <p className="text-xs mt-1">{t('trySearch')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCourse && courseApplied && (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {selectedCourse.fullName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {selectedCourse.shortName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              PAR {calculateTotalPar()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex rounded-lg border-2 border-green-600 overflow-hidden mb-4">
                          <button
                            onClick={() => {
                              setCourseType('f18');
                              const newHoles = courses.f18;
                              setHoles(newHoles);
                              const newPars = {};
                              newHoles.forEach((hole, index) => {
                                newPars[hole] = selectedCourse.pars[index] || 4;
                              });
                              setPars(newPars);
                            }}
                            className={`flex-1 px-4 py-2 font-semibold text-sm transition ${
                              courseType === 'f18'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-green-50'
                            }`}
                          >
                            {t('f18')}
                          </button>
                          <button
                            onClick={() => {
                              setCourseType('b18');
                              const newHoles = courses.b18;
                              setHoles(newHoles);
                              const newPars = {};
                              newHoles.forEach((hole, index) => {
                                if (index < 9) {
                                  newPars[hole] = selectedCourse.pars[hole - 1] || 4;
                                } else {
                                  newPars[hole] = selectedCourse.pars[hole - 1] || 4;
                                }
                              });
                              setPars(newPars);
                            }}
                            className={`flex-1 px-4 py-2 font-semibold text-sm transition ${
                              courseType === 'b18'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-green-50'
                            }`}
                          >
                            {t('b18')}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                            <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                              {t('front9')}
                            </div>
                            <div className="p-1.5 space-y-1">
                              {holes.slice(0, 9).map((hole, idx) => (
                                <div key={hole}>
                                  <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                    {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                  </div>
                                  <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                    pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                    pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                    'bg-gray-300 text-black'
                                  }`}>
                                    Par {pars[hole]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {holes.length > 9 && (
                            <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                              <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                                {t('back9')}
                              </div>
                              <div className="p-1.5 space-y-1">
                                {holes.slice(9, 18).map((hole, idx) => (
                                  <div key={hole}>
                                    <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                      {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                    </div>
                                    <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                      pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                      pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                      'bg-gray-300 text-black'
                                    }`}>
                                      Par {pars[hole]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {setupMode === 'manual' && (
                <>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {t('gameType')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(courses).map(type => (
                        <button
                          key={type}
                          onClick={() => setCourse(type)}
                          className={`p-2 rounded-lg border transition transform hover:scale-105 ${
                            courseType === type
                              ? 'bg-green-600 text-white border-green-600 shadow-md'
                              : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-green-300 hover:shadow-sm'
                          }`}
                        >
                          <h4 className="font-semibold text-xs">{t(type)}</h4>
                          <p className="text-xs opacity-80" style={{ fontSize: '10px' }}>
                            {t(`${type}Desc`)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('setPar')}</h3>
                    
                    {(courseType === 'f18' || courseType === 'b18') ? (
                      <div className="grid grid-cols-2 gap-3">
                        {getVerticalArrangedHoles().map((pair, index) => (
                          <React.Fragment key={index}>
                            {pair[0] && (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {lang === 'zh' ? `${pair[0]}洞` : `H${pair[0]}`}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5, 6].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[0], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[0]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {pair[1] ? (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {lang === 'zh' ? `${pair[1]}洞` : `H${pair[1]}`}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5, 6].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[1], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[1]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {holes.map(hole => (
                          <div key={hole} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-900">
                              {t('hole')} {hole}
                            </span>
                            <div className="flex gap-1">
                              {[3, 4, 5, 6].map(par => (
                                <button
                                  key={par}
                                  onClick={() => setPar(hole, par)}
                                  className={`w-8 h-8 rounded font-bold text-sm transition-all ${
                                    pars[hole] === par
                                      ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                      : 'bg-gray-100 text-gray-500 border border-gray-400'
                                  }`}
                                >
                                  {par}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t text-center">
                      <span className="text-sm text-gray-600">{t('par')}: </span>
                      <span className="text-lg font-bold text-green-600">{calculateTotalPar()}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
      setCurrentSection('home');
    }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={confirmCourse}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('confirmCourse')}
                </button>
              </div>
            </div>
          )}

          {currentSection === 'players' && (
            <div className="space-y-4 py-3">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('playerTitle')}
                </h2>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('players')}
                  </h3>
                  <button
                    onClick={toggleJumboMode}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
                      jumboMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {lang === 'zh' ? '多人' : 'Jumbo'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: jumboMode ? 8 : 4 }, (_, i) => i).map(i => (
                    <div key={i} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">
                        {t(`player${i + 1}`)}:
                      </label>
                      <PlayerInput
                        index={i}
                        value={playerNames[i]}
                        placeholder={t('enterName')}
                        onChange={updatePlayerName}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {t('gameMode')}:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setGameMode('matchPlay')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'matchPlay'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('matchPlay')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('win123')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'win123'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('win123')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('skins')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'skins'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CircleDollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('skins')}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {t('stake')}:
                    </label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder={t('enterStake')}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      {t('handicap')}:
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setHandicap('off')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          handicap === 'off'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => setHandicap('on')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          handicap === 'on'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {handicap === 'on' && activePlayers.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('handicapSettings')}
                  </h3>
                  {activePlayers.map(playerName => (
                    <HandicapRow
                      key={playerName}
                      playerName={playerName}
                      handicaps={playerHandicaps[playerName] || {}}
                      onChange={updatePlayerHandicap}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSection('course')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('start')}
                </button>
              </div>
            </div>
          )}

          {currentSection === 'scorecard' && (
            <div className="space-y-3 py-3">
              {selectedCourse && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white shadow-md text-center">
                  <h1 className="text-2xl font-bold mb-1">
                    {selectedCourse.fullName}
                  </h1>
                  <p className="text-sm text-green-100">
                    {selectedCourse.shortName}
                  </p>
                </div>
              )}

              {(() => {
                const hasData = completedHoles.length > 0;
                const frontNine = holes.filter(h => h <= 9 && completedHoles.includes(h));
                const backNine = holes.filter(h => h > 9 && completedHoles.includes(h));
                
                const calculateTotal = (player, holesList) => {
                  return holesList.reduce((total, hole) => {
                    const score = allScores[player]?.[hole];
                    return total + (score || 0);
                  }, 0);
                };
                
                const calculateParTotal = (holesList) => {
                  return holesList.reduce((total, hole) => {
                    return total + (pars[hole] || 4);
                  }, 0);
                };
                
                const totalPar = calculateParTotal(completedHoles);
                const playerTotals = {};
                activePlayers.forEach(player => {
                  playerTotals[player] = calculateTotal(player, completedHoles);
                });

                const scoreRankings = activePlayers
                  .map(player => ({ player, score: playerTotals[player] }))
                  .sort((a, b) => a.score - b.score)
                  .reduce((acc, { player }, index, arr) => {
                    if (index === 0) {
                      acc[player] = 1;
                    } else {
                      const prevPlayer = arr[index - 1].player;
                      if (playerTotals[player] === playerTotals[prevPlayer]) {
                        acc[player] = acc[prevPlayer];
                      } else {
                        acc[player] = index + 1;
                      }
                    }
                    return acc;
                  }, {});

                const moneyRankings = (Number(stake) > 0) ? activePlayers
                  .map(player => ({ player, money: totalMoney[player] }))
                  .sort((a, b) => b.money - a.money)
                  .reduce((acc, { player }, index, arr) => {
                    if (index === 0) {
                      acc[player] = 1;
                    } else {
                      const prevPlayer = arr[index - 1].player;
                      if (totalMoney[player] === totalMoney[prevPlayer]) {
                        acc[player] = acc[prevPlayer];
                      } else {
                        acc[player] = index + 1;
                      }
                    }
                    return acc;
                  }, {}) : {};
                
                return (
                  <>
                    {gameComplete && hasData && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                          {t('totalScore')} ({t('standardPar')}: {totalPar})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {activePlayers.map(player => {
                            const total = playerTotals[player];
                            const diff = total - totalPar;
                            const diffText = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                            const diffColor = diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600';
                            const rank = scoreRankings[player];
                            const medal = getMedal(rank);
                            
                            return (
                              <div key={player} className="text-center p-2 bg-gray-50 rounded">
                                <div className="text-xs font-medium text-gray-700 flex items-center justify-center gap-1">
                                  {player}
                                  {medal && <span className="text-sm">{medal}</span>}
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-xl font-bold text-gray-900">{total || '-'}</span>
                                  {total > 0 && (
                                    <span className={`text-xs font-semibold ${diffColor}`}>
                                      ({diffText})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasData ? (
                      <>
                        {frontNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                    {t('out')}
                                  </th>
                                  {frontNine.map(hole => (
                                    <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                      {hole}
                                    </th>
                                  ))}
                                  <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                    {t('total')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                  {frontNine.map(hole => (
                                    <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                      {pars[hole] || 4}
                                    </td>
                                  ))}
                                  <td className="px-1 py-1 text-center font-bold text-gray-900">
                                    {calculateParTotal(frontNine)}
                                  </td>
                                </tr>
                                {activePlayers.map((player, index) => (
                                  <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {frontNine.map(hole => {
                                      const score = allScores[player]?.[hole];
                                      const par = pars[hole] || 4;
                                      const handicapValue = getHandicapForHole(player, par);
                                      const netScore = score ? score - handicapValue : null;
                                      
                                      return (
                                        <td key={hole} className="px-0 py-1 text-center">
                                          {score ? (
                                            <div>
                                              <ScoreDisplay score={score} par={par} />
                                              {!gameComplete && handicap === 'on' && handicapValue > 0 && (
                                                <div style={{ fontSize: '8px', color: '#059669' }}>
                                                  ({netScore})
                                                </div>
                                              )}
                                            </div>
                                          ) : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1 text-center font-bold text-gray-900">
                                      {calculateTotal(player, frontNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {backNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                    {t('in')}
                                  </th>
                                  {backNine.map(hole => (
                                    <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                      {hole}
                                    </th>
                                  ))}
                                  <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                    {t('total')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                  {backNine.map(hole => (
                                    <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                      {pars[hole] || 4}
                                    </td>
                                  ))}
                                  <td className="px-1 py-1 text-center font-bold text-gray-900">
                                    {calculateParTotal(backNine)}
                                  </td>
                                </tr>
                                {activePlayers.map((player, index) => (
                                  <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {backNine.map(hole => {
                                      const score = allScores[player]?.[hole];
                                      const par = pars[hole] || 4;
                                      const handicapValue = getHandicapForHole(player, par);
                                      const netScore = score ? score - handicapValue : null;
                                      
                                      return (
                                        <td key={hole} className="px-0 py-1 text-center">
                                          {score ? (
                                            <div>
                                              <ScoreDisplay score={score} par={par} />
                                              {!gameComplete && handicap === 'on' && handicapValue > 0 && (
                                                <div style={{ fontSize: '8px', color: '#059669' }}>
                                                  ({netScore})
                                                </div>
                                              )}
                                            </div>
                                          ) : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1 text-center font-bold text-gray-900">
                                      {calculateTotal(player, backNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 text-sm">{t('noScoreData')}</p>
                      </div>
                    )}
                  </>
                );
              })()}

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {t('finalSettlement')}
                  </h3>
                  {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                    <div className="mb-3 text-center p-2 bg-purple-100 rounded">
                      <span className="text-sm text-purple-700">
                        {gameMode === 'win123' ? t('penaltyPot') : t('prizePool')}: 
                      </span>
                      <span className="text-lg font-bold text-purple-800 ml-2">
                        ${prizePool}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      const playerTotals = {};
                      activePlayers.forEach(player => {
                        playerTotals[player] = completedHoles.reduce((total, hole) => {
                          const score = allScores[player]?.[hole];
                          return total + (score || 0);
                        }, 0);
                      });

                      const moneyRankings = activePlayers
                        .map(player => ({ player, money: totalMoney[player] }))
                        .sort((a, b) => b.money - a.money)
                        .reduce((acc, { player }, index, arr) => {
                          if (index === 0) {
                            acc[player] = 1;
                          } else {
                            const prevPlayer = arr[index - 1].player;
                            if (totalMoney[player] === totalMoney[prevPlayer]) {
                              acc[player] = acc[prevPlayer];
                            } else {
                              acc[player] = index + 1;
                            }
                          }
                          return acc;
                        }, {});

                      return activePlayers.map(player => {
                        const amount = totalMoney[player] || 0;
                        const rank = moneyRankings[player];
                        const medal = getMedal(rank);
                        
                        return (
                          <div key={player} className="border-b border-yellow-200 last:border-b-0 pb-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900 flex items-center gap-1">
                                {player}
                                {amount > 0 && medal && <span className="text-base">{medal}</span>}
                              </span>
                              <span className={`font-bold ${
                                amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!gameComplete ? (
                  <button
                    onClick={() => setCurrentSection('game')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    {t('resume')}
                  </button>
                ) : (
                  <div className="w-full">
                    <button
                      onClick={goHome}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      {t('backToHome')}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {lang === 'zh' ? '所有比赛数据将被清除' : 'All game data will be cleared'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {currentSection === 'game' && (
        <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
          <div className="bg-green-800 bg-opacity-50 text-center pt-6 pb-3 relative">
            <h1 className="text-2xl font-bold mb-2">
              {t('hole')} {holes[currentHole]} (PAR {pars[holes[currentHole]] || 4})
            </h1>
            {Number(stake) > 0 && (
              <div className="text-base">
                {t('stake')}: ${Number(stake)} 
                {(gameMode === 'skins' || gameMode === 'win123') && (
                  <span className="ml-4">
                    {gameMode === 'win123' ? t('penaltyPot') : t('poolBalance')}: ${gameMode === 'skins' ? prizePool + (Number(stake) || 0) * activePlayers.length : prizePool}
                  </span>
                )}
              </div>
            )}
            
            {selectedCourse && (
              selectedCourse.blueTees || 
              selectedCourse.whiteTees || 
              selectedCourse.redTees
            ) && (
              <div className="mt-2 px-4">
                <div className="grid gap-1.5" style={{
                  gridTemplateColumns: `repeat(${
                    [selectedCourse.blueTees, selectedCourse.whiteTees, selectedCourse.redTees]
                      .filter(Boolean).length
                  }, 1fr)`
                }}>
                  {selectedCourse.blueTees && (
                    <div className="bg-blue-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Blue</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.blueTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.whiteTees && (
                    <div className="bg-gray-200 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span className="text-xs font-semibold text-gray-700">White</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedCourse.whiteTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.redTees && (
                    <div className="bg-red-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Red</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.redTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!gameComplete && completedHoles.length < holes.length && (
              <button
                onClick={() => {
                  const message = lang === 'zh' 
                    ? '确定要终止比赛吗？\n未完成的洞将不计入成绩' 
                    : 'End the game now?\nIncomplete holes will not be counted';
                  showConfirm(message, () => {
                    setGameComplete(true);
                    showToast(t('gameOver'));
                    setCurrentSection('scorecard');
                  }, true);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
              >
                {lang === 'zh' ? '终止' : 'End'}
              </button>
            )}
          </div>

          <div className="bg-white text-gray-900 p-3">
            <div className="grid gap-3">
              {activePlayers.map(player => {
                const holeNum = holes[currentHole];
                const par = pars[holeNum] || 4;
                const playerScore = scores[player] || par;
                const playerUp = ups[player] || false;
                const playerHandicapValue = getHandicapForHole(player, par);
                const netScore = playerScore - playerHandicapValue;
                const scoreLabel = getScoreLabel(netScore, par);
                
                return (
                  <div key={player} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900">{player}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${scoreLabel.class}`}>
                            {scoreLabel.text}
                          </span>
                          {handicap === 'on' && playerHandicapValue > 0 && (
                            <span className="text-xs text-green-600">
                              {t('netScore')}: {netScore}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeScore(player, -1)}
                          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center min-w-[60px]">
                          <div className="text-3xl font-bold text-gray-900">{playerScore}</div>
                        </div>
                        
                        <button
                          onClick={() => changeScore(player, 1)}
                          className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-sm transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {gameMode === 'win123' && Number(stake) > 0 && (
                        <div className="ml-3">
                          <button
                            onClick={() => toggleUp(player)}
                            className={`px-4 py-2 rounded-md font-medium text-sm relative transition ${
                              playerUp
                                ? 'bg-yellow-400 text-yellow-900'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <TrendingUp className="inline w-3 h-3 mr-1" />
                            UP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {Number(stake) > 0 && currentHoleSettlement && gameMode === 'win123' && (
            <div className="bg-orange-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = currentHoleSettlement[player]?.money || 0;
                  return (
                    <div key={player} className="bg-white p-2 rounded-md text-center">
                      <div className="text-xs font-medium truncate">{player}</div>
                      <div className={`text-sm font-bold ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Number(stake) > 0 && currentHoleSettlement && gameMode === 'matchPlay' && (
            <div className="bg-orange-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = currentHoleSettlement[player]?.money || 0;
                  return (
                    <div key={player} className="bg-white p-2 rounded-md text-center">
                      <div className="text-xs font-medium truncate">{player}</div>
                      <div className={`text-sm font-bold ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Number(stake) > 0 && (gameMode === 'matchPlay' || gameMode === 'win123' || gameMode === 'skins') && (
            <div className="bg-blue-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('currentMoney')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = totalMoney[player] || 0;
                  
                  return (
                    <div key={player} className="bg-white p-2 rounded-md">
                      <div className="text-xs font-medium text-center truncate">{player}</div>
                      <div className={`text-sm font-bold text-center ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {gameMode === 'win123' ? (
                          <>
                            {t('totalLoss')}: {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                          </>
                        ) : (
                          <>
                            {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white p-3">
            <div className="flex gap-2">
              <button
                onClick={nextHole}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                {currentHole === holes.length - 1 ? t('finishRound') : t('nextHole')}
              </button>
              <button
                onClick={() => setCurrentSection('scorecard')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={prevHole}
                disabled={currentHole === 0}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        message={confirmDialog.message}
        t={t}
        showScreenshotHint={confirmDialog.showScreenshotHint}
      />

      <HoleScoreConfirmDialog
        isOpen={holeConfirmDialog.isOpen}
        onClose={() => {
          setHoleConfirmDialog({ isOpen: false, action: null });
          setPendingRankings(null);
        }}
        onConfirm={() => {
          if (holeConfirmDialog.action) holeConfirmDialog.action();
        }}
        hole={holes[currentHole]}
        players={activePlayers}
        scores={scores}
        rankings={pendingRankings}
        gameMode={gameMode}
        getHandicapForHole={getHandicapForHole}
        pars={pars}
        t={t}
        stake={stake}
        prizePool={prizePool}
        activePlayers={activePlayers}
      />
    </div>
  );
}

export default IntegratedGolfGame;