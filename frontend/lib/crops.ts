export type CropCategory =
  | "All crops"
  | "Food grains"
  | "Oilseeds"
  | "Vegetables"
  | "Commercial crops"
  | "Spices & Fruits";

export type GrowingStage = {
  stageNumber: number;
  name: string;
  duration: string;
  timing: string;
  description: string;
  keyPractices: string[];
};

export type PestManagementItem = {
  name: string;
  type: "pest" | "disease";
  symptoms: string;
  organicControl: string;
  chemicalControl: string;
};

export type CropProfile = {
  id: string;
  name: string;
  localName: string;
  botanicalName: string;
  category: "Food grains" | "Oilseeds" | "Vegetables" | "Commercial crops" | "Spices & Fruits";
  mandiCommodity: string;
  summary: string;
  season: string;
  duration: string;
  temperature: string;
  rainfall: string;
  soilType: string;
  soilPh: string;
  seedRate: string;
  spacing: string;
  npkRatio: string;
  fertilizerSchedule: {
    basal: string;
    vegetative: string;
    flowering: string;
    micronutrients: string;
  };
  irrigation: {
    waterRequirement: string;
    method: string;
    criticalStages: string[];
    waterSavingTip: string;
  };
  growingStages: GrowingStage[];
  pestManagement: PestManagementItem[];
  harvesting: {
    maturitySigns: string;
    harvestMethod: string;
    postHarvest: string;
    expectedYield: string;
  };
  sourceAttribution: {
    institution: string;
    guideName: string;
    year: number;
    referenceUrl: string;
  };
  popularVarieties: string[];
  suitableRegions: string[];
};

export const CROP_CATEGORIES: CropCategory[] = [
  "All crops",
  "Food grains",
  "Oilseeds",
  "Vegetables",
  "Commercial crops",
  "Spices & Fruits",
];

