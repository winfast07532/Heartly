/* EDIT PRICES AND REWARDS HERE. Increment version and deploy the pet function + site together.
   Prices/rewards: whole points, 0–1000000. Names are labels for finding items. */
(function(root){
  const config = {
  "version": 1,
  "dailyReward": 50,
  "xpPerCare": 5,
  "xpDailyCap": 20,
  "care": {
    "feed": {
      "cooldownHours": 4,
      "gain": 30
    },
    "play": {
      "cooldownHours": 1,
      "gain": 20,
      "energy": 10
    },
    "clean": {
      "cooldownHours": 2,
      "gain": 40
    }
  },
  "items": {
    "snack": {
      "name": "Little crunchies",
      "price": 25
    },
    "treat": {
      "name": "Something special",
      "price": 100
    },
    "yarn": {
      "name": "A ball of yarn",
      "price": 150
    },
    "mouse": {
      "name": "Pocket mouse",
      "price": 150
    },
    "bed": {
      "name": "Cloud bed",
      "price": 300
    },
    "plant": {
      "name": "A little green",
      "price": 200
    },
    "rose": {
      "name": "Peach afternoon",
      "price": 500
    },
    "sand": {
      "name": "Sunday linen",
      "price": 500
    },
    "pack_976b43105d6b4d3e": {
      "name": "Honey climbing tower",
      "price": 300
    },
    "pack_58d9bbe49f2c5aff": {
      "name": "Climbing tower 10",
      "price": 300
    },
    "pack_31fb3da8f8e91d96": {
      "name": "Ivory climbing tower",
      "price": 300
    },
    "pack_6f77d3b42fd28ee6": {
      "name": "Climbing tower 37",
      "price": 300
    },
    "pack_0bcad951d995c5de": {
      "name": "Climbing tower 74",
      "price": 300
    },
    "pack_d0ffe4459db22bee": {
      "name": "Climbing tower 75",
      "price": 300
    },
    "pack_fff8d8925be6dd8c": {
      "name": "Blue cloud nest",
      "price": 300
    },
    "pack_a794edbc75410162": {
      "name": "Stone cloud nest",
      "price": 300
    },
    "pack_66f09ee7fc84014c": {
      "name": "Cozy pet bed 251",
      "price": 300
    },
    "pack_74f8a5b95df3ba57": {
      "name": "Cozy pet bed 252",
      "price": 300
    },
    "pack_848c13ab9f7b3607": {
      "name": "Cozy pet bed 320",
      "price": 300
    },
    "pack_5b540716a008120f": {
      "name": "Cozy pet bed 321",
      "price": 300
    },
    "pack_b5c53923aedcf1a9": {
      "name": "Blue curtain window",
      "price": 100
    },
    "pack_1c0f0ed894066c62": {
      "name": "Curtained window 12",
      "price": 100
    },
    "pack_34e8d3ca9f531ab2": {
      "name": "Curtained window 13",
      "price": 100
    },
    "pack_7e0301aa0c3277a3": {
      "name": "Teal curtain window",
      "price": 100
    },
    "pack_05fae8434ff111a5": {
      "name": "Curtained window 30",
      "price": 100
    },
    "pack_b02d5e2aa4078066": {
      "name": "Curtained window 31",
      "price": 100
    },
    "pack_6c93d3c5a18876fc": {
      "name": "Curtained window 32",
      "price": 100
    },
    "pack_ebe376518a892882": {
      "name": "Curtained window 33",
      "price": 100
    },
    "pack_f471d30d3cd1958a": {
      "name": "Pet portrait 419",
      "price": 100
    },
    "pack_25ce6c46731be11d": {
      "name": "Pet portrait 420",
      "price": 100
    },
    "pack_430b4d67e287bf09": {
      "name": "Pet portrait 421",
      "price": 100
    },
    "pack_22d79e035341954b": {
      "name": "Pet portrait 426",
      "price": 100
    },
    "pack_f54066505aa0d514": {
      "name": "Pet portrait 427",
      "price": 100
    },
    "pack_d2732a9a437f2672": {
      "name": "Pet portrait 428",
      "price": 100
    },
    "pack_3fe609d62587f931": {
      "name": "Pet portrait 429",
      "price": 100
    },
    "pack_678563032ab83e11": {
      "name": "Pet portrait 430",
      "price": 100
    },
    "pack_8ea1bbb3bfea9e39": {
      "name": "Pet portrait 431",
      "price": 100
    },
    "pack_715e0bc24c865c19": {
      "name": "Pet portrait 434",
      "price": 100
    },
    "pack_946856a7f61df6b7": {
      "name": "Pet portrait 435",
      "price": 100
    },
    "pack_af058e323658c2b6": {
      "name": "Pet portrait 436",
      "price": 100
    },
    "pack_3df5f93e98cd76d6": {
      "name": "Playroom furniture 101",
      "price": 300
    },
    "pack_fbe48571077fdec1": {
      "name": "Playroom furniture 102",
      "price": 300
    },
    "pack_438e6b09d63146c2": {
      "name": "Playroom furniture 204",
      "price": 300
    },
    "pack_c5718f10ad4b85f3": {
      "name": "Playroom furniture 236",
      "price": 300
    },
    "pack_c5eff57393a5da0f": {
      "name": "Playroom furniture 276",
      "price": 300
    },
    "pack_3f32f73e8188ff9a": {
      "name": "Playroom furniture 327",
      "price": 300
    },
    "pack_d10894f7558f000e": {
      "name": "Playroom furniture 328",
      "price": 300
    },
    "pack_1307351eeb375564": {
      "name": "Playroom furniture 329",
      "price": 300
    },
    "pack_1a373d544f7bfa5a": {
      "name": "Playroom furniture 347",
      "price": 300
    },
    "pack_932838a4c4f81105": {
      "name": "Playroom furniture 373",
      "price": 300
    },
    "pack_4807f805ce92631f": {
      "name": "Playroom furniture 374",
      "price": 300
    },
    "pack_81eb2d32b27adbbf": {
      "name": "Playroom furniture 60",
      "price": 300
    },
    "pack_765e27b05bc700e5": {
      "name": "Playroom furniture 61",
      "price": 300
    },
    "pack_18a004c97cbdb0ac": {
      "name": "Playroom furniture 62",
      "price": 300
    },
    "pack_59e7cf0ec579e943": {
      "name": "Playroom furniture 63",
      "price": 300
    },
    "pack_70b6440dfe291263": {
      "name": "Playroom furniture 64",
      "price": 300
    },
    "pack_f4809b26d6bd75d7": {
      "name": "Playroom furniture 92",
      "price": 300
    },
    "pack_e1784b4a1a962ad7": {
      "name": "Playroom furniture 93",
      "price": 300
    },
    "pack_02d0088e1470b894": {
      "name": "Playroom furniture 94",
      "price": 300
    },
    "pack_0e30925f7e7e3de4": {
      "name": "Little olive tree",
      "price": 200
    },
    "pack_4cfff3e068d23b6d": {
      "name": "Potted plant 104",
      "price": 200
    },
    "pack_004094477b8dbb5b": {
      "name": "Potted plant 105",
      "price": 200
    },
    "pack_ed66a6c6b4605e9a": {
      "name": "Lilac potted plant",
      "price": 200
    },
    "pack_8d9b68e4eeebdaf0": {
      "name": "Potted plant 107",
      "price": 200
    },
    "pack_2dc21592720838d6": {
      "name": "Potted plant 108",
      "price": 200
    },
    "pack_5462b55e1916bd4b": {
      "name": "Potted plant 115",
      "price": 200
    },
    "pack_fbc20532e177abd1": {
      "name": "Potted plant 116",
      "price": 200
    },
    "pack_a08430291f95f520": {
      "name": "Potted plant 117",
      "price": 200
    },
    "pack_f3b0f6381d37956a": {
      "name": "Potted plant 118",
      "price": 200
    },
    "pack_eb64723b4d448f29": {
      "name": "Potted plant 119",
      "price": 200
    },
    "pack_58ee1686ed5d19e1": {
      "name": "Potted plant 120",
      "price": 200
    },
    "pack_b2f8c13b6fb04534": {
      "name": "Potted plant 121",
      "price": 200
    },
    "pack_390192c9e7890ebe": {
      "name": "Potted plant 122",
      "price": 200
    },
    "pack_8e45ed0332120d1b": {
      "name": "Potted plant 136",
      "price": 200
    },
    "pack_7e8a01bcc60dfb67": {
      "name": "Potted plant 159",
      "price": 200
    },
    "pack_13c7409fb78edd00": {
      "name": "Potted plant 160",
      "price": 200
    },
    "pack_ada03b0ce6f3ca56": {
      "name": "Potted plant 161",
      "price": 200
    },
    "pack_8d540395be881923": {
      "name": "Potted plant 162",
      "price": 200
    },
    "pack_aa858336b6565ff7": {
      "name": "Potted plant 184",
      "price": 200
    },
    "pack_86f217b618bbd9ad": {
      "name": "Potted plant 185",
      "price": 200
    },
    "pack_9314cdf3cd6ade11": {
      "name": "Potted plant 186",
      "price": 200
    },
    "pack_c512f25ab62b880a": {
      "name": "Potted plant 187",
      "price": 200
    },
    "pack_009bec1bd9636ef9": {
      "name": "Potted plant 205",
      "price": 200
    },
    "pack_045fe9a795c571d8": {
      "name": "Potted plant 206",
      "price": 200
    },
    "pack_584d07a5fea02749": {
      "name": "Potted plant 207",
      "price": 200
    },
    "pack_68b0b876c5b3cacc": {
      "name": "Blue cloud rug",
      "price": 100
    },
    "pack_b60c26d725828e2e": {
      "name": "Blush cloud rug",
      "price": 100
    },
    "pack_444e85de88fabaf2": {
      "name": "Soft room rug 432",
      "price": 100
    },
    "pack_df6f895e30352f53": {
      "name": "Soft room rug 433",
      "price": 100
    },
    "pack_ddd5cfc8bd90a57a": {
      "name": "Wall picture 41",
      "price": 100
    },
    "pack_b3c12d8b69d31026": {
      "name": "Wall picture 49",
      "price": 100
    },
    "pack_0a1d2dd040ea609f": {
      "name": "Wall shelf 02",
      "price": 100
    },
    "pack_8ae4532401004218": {
      "name": "Wall shelf 03",
      "price": 100
    },
    "pack_9bd6444016330380": {
      "name": "Wall shelf 04",
      "price": 100
    },
    "pack_5f9adf2e09dec1f0": {
      "name": "Wall shelf 05",
      "price": 100
    },
    "pack_a2afdbe203212b8e": {
      "name": "Wall shelf 06",
      "price": 100
    },
    "pack_be32c6604d9c71dd": {
      "name": "Wall shelf 18",
      "price": 100
    },
    "pack_22db72629a31e8fe": {
      "name": "Wall shelf 19",
      "price": 100
    },
    "pack_57f548e45b3b357b": {
      "name": "Wall shelf 38",
      "price": 100
    },
    "pack_cc848045b72d7fe7": {
      "name": "Wall shelf 39",
      "price": 100
    },
    "pack_ebacc40d868b4d6f": {
      "name": "Wall shelf 40",
      "price": 100
    },
    "pack_f60223d33b2d2ee2": {
      "name": "Wall shelf 45",
      "price": 100
    },
    "pack_a0d9d41036ca4b71": {
      "name": "Wall shelf 46",
      "price": 100
    },
    "pack_e9cb805d967cfbc9": {
      "name": "Wall shelf 55",
      "price": 100
    },
    "pack_c8c860bbb5646597": {
      "name": "Wall shelf 56",
      "price": 100
    },
    "pack_1adecbae5fdac916": {
      "name": "Wall shelf 57",
      "price": 100
    },
    "pack_b093d7471504be86": {
      "name": "Wall shelf 58",
      "price": 100
    },
    "pack_2ee4153a7b5d4d4a": {
      "name": "Wall shelf 59",
      "price": 100
    },
    "pack_a0c7e8d09006f0e2": {
      "name": "Wall shelf 69",
      "price": 100
    },
    "pack_8e1c66ad1dbc96c1": {
      "name": "Wall shelf 70",
      "price": 100
    },
    "pack_770e74d78bd9d461": {
      "name": "Wall shelf 76",
      "price": 100
    },
    "pack_e5660fe713c35c67": {
      "name": "Wall shelf 77",
      "price": 100
    },
    "pack_65ed7791ae663fb3": {
      "name": "Wall shelf 78",
      "price": 100
    },
    "pack_992a8b628db45916": {
      "name": "Wall shelf 79",
      "price": 100
    },
    "pack_f090b70a711c32e8": {
      "name": "Wall shelf 80",
      "price": 100
    },
    "pack_ba8e18ee33c08fba": {
      "name": "Wall shelf 85",
      "price": 100
    },
    "pack_bb8b4d21eb4a97c3": {
      "name": "Wall shelf 86",
      "price": 100
    },
    "pack_room_dcd62e797a19": {
      "name": "Classic room",
      "price": 500
    },
    "pack_room_67613e08fa56": {
      "name": "Classic room 10",
      "price": 500
    },
    "pack_room_47cb28e70552": {
      "name": "Classic room 11",
      "price": 500
    },
    "pack_room_63c73835392c": {
      "name": "Classic room 12",
      "price": 500
    },
    "pack_room_cf05e65d57eb": {
      "name": "Linen room",
      "price": 500
    },
    "pack_room_b61d55d518e1": {
      "name": "Classic room 14",
      "price": 500
    },
    "pack_room_f02f39a5d8e3": {
      "name": "Classic room 15",
      "price": 500
    },
    "pack_room_e3bfacaddad8": {
      "name": "Classic room 16",
      "price": 500
    },
    "pack_room_b51b38e3d4e7": {
      "name": "Classic room 17",
      "price": 500
    },
    "pack_room_c2370078a0cb": {
      "name": "Classic room 18",
      "price": 500
    },
    "pack_room_146f96ab17be": {
      "name": "Classic room 19",
      "price": 500
    },
    "pack_room_5fd3b7488ca1": {
      "name": "Classic room 2",
      "price": 500
    },
    "pack_room_0e7f1809c0cd": {
      "name": "Classic room 20",
      "price": 500
    },
    "pack_room_fc3795532c2e": {
      "name": "Classic room 3",
      "price": 500
    },
    "pack_room_74767b647780": {
      "name": "Classic room 4",
      "price": 500
    },
    "pack_room_777c7025d595": {
      "name": "Classic room 5",
      "price": 500
    },
    "pack_room_34fa1f98314e": {
      "name": "Classic room 6",
      "price": 500
    },
    "pack_room_976f2ca7cd69": {
      "name": "Classic room 7",
      "price": 500
    },
    "pack_room_45c8893b7161": {
      "name": "Classic room 8",
      "price": 500
    },
    "pack_room_9f1e6ba949dc": {
      "name": "Classic room 9",
      "price": 500
    },
    "pack_room_ef3d7e1d60e8": {
      "name": "Winter room 1",
      "price": 500
    },
    "pack_room_5db51f00efb7": {
      "name": "Winter room 2",
      "price": 500
    },
    "pack_room_c53930dad9e7": {
      "name": "Winter room 3",
      "price": 500
    },
    "pack_room_6b2f228d4616": {
      "name": "Winter room 4",
      "price": 500
    },
    "pack_room_6b0546a83ce8": {
      "name": "Winter room 5",
      "price": 500
    },
    "pack_0e48963d0147649b": {
      "name": "Beds 01",
      "price": 50
    },
    "pack_7deed6c554b02acb": {
      "name": "Beds 02",
      "price": 50
    },
    "pack_2477f4c323f86e8c": {
      "name": "Beds 03",
      "price": 50
    },
    "pack_3d2fedc2e548863e": {
      "name": "Beds 04",
      "price": 50
    },
    "pack_ac09c8537ae2f328": {
      "name": "Beds 05",
      "price": 50
    },
    "pack_2c8763105315dd57": {
      "name": "Beds 06",
      "price": 50
    },
    "pack_56b64c75b74db57e": {
      "name": "Beds 07",
      "price": 50
    },
    "pack_37a8838771577116": {
      "name": "Beds 08",
      "price": 50
    },
    "pack_02f011144e88e0e0": {
      "name": "Bird room accessory 01",
      "price": 50
    },
    "pack_35d2f7486229b43c": {
      "name": "Bird room accessory 02",
      "price": 50
    },
    "pack_0958868dce753fa0": {
      "name": "Bird room accessory 03",
      "price": 50
    },
    "pack_929732a01a034428": {
      "name": "Bird room accessory 04",
      "price": 50
    },
    "pack_33cbd895206fb09d": {
      "name": "Bird room accessory 05",
      "price": 50
    },
    "pack_38260b2ab702d1ca": {
      "name": "Bird room accessory 06",
      "price": 50
    },
    "pack_c673fa89cc0fb450": {
      "name": "Bird room accessory 07",
      "price": 50
    },
    "pack_1bf403ed0be312ee": {
      "name": "Bird room accessory 08",
      "price": 50
    },
    "pack_a36e08ae4c2c9c14": {
      "name": "Bird room accessory 09",
      "price": 50
    },
    "pack_85587621b23fe7c2": {
      "name": "Bird room accessory 10",
      "price": 50
    },
    "pack_cbd274745ec621da": {
      "name": "Bird room accessory 11",
      "price": 50
    },
    "pack_b534de4b58dbf543": {
      "name": "Bird room accessory 12",
      "price": 50
    },
    "pack_1e863e180c18ae8e": {
      "name": "Bird room accessory 13",
      "price": 50
    },
    "pack_605a81a5788c36a8": {
      "name": "Bird room accessory 14",
      "price": 50
    },
    "pack_8e2cbf2ebac7f291": {
      "name": "Bird room accessory 15",
      "price": 50
    },
    "pack_02bcf9f889870a17": {
      "name": "Bird room accessory 16",
      "price": 50
    },
    "pack_a847f34ae37078ed": {
      "name": "Bird room accessory 17",
      "price": 50
    },
    "pack_ae8524ec3c4c2841": {
      "name": "Bird room accessory 18",
      "price": 50
    },
    "pack_22f8ca9030cce271": {
      "name": "Bird room accessory 19",
      "price": 50
    },
    "pack_c730be76e69d1379": {
      "name": "Bird room accessory 20",
      "price": 50
    },
    "pack_1cbd723e299779a1": {
      "name": "Bird room accessory 21",
      "price": 50
    },
    "pack_72dee3bc1573f964": {
      "name": "Bird room accessory 22",
      "price": 50
    },
    "pack_f715d7774ac9bb13": {
      "name": "Bird room accessory 23",
      "price": 50
    },
    "pack_5aadc3a0b8f4e086": {
      "name": "Bird room accessory 24",
      "price": 50
    },
    "pack_7e70503c0ba86371": {
      "name": "Bird room accessory 25",
      "price": 50
    },
    "pack_a827dfa3c5b50e1b": {
      "name": "Bird room accessory 26",
      "price": 50
    },
    "pack_e7d4cdd966f9eb5d": {
      "name": "Bird room accessory 27",
      "price": 50
    },
    "pack_e1c06b83bdfc5ad4": {
      "name": "Bird room accessory 28",
      "price": 50
    },
    "pack_e259099f32bdb666": {
      "name": "Bird room accessory 29",
      "price": 50
    },
    "pack_bbe0d85f3c52a9af": {
      "name": "Bird room accessory 30",
      "price": 50
    },
    "pack_d1b2dc2eadc15cea": {
      "name": "Food Bowl 01",
      "price": 50
    },
    "pack_004cb6b26ebed5d8": {
      "name": "Food Bowl 02",
      "price": 50
    },
    "pack_f29de7da572ed1ba": {
      "name": "Food Bowl Empty 01",
      "price": 50
    },
    "pack_fa147f0da1fd5ebb": {
      "name": "Food Bowl Empty 02",
      "price": 50
    },
    "pack_0f2698943d686d7a": {
      "name": "Ceramic food bowl",
      "price": 50
    },
    "pack_5622e89e7fea7c22": {
      "name": "Food and water bowl 02",
      "price": 50
    },
    "pack_c7b73dc68dbb2c99": {
      "name": "Blue food bowl",
      "price": 50
    },
    "pack_97472de3f9dfcb69": {
      "name": "Food and water bowl 04",
      "price": 50
    },
    "pack_d4bb62a7c9a59ca9": {
      "name": "Food and water bowl 05",
      "price": 50
    },
    "pack_6d2982ab9c7f3a75": {
      "name": "Food and water bowl 06",
      "price": 50
    },
    "pack_f82c5a044e19410c": {
      "name": "Food and water bowl 07",
      "price": 50
    },
    "pack_f77fdb169d3825a8": {
      "name": "Food and water bowl 08",
      "price": 50
    },
    "pack_6f078557f5f3be5d": {
      "name": "Food and water bowl 09",
      "price": 50
    },
    "pack_84a9d9a4ca629704": {
      "name": "Food and water bowl 10",
      "price": 50
    },
    "pack_ea03026c50743672": {
      "name": "Food and water bowl 11",
      "price": 50
    },
    "pack_0d8c5d6893c34da9": {
      "name": "Food and water bowl 12",
      "price": 50
    },
    "pack_fa58d24cb406fa13": {
      "name": "Food and water bowl 13",
      "price": 50
    },
    "pack_20d36cb4e998c014": {
      "name": "Food and water bowl 14",
      "price": 50
    },
    "pack_e32dc27fe147b824": {
      "name": "Food bowl 109",
      "price": 50
    },
    "pack_aabd7b091fa8d3f1": {
      "name": "Food bowl 110",
      "price": 50
    },
    "pack_6b85fa670a3d582f": {
      "name": "Food bowl 111",
      "price": 50
    },
    "pack_5eb5c50a1e03486a": {
      "name": "Food bowl 112",
      "price": 50
    },
    "pack_362ac20f51241406": {
      "name": "Food bowl 113",
      "price": 50
    },
    "pack_fab2a7f58a03741b": {
      "name": "Food bowl 114",
      "price": 50
    },
    "pack_87d0bb0cd85aa1a3": {
      "name": "Food bowl 137",
      "price": 50
    },
    "pack_e885c8e39befa1ed": {
      "name": "Food bowl 138",
      "price": 50
    },
    "pack_2c033aa7f0918f50": {
      "name": "Food bowl 139",
      "price": 50
    },
    "pack_28fdcd91d7448dc4": {
      "name": "Food bowl 140",
      "price": 50
    },
    "pack_95776e11d381ea8a": {
      "name": "Food bowl 141",
      "price": 50
    },
    "pack_755ba754a28043c1": {
      "name": "Food bowl 142",
      "price": 50
    },
    "pack_f18e80d2e7928a5f": {
      "name": "Food bowl 166",
      "price": 50
    },
    "pack_ab585c8b816b16fe": {
      "name": "Food bowl 167",
      "price": 50
    },
    "pack_40f4ff30f0c9db77": {
      "name": "Food bowl 168",
      "price": 50
    },
    "pack_5c3e36652dc5210c": {
      "name": "Food bowl 169",
      "price": 50
    },
    "pack_5658c1486d9c16ea": {
      "name": "Food bowl 170",
      "price": 50
    },
    "pack_eac79244c8f14530": {
      "name": "Food bowl 171",
      "price": 50
    },
    "pack_4852cc468d14e3f9": {
      "name": "Foods 07",
      "price": 50
    },
    "pack_d30f67cf955299a6": {
      "name": "Foods 10",
      "price": 50
    },
    "pack_438cee61575e0d27": {
      "name": "Hair Brush 01",
      "price": 50
    },
    "pack_3e88879752de9de2": {
      "name": "Hair Brush 02",
      "price": 50
    },
    "pack_7c72a0fd845b7025": {
      "name": "Hair Brush 03",
      "price": 50
    },
    "pack_646480aa946a84e2": {
      "name": "Hair Brush 04",
      "price": 50
    },
    "pack_9951813d7a3e2a8f": {
      "name": "Home Cages 01",
      "price": 50
    },
    "pack_920f4f42284377bf": {
      "name": "Home Cages 02",
      "price": 50
    },
    "pack_b06fb527bfa971c8": {
      "name": "Home Cages 03",
      "price": 50
    },
    "pack_3e5cd0e66f886220": {
      "name": "Home Cages 04",
      "price": 50
    },
    "pack_07dade69e191c8ab": {
      "name": "Home Cages 05",
      "price": 50
    },
    "pack_84d49d58eeff6a06": {
      "name": "Home Cages 06",
      "price": 50
    },
    "pack_6503778af171bff5": {
      "name": "Home Cages 07",
      "price": 50
    },
    "pack_231cb088aee6ab52": {
      "name": "Home Cages 08",
      "price": 50
    },
    "pack_f2e25e08c3ba4b13": {
      "name": "Pet Carry Box 01",
      "price": 50
    },
    "pack_9d7ab6427d51607d": {
      "name": "Pet Carry Box 02",
      "price": 50
    },
    "pack_7411d4c31aa2885f": {
      "name": "Pet Carry Box 03",
      "price": 50
    },
    "pack_764fc7936730f68d": {
      "name": "Pet Carry Box 04",
      "price": 50
    },
    "pack_90432a7e1b82ea84": {
      "name": "Pet Carry Box 05",
      "price": 50
    },
    "pack_3d856298c097ed21": {
      "name": "Pet Carry Box 06",
      "price": 50
    },
    "pack_820eedebc9d491d9": {
      "name": "Pet Carry Box 07",
      "price": 50
    },
    "pack_9c5d28d7364d0cc6": {
      "name": "Pet Carry Box 08",
      "price": 50
    },
    "pack_eb0545c84265bd4d": {
      "name": "Pet room accessory 331",
      "price": 50
    },
    "pack_360a4396935aa3c1": {
      "name": "Pet room accessory 332",
      "price": 50
    },
    "pack_fd027ddfe930c634": {
      "name": "Pet room accessory 333",
      "price": 50
    },
    "pack_9dc37ee8ad2e0009": {
      "name": "Pet room accessory 334",
      "price": 50
    },
    "pack_a94f058a52df616a": {
      "name": "Pet room accessory 335",
      "price": 50
    },
    "pack_76a5262e46ea799b": {
      "name": "Pet room accessory 336",
      "price": 50
    },
    "pack_a74b9f153c363818": {
      "name": "Pet room accessory 361",
      "price": 50
    },
    "pack_c23c4e86b709f811": {
      "name": "Pet room accessory 362",
      "price": 50
    },
    "pack_31db038afca483ee": {
      "name": "Pet room accessory 363",
      "price": 50
    },
    "pack_7d22181e5870f7ac": {
      "name": "Pet room accessory 364",
      "price": 50
    },
    "pack_d909c2cccfcb8b7a": {
      "name": "Pet room accessory 365",
      "price": 50
    },
    "pack_4396cea927769b45": {
      "name": "Pet room accessory 366",
      "price": 50
    },
    "pack_939b70570cd99bf8": {
      "name": "Pet room accessory 382",
      "price": 50
    },
    "pack_5b1a65b8fbcc7193": {
      "name": "Pet room accessory 383",
      "price": 50
    },
    "pack_a0f756479a2cbdce": {
      "name": "Pet room accessory 384",
      "price": 50
    },
    "pack_3d1faa245ef2e331": {
      "name": "Pet room accessory 385",
      "price": 50
    },
    "pack_3f18bd4637b523b4": {
      "name": "Pet room accessory 386",
      "price": 50
    },
    "pack_a481f726813745f5": {
      "name": "Pet room accessory 387",
      "price": 50
    },
    "pack_d995746517219233": {
      "name": "Pet room accessory 388",
      "price": 50
    },
    "pack_433e7f875fafb238": {
      "name": "Pet room accessory 393",
      "price": 50
    },
    "pack_b790a1c2b583f55d": {
      "name": "Pet room accessory 394",
      "price": 50
    },
    "pack_bb3e325f6732fa29": {
      "name": "Pet room accessory 395",
      "price": 50
    },
    "pack_871fda27f94b807d": {
      "name": "Pet room accessory 396",
      "price": 50
    },
    "pack_0e7e87c415faf3a0": {
      "name": "Pet room accessory 397",
      "price": 50
    },
    "pack_c200d99738c36b75": {
      "name": "Pet room accessory 400",
      "price": 50
    },
    "pack_74435aa63046e0ed": {
      "name": "Pet room accessory 401",
      "price": 50
    },
    "pack_0f62a896fe0eb217": {
      "name": "Pet room accessory 402",
      "price": 50
    },
    "pack_b5041dd8ca0949d1": {
      "name": "Pet room accessory 412",
      "price": 50
    },
    "pack_d56c96afd68dc612": {
      "name": "Pet toy and accessory 123",
      "price": 50
    },
    "pack_c470fdd5ec0ad8d8": {
      "name": "Pet toy and accessory 124",
      "price": 50
    },
    "pack_c26ce2e07f622659": {
      "name": "Pet toy and accessory 125",
      "price": 50
    },
    "pack_27c58200926f0b07": {
      "name": "Pet toy and accessory 126",
      "price": 50
    },
    "pack_856a58b4d2c9c4d3": {
      "name": "Pet toy and accessory 127",
      "price": 50
    },
    "pack_bc49e7e12f19abb7": {
      "name": "Pet toy and accessory 143",
      "price": 50
    },
    "pack_15ae07794a0f91d3": {
      "name": "Pet toy and accessory 146",
      "price": 50
    },
    "pack_d713ec82ed4d9020": {
      "name": "Pet toy and accessory 147",
      "price": 50
    },
    "pack_691f07be0dcfd130": {
      "name": "Pet toy and accessory 148",
      "price": 50
    },
    "pack_0a125abc93d6bf40": {
      "name": "Pet toy and accessory 149",
      "price": 50
    },
    "pack_4c463b6cae6ab330": {
      "name": "Pet toy and accessory 150",
      "price": 50
    },
    "pack_6405b403b7de4d5d": {
      "name": "Pet toy and accessory 163",
      "price": 50
    },
    "pack_38aab951affda607": {
      "name": "Pet toy and accessory 172",
      "price": 50
    },
    "pack_9e6cfea84bae9b8c": {
      "name": "Pet toy and accessory 173",
      "price": 50
    },
    "pack_0d4c3b4003ffa6d4": {
      "name": "Pet toy and accessory 174",
      "price": 50
    },
    "pack_855df3293bc355c6": {
      "name": "Pet toy and accessory 177",
      "price": 50
    },
    "pack_6a0dd166b5661f5f": {
      "name": "Pet toy and accessory 188",
      "price": 50
    },
    "pack_ce68b026c5b80312": {
      "name": "Pet toy and accessory 191",
      "price": 50
    },
    "pack_8fbb0d55e29b8e3d": {
      "name": "Pet toy and accessory 192",
      "price": 50
    },
    "pack_3c774d1f0ac0e870": {
      "name": "Pet toy and accessory 193",
      "price": 50
    },
    "pack_ae42b8d06df16976": {
      "name": "Pet toy and accessory 194",
      "price": 50
    },
    "pack_1e189ab7b974a4db": {
      "name": "Pet toy and accessory 197",
      "price": 50
    },
    "pack_40b5b7852f490217": {
      "name": "Pet toy and accessory 208",
      "price": 50
    },
    "pack_c905d06580a9af5d": {
      "name": "Pet toy and accessory 211",
      "price": 50
    },
    "pack_e0de1ef62c05086a": {
      "name": "Pet toy and accessory 212",
      "price": 50
    },
    "pack_08d42a5b0286a7df": {
      "name": "Pet toy and accessory 215",
      "price": 50
    },
    "pack_b963adcd5a065bce": {
      "name": "Pet toy and accessory 216",
      "price": 50
    },
    "pack_5a81a7a7cd2944c4": {
      "name": "Pet toy and accessory 225",
      "price": 50
    },
    "pack_749a72ffe3c0b020": {
      "name": "Pet toy and accessory 230",
      "price": 50
    },
    "pack_63f6457a4995ece3": {
      "name": "Pet toy and accessory 235",
      "price": 50
    },
    "pack_859c4f2569aeb5bd": {
      "name": "Pet toy and accessory 237",
      "price": 50
    },
    "pack_a3fca950a0e23297": {
      "name": "Pet toy and accessory 243",
      "price": 50
    },
    "pack_8b3150717d7d10c6": {
      "name": "Pet toy and accessory 244",
      "price": 50
    },
    "pack_c5e79ef550f9c13b": {
      "name": "Pet toy and accessory 245",
      "price": 50
    },
    "pack_dc68741d26462d8b": {
      "name": "Pet toy and accessory 246",
      "price": 50
    },
    "pack_b9822d8f146ac4f9": {
      "name": "Pet toy and accessory 247",
      "price": 50
    },
    "pack_b9bc75ec5e63b29e": {
      "name": "Pet toy and accessory 248",
      "price": 50
    },
    "pack_b41b18c7f01afdee": {
      "name": "Pet toy and accessory 258",
      "price": 50
    },
    "pack_0cf1993c862b45b4": {
      "name": "Pet toy and accessory 259",
      "price": 50
    },
    "pack_2941ab830a0735e7": {
      "name": "Pet toy and accessory 260",
      "price": 50
    },
    "pack_30b71ecd1b38577e": {
      "name": "Pet toy and accessory 261",
      "price": 50
    },
    "pack_0f5be68b1fe44ce8": {
      "name": "Pet toy and accessory 262",
      "price": 50
    },
    "pack_b38bf1d87e28f93f": {
      "name": "Pet toy and accessory 263",
      "price": 50
    },
    "pack_14870ae3eecbf990": {
      "name": "Pet toy and accessory 275",
      "price": 50
    },
    "pack_a14c2f9bd20decf1": {
      "name": "Pet toy and accessory 281",
      "price": 50
    },
    "pack_e3f4fbc5d9f09388": {
      "name": "Pet toy and accessory 282",
      "price": 50
    },
    "pack_eec13534c4af1b2a": {
      "name": "Pet toy and accessory 283",
      "price": 50
    },
    "pack_b0dd5a2e8e7de12a": {
      "name": "Pet toy and accessory 284",
      "price": 50
    },
    "pack_7b04491d80a3122e": {
      "name": "Pet toy and accessory 285",
      "price": 50
    },
    "pack_90e79ecca2f6e58f": {
      "name": "Pet toy and accessory 288",
      "price": 50
    },
    "pack_df7df4d965e2b78b": {
      "name": "Pet toy and accessory 313",
      "price": 50
    },
    "pack_7b84dc04118d1743": {
      "name": "Pet toy and accessory 314",
      "price": 50
    },
    "pack_e520059d52500a55": {
      "name": "Pet toy and accessory 315",
      "price": 50
    },
    "pack_dd3d214d591e823a": {
      "name": "Pet toy and accessory 316",
      "price": 50
    },
    "pack_7bf9ab7043da404d": {
      "name": "Pet toy and accessory 317",
      "price": 50
    },
    "pack_519f24d598c3f0c7": {
      "name": "Pet toy and accessory 318",
      "price": 50
    },
    "pack_51d175464ca340fa": {
      "name": "Pet toy and accessory 319",
      "price": 50
    },
    "pack_7d25d901fc6b43b4": {
      "name": "Pet toy and accessory 330",
      "price": 50
    },
    "pack_8ad257afde755341": {
      "name": "Pet toy and accessory 353",
      "price": 50
    },
    "pack_5209b75c60c7188d": {
      "name": "Pet toy and accessory 360",
      "price": 50
    },
    "pack_ab0a9ba4f61e6914": {
      "name": "Pet toy and accessory 368",
      "price": 50
    },
    "pack_f0a648cf6d2f9482": {
      "name": "Pet toy and accessory 372",
      "price": 50
    },
    "pack_841588e3bfd4859d": {
      "name": "Pet toy and accessory 376",
      "price": 50
    },
    "pack_f0493a97dd2b9dff": {
      "name": "Pet toy and accessory 377",
      "price": 50
    },
    "pack_05a1c6f04c7637b4": {
      "name": "Pet toy and accessory 380",
      "price": 50
    },
    "pack_e79595f16ce305cd": {
      "name": "Pet toy and accessory 381",
      "price": 50
    },
    "pack_164a57fad4432fef": {
      "name": "Pet toy and accessory 389",
      "price": 50
    },
    "pack_296eeb3bf8a52dca": {
      "name": "Pet toy and accessory 390",
      "price": 50
    },
    "pack_30200a7f903f47f4": {
      "name": "Pet toy and accessory 391",
      "price": 50
    },
    "pack_1d2bd402327c89b7": {
      "name": "Pet toy and accessory 392",
      "price": 50
    },
    "pack_d934267d4428400f": {
      "name": "Pet toy and accessory 398",
      "price": 50
    },
    "pack_819e3a686db78fd6": {
      "name": "Pet toy and accessory 399",
      "price": 50
    },
    "pack_de07064d98736dd7": {
      "name": "Pet toy and accessory 415",
      "price": 50
    },
    "pack_be6534e86930dfca": {
      "name": "Pet toy and accessory 416",
      "price": 50
    },
    "pack_591b7a0bbd2a60c5": {
      "name": "Pet toy and accessory 417",
      "price": 50
    },
    "pack_bd0b96e10123338e": {
      "name": "Pet toy and accessory 418",
      "price": 50
    },
    "pack_5f630cdabd9fd98f": {
      "name": "Pet toy and accessory 42",
      "price": 50
    },
    "pack_5006cc611136c7ed": {
      "name": "Pet toy and accessory 422",
      "price": 50
    },
    "pack_8886f7f90c578a4e": {
      "name": "Pet toy and accessory 423",
      "price": 50
    },
    "pack_43eabba34ecd9f85": {
      "name": "Pet toy and accessory 424",
      "price": 50
    },
    "pack_382a4fdce4c818cf": {
      "name": "Pet toy and accessory 425",
      "price": 50
    },
    "pack_99f67ff22bc8590a": {
      "name": "Pet toy and accessory 50",
      "price": 50
    },
    "pack_21be29fc61a04c2e": {
      "name": "Pet toy and accessory 65",
      "price": 50
    },
    "pack_a6f6127b31fe1023": {
      "name": "Pet toy and accessory 66",
      "price": 50
    },
    "pack_cd9cf5442e2bf914": {
      "name": "Pet toy and accessory 67",
      "price": 50
    },
    "pack_20650748fc89af3d": {
      "name": "Pet toy and accessory 68",
      "price": 50
    },
    "pack_7aeae62f8acb079a": {
      "name": "Pet toy and accessory 71",
      "price": 50
    },
    "pack_fe9cfb30ed48bcb6": {
      "name": "Pet toy and accessory 72",
      "price": 50
    },
    "pack_6fc2feeb458a713c": {
      "name": "Pet toy and accessory 73",
      "price": 50
    },
    "pack_3fb38e914d2e07f5": {
      "name": "Pet toy and accessory 81",
      "price": 50
    },
    "pack_b72297622cf6a79d": {
      "name": "Pet toy and accessory 82",
      "price": 50
    },
    "pack_22f57d71f0b3d22c": {
      "name": "Pet toy and accessory 83",
      "price": 50
    },
    "pack_325430c20bd38c23": {
      "name": "Pet toy and accessory 84",
      "price": 50
    },
    "pack_5473c23df241bf60": {
      "name": "Pet toy and accessory 87",
      "price": 50
    },
    "pack_e2a03f67d026150f": {
      "name": "Pet toy and accessory 88",
      "price": 50
    },
    "pack_b1d582b12970ba4a": {
      "name": "Pet toy and accessory 89",
      "price": 50
    },
    "pack_6b9affdbd7c7933e": {
      "name": "Pet toy and accessory 90",
      "price": 50
    },
    "pack_202098ffb68557a5": {
      "name": "Pet toy and accessory 91",
      "price": 50
    },
    "pack_e9723b2ecc776d9a": {
      "name": "Tiny playroom accessory 07",
      "price": 50
    },
    "pack_eefcbe32167b0f4b": {
      "name": "Tiny playroom accessory 08",
      "price": 50
    },
    "pack_87ccb5f13a495899": {
      "name": "Tiny playroom accessory 09",
      "price": 50
    },
    "pack_be176c169b2756bc": {
      "name": "Tiny playroom accessory 100",
      "price": 50
    },
    "pack_2701307729c6f838": {
      "name": "Tiny playroom accessory 128",
      "price": 50
    },
    "pack_120892539179bc30": {
      "name": "Tiny playroom accessory 130",
      "price": 50
    },
    "pack_fba1d744bca25223": {
      "name": "Tiny playroom accessory 15",
      "price": 50
    },
    "pack_67620d4e8089ce36": {
      "name": "Tiny playroom accessory 151",
      "price": 50
    },
    "pack_65f00fd450ebac19": {
      "name": "Tiny playroom accessory 153",
      "price": 50
    },
    "pack_6a23483dab4c0211": {
      "name": "Tiny playroom accessory 16",
      "price": 50
    },
    "pack_ccca531698dd7548": {
      "name": "Tiny playroom accessory 17",
      "price": 50
    },
    "pack_a5a11243431834bb": {
      "name": "Tiny playroom accessory 178",
      "price": 50
    },
    "pack_a718902533c1606e": {
      "name": "Tiny playroom accessory 180",
      "price": 50
    },
    "pack_87513609a732f3fb": {
      "name": "Tiny playroom accessory 198",
      "price": 50
    },
    "pack_139a322c361b3b3d": {
      "name": "Tiny playroom accessory 20",
      "price": 50
    },
    "pack_9a48d14e5a53f7f3": {
      "name": "Tiny playroom accessory 200",
      "price": 50
    },
    "pack_be385b1049b2e235": {
      "name": "Tiny playroom accessory 21",
      "price": 50
    },
    "pack_43907bb68e94766c": {
      "name": "Tiny playroom accessory 217",
      "price": 50
    },
    "pack_c032e137a03b50a0": {
      "name": "Tiny playroom accessory 218",
      "price": 50
    },
    "pack_b110c8399dd3ae66": {
      "name": "Tiny playroom accessory 219",
      "price": 50
    },
    "pack_bcab16486f8414ba": {
      "name": "Tiny playroom accessory 221",
      "price": 50
    },
    "pack_8669eb52c4ba3d87": {
      "name": "Tiny playroom accessory 226",
      "price": 50
    },
    "pack_e7b494f1fee39b22": {
      "name": "Tiny playroom accessory 227",
      "price": 50
    },
    "pack_4871578904663326": {
      "name": "Tiny playroom accessory 228",
      "price": 50
    },
    "pack_a1f3f0b3f5480c43": {
      "name": "Tiny playroom accessory 229",
      "price": 50
    },
    "pack_f98160aff675f742": {
      "name": "Tiny playroom accessory 231",
      "price": 50
    },
    "pack_0afdaa81e2192fa6": {
      "name": "Tiny playroom accessory 233",
      "price": 50
    },
    "pack_acb0632980a45783": {
      "name": "Tiny playroom accessory 239",
      "price": 50
    },
    "pack_14e4cc4df83a587e": {
      "name": "Tiny playroom accessory 240",
      "price": 50
    },
    "pack_faa3164bc40f7573": {
      "name": "Tiny playroom accessory 254",
      "price": 50
    },
    "pack_02e673eccb00fac7": {
      "name": "Tiny playroom accessory 255",
      "price": 50
    },
    "pack_4e1a9ea2ab47c499": {
      "name": "Tiny playroom accessory 26",
      "price": 50
    },
    "pack_b2bd3799f5be75fb": {
      "name": "Tiny playroom accessory 27",
      "price": 50
    },
    "pack_af6f9ba9bb299b4b": {
      "name": "Tiny playroom accessory 279",
      "price": 50
    },
    "pack_b89b40bfb492780e": {
      "name": "Tiny playroom accessory 280",
      "price": 50
    },
    "pack_78bca186fda4cf39": {
      "name": "Tiny playroom accessory 297",
      "price": 50
    },
    "pack_71343fe8af0128cd": {
      "name": "Tiny playroom accessory 310",
      "price": 50
    },
    "pack_03f5794b8b1ecbc1": {
      "name": "Tiny playroom accessory 311",
      "price": 50
    },
    "pack_f74c7d896d45c0c0": {
      "name": "Tiny playroom accessory 312",
      "price": 50
    },
    "pack_bd925c4d4680f467": {
      "name": "Tiny playroom accessory 95",
      "price": 50
    },
    "pack_1f5fdb7b1a279b90": {
      "name": "Tiny playroom accessory 96",
      "price": 50
    },
    "pack_c1b83dde2e7bba84": {
      "name": "Tiny playroom accessory 97",
      "price": 50
    },
    "pack_e7367b854274ebee": {
      "name": "Tiny playroom accessory 98",
      "price": 50
    },
    "pack_181b812d40d574b0": {
      "name": "Tiny playroom accessory 99",
      "price": 50
    },
    "pack_8b128abfd32c9a48": {
      "name": "Vitamin Paste 01",
      "price": 50
    },
    "pack_b48e9da87aba2ba7": {
      "name": "Vitamin Paste 02",
      "price": 50
    },
    "pack_78910ef21563aa8e": {
      "name": "Vitamin Paste 03",
      "price": 50
    },
    "pack_9c38c7fee7700e5e": {
      "name": "Vitamin Paste 04",
      "price": 50
    },
    "pack_2d2bae93b43472ce": {
      "name": "Water Bowls 01",
      "price": 50
    },
    "pack_369e6dc04941d127": {
      "name": "Water Bowls 02",
      "price": 50
    },
    "pack_61e7225f8dcb8092": {
      "name": "Water Bowls Empty 01",
      "price": 50
    },
    "pack_4657b7f464273d30": {
      "name": "Water Bowls Empty 02",
      "price": 50
    },
    "pack_fee9a7de853d37be": {
      "name": "Flowerfood 01",
      "price": 50
    },
    "pack_6562fe98787724f2": {
      "name": "Flowerfood 02",
      "price": 50
    },
    "pack_f9b2bdd656b3741a": {
      "name": "Flowerfood 03",
      "price": 50
    },
    "pack_dff67fab5f948e18": {
      "name": "Flowerfood 04",
      "price": 50
    },
    "pack_690315b03abbdf79": {
      "name": "Flowerfood 05",
      "price": 50
    },
    "pack_f04d119f85820055": {
      "name": "Flowerfood 06",
      "price": 50
    },
    "pack_4eb09e21e63dd42b": {
      "name": "Flowerfood 07",
      "price": 50
    },
    "pack_04351360d73450e8": {
      "name": "Flowerfood 08",
      "price": 50
    },
    "pack_e100b587aff6ad51": {
      "name": "Flowerfood 09",
      "price": 50
    },
    "pack_4884e1566dbcffa8": {
      "name": "Flowerfood 10",
      "price": 50
    },
    "pack_12c14777e069c25b": {
      "name": "Flowerfood 11",
      "price": 50
    },
    "pack_7ad84e1d776118a6": {
      "name": "Flowerfood 12",
      "price": 50
    },
    "pack_a83cf59fb3e1f513": {
      "name": "Flowerfood 13",
      "price": 50
    },
    "pack_c01c213187a84bc1": {
      "name": "Flowerfood 14",
      "price": 50
    },
    "pack_681d1cc405556d10": {
      "name": "Flowerfood 15",
      "price": 50
    },
    "pack_010a4f6ed136018a": {
      "name": "Flowerfood 16",
      "price": 50
    },
    "pack_dd682cb5fa11206b": {
      "name": "Foods 01",
      "price": 50
    },
    "pack_6f5df116f5cfbc18": {
      "name": "Foods 02",
      "price": 50
    },
    "pack_c771bf7385e6f874": {
      "name": "Foods 03",
      "price": 50
    },
    "pack_da60a91ac7891ab0": {
      "name": "Foods 04",
      "price": 50
    },
    "pack_7450d8182ec7761c": {
      "name": "Foods 05",
      "price": 50
    },
    "pack_59d3784c7a8fee03": {
      "name": "Foods 06",
      "price": 50
    },
    "pack_48e6945e4b91de83": {
      "name": "Foods 08",
      "price": 50
    },
    "pack_94c03f98d378aee2": {
      "name": "Foods 09",
      "price": 50
    },
    "pack_11cd926bfdcd0918": {
      "name": "Grassand Wood Snacks 01",
      "price": 50
    },
    "pack_4e2080f8ec053162": {
      "name": "Grassand Wood Snacks 02",
      "price": 50
    },
    "pack_1891efd00b46b1b8": {
      "name": "Grassand Wood Snacks 03",
      "price": 50
    },
    "pack_75604906423eaa30": {
      "name": "Grassand Wood Snacks 04",
      "price": 50
    },
    "pack_350b733ee97f621d": {
      "name": "Grassand Wood Snacks 05",
      "price": 50
    },
    "pack_53f7a4531c102099": {
      "name": "Grassand Wood Snacks 06",
      "price": 50
    },
    "pack_73181e3b1a44ddf9": {
      "name": "Grassand Wood Snacks 07",
      "price": 50
    },
    "pack_caca6fd54c4dd61b": {
      "name": "Grassand Wood Snacks 08",
      "price": 50
    },
    "pack_a0e750f85e467f8d": {
      "name": "Grassand Wood Snacks 09",
      "price": 50
    },
    "pack_11c352703a54e380": {
      "name": "Grassand Wood Snacks 10",
      "price": 50
    },
    "pack_fbe1c6a89ab77480": {
      "name": "Grassand Wood Snacks 11",
      "price": 50
    },
    "pack_5dbec8bb48766186": {
      "name": "Grassand Wood Snacks 12",
      "price": 50
    },
    "pack_7ae55a7eb7019d65": {
      "name": "Grassand Wood Snacks 13",
      "price": 50
    },
    "pack_1e86748fd72cd3c2": {
      "name": "Grassand Wood Snacks 14",
      "price": 50
    },
    "pack_425a30b728f50af1": {
      "name": "Grassand Wood Snacks 15",
      "price": 50
    },
    "pack_f74ed3b8ac268865": {
      "name": "Grassand Wood Snacks 16",
      "price": 50
    },
    "pack_ad8635bc468f115c": {
      "name": "Pet room accessory 403",
      "price": 50
    },
    "pack_7316ec7933e59cb5": {
      "name": "Pet room accessory 404",
      "price": 50
    },
    "pack_3db9659e6dee6f8b": {
      "name": "Pet room accessory 405",
      "price": 50
    },
    "pack_ee783e82fa9d16c0": {
      "name": "Pet room accessory 406",
      "price": 50
    },
    "pack_f9e03ce4210db2f1": {
      "name": "Pet room accessory 407",
      "price": 50
    },
    "pack_d1f172bc46358c04": {
      "name": "Pet room accessory 408",
      "price": 50
    },
    "pack_7e16082ef2a0b7be": {
      "name": "Pet room accessory 409",
      "price": 50
    },
    "pack_69f7ea99828186f8": {
      "name": "Pet room accessory 410",
      "price": 50
    },
    "pack_3c13c59695b05d22": {
      "name": "Pet room accessory 411",
      "price": 50
    },
    "pack_7f4e78d48ea624d5": {
      "name": "Pet toy and accessory 371",
      "price": 50
    },
    "pack_77bbad057d3cc909": {
      "name": "Tiny playroom accessory 129",
      "price": 50
    },
    "pack_07825bb9dbecd8c1": {
      "name": "Tiny playroom accessory 131",
      "price": 50
    },
    "pack_d47cfe5dd6cb8035": {
      "name": "Tiny playroom accessory 132",
      "price": 50
    },
    "pack_3b681221181f41d5": {
      "name": "Tiny playroom accessory 133",
      "price": 50
    },
    "pack_471ec58c7c0f9236": {
      "name": "Tiny playroom accessory 134",
      "price": 50
    },
    "pack_e0623ae63da4639b": {
      "name": "Tiny playroom accessory 135",
      "price": 50
    },
    "pack_0e0a5908ad4c3346": {
      "name": "Tiny playroom accessory 144",
      "price": 50
    },
    "pack_f7c3af11a8a88a3c": {
      "name": "Tiny playroom accessory 145",
      "price": 50
    },
    "pack_7bb91bf0313a46ae": {
      "name": "Tiny playroom accessory 152",
      "price": 50
    },
    "pack_0accd5e00c6521b1": {
      "name": "Tiny playroom accessory 154",
      "price": 50
    },
    "pack_18ee4c0a0184c184": {
      "name": "Tiny playroom accessory 155",
      "price": 50
    },
    "pack_7543b35f3724016f": {
      "name": "Tiny playroom accessory 156",
      "price": 50
    },
    "pack_eec31ab9c98aa151": {
      "name": "Tiny playroom accessory 157",
      "price": 50
    },
    "pack_5c771334c88ee981": {
      "name": "Tiny playroom accessory 158",
      "price": 50
    },
    "pack_4d17076d90cca862": {
      "name": "Tiny playroom accessory 164",
      "price": 50
    },
    "pack_628d695fa976afb7": {
      "name": "Tiny playroom accessory 165",
      "price": 50
    },
    "pack_964db4e88bef438d": {
      "name": "Tiny playroom accessory 175",
      "price": 50
    },
    "pack_c32ea3c7e9b812f6": {
      "name": "Tiny playroom accessory 176",
      "price": 50
    },
    "pack_53743dafd47a8607": {
      "name": "Tiny playroom accessory 179",
      "price": 50
    },
    "pack_8c869bb43604171d": {
      "name": "Tiny playroom accessory 181",
      "price": 50
    },
    "pack_c6045233799f315a": {
      "name": "Tiny playroom accessory 182",
      "price": 50
    },
    "pack_cc76e1c98160565b": {
      "name": "Tiny playroom accessory 183",
      "price": 50
    },
    "pack_126046cee44f0e96": {
      "name": "Tiny playroom accessory 189",
      "price": 50
    },
    "pack_1524bcb9dceb304c": {
      "name": "Tiny playroom accessory 190",
      "price": 50
    },
    "pack_2d337fef34b7cb2a": {
      "name": "Tiny playroom accessory 195",
      "price": 50
    },
    "pack_52430eeea8d8ba64": {
      "name": "Tiny playroom accessory 196",
      "price": 50
    },
    "pack_6eda3fe56d1fdb78": {
      "name": "Tiny playroom accessory 199",
      "price": 50
    },
    "pack_0db753a7964515b1": {
      "name": "Tiny playroom accessory 201",
      "price": 50
    },
    "pack_b081ecbbf379d7b3": {
      "name": "Tiny playroom accessory 202",
      "price": 50
    },
    "pack_f0bef3f9e63941d7": {
      "name": "Tiny playroom accessory 203",
      "price": 50
    },
    "pack_50588f30572c2fb9": {
      "name": "Tiny playroom accessory 209",
      "price": 50
    },
    "pack_989c6ddf919bd703": {
      "name": "Tiny playroom accessory 210",
      "price": 50
    },
    "pack_622686fd54cd080b": {
      "name": "Tiny playroom accessory 22",
      "price": 50
    },
    "pack_969307b9be8044ff": {
      "name": "Tiny playroom accessory 220",
      "price": 50
    },
    "pack_5b85b4637ddedb1a": {
      "name": "Tiny playroom accessory 222",
      "price": 50
    },
    "pack_3c5c36b94bdafd99": {
      "name": "Tiny playroom accessory 223",
      "price": 50
    },
    "pack_b433d3e92e5a7ff8": {
      "name": "Tiny playroom accessory 224",
      "price": 50
    },
    "pack_b8fa11eecb6ef222": {
      "name": "Tiny playroom accessory 23",
      "price": 50
    },
    "pack_9062bbd9926deea5": {
      "name": "Tiny playroom accessory 232",
      "price": 50
    },
    "pack_d9d7633f24c9ebbc": {
      "name": "Tiny playroom accessory 234",
      "price": 50
    },
    "pack_37c7b4f4da1ebd20": {
      "name": "Tiny playroom accessory 238",
      "price": 50
    },
    "pack_c7cca04f079305e6": {
      "name": "Tiny playroom accessory 24",
      "price": 50
    },
    "pack_687556a74eb6976f": {
      "name": "Tiny playroom accessory 241",
      "price": 50
    },
    "pack_a52ce33fda21a3f5": {
      "name": "Tiny playroom accessory 242",
      "price": 50
    },
    "pack_8c4015b3a7ae7840": {
      "name": "Tiny playroom accessory 249",
      "price": 50
    },
    "pack_dd7bf132f2bf3414": {
      "name": "Tiny playroom accessory 25",
      "price": 50
    },
    "pack_44335930561c3b64": {
      "name": "Tiny playroom accessory 250",
      "price": 50
    },
    "pack_78d8ee6dd2c1adb0": {
      "name": "Tiny playroom accessory 253",
      "price": 50
    },
    "pack_d74e2525ab0637fa": {
      "name": "Tiny playroom accessory 256",
      "price": 50
    },
    "pack_512b9264de94a7a9": {
      "name": "Tiny playroom accessory 257",
      "price": 50
    },
    "pack_1c8baed386a53042": {
      "name": "Tiny playroom accessory 264",
      "price": 50
    },
    "pack_20e472ef5932361c": {
      "name": "Tiny playroom accessory 265",
      "price": 50
    },
    "pack_f796eb22e3fc7ac8": {
      "name": "Tiny playroom accessory 266",
      "price": 50
    },
    "pack_56fa0a5fbb3aae7f": {
      "name": "Tiny playroom accessory 267",
      "price": 50
    },
    "pack_f2fd1b9f3bf2d1ec": {
      "name": "Tiny playroom accessory 268",
      "price": 50
    },
    "pack_01afb7892bdbda2d": {
      "name": "Tiny playroom accessory 269",
      "price": 50
    },
    "pack_e545714564ea8707": {
      "name": "Tiny playroom accessory 270",
      "price": 50
    },
    "pack_11bda9ac5f104a4e": {
      "name": "Tiny playroom accessory 271",
      "price": 50
    },
    "pack_ba23364f7b0b8a9c": {
      "name": "Tiny playroom accessory 272",
      "price": 50
    },
    "pack_0a2c77827e39b271": {
      "name": "Tiny playroom accessory 273",
      "price": 50
    },
    "pack_0e286bc11771dbbf": {
      "name": "Tiny playroom accessory 274",
      "price": 50
    },
    "pack_e4591f96fdc9a899": {
      "name": "Tiny playroom accessory 277",
      "price": 50
    },
    "pack_621d3e8030f64bd7": {
      "name": "Tiny playroom accessory 278",
      "price": 50
    },
    "pack_3982cb711ed983dd": {
      "name": "Tiny playroom accessory 28",
      "price": 50
    },
    "pack_da536a6de2609f8d": {
      "name": "Tiny playroom accessory 286",
      "price": 50
    },
    "pack_e5ce19857f025686": {
      "name": "Tiny playroom accessory 287",
      "price": 50
    },
    "pack_f97a7ed9debbb6ad": {
      "name": "Tiny playroom accessory 289",
      "price": 50
    },
    "pack_4b4a07f484943ef8": {
      "name": "Tiny playroom accessory 29",
      "price": 50
    },
    "pack_af640fff4438b955": {
      "name": "Tiny playroom accessory 290",
      "price": 50
    },
    "pack_50975515bcf960e2": {
      "name": "Tiny playroom accessory 291",
      "price": 50
    },
    "pack_de584c9c050851a9": {
      "name": "Tiny playroom accessory 292",
      "price": 50
    },
    "pack_ec0b851cbc5850f7": {
      "name": "Tiny playroom accessory 293",
      "price": 50
    },
    "pack_862f0dbc9e58350f": {
      "name": "Tiny playroom accessory 294",
      "price": 50
    },
    "pack_60ce14557e927465": {
      "name": "Tiny playroom accessory 295",
      "price": 50
    },
    "pack_1a51ea2a2698dbed": {
      "name": "Tiny playroom accessory 296",
      "price": 50
    },
    "pack_245d3c1930829d4f": {
      "name": "Tiny playroom accessory 298",
      "price": 50
    },
    "pack_ebe89caf12e83b5a": {
      "name": "Tiny playroom accessory 299",
      "price": 50
    },
    "pack_d26ca94e050cbdbe": {
      "name": "Tiny playroom accessory 300",
      "price": 50
    },
    "pack_c218319e885d2f99": {
      "name": "Tiny playroom accessory 301",
      "price": 50
    },
    "pack_8e3c9750d0779358": {
      "name": "Tiny playroom accessory 302",
      "price": 50
    },
    "pack_cdd4c762cbdffdd5": {
      "name": "Tiny playroom accessory 303",
      "price": 50
    },
    "pack_473b3c897f6dd92d": {
      "name": "Tiny playroom accessory 304",
      "price": 50
    },
    "pack_23e485cc360b19b2": {
      "name": "Tiny playroom accessory 305",
      "price": 50
    },
    "pack_f2fc1d70d35976bb": {
      "name": "Tiny playroom accessory 306",
      "price": 50
    },
    "pack_588e13a918f7f54f": {
      "name": "Tiny playroom accessory 307",
      "price": 50
    },
    "pack_07091c99c262d741": {
      "name": "Tiny playroom accessory 308",
      "price": 50
    },
    "pack_2663d9b357e1ff27": {
      "name": "Tiny playroom accessory 309",
      "price": 50
    },
    "pack_170c4d39728a84c1": {
      "name": "Tiny playroom accessory 322",
      "price": 50
    },
    "pack_ce28579c098daa5f": {
      "name": "Tiny playroom accessory 323",
      "price": 50
    },
    "pack_98da2d3bd8e47bd5": {
      "name": "Tiny playroom accessory 324",
      "price": 50
    },
    "pack_fddb0f58d9326577": {
      "name": "Tiny playroom accessory 325",
      "price": 50
    },
    "pack_792fa99d3b642e28": {
      "name": "Tiny playroom accessory 326",
      "price": 50
    },
    "pack_528794806ae66c44": {
      "name": "Tiny playroom accessory 337",
      "price": 50
    },
    "pack_f193593845f80036": {
      "name": "Tiny playroom accessory 338",
      "price": 50
    },
    "pack_466b0b159ddc41e5": {
      "name": "Tiny playroom accessory 339",
      "price": 50
    },
    "pack_80848ede099a5596": {
      "name": "Tiny playroom accessory 34",
      "price": 50
    },
    "pack_2f24fb3457eb3e45": {
      "name": "Tiny playroom accessory 340",
      "price": 50
    },
    "pack_667915c1bd74ddbe": {
      "name": "Tiny playroom accessory 341",
      "price": 50
    },
    "pack_a39e6483ec99420b": {
      "name": "Tiny playroom accessory 342",
      "price": 50
    },
    "pack_52cd6c18836f7489": {
      "name": "Tiny playroom accessory 343",
      "price": 50
    },
    "pack_6fc367fe6ef16ed1": {
      "name": "Tiny playroom accessory 344",
      "price": 50
    },
    "pack_7f62493cdfe4eed0": {
      "name": "Tiny playroom accessory 345",
      "price": 50
    },
    "pack_4cd673341c0994f3": {
      "name": "Tiny playroom accessory 346",
      "price": 50
    },
    "pack_6516c8be32a16e6f": {
      "name": "Tiny playroom accessory 348",
      "price": 50
    },
    "pack_d646d0fb5c2d9570": {
      "name": "Tiny playroom accessory 349",
      "price": 50
    },
    "pack_01cd63d030b6a2ea": {
      "name": "Tiny playroom accessory 35",
      "price": 50
    },
    "pack_dc53c58be3275adf": {
      "name": "Tiny playroom accessory 350",
      "price": 50
    },
    "pack_0110494acb479574": {
      "name": "Tiny playroom accessory 351",
      "price": 50
    },
    "pack_0adc05bcd56cab3f": {
      "name": "Tiny playroom accessory 352",
      "price": 50
    },
    "pack_b67d5687a6dc5367": {
      "name": "Tiny playroom accessory 354",
      "price": 50
    },
    "pack_9f53031f96597234": {
      "name": "Tiny playroom accessory 355",
      "price": 50
    },
    "pack_428ddc577810167a": {
      "name": "Tiny playroom accessory 356",
      "price": 50
    },
    "pack_627273bd37d4d211": {
      "name": "Tiny playroom accessory 357",
      "price": 50
    },
    "pack_4df26ddd0dc0c1e2": {
      "name": "Tiny playroom accessory 358",
      "price": 50
    },
    "pack_336b7d59cbb9b490": {
      "name": "Tiny playroom accessory 359",
      "price": 50
    },
    "pack_4a1a4536d9edf7da": {
      "name": "Tiny playroom accessory 367",
      "price": 50
    },
    "pack_9c1388b8f52155ab": {
      "name": "Tiny playroom accessory 369",
      "price": 50
    },
    "pack_855d6235eb13969a": {
      "name": "Tiny playroom accessory 370",
      "price": 50
    },
    "pack_5493f03ef5172575": {
      "name": "Tiny playroom accessory 375",
      "price": 50
    },
    "pack_27ef937d1b1dc629": {
      "name": "Tiny playroom accessory 378",
      "price": 50
    },
    "pack_ad1d0637401414ee": {
      "name": "Tiny playroom accessory 379",
      "price": 50
    },
    "pack_eac6203b315fdd9d": {
      "name": "Tiny playroom accessory 43",
      "price": 50
    },
    "pack_2f3381d633a5de71": {
      "name": "Tiny playroom accessory 44",
      "price": 50
    },
    "pack_d884847af525f294": {
      "name": "Tiny playroom accessory 47",
      "price": 50
    },
    "pack_17ecdee67d0798ce": {
      "name": "Tiny playroom accessory 48",
      "price": 50
    },
    "pack_2bbbddbcb366d2cf": {
      "name": "Tiny playroom accessory 51",
      "price": 50
    },
    "pack_7ca5b6677f4b0e09": {
      "name": "Tiny playroom accessory 52",
      "price": 50
    },
    "pack_f6e48de590b77ed4": {
      "name": "Tiny playroom accessory 53",
      "price": 50
    },
    "pack_05fd45820d558da3": {
      "name": "Tiny playroom accessory 54",
      "price": 50
    },
    "pack_220a7bf049a7cd46": {
      "name": "Toy Balls 01",
      "price": 50
    },
    "pack_dde2b2dab99fd588": {
      "name": "Toy Balls 02",
      "price": 50
    },
    "pack_aa821ab8251a7c86": {
      "name": "Toy Balls 03",
      "price": 50
    },
    "pack_9723451a2419136a": {
      "name": "Toy Balls 04",
      "price": 50
    },
    "pack_39c3cc640358009e": {
      "name": "Toy Balls 05",
      "price": 50
    },
    "pack_64140af3cc3dad6c": {
      "name": "Toy Balls 06",
      "price": 50
    },
    "pack_9849ed0c2fb77127": {
      "name": "Toy Balls 07",
      "price": 50
    },
    "pack_0c8e91a1912a7b0b": {
      "name": "Toy Balls 08",
      "price": 50
    },
    "pack_0e5296f65b19510a": {
      "name": "Toy Balls 09",
      "price": 50
    },
    "pack_7cdb5004ca8fe3a2": {
      "name": "Toy Balls 10",
      "price": 50
    },
    "pack_0bbb56ea33cedc56": {
      "name": "Toy Balls 11",
      "price": 50
    },
    "pack_e4e6ee79e082fb71": {
      "name": "Toy Balls 12",
      "price": 50
    },
    "pack_5373eaa0c4481709": {
      "name": "Toy Balls 13",
      "price": 50
    },
    "pack_660133144e98aaff": {
      "name": "Toy Balls 14",
      "price": 50
    },
    "pack_8640c83454d3a93a": {
      "name": "Toy Balls 15",
      "price": 50
    },
    "pack_e815ffefcddde312": {
      "name": "Toy Balls 16",
      "price": 50
    },
    "pack_7cdd5fe54b97aa41": {
      "name": "Toy Balls 17",
      "price": 50
    },
    "pack_5963fe6c80af79c1": {
      "name": "Toy Balls 18",
      "price": 50
    },
    "pack_fc83093735bd65f5": {
      "name": "Toy Balls 19",
      "price": 50
    },
    "pack_dd1da5cdff5a5eda": {
      "name": "Toy Balls 20",
      "price": 50
    },
    "pack_4c04d3eb704c7f96": {
      "name": "Toys 01",
      "price": 50
    },
    "pack_939d9d3df17d5754": {
      "name": "Toys 02",
      "price": 50
    },
    "pack_87e288d61e5214af": {
      "name": "Toys 03",
      "price": 50
    },
    "pack_9af2cc317dc93cfc": {
      "name": "Toys 04",
      "price": 50
    },
    "pack_d5a5c9b75b036eff": {
      "name": "Toys 05",
      "price": 50
    },
    "pack_7d326b6bb6f593c5": {
      "name": "Toys 06",
      "price": 50
    },
    "pack_3c4a7e1a83b7da2d": {
      "name": "Toys 07",
      "price": 50
    },
    "pack_9c021d7807b3f25f": {
      "name": "Toys 08",
      "price": 50
    },
    "pack_9dadd146cd5b6387": {
      "name": "Toys 09",
      "price": 50
    },
    "pack_8864cf0ccdb2ab63": {
      "name": "Toys 10",
      "price": 50
    },
    "pack_993b7ff48b4c67f9": {
      "name": "Toys 11",
      "price": 50
    },
    "pack_ca7253be7847be90": {
      "name": "Toys 12",
      "price": 50
    },
    "pack_f6134650685fdcfa": {
      "name": "Toys 13",
      "price": 50
    },
    "pack_4c901a37502a77f4": {
      "name": "Toys 14",
      "price": 50
    },
    "pack_e0c9b20eb7a4f3f3": {
      "name": "Toys 15",
      "price": 50
    },
    "pack_e891d1f2e5fd50c4": {
      "name": "Toys 16",
      "price": 50
    },
    "pack_569a52a0761a4dd5": {
      "name": "Toys 17",
      "price": 50
    },
    "pack_3a0167a14dad4d28": {
      "name": "Toys 18",
      "price": 50
    },
    "pack_456c423557795e24": {
      "name": "Toys 19",
      "price": 50
    },
    "pack_838ba2dd80961a9a": {
      "name": "Toys 20",
      "price": 50
    },
    "pack_c1b163638214c0ba": {
      "name": "Toys 21",
      "price": 50
    },
    "pack_8df5a0ec2b0d215e": {
      "name": "Toys 22",
      "price": 50
    },
    "pack_4dfe0939c61b68b7": {
      "name": "Toys 23",
      "price": 50
    },
    "pack_a08a8eb018cbca92": {
      "name": "Toys 24",
      "price": 50
    },
    "pack_26ac55d723facbbf": {
      "name": "Vitamins 01",
      "price": 50
    },
    "pack_3df489bd6052df20": {
      "name": "Vitamins 02",
      "price": 50
    },
    "pack_ed421db6ecd993d8": {
      "name": "Vitamins 03",
      "price": 50
    },
    "pack_e3e9fcb86fd13e9b": {
      "name": "Vitamins 04",
      "price": 50
    }
  }
};
  for(const v of [config.dailyReward,config.xpPerCare,config.xpDailyCap,...Object.values(config.items).map(i=>i.price)])if(!Number.isSafeInteger(v)||v<0||v>1000000)throw Error('Pet config values must be whole numbers between 0 and 1000000.');
  for(const care of Object.values(config.care))if(!Number.isFinite(care.cooldownHours)||care.cooldownHours<0||care.cooldownHours>168||!Number.isFinite(care.gain)||care.gain<0||care.gain>100)throw Error('Invalid pet care configuration.');
  root.PetConfig=config;
  if(typeof module!=="undefined")module.exports=config;
})(globalThis);
