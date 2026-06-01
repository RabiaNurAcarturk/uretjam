export interface CinematicPreset {
  title: string;
  genre: string;
  themes: string[];
  style: string;
  idea: string;
}

export const CINEMATIC_PRESETS: CinematicPreset[] = [
  {
    title: "Kum Saatinin Son Nefesi",
    genre: "Romantik Trajik Realizm / Neo-Noir",
    themes: ["Aşk", "Ölüm"],
    style: "Chiaroscuro gölgeler, yüksek kontrast, 35mm sferik lensler",
    idea: "Yaşlı bir saat ustası, yerel zamanı tam üç saniye geriye alabilen bir cep saati yapar. Ölen karısının son üç saniyelik nefesini yakalamak için zamanı sonsuz bir döngüde tekrarlarken, her dönüşün kendi kalbini fiziksel olarak yaşlandırdığını fark eder."
  },
  {
    title: "Sessiz Bozkır",
    genre: "Şiirsel Mistik Gizem",
    themes: ["Vatan", "Ölüm"],
    style: "Tarkovski tarzı uzun planlar, doğal bulutlu ışık, geniş anamorfik manzaralar",
    idea: "Yorgun ve emekli bir asker, ücra bir vadideki evine döndüğünde tüm köyün tamamen boş, el değmemiş ve sessiz olduğunu görür. Tek aktif varlık, ahşap kalıntılar arasında dolaşan ve gri gökyüzü altında unutulmuş ata ninnileri mırıldanan ruhani bir gölgedir."
  },
  {
    title: "Batık Düşler Haritası",
    genre: "Distopik Romantik Dram",
    themes: ["Aşk", "Vatan"],
    style: "Soğuk çelik mavisi ve sıcak bakır neon, vintage Cooke lensler, dar klostrofobik takip planları",
    idea: "Gelecekte sular altında kalmış bir kıyı şeridinde, devlet haritacısı atalarının doğduğu kasabayı tüm resmi haritalardan silmekle görevlendirilir. Ancak batmakta olan malikaneyi terk etmeyi reddeden asi bir kadına aşık olunca görevini yapamaz."
  },
  {
    title: "Bir İmparatorluğun Ağıtı",
    genre: "Tarihsel Psikolojik Dram",
    themes: ["Vatan", "Ölüm", "Aşk"],
    style: "Derin kırmızı ve altın kadife tonları, Kubrick usulü tek noktalı perspektif, soğuk yavaş zoom",
    idea: "Vatanı işgalciler tarafından parça parça edilen seçkin bir opera primadonası, yabancı bir general için tiyatroda şarkı söylemeye zorlanır. Sahnede sergileyeceği aryaya ölümcül zehrini ekleyerek vatan sevgisini, aşkı ve intikamı birleştiren görkemli bir final planlar."
  }
];