export const CROPS_DATA: CropProfile[] = [
  {
    id: "rice",
    name: "Rice / Paddy",
    localName: "நெல் (Nel)",
    botanicalName: "Oryza sativa",
    category: "Food grains",
    mandiCommodity: "Paddy(Dhan)(Common)",
    summary:
      "Staple cereal crop of India. Requires warm humid climate, heavy clay-loam soils with high water retention, and systematic split fertilizer management.",
    season: "Samba / Thaladi (Aug–Jan), Kuruvai (Jun–Sep), Navarai (Dec–Apr)",
    duration: "115–135 days (Medium duration)",
    temperature: "21°C – 37°C (optimum 25°C–32°C)",
    rainfall: "1000 – 1500 mm (or controlled irrigation)",
    soilType: "Clay loam to heavy clay soil with high water-holding capacity",
    soilPh: "5.5 – 7.0 (slightly acidic to neutral)",
    seedRate: "30–35 kg/ha (transplanted), 10–12 kg/ha (System of Rice Intensification - SRI)",
    spacing: "20 x 10 cm or 15 x 10 cm (SRI: 25 x 25 cm with single seedling)",
    npkRatio: "120 : 40 : 40 kg/ha (N : P₂O₅ : K₂O)",
    fertilizerSchedule: {
      basal: "Full P₂O₅ (40 kg) + 25% Nitrogen (30 kg) + 50% Potassium (20 kg) at last puddling.",
      vegetative: "50% Nitrogen (60 kg) split equally at active tillering (21–25 DAT) and panicle initiation (40–45 DAT).",
      flowering: "Remaining 25% Nitrogen (30 kg) + 50% Potassium (20 kg) at heading/panicle emergence.",
      micronutrients: "Zinc Sulfate @ 25 kg/ha applied as basal. Avoid mixing zinc directly with phosphatic fertilizers.",
    },
    irrigation: {
      waterRequirement: "1200 – 1400 mm",
      method: "Alternate Wetting and Drying (AWD) or shallow submergence (2–5 cm)",
      criticalStages: ["Panicle initiation (40–50 DAT)", "Booting & flowering (60–75 DAT)", "Milking & early dough stage (80–90 DAT)"],
      waterSavingTip: "Implement AWD pipe monitoring: re-irrigate to 5 cm depth only after water level drops 15 cm below soil surface. Saves up to 25–30% water without yield reduction.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Nursery & Transplanting",
        duration: "Days 1–25",
        timing: "Nursery 18–22 days, transplanting at 3–4 leaf stage",
        description: "Seed treatment with Azospirillum (600g/ha) + Phosphobacteria. Transplant healthy young seedlings at 2–3 cm depth.",
        keyPractices: [
          "Pre-soak seeds in Pseudomonas fluorescens solution (10g/kg)",
          "Puddle field thoroughly with 5 cm water layer",
          "Maintain 2–3 seedlings per hill at 20 x 10 cm spacing",
        ],
      },
      {
        stageNumber: 2,
        name: "Active Tillering",
        duration: "Days 26–55",
        timing: "Vegetative elongation phase",
        description: "Plants form tillers rapidly. Critical for establishing effective panicle bearing tillers.",
        keyPractices: [
          "Top-dress first split of Nitrogen (30 kg/ha)",
          "Cono-weeding or hand weeding at 20 and 40 DAT",
          "Maintain shallow water layer of 2–3 cm",
        ],
      },
      {
        stageNumber: 3,
        name: "Panicle Initiation & Heading",
        duration: "Days 56–85",
        timing: "Reproductive phase",
        description: "Flag leaf emerges and panicles form inside sheath. Highest sensitivity to moisture stress.",
        keyPractices: [
          "Maintain continuous 5 cm water layer until flowering concludes",
          "Apply remaining Potash (20 kg/ha) to enhance grain filling",
          "Monitor field margins for stem borer and blast symptoms",
        ],
      },
      {
        stageNumber: 4,
        name: "Grain Filling & Ripening",
        duration: "Days 86–125",
        timing: "Ripening to harvest phase",
        description: "Milky liquid hardens into starch. Grains turn from green to golden yellow.",
        keyPractices: [
          "Stop irrigation completely 10–12 days prior to expected harvest",
          "Harvest when 80–85% of grains in panicles turn golden yellow",
          "Thresh promptly and sun-dry grain to 12–14% safe storage moisture",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Yellow Stem Borer (Scirpophaga incertulas)",
        type: "pest",
        symptoms: "Dead hearts in vegetative stage; White ears / empty panicles at reproductive stage.",
        organicControl: "Install TNAU pheromone traps @ 12 traps/ha. Release Trichogramma japonicum egg parasitoid @ 1,00,000/ha weekly.",
        chemicalControl: "Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Cartap hydrochloride 50 SP @ 2 g/L when ETL exceeds 10% dead hearts.",
      },
      {
        name: "Rice Blast (Magnaporthe oryzae)",
        type: "disease",
        symptoms: "Spindle-shaped spots on leaves with grey center and brownish-red margins; neck rot at panicle base.",
        organicControl: "Foliar spray of Pseudomonas fluorescens @ 5 g/L or 2.5 kg/ha mixed in 500L water.",
        chemicalControl: "Tricyclazole 75 WP @ 1 g/L or Azoxystrobin 25 SC @ 1 ml/L at first appearance of lesions.",
      },
      {
        name: "Brown Plant Hopper - BPH (Nilaparvata lugens)",
        type: "pest",
        symptoms: "Circular patches of dried, brown plants called 'hopper burn' at lower stem regions.",
        organicControl: "Create alleyways (30 cm gap every 2 meters) for aeration. Spray Neem seed kernel extract (NSKE 5%). Avoid excessive nitrogen.",
        chemicalControl: "Triflumuron or Pymetrozine 50 WG @ 0.6 g/L targeted at the base of the rice hills.",
      },
    ],
    harvesting: {
      maturitySigns: "85% grains in panicles turn golden straw-yellow. Grains in the lower panicle portion turn hard.",
      harvestMethod: "Combine harvester or manual sickle cutting at 10 cm above ground level.",
      postHarvest: "Thresh immediately; dry grains under sun on tarpaulin to 12% moisture; store in clean airtight gunny bags with neem leaves.",
      expectedYield: "5.5 – 6.5 tonnes/ha (irrigated medium-duration varieties)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University (TNAU) & ICAR-NRRI",
      guideName: "TNAU Crop Production Guide — Agriculture 2020 (Paddy)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["CO 51", "ADT 43", "ADT 45", "BPT 5204 (Sona Masoori)", "CR 1009 Sub 1", "IR 20"],
    suitableRegions: ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Telangana", "Kerala", "West Bengal", "Punjab", "Odisha"],
  },
  {
    id: "groundnut",
    name: "Groundnut / Peanut",
    localName: "வேர்க்கடலை / மணிலா (Verkadalai)",
    botanicalName: "Arachis hypogaea",
    category: "Oilseeds",
    mandiCommodity: "Groundnut",
    summary:
      "Premier oilseed and legume crop. Thrives in loose, friable sandy loam soils. Calcium and sulfur nutrition through gypsum application at pegging stage is critical for well-filled pods.",
    season: "Chithirai pattam (Apr–May), Adipattam (Jun–Jul), Margazhi / Karthigai (Nov–Dec)",
    duration: "105–115 days (Bunch varieties)",
    temperature: "22°C – 32°C (sensitive to frost and continuous waterlogging)",
    rainfall: "500 – 750 mm evenly distributed during growing cycle",
    soilType: "Well-drained light sandy loam or red loamy soil with friable subsoil",
    soilPh: "6.0 – 7.5 (loose friable structure facilitates peg penetration)",
    seedRate: "125–140 kg/ha of sound mature kernels (pods unshelled: 160–180 kg/ha)",
    spacing: "30 x 10 cm (bunch varieties) or 40 x 10 cm (semi-spreading varieties)",
    npkRatio: "25 : 50 : 75 kg/ha (N : P₂O₅ : K₂O) + Gypsum @ 400 kg/ha",
    fertilizerSchedule: {
      basal: "Full N, P₂O₅, and K₂O (25:50:75 kg/ha) broadcasted and incorporated at final ploughing.",
      vegetative: "Foliar spray of 0.5% Ferrous Sulfate + 0.1% Citric Acid at 30 and 45 DAS if leaves show chlorosis.",
      flowering: "Gypsum @ 400 kg/ha applied at 40–45 DAS (pegging stage) near root zone followed by earthing up.",
      micronutrients: "Zinc Sulfate @ 25 kg/ha basal + Borax 10 kg/ha to avoid hollow heart disorder in kernels.",
    },
    irrigation: {
      waterRequirement: "400 – 550 mm (4 to 6 irrigations)",
      method: "Sprinkler or ridge-and-furrow irrigation",
      criticalStages: ["Flowering (20–25 DAS)", "Pegging & peg penetration (40–45 DAS)", "Pod development (60–75 DAS)"],
      waterSavingTip: "Sprinkler irrigation saves 35% water and promotes uniform pod development. Avoid heavy irrigation during peg entry.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Sowing & Germination",
        duration: "Days 1–15",
        timing: "Seed treatment to seedling emergence",
        description: "Treat kernels with Trichoderma viride (4g/kg) + Rhizobium biofertilizer (3 packets/ha). Dibble at 4 cm depth.",
        keyPractices: [
          "Select sound, bold kernels with intact pink seed coat",
          "Sow in moist seedbed with tractor drawn seed drill or manual dibbling",
          "Pre-emergence herbicide Pendimethalin @ 1.0 kg a.i./ha within 3 days",
        ],
      },
      {
        stageNumber: 2,
        name: "Vegetative & Flowering",
        duration: "Days 16–35",
        timing: "Branching and flower initiation",
        description: "Yellow flowers emerge from leaf axils. Light hoeing and hand weeding before peg formation.",
        keyPractices: [
          "First hand weeding and hoeing at 20 DAS",
          "Ensure light irrigation if rainfall is insufficient at flower opening",
          "Spray Neem oil 3% to deter early sucking pests",
        ],
      },
      {
        stageNumber: 3,
        name: "Pegging & Pod Formation",
        duration: "Days 36–65",
        timing: "Peg penetration into soil",
        description: "Fertilized flowers develop geotropic pegs that penetrate the top 4–6 cm soil to form pods.",
        keyPractices: [
          "Apply Gypsum @ 400 kg/ha at 40–45 DAS around plant base",
          "Earth up soil lightly around plants; do not disturb soil after peg entry",
          "Maintain optimum soil moisture to facilitate easy peg entry",
        ],
      },
      {
        stageNumber: 4,
        name: "Pod Maturation & Harvest",
        duration: "Days 66–110",
        timing: "Kernel filling to harvest",
        description: "Kernels fill pods and develop oil content. Shell inner wall turns dark brownish-black.",
        keyPractices: [
          "Test maturity: pull 3 random plants; crack open 10 pods",
          "Mature pods have prominent shell reticulation and black inner lining",
          "Harvest when 75–80% of pods show full maturity; sun dry to 8% moisture",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Tikka Leaf Spot (Cercospora arachidicola & C. personata)",
        type: "disease",
        symptoms: "Circular dark brown spots with yellow halo on upper leaf surface; causes severe defoliation.",
        organicControl: "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Panchagavya 3% at first symptom.",
        chemicalControl: "Mancozeb 75 WP @ 2 g/L or Tebuconazole 25.9 EC @ 1.5 ml/L at 15-day intervals.",
      },
      {
        name: "Leaf Miner (Aproaerema modicella)",
        type: "pest",
        symptoms: "Blister-like mines on leaves; leaves fold together and dry up like scorched foliage.",
        organicControl: "Install light traps @ 2/ha. Conserve spiders and braconid wasps.",
        chemicalControl: "Dimethoate 30 EC @ 1.7 ml/L or Quinalphos 25 EC @ 2 ml/L when ETL reaches 1 larva/meter row.",
      },
      {
        name: "Collar Rot / Stem Rot (Aspergillus niger & Sclerotium rolfsii)",
        type: "disease",
        symptoms: "Wilting of branches, rotting at soil collar with white mycelial growth or black spores.",
        organicControl: "Soil application of Trichoderma viride @ 2.5 kg/ha enriched with 250 kg FYM.",
        chemicalControl: "Seed treatment with Carbendazim @ 2 g/kg seed before sowing.",
      },
    ],
    harvesting: {
      maturitySigns: "Leaves yellow and drop; inner surface of pod shell turns dark brown or black; kernel separates cleanly.",
      harvestMethod: "Plough along rows to loosen soil; pull plants manually or using tractor digger-shaker.",
      postHarvest: "Strip pods; spread in 5 cm layer under sun for 4–5 days until kernel rattles in shell (8% moisture).",
      expectedYield: "2.2 – 2.8 tonnes/ha pods (irrigated), 1.5 – 1.8 tonnes/ha (rainfed)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University (TNAU) & ICAR-DGR Junagadh",
      guideName: "TNAU Crop Production Guide — Oilseeds 2020 (Groundnut)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["VRI 8", "TMV 13", "VRI 2", "Kadiri 6", "GJG 31", "Dharani", "TAG 24"],
    suitableRegions: ["Tamil Nadu (Salem, Namakkal, Tiruvannamalai, Villupuram)", "Andhra Pradesh", "Karnataka", "Gujarat", "Rajasthan"],
  },
  {
    id: "maize",
    name: "Maize / Corn",
    localName: "மக்காச்சோளம் (Makkacholam)",
    botanicalName: "Zea mays",
    category: "Food grains",
    mandiCommodity: "Maize",
    summary:
      "High-yielding cereal with industrial and poultry feed demand. Fast vegetative growth with high nitrogen and zinc requirements. Strict monitoring for Fall Armyworm is essential.",
    season: "Adipattam (Jun–Jul), Purattasi (Sep–Oct), Thai pattam (Jan–Feb)",
    duration: "95–110 days (Single cross hybrids)",
    temperature: "21°C – 32°C (sensitive to frost and prolonged waterlogging)",
    rainfall: "500 – 750 mm during crop growth",
    soilType: "Deep, well-drained fertile sandy loam to clay loam rich in organic matter",
    soilPh: "6.5 – 7.5 (intolerant of salinity and alkalinity)",
    seedRate: "15–20 kg/ha of certified hybrid seed",
    spacing: "60 x 20 cm or 60 x 25 cm (one plant per hill)",
    npkRatio: "150 : 75 : 75 kg/ha (N : P₂O₅ : K₂O) + Zinc Sulfate @ 25 kg/ha",
    fertilizerSchedule: {
      basal: "Full P₂O₅ (75 kg) + full K₂O (75 kg) + 25% Nitrogen (37.5 kg) + Zinc Sulfate 25 kg/ha incorporated in ridges.",
      vegetative: "50% Nitrogen (75 kg) top-dressed at knee-high stage (25–30 DAS) followed by earthing up.",
      flowering: "Remaining 25% Nitrogen (37.5 kg) applied at tasseling / silking stage (45–50 DAS).",
      micronutrients: "Spray 0.5% Zinc Sulfate + 1% Urea at 30 and 45 DAS if white bud symptoms appear on young leaves.",
    },
    irrigation: {
      waterRequirement: "500 – 600 mm (5 to 6 irrigations)",
      method: "Ridge and furrow or drip fertigation",
      criticalStages: ["Tasseling & pollen shed (45–50 DAS)", "Silking & fertilization (55–65 DAS)", "Grain dough stage (70–80 DAS)"],
      waterSavingTip: "Moisture stress during silking causes barren cobs. Irrigate in alternate furrows to save 30% water during early vegetative stages.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Establishment & Seedling",
        duration: "Days 1–20",
        timing: "Germination to 5-leaf collar",
        description: "Seed treatment with Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS (6ml/kg) to protect against early FAW attack.",
        keyPractices: [
          "Dibble 1 seed per hole at 3–4 cm depth on ridge sides",
          "Apply pre-emergence Atrazine @ 1.0 kg a.i./ha within 3 days of sowing",
          "Thin excess plants at 12–15 DAS to maintain single healthy seedling",
        ],
      },
      {
        stageNumber: 2,
        name: "Knee-High Rapid Growth",
        duration: "Days 21–45",
        timing: "Rapid stalk elongation",
        description: "Stalks grow vigorously. Top dress nitrogen and form high ridges around base to prevent lodging.",
        keyPractices: [
          "Apply second split of Nitrogen (75 kg/ha) along ridge sides",
          "Earth up ridges to support root anchorage",
          "Scout central whorls daily for Fall Armyworm egg masses and pinhole damage",
        ],
      },
      {
        stageNumber: 3,
        name: "Tasseling & Silking",
        duration: "Days 46–70",
        timing: "Flowering and cob fertilization",
        description: "Male tassels shed pollen onto sticky female silks. Crucial phase for cob length and seed set.",
        keyPractices: [
          "Apply final split of Nitrogen (37.5 kg/ha)",
          "Maintain constant soil moisture; water deficit aborts kernel formation",
          "Do not spray insecticides during active morning pollen shed (8 AM–11 AM)",
        ],
      },
      {
        stageNumber: 4,
        name: "Grain Filling & Harvest",
        duration: "Days 71–105",
        timing: "Milk stage to black layer maturity",
        description: "Kernels fill with starch, harden, and develop black layer at the base marking physiological maturity.",
        keyPractices: [
          "Outer cob sheath turns dry papery white/brown",
          "Harvest cobs and dry on clean floor in bright sunlight",
          "Shell when grain moisture drops to 14% using mechanical maize sheller",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Fall Armyworm - FAW (Spodoptera frugiperda)",
        type: "pest",
        symptoms: "Pinhole perforations on leaves; ragged feeding margins in whorls with moist sawdust-like fecal matter.",
        organicControl: "Release Telenomus remus egg parasitoid. Apply Bacillus thuringiensis (Bt) kurstaki @ 2 g/L or Metarhizium rileyi @ 3 g/L.",
        chemicalControl: "Whorl application of Emamectin benzoate 5 SG @ 0.4 g/L or Spinetoram 11.7 SC @ 0.5 ml/L targeting the central whorl.",
      },
      {
        name: "Stem Borer (Chilo partellus)",
        type: "pest",
        symptoms: "Shot-hole feeding on leaves; central shoot dries up into 'dead heart'.",
        organicControl: "Release Trichogramma chilonis @ 2.5 lakh/ha at weekly intervals. Intercrop with cowpea.",
        chemicalControl: "Carbofuran 3G granules @ 7 kg/ha applied into whorls at 25 DAS.",
      },
      {
        name: "Maydis Leaf Blight (Bipolaris maydis)",
        type: "disease",
        symptoms: "Elongated rectangular straw-colored lesions bounded by leaf veins; rapid blighting in warm humid weather.",
        organicControl: "Crop rotation; destroy infected stubbles after harvest.",
        chemicalControl: "Mancozeb 75 WP @ 2 g/L or Azoxystrobin 23 SC @ 1 ml/L at first appearance of spots.",
      },
    ],
    harvesting: {
      maturitySigns: "Cob husk dries into paper-white shade; kernels cannot be indented with thumbnail; black abscission layer visible at kernel tip.",
      harvestMethod: "De-husk cobs manually or harvest with tractor-drawn maize harvester.",
      postHarvest: "Dry cobs in sun for 3–4 days; shell with maize sheller; dry grain to 12% moisture for safe storage.",
      expectedYield: "6.5 – 8.0 tonnes/ha grain (hybrids under irrigated conditions)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-IIMR Ludhiana",
      guideName: "TNAU Crop Production Guide — Agriculture 2020 (Millets & Maize)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["COH(M) 8", "CO 6", "Pioneer 3396", "NK 6240", "DKC 9108", "Kaveri 50"],
    suitableRegions: ["Tamil Nadu (Salem, Perambalur, Dindigul, Erode)", "Karnataka", "Telangana", "Andhra Pradesh", "Maharashtra", "Bihar"],
  },
  {
    id: "tomato",
    name: "Tomato",
    localName: "தக்காளி (Thakkali)",
    botanicalName: "Solanum lycopersicum",
    category: "Vegetables",
    mandiCommodity: "Tomato",
    summary:
      "High-value vegetable crop cultivated year-round. Staking, drip fertigation, and balanced calcium-boron nutrition prevent blossom end rot and fruit cracking while maximizing marketability.",
    season: "May–Jun (Vaigasi), Nov–Dec (Karthigai), Feb–Mar (Masi)",
    duration: "125–140 days (Indeterminate hybrids)",
    temperature: "18°C – 30°C (night temperature 16°C–20°C critical for fruit set)",
    rainfall: "600 – 800 mm (drip irrigation preferred)",
    soilType: "Well-drained rich sandy loam to red loamy soil with good organic content",
    soilPh: "6.0 – 7.0 (avoid poorly drained waterlogged soils)",
    seedRate: "120–150 g/ha (pro-tray nursery raising with cocopeat)",
    spacing: "90 x 60 cm (paired rows: 120 x 60 x 60 cm for drip and staking)",
    npkRatio: "200 : 250 : 250 kg/ha (N : P₂O₅ : K₂O) for high-yielding hybrids",
    fertilizerSchedule: {
      basal: "FYM 25 t/ha + 25% N (50 kg) + 100% P₂O₅ (250 kg) + 25% K₂O (60 kg) + Neem cake 250 kg/ha.",
      vegetative: "Fertigate remaining N and K in weekly splits through drip irrigation from 15 to 90 DAT.",
      flowering: "Foliar spray of Calcium Nitrate (5 g/L) + Boron (1 g/L) at 45 and 60 DAT to avoid blossom-end rot.",
      micronutrients: "Spray TNAU Tomato Vegetable Special @ 5 g/L at 40, 55, and 70 DAT for enhanced fruit weight.",
    },
    irrigation: {
      waterRequirement: "400 – 600 mm",
      method: "Drip irrigation with inline drippers (2–4 LPH)",
      criticalStages: ["Transplanting establishment (1–10 DAT)", "Flowering & fruit set (35–55 DAT)", "Fruit expansion & harvesting (60–120 DAT)"],
      waterSavingTip: "Drip irrigation saves 45% water and lowers incidence of fungal foliar blights compared to furrow flooding.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Pro-tray Nursery & Transplanting",
        duration: "Days 1–25",
        timing: "Seedling propagation to field planting",
        description: "Grow seedlings in 98-cell pro-trays with sterilized cocopeat. Transplant sturdy 25-day seedlings with 4–5 leaves in evening hours.",
        keyPractices: [
          "Dip seedling roots in Pseudomonas fluorescens (10g/L) before planting",
          "Transplant on raised beds with silver-black mulch film (30 micron)",
          "Immediate light irrigation through drip system",
        ],
      },
      {
        stageNumber: 2,
        name: "Vegetative Growth & Staking",
        duration: "Days 26–50",
        timing: "Branching and canopy development",
        description: "Staking with bamboo poles and GI wire/twine keeps foliage and fruit off wet soil, preventing fruit rot.",
        keyPractices: [
          "Erect bamboo stakes and tie plants at 30 DAT",
          "Prune side suckers below first flower cluster for indeterminate hybrids",
          "Install yellow sticky traps (15/ha) to monitor whitefly vectors of leaf curl virus",
        ],
      },
      {
        stageNumber: 3,
        name: "Flowering & Fruit Setting",
        duration: "Days 51–75",
        timing: "Continuous blooming and fruit development",
        description: "Flowers open in clusters. Consistent moisture and boron are vital to prevent flower drop.",
        keyPractices: [
          "Spray NAA (Planofix) @ 0.25 ml/L at peak flowering to reduce flower drop",
          "Ensure steady drip irrigation without fluctuating soil dryness",
          "Monitor fruit clusters for early pinholes of fruit borer",
        ],
      },
      {
        stageNumber: 4,
        name: "Fruit Ripening & Harvesting",
        duration: "Days 76–135",
        timing: "Multiple pickings every 3–4 days",
        description: "Harvest fruits at breaker or turning stage for long-distance transport, firm red for local markets.",
        keyPractices: [
          "Pick fruits in morning hours with calyx attached",
          "Grade according to size, color uniformity, and firmness",
          "Pack in ventilated plastic crates instead of rough wooden boxes",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Tomato Fruit Borer (Helicoverpa armigera)",
        type: "pest",
        symptoms: "Circular entry holes on fruit; caterpillar feeds with part of body inside fruit; internal rotting.",
        organicControl: "Install Helicoverpa pheromone traps @ 12/ha. Plant African marigold as border trap crop (1 row per 16 tomato rows). Spray HaNPV @ 250 LE/ha.",
        chemicalControl: "Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Flubendiamide 39.35 SC @ 0.3 ml/L with adherence to 3-day waiting period.",
      },
      {
        name: "Tomato Leaf Curl Virus - ToLCV",
        type: "disease",
        symptoms: "Upward curling of leaves, leaf thickening, stunted bushy plant growth, complete failure of fruit set.",
        organicControl: "Vector control: Whitefly (Bemisia tabaci). Install yellow sticky traps @ 25/ha. Spray Neem oil 3% regularly.",
        chemicalControl: "Spray Spiromesifen 22.9 SC @ 1 ml/L or Diafenthiuron 50 WP @ 1.2 g/L to suppress whiteflies.",
      },
      {
        name: "Early Blight & Late Blight (Alternaria & Phytophthora)",
        type: "disease",
        symptoms: "Concentric target-board rings on leaves (early blight); water-soaked irregular lesions with white mould underneath (late blight).",
        organicControl: "Maintain good canopy aeration via staking; avoid overhead sprinkler wetting.",
        chemicalControl: "Mancozeb 75 WP @ 2.5 g/L (early blight) or Cymoxanil + Mancozeb 72 WP @ 2 g/L (late blight).",
      },
    ],
    harvesting: {
      maturitySigns: "Breaker stage: 10–25% pink color at blossom end for shipping; pink-red for nearby mandis.",
      harvestMethod: "Gentle twist and pull with pedicel intact; pick every 3–4 days over an 8-week harvest span.",
      postHarvest: "Grade by color and size; store in cool shaded packing shed; shelf life 7–10 days at 15°C.",
      expectedYield: "50 – 70 tonnes/ha (staked indeterminate hybrids)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-IIHR Bengaluru",
      guideName: "TNAU Crop Production Guide — Horticulture 2020 (Tomato)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["Shivam (Syngenta)", "Arka Rakshak (IIHR)", "Arka Abhed", "PKM 1", "US 440", "Abhinav"],
    suitableRegions: ["Tamil Nadu (Salem, Dharmapuri, Krishnagiri, Dindigul)", "Karnataka", "Andhra Pradesh", "Maharashtra"],
  },
  {
    id: "cotton",
    name: "Cotton",
    localName: "பருத்தி (Paruthi)",
    botanicalName: "Gossypium hirsutum",
    category: "Commercial crops",
    mandiCommodity: "Cotton",
    summary:
      "Premier natural fiber crop of India. Grows well in deep black cotton soils (Vertisols). Balanced nutrient management and Integrated Pest Management against pink bollworm are critical.",
    season: "Winter irrigated (Aug–Sep), Summer irrigated (Feb–Mar)",
    duration: "150–165 days (Hybrids)",
    temperature: "21°C – 35°C (warm days and bright sunshine for boll maturation)",
    rainfall: "600 – 1000 mm (sensitive to heavy rains during boll opening)",
    soilType: "Deep black soils (Vertisols) or fertile alluvial/loamy soils with good drainage",
    soilPh: "7.0 – 8.5 (moderately tolerant of salinity)",
    seedRate: "2.0 – 2.5 kg/ha of Bt cotton hybrid seeds",
    spacing: "90 x 60 cm or 120 x 60 cm on ridges",
    npkRatio: "120 : 60 : 60 kg/ha (N : P₂O₅ : K₂O)",
    fertilizerSchedule: {
      basal: "Full P₂O₅ (60 kg) + 25% N (30 kg) + 33% K₂O (20 kg) applied into ridges.",
      vegetative: "50% N (60 kg) + 33% K₂O (20 kg) in two splits at square formation (40–45 DAS) and flowering (60–65 DAS).",
      flowering: "Remaining 25% N (30 kg) + 34% K₂O (20 kg) at boll development (75–80 DAS).",
      micronutrients: "Foliar spray of 1% DAP + 1% Potassium Chloride (KCl) at 60 and 75 DAS to prevent premature leaf reddening.",
    },
    irrigation: {
      waterRequirement: "650 – 800 mm (6 to 8 irrigations)",
      method: "Ridge-and-furrow or drip irrigation",
      criticalStages: ["Square formation (35–45 DAS)", "Peak flowering (60–75 DAS)", "Boll development (75–100 DAS)"],
      waterSavingTip: "Cease irrigation when 30% bolls burst open to prevent fiber staining and fungal rotting.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Germination & Square Formation",
        duration: "Days 1–45",
        timing: "Seedling establishment to early squares",
        description: "Dibble 1 seed per hill at 3 cm depth. Thin to 1 plant/hill at 15 DAS. Flower buds ('squares') appear around 35 DAS.",
        keyPractices: [
          "Pre-soak seeds in cow dung slurry or biofertilizers for rapid germination",
          "Gap fill within 10 days of sowing",
          "Inter-cultivation with blade harrow at 25 and 40 DAS",
        ],
      },
      {
        stageNumber: 2,
        name: "Peak Flowering & Boll Setting",
        duration: "Days 46–85",
        timing: "Cream flowers open, pollinate, and turn pink",
        description: "Vigorous sympodial branching. White/cream flowers open in morning, turn pink next day, and drop petals as bolls enlarge.",
        keyPractices: [
          "Nip terminal shoots (apical bud removal) at 80–90 DAS to encourage lateral boll growth",
          "Foliar spray of Planofix @ 0.25 ml/L to check square and boll shedding",
          "Maintain optimal moisture in furrows",
        ],
      },
      {
        stageNumber: 3,
        name: "Boll Development",
        duration: "Days 86–120",
        timing: "Green bolls enlarge and fill fiber",
        description: "Bolls reach maximum size. Fiber cells elongate and thicken inside developing green bolls.",
        keyPractices: [
          "Monitor for Pink Bollworm larvae by destructively sampling 20 green bolls per acre",
          "Maintain weed-free conditions along rows",
          "Ensure no water stress during fiber elongation",
        ],
      },
      {
        stageNumber: 4,
        name: "Boll Bursting & Picking",
        duration: "Days 121–165",
        timing: "Boll dehiscence to multiple pickings",
        description: "Mature dry bolls split open along carpels exposing clean white fluffy seed cotton (Kapas).",
        keyPractices: [
          "Pick Kapas in clean dry morning hours after dew has evaporated",
          "Keep clean cotton separate from stained/pest-damaged cotton",
          "Do not mix leaf trash or bracts with picked cotton; store in dry shed",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Pink Bollworm (Pectinophora gossypiella)",
        type: "pest",
        symptoms: "Rosetted flowers that fail to open properly; drilled entry holes in developing green bolls; stained fiber.",
        organicControl: "Install Pink Bollworm pheromone traps (Phero-sensor) @ 8–10/acre from 45 DAS. Release Trichogrammatoidea bactrae @ 50,000/ha.",
        chemicalControl: "Profenofos 50 EC @ 2 ml/L or Chlorantraniliprole 18.5 SC @ 0.3 ml/L when trap catches exceed 8 moths/trap/day for 3 consecutive days.",
      },
      {
        name: "Sucking Pests (Leafhopper / Jassids, Thrips, Whitefly)",
        type: "pest",
        symptoms: "Downward curling of leaf edges, 'hopper burn' yellow margins, crinkled foliage with sticky honeydew.",
        organicControl: "Yellow sticky traps (15/ha) + Neem seed kernel extract (NSKE 5%).",
        chemicalControl: "Flonicamid 50 WG @ 0.3 g/L or Thiamethoxam 25 WG @ 0.2 g/L.",
      },
      {
        name: "Grey Mildew (Ramularia areola)",
        type: "disease",
        symptoms: "Angular pale translucent spots on lower leaves with frosty white powdery fungal growth on underside.",
        organicControl: "Ensure adequate row spacing for sunlight and air penetration.",
        chemicalControl: "Carbendazim 50 WP @ 1 g/L or Wettable Sulfur @ 2.5 g/L.",
      },
    ],
    harvesting: {
      maturitySigns: "Bolls burst wide open; white lint fluffs out prominently and dries.",
      harvestMethod: "Hand picking in 3 to 4 rounds at 10–12 day intervals. Avoid picking morning dew-soaked bolls.",
      postHarvest: "Spread on clean tarpaulins to sun-dry to 7–8% moisture; pack into clean cotton cloth bags, never synthetic plastic.",
      expectedYield: "2.5 – 3.2 tonnes/ha seed cotton (Kapas) under irrigated conditions",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-CICR Nagpur",
      guideName: "TNAU Crop Production Guide — Agriculture 2020 (Cotton)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["Suraj", "MCU 5", "CO 14", "RCH 659 Bt", "Bollgard II hybrids", "KCH 14"],
    suitableRegions: ["Tamil Nadu (Salem, Coimbatore, Tiruppur, Perambalur)", "Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh"],
  },
  {
    id: "onion",
    name: "Onion / Shallots",
    localName: "வெங்காயம் (Vengayam - Bellary & Small Onion)",
    botanicalName: "Allium cepa",
    category: "Vegetables",
    mandiCommodity: "Onion",
    summary:
      "Vital culinary bulb crop with continuous consumer and export demand. High sulfur requirement for pungency and firm storage life. Withhold irrigation 10–15 days before harvest to avoid neck rot.",
    season: "Vaigasi pattam (Apr–May), Purattasi pattam (Sep–Oct), Thai pattam (Jan–Feb)",
    duration: "70–90 days (Small onion / Shallot), 110–120 days (Bellary / Big onion)",
    temperature: "15°C – 30°C (cool weather during vegetative, warm dry weather for bulb maturity)",
    rainfall: "500 – 700 mm (intolerant of heavy continuous rain during bulb formation)",
    soilType: "Friable, fertile sandy loam to light red soils with high organic matter",
    soilPh: "6.0 – 7.0 (compact heavy clays cause split and misshapen bulbs)",
    seedRate: "Small onion: 1200–1500 kg medium bulbs/ha; Big onion: 8–10 kg seeds/ha for nursery",
    spacing: "15 x 10 cm on flat beds or ridge sides (45 cm ridges)",
    npkRatio: "60 : 60 : 30 kg/ha NPK (Small onion) + Sulfur @ 20 kg/ha",
    fertilizerSchedule: {
      basal: "Full P₂O₅ (60 kg) + full K₂O (30 kg) + 50% N (30 kg) + Elemental Sulfur (20 kg/ha) at final land preparation.",
      vegetative: "Remaining 50% N (30 kg) top-dressed at 30 days after planting (DAP).",
      flowering: "Foliar spray of 19:19:19 (5 g/L) + Micronutrient mixture (2 g/L) at 40 and 55 DAP.",
      micronutrients: "Zinc Sulfate @ 15 kg/ha basal. Sulfur application enhances pungency and extends storage firmness.",
    },
    irrigation: {
      waterRequirement: "350 – 550 mm",
      method: "Sprinkler, drip, or shallow furrow flooding every 5–7 days",
      criticalStages: ["Establishment & sprouting (1–10 DAP)", "Vegetative foliage growth (25–35 DAP)", "Bulb development & swelling (45–65 DAP)"],
      waterSavingTip: "CRITICAL: Cease irrigation 10–15 days before harvest. Irrigating close to harvest causes neck rot and drastically reduces storage life.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Bulb Planting / Seedling Setting",
        duration: "Days 1–15",
        timing: "Field planting to root anchor",
        description: "Select uniform medium-sized bulbs (10–12g) for small onion. Treat bulbs in Trichoderma viride (4g/kg) before dibbling at 15 x 10 cm.",
        keyPractices: [
          "Dip bulbs in Carbendazim 1g/L solution for 15 mins to prevent basal rot",
          "Plant bulbs upright with neck exposed slightly above soil",
          "Apply immediate light irrigation to ensure uniform sprouting",
        ],
      },
      {
        stageNumber: 2,
        name: "Vegetative Foliage Growth",
        duration: "Days 16–45",
        timing: "Active leaf blade emergence",
        description: "Each plant produces 6–8 erect tubular hollow leaves. Root system is shallow; frequent light hoeing keeps soil aerated.",
        keyPractices: [
          "Top-dress second split of Nitrogen (30 kg/ha) at 30 DAP",
          "Manual hand weeding at 20 and 40 DAP (shallow roots damaged by deep tillage)",
          "Maintain uniform soil moisture without allowing surface crusting",
        ],
      },
      {
        stageNumber: 3,
        name: "Bulb Expansion & Swelling",
        duration: "Days 46–70",
        timing: "Bulb enlargement stage",
        description: "Leaf bases swell rapidly to form clusters of 4–8 bulbs per hill in shallots. Moisture stress during this stage reduces bulb size.",
        keyPractices: [
          "Spray Blue sticky traps (15/ha) to monitor and catch onion thrips",
          "Foliar spray of Boron (1 g/L) to prevent hollow neck and crack formation",
          "Ensure steady irrigation every 5–6 days",
        ],
      },
      {
        stageNumber: 4,
        name: "Neck Fall & Harvest Curing",
        duration: "Days 71–90",
        timing: "Top senescence and harvesting",
        description: "Neck tissues soften and 50–70% of foliage falls over naturally ('neck fall'), signaling complete bulb maturity.",
        keyPractices: [
          "Stop irrigation completely 10–12 days prior to pulling",
          "Harvest when 50% tops collapse naturally on a bright sunny day",
          "Field curing: lay bulbs in windrows covering bulbs with leaves for 3–5 days",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Onion Thrips (Thrips tabaci)",
        type: "pest",
        symptoms: "Silvery-white patches and streaks on leaves; curled leaf tips; leaves turn brownish and dry.",
        organicControl: "Install blue sticky traps @ 20/ha. Spray Neem oil 3% or Spinosad 45 SC @ 0.3 ml/L.",
        chemicalControl: "Fipronil 5 SC @ 1.5 ml/L or Thiamethoxam 25 WG @ 0.25 g/L with sticker.",
      },
      {
        name: "Purple Blotch (Alternaria porri)",
        type: "disease",
        symptoms: "Small water-soaked lesions that turn dark purple with yellow border; leaves break at lesion point.",
        organicControl: "Crop rotation with non-allium crops. Ensure well-drained raised beds.",
        chemicalControl: "Mancozeb 75 WP @ 2.5 g/L or Difenoconazole 25 EC @ 1 ml/L at first appearance.",
      },
      {
        name: "Basal Rot (Fusarium oxysporum f.sp. cepae)",
        type: "disease",
        symptoms: "Yellowing and dying back of leaves from tip; rotting of roots and bottom of bulb plate.",
        organicControl: "Bulb treatment with Trichoderma viride @ 4 g/kg + Pseudomonas @ 10 g/kg.",
        chemicalControl: "Drench infected patches with Carbendazim 50 WP @ 1 g/L or Copper Oxychloride @ 2.5 g/L.",
      },
    ],
    harvesting: {
      maturitySigns: "50% to 70% neck fall; leaves turn yellow and dry; outer bulb scales turn reddish-purple and papery.",
      harvestMethod: "Pull by hand on dry soil; cut tops leaving 2.5 cm neck attached to bulb to prevent storage infections.",
      postHarvest: "Shade cure for 10–12 days; store in well-ventilated raised bamboo/wire-mesh onion storage racks.",
      expectedYield: "12 – 16 tonnes/ha (Small onion / Shallot), 25 – 30 tonnes/ha (Bellary onion)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-DOGR Rajgurunagar",
      guideName: "TNAU Crop Production Guide — Horticulture 2020 (Onion)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["CO 5 (Small onion)", "CO (On) 5", "Arka Bindu", "Bhima Super (Bellary)", "N-53", "Agrifound Light Red"],
    suitableRegions: ["Tamil Nadu (Perambalur, Tiruchirappalli, Dindigul, Salem)", "Maharashtra (Nashik, Pune)", "Karnataka", "Andhra Pradesh"],
  },
  {
    id: "turmeric",
    name: "Turmeric",
    localName: "மஞ்சள் (Manjal)",
    botanicalName: "Curcuma longa",
    category: "Spices & Fruits",
    mandiCommodity: "Turmeric",
    summary:
      "Prized medicinal and commercial spice crop with major production in Western Tamil Nadu (Salem & Erode). Requires deep friable loamy soil, intensive organic mulching, and rigorous rhizome rot prevention.",
    season: "May–June (Vaikasi / Ani pattam)",
    duration: "240–270 days (8 to 9 months)",
    temperature: "20°C – 35°C (warm humid tropical climate with partial shade tolerance)",
    rainfall: "1500 – 2000 mm (or regular irrigation)",
    soilType: "Well-drained rich friable sandy loam or alluvial soil rich in humus",
    soilPh: "6.5 – 7.5 (susceptible to water stagnation and anaerobic root rot)",
    seedRate: "2000–2500 kg/ha of healthy mother or finger rhizomes (20–30g each)",
    spacing: "45 x 15 cm on ridges or broad bed and furrow (BBF: 120 cm bed with 4 rows)",
    npkRatio: "120 : 60 : 90 kg/ha (N : P₂O₅ : K₂O) + FYM @ 25 t/ha",
    fertilizerSchedule: {
      basal: "FYM 25 t/ha + Neem cake 2 t/ha + 100% P₂O₅ (60 kg) + 33% K₂O (30 kg) + 25% N (30 kg) in planting beds.",
      vegetative: "N and K applied in 3 equal splits at 30, 60, and 90 DAP along with earthing up and mulching.",
      flowering: "Remaining Potassium (30 kg) applied at 120 DAP to promote bold finger rhizome enlargement.",
      micronutrients: "Foliar spray of TNAU Turmeric Rich @ 5 g/L at 60, 90, and 120 DAP enhances curcumin content by 15%.",
    },
    irrigation: {
      waterRequirement: "1200 – 1500 mm (15 to 20 irrigations)",
      method: "Drip irrigation or furrow irrigation every 7–10 days",
      criticalStages: ["Rhizome sprouting & emergence (1–45 DAP)", "Tillering & leaf production (60–120 DAP)", "Rhizome swelling & finger development (120–180 DAP)"],
      waterSavingTip: "Apply green leaf mulch (12.5 tonnes/ha at planting, repeated at 50 DAP) to conserve soil moisture, moderate soil temperature, and suppress weeds.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Rhizome Sprouting & Mulching",
        duration: "Days 1–45",
        timing: "Planting to shoot emergence",
        description: "Treat seed rhizomes with Trichoderma viride (4g/kg) and Pseudomonas fluorescens (10g/kg). Mulch immediately with green leaves.",
        keyPractices: [
          "Dip rhizomes in Mancozeb (3g/L) for 30 minutes before planting",
          "Plant at 4 cm depth on ridges spaced at 45 cm",
          "First mulching with green leaves @ 12.5 t/ha immediately after planting",
        ],
      },
      {
        stageNumber: 2,
        name: "Tillering & Second Mulching",
        duration: "Days 46–100",
        timing: "Rapid canopy & pseudostem development",
        description: "Aerial shoots produce 6–10 large leaves. Second mulching and earthing up to protect developing crown from exposure.",
        keyPractices: [
          "Second green leaf mulch application @ 12.5 t/ha at 50 DAP",
          "Apply second split of N and K fertilizers",
          "Earth up soil around clumps to prevent rhizome exposure to sunlight",
        ],
      },
      {
        stageNumber: 3,
        name: "Rhizome Growth & Enlargement",
        duration: "Days 101–180",
        timing: "Underground finger development",
        description: "Mother rhizomes produce primary and secondary finger rhizomes. High nutrient and moisture demand.",
        keyPractices: [
          "Third split of Nitrogen and Potash application at 90–100 DAP",
          "Spray TNAU Turmeric Rich micronutrient mixture",
          "Maintain optimal soil aeration and prevent water stagnation at all costs",
        ],
      },
      {
        stageNumber: 4,
        name: "Maturation & Senescence",
        duration: "Days 181–260",
        timing: "Leaf drying to harvest",
        description: "Leaves turn pale yellow, dry up, and lodge naturally, indicating complete rhizome maturity and peak curcumin content.",
        keyPractices: [
          "Withhold irrigation 15 days before harvesting",
          "Cut dry foliage close to ground level before digging",
          "Plough carefully with tractor or dig manual clumps without slicing rhizomes",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Rhizome Rot / Soft Rot (Pythium aphanidermatum)",
        type: "disease",
        symptoms: "Yellowing of leaves from margins inward; water-soaked pseudostem collar; rotting foul-smelling rhizomes.",
        organicControl: "Ensure perfect field drainage. Soil drench with Trichoderma harzianum @ 2.5 kg/ha in 250 kg FYM.",
        chemicalControl: "Drench beds with Copper Oxychloride 50 WP @ 2.5 g/L or Metalaxyl-Mancozeb 72 WP @ 2 g/L at first notice.",
      },
      {
        name: "Shoot Borer (Conogethes punctiferalis)",
        type: "pest",
        symptoms: "Larvae bore into pseudostems; central shoot withers into 'dead heart'; boreholes show frass extrusion.",
        organicControl: "Release egg parasitoid Trichogramma chilonis @ 50,000/ha. Prune and destroy bored shoots.",
        chemicalControl: "Spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Malathion 50 EC @ 2 ml/L at monthly intervals.",
      },
      {
        name: "Leaf Spot (Colletotrichum capsici)",
        type: "disease",
        symptoms: "Brown elliptic spots on leaves with grey center; leaves dry up prematurely in humid weather.",
        organicControl: "Foliar spray of Pseudomonas fluorescens @ 5 g/L.",
        chemicalControl: "Spray Mancozeb @ 2 g/L or Azoxystrobin @ 1 ml/L at 15-day intervals.",
      },
    ],
    harvesting: {
      maturitySigns: "Leaves turn pale yellow, dry completely, and collapse to the ground; rhizomes develop deep yellow-orange internal flesh.",
      harvestMethod: "Loosen soil with ridge plough; pull clumps by hand and shake off clinging soil; separate mother from finger rhizomes.",
      postHarvest: "Boil rhizomes in clean water/steam for 45–60 mins until soft; sun-dry on clean floor for 10–15 days to 10% moisture; polish in drum.",
      expectedYield: "25 – 30 tonnes/ha fresh rhizomes (5.0 – 6.0 tonnes/ha cured dry turmeric)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-IISR Calicut",
      guideName: "TNAU Crop Production Guide — Horticulture 2020 (Spices - Turmeric)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["BSR 1", "BSR 2", "IISR Pragati", "Roma", "Suranjana", "Erode Local", "Salem Local"],
    suitableRegions: ["Tamil Nadu (Salem, Erode, Namakkal, Dharmapuri, Coimbatore)", "Telangana", "Andhra Pradesh", "Maharashtra"],
  },
  {
    id: "banana",
    name: "Banana",
    localName: "வாழை (Vazhai)",
    botanicalName: "Musa acuminata",
    category: "Spices & Fruits",
    mandiCommodity: "Banana",
    summary:
      "Perennial giant herb yielding high commercial fruit output year-round. Demands heavy organic feeding, high potassium nutrition, regular de-suckering, and propping to prevent wind lodging.",
    season: "Feb–Apr and Jul–Aug (throughout year in irrigated tropical plains)",
    duration: "11–13 months (Plant crop), 9–10 months (Ratoon crop)",
    temperature: "20°C – 35°C (warm humid tropical climate; growth halts below 12°C)",
    rainfall: "1500 – 2000 mm (or continuous micro-irrigation)",
    soilType: "Deep rich loamy or alluvial soil high in organic matter with excellent internal drainage",
    soilPh: "6.5 – 7.5 (intolerant of salinity and standing water)",
    seedRate: "2000–2500 suckers/ha (Sword suckers 1.5–2.0 kg or certified tissue culture plantlets)",
    spacing: "2.1 x 2.1 m (pit planting) or 1.8 x 1.8 m (high density planting)",
    npkRatio: "200 : 35 : 300 g NPK per plant per crop cycle",
    fertilizerSchedule: {
      basal: "FYM 10 kg/plant + Neem cake 1 kg + full P₂O₅ (35g) applied in planting pit.",
      vegetative: "Nitrogen (200g) applied in 4 equal splits at 2nd, 3rd, 4th, and 5th month after planting.",
      flowering: "Potassium (300g) applied in 3 splits at shooting (7th month), bunch emergence (8th month), and bunch development (9th month).",
      micronutrients: "Spray TNAU Banana Micronutrient Formulation @ 5 g/L at 3rd, 5th, and 7th month after planting.",
    },
    irrigation: {
      waterRequirement: "1800 – 2200 mm (requires 15–20 liters/plant/day)",
      method: "Drip irrigation with 2 drippers (4 LPH each) per plant",
      criticalStages: ["Early vegetative establishment (1–3 months)", "Shooting & floral emergence (7–8 months)", "Bunch development & finger filling (9–11 months)"],
      waterSavingTip: "Drip irrigation with fertigation saves 40% water and enhances bunch weight by 20–25% over conventional basin flooding.",
    },
    growingStages: [
      {
        stageNumber: 1,
        name: "Sucker Planting & Establishment",
        duration: "Months 1–3",
        timing: "Paring and pralinage to early whorl",
        description: "Pare sucker corm, dip in cow dung slurry + Carbofuran + Pseudomonas. Plant upright in 60x60x60 cm pits filled with manure and topsoil.",
        keyPractices: [
          "Dip suckers in Carbendazim 2g/L solution to prevent Panama wilt",
          "Ensure soil is firmly pressed around corm",
          "De-sucker continuously: remove all side suckers until bunch shooting",
        ],
      },
      {
        stageNumber: 2,
        name: "Vegetative Canopy Development",
        duration: "Months 4–7",
        timing: "Rapid pseudostem growth and broad leaf production",
        description: "Pseudostem reaches full height (2.5–3.5m) and produces 30–35 broad functional green leaves.",
        keyPractices: [
          "Apply monthly nitrogen and potassium fertigation splits",
          "Remove dried and diseased lower leaves (de-leafing)",
          "Earthing up soil around base to support heavy root anchor",
        ],
      },
      {
        stageNumber: 3,
        name: "Shooting & Bunch Emergence",
        duration: "Months 8–9",
        timing: "Inflorescence emergence from crown",
        description: "Large purple-red flower bud emerges from center of crown. Female flowers open to form hands of fingers.",
        keyPractices: [
          "Denavelling: remove male flower bud after last hand of bananas opens",
          "Propping: support heavy pseudostem with bamboo or casuarina poles to prevent wind lodging",
          "Sleeve bunch with ventilated blue/white polyethylene bunch cover to protect from sun-scorch and thrips",
        ],
      },
      {
        stageNumber: 4,
        name: "Bunch Maturation & Harvesting",
        duration: "Months 10–12",
        timing: "Finger filling to harvest",
        description: "Bananas swell and lose sharp ridge angles. Skin turns light green.",
        keyPractices: [
          "Spray Potassium Sulphate (SOP 0.5%) on bunch 30 days after shooting",
          "Harvest when fingers are 75–80% mature with rounded edges",
          "Cut bunch with 30 cm stalk attached for easy handling; shade pack in crates",
        ],
      },
    ],
    pestManagement: [
      {
        name: "Banana Pseudostem Weevil (Odoiporus longicollis)",
        type: "pest",
        symptoms: "Pinhead sized jelly-like exudation on pseudostem; rotting of inner core; stem collapses in mild wind.",
        organicControl: "Install pseudostem longitudinal split traps @ 65 traps/ha. Swab stem with Beauveria bassiana @ 5 g/L.",
        chemicalControl: "Stem injection with Monocrotophos 36 SL or Chlorpyrifos 20 EC @ 1:4 dilution into boreholes.",
      },
      {
        name: "Panama Wilt (Fusarium oxysporum f.sp. cubense)",
        type: "disease",
        symptoms: "Yellowing of lower leaves progressing upward; leaves buckle at petiole and hang down like an apron; brown vascular discoloration in corm.",
        organicControl: "Plant resistant varieties (Grand Naine, Robusta). Soil application of Trichoderma viride @ 2.5 kg/ha in 250 kg neem cake.",
        chemicalControl: "Corm injection with Carbendazim 2% solution (3ml/plant) at 3rd, 5th, and 7th month.",
      },
      {
        name: "Sigatoka Leaf Spot (Mycosphaerella musicola)",
        type: "disease",
        symptoms: "Spindle-shaped yellow-brown spots with grey centers on leaves; causes premature drying of canopy.",
        organicControl: "Cut and burn heavily infected leaves. Avoid overhead sprinkling.",
        chemicalControl: "Foliar spray of Propiconazole 25 EC @ 1 ml/L + mineral oil (10 ml/L) or Carbendazim @ 1 g/L.",
      },
    ],
    harvesting: {
      maturitySigns: "Angles of individual fingers become rounded; floral remnants drop easily; fruit skin turns light green.",
      harvestMethod: "Half-cut the pseudostem, gently lower bunch, and cut stalk cleanly 30 cm above top hand.",
      postHarvest: "De-hand with de-handing curved knife; wash in clean water with alum; pack into corrugated fiberboard boxes for transit.",
      expectedYield: "60 – 75 tonnes/ha (Grand Naine), 35 – 45 tonnes/ha (Poovan / Rasthali)",
    },
    sourceAttribution: {
      institution: "Tamil Nadu Agricultural University & ICAR-NRCB Tiruchirappalli",
      guideName: "TNAU Crop Production Guide — Horticulture 2020 (Banana)",
      year: 2020,
      referenceUrl: "https://agritech.tnau.ac.in",
    },
    popularVarieties: ["Grand Naine (G9)", "Poovan", "Rasthali (Silk)", "Robusta", "Nendran", "Red Banana", "Ney Poovan"],
    suitableRegions: ["Tamil Nadu (Trichy, Erode, Coimbatore, Theni, Salem)", "Kerala", "Karnataka", "Andhra Pradesh", "Maharashtra"],
  },
];
