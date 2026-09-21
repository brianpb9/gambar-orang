/**
 * Gambar Orang — character path data (simplified geometry for TK kids)
 * Coordinates in design space 400×520. Steps reveal stroke groups in order.
 * fillRegions are closed paths for Warnai (bucket) mode.
 */
window.GAMBOR_CHARACTERS = [
  {
    id: "cewek-kuncir",
    nameId: "Cewek kuncir",
    nameEn: "Girl pigtails",
    emoji: "👧",
    // 9 steps inspired by pigtail girl reference
    steps: [
      {
        id: "head",
        labelId: "Kepala",
        labelEn: "Head",
        paths: [
          "M 200 95 C 155 95 120 130 120 180 C 120 230 155 265 200 265 C 245 265 280 230 280 180 C 280 130 245 95 200 95"
        ]
      },
      {
        id: "left-pigtail",
        labelId: "Kuncir kiri",
        labelEn: "Left pigtail",
        paths: [
          "M 125 145 C 90 130 70 155 75 185 C 80 210 100 220 120 210",
          "M 95 175 C 85 185 88 205 100 200"
        ]
      },
      {
        id: "right-pigtail",
        labelId: "Kuncir kanan",
        labelEn: "Right pigtail",
        paths: [
          "M 275 145 C 310 130 330 155 325 185 C 320 210 300 220 280 210",
          "M 305 175 C 315 185 312 205 300 200"
        ]
      },
      {
        id: "bangs",
        labelId: "Rambut depan",
        labelEn: "Bangs",
        paths: [
          "M 140 120 C 160 105 185 100 200 100 C 215 100 240 105 260 120",
          "M 160 118 C 170 135 180 140 200 138 C 220 140 230 135 240 118"
        ]
      },
      {
        id: "face",
        labelId: "Wajah",
        labelEn: "Face",
        paths: [
          "M 168 175 Q 175 168 182 175",
          "M 218 175 Q 225 168 232 175",
          "M 185 205 Q 200 218 215 205",
          "M 155 195 Q 145 200 150 210",
          "M 245 195 Q 255 200 250 210"
        ]
      },
      {
        id: "body",
        labelId: "Badan / baju",
        labelEn: "Body / dress",
        paths: [
          "M 160 265 L 150 380 L 250 380 L 240 265",
          "M 150 320 L 250 320"
        ]
      },
      {
        id: "arms",
        labelId: "Tangan",
        labelEn: "Arms",
        paths: [
          "M 160 280 C 120 300 100 340 105 375",
          "M 240 280 C 280 300 300 340 295 375",
          "M 100 375 Q 105 385 115 380",
          "M 300 375 Q 295 385 285 380"
        ]
      },
      {
        id: "legs",
        labelId: "Kaki",
        labelEn: "Legs",
        paths: [
          "M 175 380 L 170 450",
          "M 225 380 L 230 450"
        ]
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        paths: [
          "M 155 450 Q 170 465 185 450",
          "M 215 450 Q 230 465 245 450"
        ]
      }
    ],
    fillRegions: [
      { id: "hair", labelId: "Rambut", labelEn: "Hair", path: "M 130 150 C 125 105 155 90 200 92 C 245 90 275 105 270 150 C 260 120 235 108 200 108 C 165 108 140 120 130 150 Z M 125 150 C 95 135 72 155 78 188 C 84 215 105 222 122 210 L 130 165 Z M 275 150 C 305 135 328 155 322 188 C 316 215 295 222 278 210 L 270 165 Z", defaultColor: "#E8A838" },
      { id: "skin", labelId: "Kulit", labelEn: "Skin", path: "M 200 108 C 160 108 130 140 130 180 C 130 228 160 258 200 258 C 240 258 270 228 270 180 C 270 140 240 108 200 108 Z", defaultColor: "#F5C9A8" },
      { id: "dress", labelId: "Baju", labelEn: "Dress", path: "M 160 265 L 150 380 L 250 380 L 240 265 Z", defaultColor: "#F48FB1" },
      { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: "M 152 448 L 152 460 Q 170 472 188 460 L 188 448 Z M 212 448 L 212 460 Q 230 472 248 460 L 248 448 Z", defaultColor: "#C62828" }
    ],
    palette: ["#F5C9A8", "#E8A838", "#F48FB1", "#EF5350", "#42A5F5", "#8D6E63", "#FFFFFF", "#212121"]
  },
  {
    id: "cowok",
    nameId: "Cowok",
    nameEn: "Boy",
    emoji: "👦",
    steps: [
      {
        id: "head",
        labelId: "Kepala",
        labelEn: "Head",
        paths: [
          "M 200 100 C 150 100 115 140 115 190 C 115 240 150 275 200 275 C 250 275 285 240 285 190 C 285 140 250 100 200 100"
        ]
      },
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        paths: [
          "M 120 160 C 125 110 160 90 200 88 C 240 90 275 110 280 160",
          "M 140 130 C 155 115 180 108 200 108 C 220 108 245 115 260 130",
          "M 165 115 L 170 95",
          "M 200 108 L 200 90",
          "M 235 115 L 240 95"
        ]
      },
      {
        id: "ears",
        labelId: "Telinga",
        labelEn: "Ears",
        paths: [
          "M 115 185 Q 100 185 102 205 Q 105 220 118 215",
          "M 285 185 Q 300 185 298 205 Q 295 220 282 215"
        ]
      },
      {
        id: "face",
        labelId: "Wajah",
        labelEn: "Face",
        paths: [
          "M 165 180 Q 172 172 180 180",
          "M 220 180 Q 227 172 235 180",
          "M 185 215 Q 200 228 215 215"
        ]
      },
      {
        id: "body",
        labelId: "Baju",
        labelEn: "Shirt",
        paths: [
          "M 155 275 L 145 365 L 255 365 L 245 275",
          "M 200 275 L 200 365"
        ]
      },
      {
        id: "arms",
        labelId: "Tangan",
        labelEn: "Arms",
        paths: [
          "M 155 290 C 115 310 95 350 100 385",
          "M 245 290 C 285 310 305 350 300 385",
          "M 95 385 Q 100 395 110 390",
          "M 305 385 Q 300 395 290 390"
        ]
      },
      {
        id: "legs",
        labelId: "Celana & kaki",
        labelEn: "Pants & legs",
        paths: [
          "M 160 365 L 155 430",
          "M 240 365 L 245 430",
          "M 145 365 L 255 365"
        ]
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        paths: [
          "M 140 430 Q 155 448 175 430",
          "M 225 430 Q 240 448 260 430"
        ]
      }
    ],
    fillRegions: [
      { id: "hair", labelId: "Rambut", labelEn: "Hair", path: "M 120 160 C 125 100 160 85 200 85 C 240 85 275 100 280 160 C 270 125 240 105 200 105 C 160 105 130 125 120 160 Z", defaultColor: "#5D4037" },
      { id: "skin", labelId: "Kulit", labelEn: "Skin", path: "M 200 105 C 155 105 120 145 120 190 C 120 240 155 270 200 270 C 245 270 280 240 280 190 C 280 145 245 105 200 105 Z", defaultColor: "#F5C9A8" },
      { id: "shirt", labelId: "Baju", labelEn: "Shirt", path: "M 155 275 L 145 365 L 255 365 L 245 275 Z", defaultColor: "#42A5F5" },
      { id: "pants", labelId: "Celana", labelEn: "Pants", path: "M 160 365 L 155 428 L 175 428 L 180 365 Z M 240 365 L 245 428 L 225 428 L 220 365 Z", defaultColor: "#1565C0" },
      { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: "M 140 428 L 140 438 Q 155 452 175 438 L 175 428 Z M 225 428 L 225 438 Q 240 452 260 438 L 260 428 Z", defaultColor: "#EF5350" }
    ],
    palette: ["#F5C9A8", "#5D4037", "#42A5F5", "#1565C0", "#EF5350", "#E8A838", "#FFFFFF", "#212121"]
  },
  {
    id: "cewek-topi",
    nameId: "Cewek topi",
    nameEn: "Girl with hat",
    emoji: "👒",
    steps: [
      {
        id: "hat",
        labelId: "Topi",
        labelEn: "Hat",
        paths: [
          "M 110 145 Q 200 80 290 145",
          "M 110 145 Q 200 165 290 145",
          "M 155 120 Q 200 95 245 120"
        ]
      },
      {
        id: "head",
        labelId: "Kepala",
        labelEn: "Head",
        paths: [
          "M 200 145 C 155 145 125 175 125 215 C 125 260 155 290 200 290 C 245 290 275 260 275 215 C 275 175 245 145 200 145"
        ]
      },
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        paths: [
          "M 125 200 C 115 230 118 270 130 295",
          "M 275 200 C 285 230 282 270 270 295",
          "M 140 155 C 160 148 185 145 200 145 C 215 145 240 148 260 155"
        ]
      },
      {
        id: "face",
        labelId: "Wajah",
        labelEn: "Face",
        paths: [
          "M 168 210 Q 175 202 182 210",
          "M 218 210 Q 225 202 232 210",
          "M 188 240 Q 200 252 212 240",
          "M 150 230 Q 140 235 145 245",
          "M 250 230 Q 260 235 255 245"
        ]
      },
      {
        id: "body-arms",
        labelId: "Baju & tangan",
        labelEn: "Dress & arms",
        paths: [
          "M 165 290 L 145 400 L 255 400 L 235 290",
          "M 165 310 C 125 330 105 365 110 395",
          "M 235 310 C 275 330 295 365 290 395",
          "M 105 395 Q 110 405 120 400",
          "M 295 395 Q 290 405 280 400"
        ]
      },
      {
        id: "legs-shoes",
        labelId: "Kaki & sepatu",
        labelEn: "Legs & shoes",
        paths: [
          "M 175 400 L 170 465",
          "M 225 400 L 230 465",
          "M 155 465 Q 170 480 185 465",
          "M 215 465 Q 230 480 245 465"
        ]
      }
    ],
    fillRegions: [
      { id: "hat", labelId: "Topi", labelEn: "Hat", path: "M 110 145 Q 200 80 290 145 Q 200 165 110 145 Z", defaultColor: "#EF5350" },
      { id: "hair", labelId: "Rambut", labelEn: "Hair", path: "M 125 200 C 115 230 118 280 130 300 L 145 290 C 135 260 130 220 140 190 Z M 275 200 C 285 230 282 280 270 300 L 255 290 C 265 260 270 220 260 190 Z", defaultColor: "#E8A838" },
      { id: "skin", labelId: "Kulit", labelEn: "Skin", path: "M 200 150 C 160 150 130 180 130 215 C 130 255 160 285 200 285 C 240 285 270 255 270 215 C 270 180 240 150 200 150 Z", defaultColor: "#F5C9A8" },
      { id: "dress", labelId: "Baju", labelEn: "Dress", path: "M 165 290 L 145 400 L 255 400 L 235 290 Z", defaultColor: "#F48FB1" },
      { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: "M 155 463 L 155 473 Q 170 485 185 473 L 185 463 Z M 215 463 L 215 473 Q 230 485 245 473 L 245 463 Z", defaultColor: "#8D6E63" }
    ],
    palette: ["#F5C9A8", "#E8A838", "#F48FB1", "#EF5350", "#42A5F5", "#8D6E63", "#FFFFFF", "#212121"]
  }
];
