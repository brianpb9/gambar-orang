/**
 * Gambar Orang — character path data matched to Brian's tutorial refs
 * Design space 400×520. Absolute M/L/C/Q/Z only.
 * Chibi: head ≈ body. Thick closed shapes (not stick lines). Dot/oval eyes.
 */
window.GAMBOR_CHARACTERS = [
  {
    id: "cewek-kuncir",
    nameId: "Cewek kuncir",
    nameEn: "Girl pigtails",
    emoji: "👧",
    steps: [
      {
        id: "head",
        labelId: "Kepala",
        labelEn: "Head",
        paths: [
          "M 282 168 C 282 214 245 252 200 252 C 155 252 118 214 118 168 C 118 122 155 84 200 84 C 245 84 282 122 282 168 Z"
        ]
      },
      {
        id: "bangs-ears",
        labelId: "Rambut & telinga",
        labelEn: "Bangs & ears",
        paths: [
          // Zigzag bangs
          "M 128 132 L 150 112 L 170 132 L 190 110 L 200 128 L 210 110 L 230 132 L 250 112 L 272 132",
          // Ears
          "M 118 158 Q 98 168 100 188 Q 102 204 120 198",
          "M 282 158 Q 302 168 300 188 Q 298 204 280 198"
        ]
      },
      {
        id: "face",
        labelId: "Wajah",
        labelEn: "Face",
        paths: [
          // Black DOT eyes (larger so thick stroke reads solid)
          "M 180 176 C 180 183 174 188 168 188 C 162 188 156 183 156 176 C 156 169 162 164 168 164 C 174 164 180 169 180 176 Z",
          "M 244 176 C 244 183 238 188 232 188 C 226 188 220 183 220 176 C 220 169 226 164 232 164 C 238 164 244 169 244 176 Z",
          // Tiny lashes
          "M 155 168 L 144 160",
          "M 154 176 L 142 176",
          "M 155 184 L 144 192",
          "M 245 168 L 256 160",
          "M 246 176 L 258 176",
          "M 245 184 L 256 192",
          // Smile
          "M 170 206 Q 200 232 230 206"
        ]
      },
      {
        id: "pigtails",
        labelId: "Kuncir",
        labelEn: "Pigtails",
        paths: [
          // LARGE rounded teardrop blobs attached at sides
          "M 120 125 C 85 95 30 115 28 170 C 26 225 70 255 118 242 C 135 235 138 195 135 160 C 133 140 128 130 120 125 Z",
          "M 280 125 C 315 95 370 115 372 170 C 374 225 330 255 282 242 C 265 235 262 195 265 160 C 267 140 272 130 280 125 Z"
        ]
      },
      {
        id: "dress",
        labelId: "Baju",
        labelEn: "Dress",
        paths: [
          "M 160 252 L 132 390 L 268 390 L 240 252 Z"
        ]
      },
      {
        id: "arms",
        labelId: "Tangan",
        labelEn: "Arms",
        paths: [
          // Short thick curved sausage arms (clearly closed fat shapes)
          "M 155 265 C 110 270 78 310 82 360 C 84 385 115 395 138 370 C 148 350 155 310 168 272 Z",
          "M 245 265 C 290 270 322 310 318 360 C 316 385 285 395 262 370 C 252 350 245 310 232 272 Z"
        ]
      },
      {
        id: "legs",
        labelId: "Kaki",
        labelEn: "Legs",
        paths: [
          // Rounded pill legs
          "M 145 390 L 145 455 C 145 478 175 485 195 455 L 195 390 Z",
          "M 205 390 L 205 455 C 205 478 235 485 255 455 L 255 390 Z"
        ]
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        paths: [
          "M 143 448 L 197 448",
          "M 203 448 L 257 448",
          "M 200 462 C 200 476 175 484 170 484 C 165 484 140 476 140 462 C 140 450 165 444 170 444 C 175 444 200 450 200 462 Z",
          "M 260 462 C 260 476 235 484 230 484 C 225 484 200 476 200 462 C 200 450 225 444 230 444 C 235 444 260 450 260 462 Z"
        ]
      }
    ],
    fillRegions: [
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        // Top-of-head above bangs (scalloped bottom) + both pigtails — no flat bar
        path: "M 130 95 C 155 78 180 75 200 75 C 220 75 245 78 270 95 L 270 128 L 250 112 L 230 130 L 210 110 L 200 126 L 190 110 L 170 130 L 150 112 L 130 128 Z M 120 125 C 85 95 30 115 28 170 C 26 225 70 255 118 242 C 135 235 138 195 135 160 C 133 140 128 130 120 125 Z M 280 125 C 315 95 370 115 372 170 C 374 225 330 255 282 242 C 265 235 262 195 265 160 C 267 140 272 130 280 125 Z",
        defaultColor: "#E8873A"
      },
      {
        id: "skin",
        labelId: "Kulit",
        labelEn: "Skin",
        path: "M 282 168 C 282 214 245 252 200 252 C 155 252 118 214 118 168 C 118 122 155 84 200 84 C 245 84 282 122 282 168 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "arms",
        labelId: "Lengan",
        labelEn: "Arms",
        path: "M 155 265 C 110 270 78 310 82 360 C 84 385 115 395 138 370 C 148 350 155 310 168 272 Z M 245 265 C 290 270 322 310 318 360 C 316 385 285 395 262 370 C 252 350 245 310 232 272 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "legs",
        labelId: "Kaki",
        labelEn: "Legs",
        path: "M 145 390 L 145 448 L 195 448 L 195 390 Z M 205 390 L 205 448 L 255 448 L 255 390 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "eyes",
        labelId: "Mata",
        labelEn: "Eyes",
        path: "M 180 176 C 180 183 174 188 168 188 C 162 188 156 183 156 176 C 156 169 162 164 168 164 C 174 164 180 169 180 176 Z M 244 176 C 244 183 238 188 232 188 C 226 188 220 183 220 176 C 220 169 226 164 232 164 C 238 164 244 169 244 176 Z",
        defaultColor: "#212121"
      },
      {
        id: "dress",
        labelId: "Baju",
        labelEn: "Dress",
        path: "M 160 252 L 132 390 L 268 390 L 240 252 Z",
        defaultColor: "#F48FB1"
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        path: "M 143 448 L 143 462 C 143 478 170 486 170 486 C 170 486 197 478 197 462 L 197 448 Z M 203 448 L 203 462 C 203 478 230 486 230 486 C 230 486 257 478 257 462 L 257 448 Z",
        defaultColor: "#A0522D"
      }
    ],
    palette: ["#F5C9A8", "#E8873A", "#F48FB1", "#A0522D", "#EF5350", "#42A5F5", "#FFFFFF", "#212121"]
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
          "M 290 162 C 290 214 248 256 200 256 C 152 256 110 214 110 162 C 110 110 152 72 200 72 C 248 72 290 110 290 162 Z"
        ]
      },
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        paths: [
          // Short bang curve across upper third down toward ears
          "M 112 155 Q 200 100 288 155",
          "M 122 120 Q 200 78 278 120"
        ]
      },
      {
        id: "ears",
        labelId: "Telinga",
        labelEn: "Ears",
        paths: [
          "M 110 155 Q 88 165 90 190 Q 92 210 114 202",
          "M 290 155 Q 312 165 310 190 Q 308 210 286 202"
        ]
      },
      {
        id: "face",
        labelId: "Wajah",
        labelEn: "Face",
        paths: [
          // Vertical oval eyes
          "M 184 172 C 184 184 176 194 166 194 C 156 194 148 184 148 172 C 148 160 156 150 166 150 C 176 150 184 160 184 172 Z",
          "M 252 172 C 252 184 244 194 234 194 C 224 194 216 184 216 172 C 216 160 224 150 234 150 C 244 150 252 160 252 172 Z",
          // Pupils
          "M 176 176 C 176 181 172 185 168 185 C 164 185 160 181 160 176 C 160 171 164 167 168 167 C 172 167 176 171 176 176 Z",
          "M 244 176 C 244 181 240 185 236 185 C 232 185 228 181 228 176 C 228 171 232 167 236 167 C 240 167 244 171 244 176 Z",
          // Eyebrows
          "M 148 142 Q 166 134 182 142",
          "M 218 142 Q 236 134 252 142",
          // Tiny V nose
          "M 194 198 L 200 208 L 206 198",
          // Smile
          "M 168 220 Q 200 244 232 220"
        ]
      },
      {
        id: "shirt",
        labelId: "Baju",
        labelEn: "Shirt",
        paths: [
          "M 152 256 C 135 265 126 295 124 325 L 124 352 Q 200 372 276 352 L 276 325 C 274 295 265 265 248 256 Z"
        ]
      },
      {
        id: "arms",
        labelId: "Tangan",
        labelEn: "Arms",
        paths: [
          // Thick sausage arms + mitten hands
          "M 142 275 C 95 288 70 335 75 380 C 78 398 105 405 128 385 C 140 365 148 325 158 295 Z",
          "M 78 382 C 58 375 50 395 58 412 C 68 435 105 440 128 418 C 138 405 130 388 115 385 Z",
          "M 258 275 C 305 288 330 335 325 380 C 322 398 295 405 272 385 C 260 365 252 325 242 295 Z",
          "M 322 382 C 342 375 350 395 342 412 C 332 435 295 440 272 418 C 262 405 270 388 285 385 Z"
        ]
      },
      {
        id: "pants",
        labelId: "Celana",
        labelEn: "Pants",
        paths: [
          "M 135 352 L 135 435 L 188 435 L 188 352 Z",
          "M 212 352 L 212 435 L 265 435 L 265 352 Z",
          "M 135 352 L 265 352"
        ]
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        paths: [
          "M 195 442 C 195 454 175 464 155 464 C 135 464 118 454 118 442 C 118 430 135 424 155 424 C 175 424 195 430 195 442 Z",
          "M 282 442 C 282 454 262 464 242 464 C 222 464 205 454 205 442 C 205 430 222 424 242 424 C 262 424 282 430 282 442 Z"
        ]
      }
    ],
    fillRegions: [
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        path: "M 112 155 Q 200 100 288 155 C 285 115 250 70 200 68 C 150 70 115 115 112 155 Z",
        defaultColor: "#6D4C41"
      },
      {
        id: "skin",
        labelId: "Kulit",
        labelEn: "Skin",
        path: "M 290 162 C 290 214 248 256 200 256 C 152 256 110 214 110 162 C 110 110 152 72 200 72 C 248 72 290 110 290 162 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "arms",
        labelId: "Lengan",
        labelEn: "Arms",
        path: "M 142 275 C 95 288 70 335 75 380 C 78 398 105 405 128 385 C 140 365 148 325 158 295 Z M 78 382 C 58 375 50 395 58 412 C 68 435 105 440 128 418 C 138 405 130 388 115 385 Z M 258 275 C 305 288 330 335 325 380 C 322 398 295 405 272 385 C 260 365 252 325 242 295 Z M 322 382 C 342 375 350 395 342 412 C 332 435 295 440 272 418 C 262 405 270 388 285 385 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "eyes",
        labelId: "Mata",
        labelEn: "Eyes",
        path: "M 176 176 C 176 181 172 185 168 185 C 164 185 160 181 160 176 C 160 171 164 167 168 167 C 172 167 176 171 176 176 Z M 244 176 C 244 181 240 185 236 185 C 232 185 228 181 228 176 C 228 171 232 167 236 167 C 240 167 244 171 244 176 Z",
        defaultColor: "#212121"
      },
      {
        id: "shirt",
        labelId: "Baju",
        labelEn: "Shirt",
        path: "M 152 256 C 135 265 126 295 124 325 L 124 352 Q 200 372 276 352 L 276 325 C 274 295 265 265 248 256 Z",
        defaultColor: "#E53935"
      },
      {
        id: "pants",
        labelId: "Celana",
        labelEn: "Pants",
        path: "M 135 352 L 135 435 L 188 435 L 188 352 Z M 212 352 L 212 435 L 265 435 L 265 352 Z",
        defaultColor: "#1E88E5"
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        path: "M 195 442 C 195 454 175 464 155 464 C 135 464 118 454 118 442 C 118 430 135 424 155 424 C 175 424 195 430 195 442 Z M 282 442 C 282 454 262 464 242 464 C 222 464 205 454 205 442 C 205 430 222 424 242 424 C 262 424 282 430 282 442 Z",
        defaultColor: "#37474F"
      }
    ],
    palette: ["#F5C9A8", "#6D4C41", "#E53935", "#1E88E5", "#37474F", "#EF5350", "#FFFFFF", "#212121"]
  },

  {
    id: "cewek-topi",
    nameId: "Cewek topi",
    nameEn: "Girl with hat",
    emoji: "👒",
    steps: [
      {
        id: "hat-head",
        labelId: "Topi & kepala",
        labelEn: "Hat & head",
        paths: [
          "M 278 192 C 278 236 243 272 200 272 C 157 272 122 236 122 192 C 122 148 157 114 200 114 C 243 114 278 148 278 192 Z",
          // Bucket hat dome
          "M 148 118 C 148 68 252 68 252 118",
          // Wide brim
          "M 95 122 Q 200 152 305 122 Q 200 100 95 122 Z",
          // Circle eyes
          "M 184 198 C 184 206 178 212 170 212 C 162 212 156 206 156 198 C 156 190 162 184 170 184 C 178 184 184 190 184 198 Z",
          "M 244 198 C 244 206 238 212 230 212 C 222 212 216 206 216 198 C 216 190 222 184 230 184 C 238 184 244 190 244 198 Z"
        ]
      },
      {
        id: "body",
        labelId: "Badan",
        labelEn: "Body",
        paths: [
          "M 152 272 C 140 295 136 335 138 368 L 262 368 C 264 335 260 295 248 272 Z",
          "M 188 228 L 212 228"
        ]
      },
      {
        id: "hair-legs",
        labelId: "Rambut & kaki",
        labelEn: "Hair & legs",
        paths: [
          // Wavy brown hair under hat
          "M 122 170 C 100 195 95 250 110 285 C 118 300 142 295 148 270 C 152 240 142 195 135 175 Z",
          "M 278 170 C 300 195 305 250 290 285 C 282 300 258 295 252 270 C 248 240 258 195 265 175 Z",
          "M 108 215 Q 92 235 108 255",
          "M 292 215 Q 308 235 292 255",
          // Smile
          "M 172 226 Q 200 250 228 226",
          // Thick pill legs
          "M 148 368 L 148 442 C 148 465 180 472 198 442 L 198 368 Z",
          "M 202 368 L 202 442 C 202 465 234 472 252 442 L 252 368 Z"
        ]
      },
      {
        id: "clothes",
        labelId: "Baju & sepatu",
        labelEn: "Clothes & shoes",
        paths: [
          // Tank collar
          "M 165 272 Q 200 290 235 272",
          // Tank hem / shorts top
          "M 140 328 L 260 328",
          // Shorts bottom
          "M 140 368 L 260 368",
          "M 200 328 L 200 368",
          // Thick sausage arms
          "M 145 285 C 105 295 85 340 90 385 C 92 405 120 412 140 388 C 150 365 155 325 162 295 Z",
          "M 255 285 C 295 295 315 340 310 385 C 308 405 280 412 260 388 C 250 365 245 325 238 295 Z",
          // Pink shoes
          "M 198 450 C 198 462 178 470 168 470 C 158 470 140 462 140 450 C 140 438 158 432 168 432 C 178 432 198 438 198 450 Z",
          "M 260 450 C 260 462 240 470 230 470 C 220 470 202 462 202 450 C 202 438 220 432 230 432 C 240 432 260 438 260 450 Z"
        ]
      },
      {
        id: "details",
        labelId: "Hati & mata",
        labelEn: "Heart & eyes",
        paths: [
          "M 200 305 C 188 292 170 296 170 312 C 170 324 200 342 200 342 C 200 342 230 324 230 312 C 230 296 212 292 200 305 Z",
          // Pupils (white highlight dots as small open circles on black eyes — black filled via fillRegions)
          "M 176 196 C 176 199 174 201 172 201 C 170 201 168 199 168 196 C 168 193 170 191 172 191 C 174 191 176 193 176 196 Z",
          "M 236 196 C 236 199 234 201 232 201 C 230 201 228 199 228 196 C 228 193 230 191 232 191 C 234 191 236 193 236 196 Z",
          "M 148 116 Q 200 128 252 116"
        ]
      }
    ],
    fillRegions: [
      {
        id: "hat",
        labelId: "Topi",
        labelEn: "Hat",
        path: "M 148 118 C 148 68 252 68 252 118 L 252 122 Q 200 102 148 122 Z M 95 122 Q 200 152 305 122 Q 200 100 95 122 Z",
        defaultColor: "#EC407A"
      },
      {
        id: "hair",
        labelId: "Rambut",
        labelEn: "Hair",
        path: "M 122 170 C 100 195 95 250 110 285 C 118 300 142 295 148 270 C 152 240 142 195 135 175 Z M 278 170 C 300 195 305 250 290 285 C 282 300 258 295 252 270 C 248 240 258 195 265 175 Z",
        defaultColor: "#8D6E63"
      },
      {
        id: "skin",
        labelId: "Kulit",
        labelEn: "Skin",
        path: "M 278 192 C 278 236 243 272 200 272 C 157 272 122 236 122 192 C 122 148 157 114 200 114 C 243 114 278 148 278 192 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "arms",
        labelId: "Lengan",
        labelEn: "Arms",
        path: "M 145 285 C 105 295 85 340 90 385 C 92 405 120 412 140 388 C 150 365 155 325 162 295 Z M 255 285 C 295 295 315 340 310 385 C 308 405 280 412 260 388 C 250 365 245 325 238 295 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "legs",
        labelId: "Kaki",
        labelEn: "Legs",
        path: "M 148 368 L 148 442 L 198 442 L 198 368 Z M 202 368 L 202 442 L 252 442 L 252 368 Z",
        defaultColor: "#F5C9A8"
      },
      {
        id: "eyes",
        labelId: "Mata",
        labelEn: "Eyes",
        path: "M 184 198 C 184 206 178 212 170 212 C 162 212 156 206 156 198 C 156 190 162 184 170 184 C 178 184 184 190 184 198 Z M 244 198 C 244 206 238 212 230 212 C 222 212 216 206 216 198 C 216 190 222 184 230 184 C 238 184 244 190 244 198 Z",
        defaultColor: "#212121"
      },
      {
        id: "tank",
        labelId: "Baju",
        labelEn: "Tank",
        path: "M 152 272 C 140 295 138 310 138 328 L 262 328 C 262 310 260 295 248 272 Q 200 290 152 272 Z",
        defaultColor: "#FFEB3B"
      },
      {
        id: "heart",
        labelId: "Hati",
        labelEn: "Heart",
        path: "M 200 305 C 188 292 170 296 170 312 C 170 324 200 342 200 342 C 200 342 230 324 230 312 C 230 296 212 292 200 305 Z",
        defaultColor: "#EC407A"
      },
      {
        id: "shorts",
        labelId: "Celana",
        labelEn: "Shorts",
        path: "M 138 328 L 138 368 L 262 368 L 262 328 Z",
        defaultColor: "#F48FB1"
      },
      {
        id: "shoes",
        labelId: "Sepatu",
        labelEn: "Shoes",
        path: "M 198 450 C 198 462 178 470 168 470 C 158 470 140 462 140 450 C 140 438 158 432 168 432 C 178 432 198 438 198 450 Z M 260 450 C 260 462 240 470 230 470 C 220 470 202 462 202 450 C 202 438 220 432 230 432 C 240 432 260 438 260 450 Z",
        defaultColor: "#EC407A"
      }
    ],
    palette: ["#F5C9A8", "#8D6E63", "#EC407A", "#FFEB3B", "#F48FB1", "#42A5F5", "#FFFFFF", "#212121"]
  }
];
