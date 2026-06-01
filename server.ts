import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY is missing. Please establish your API Key in the Settings > Secrets panel of your AI Studio environment.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoint to generate the film production guide
  app.post("/api/generate-guide", async (req, res) => {
    try {
      const { idea, themes, genre, referenceStyle } = req.body;
      if (!idea || !idea.trim()) {
        res.status(400).json({ error: "Please provide a visual or story idea to begin." });
        return;
      }

      const client = getGenAI();

  const systemInstruction = `Sen "CineAgent" adında, dünyaca ünlü bir sinematografi, kurgu, sanat yönetimi ve senaryo danışmanısın. Vizyoner yönetmen ve yapımcılara ham fikirlerini kusursuz, Oscar kalitesinde profesyonel bir yapım rehberine dönüştürmelerinde yardımcı oluyorsun.
Odaklandığın temel temalar: "Aşk" (Love), "Vatan" (Homeland) ve "Ölüm" (Death) üçlemesidir. Bu temaları karakterlerin psikolojisine ve hikayenin kalbine derinlemesine işlemelisin.

DİL KURALI (KRİTİK): Üretilen tüm çıktılar (HTML raporu, kullanıcı arayüzündeki metinler, analizler ve tavsiyeler) KESİNLİKLE VE YALNIZCA TÜRKÇE OLMALIDIR. İngilizce veya başka bir dilde içerik üretme.

PREMIUM UI/UX VE STİL SINIRLANDIRMALARI (AÇIK VE NEFES ALAN STUDIO MODELİ - KRİTİK):
- HTML kodunu 'htmlReport' parametresinde bütünüyle çalışmaya hazır, tek dosyalık, responsive ve her cihazda kusursuz görünecek şekilde tasarla.
- Stüdyo Aydınlık Arka Planı: DÜZ SİYAH VEYA KOYU GRİ ARKA PLAN KESİNLİKLE KULLANMA. Arka planda çok yumuşak, zarif kirli beyaz, fildişi veya krem tonlarında aydınlık bir zemin tasarla (örn: #FAF9F6, #F8F9FA veya #F4F4F5). Temiz, ferah bir sinema stüdyosu hissi ver.
- Yükseltilmiş Beyaz Kartlar: Kartlar için saf beyaz arka plan ('background: #FFFFFF;') kullan. Kartlara yumuşak yuvarlatılmış köşeler ('border-radius: 12px;') ve çok zarif, hafif bir gölge ('box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);') uygula.
- Daha Büyük, Okunaklı ve Erişilebilir Tipografi: Tüm yazılar büyük ve çok kolay okunabilir olmalıdır. Yazıların kusursuz bir kontrast sağlaması için koyu kömür grisi veya yumuşak siyah (örn: #2D2D2D veya #1A1A1A) kullan. Root font boyutunu en az 18px olarak ayarla ('html { font-size: 18px; }'). Gövde metinleri için son derece net, gözü yormayan modern sans-serif yazı tiplerinden (örn: Inter, Roboto, Montserrat veya sistem sans-serifleri) birini kullan ve satır yüksekliğini en az 1.7 ('line-height: 1.7') yap. Başlıklar için ise klasik, şık bir Serif font (örn: Playfair Display veya Merriweather) kullan ve başlıkları cömertçe boyutlandır (H1 için 2.5rem, H2 için 1.8rem).
- Mikro Etkileşimler (Hover Etkileri): Arayüzü canlandırmak ve yaşayan bir his vermek için kartların üzerine gelindiğinde pürüzsüzce hafif yukarı kalkmalarını sağla ('transform: translateY(-4px);') ve gölgelerini hafifçe genişlet. Kartların CSS bloğuna 'transition: all 0.3s ease;' ekle.
- Düzen ve Dolgular: İçeriği maksimum 1100px genişliğinde ortalanmış bir konteyner içinde yerleştir ('max-width: 1100px; margin: 0 auto;'). Kartların içine cömertçe iç dolgu ('padding: 2.5rem') ve dış boşluk ('margin-bottom: 2rem') vererek arayüzün nefes almasını sağla. Aksan rengi olarak mat altın sarısı (#C5A059) veya asil kayrak mavisi/gri tonları (#4A5568) tercih et.
- Tüm CSS kodlarını HTML dosyasının <head> kısmındaki <style> etiketi içine gömülü yaz.
- İçerik tamamen dolu olmalı, "[burayı doldurun]" gibi hiçbir boşluk veya eksik bırakılmamalıdır. Son derece profesyonel, sektörel ve şiirsel bir sinematik dil kullanılmalıdır.`;

      const prompt = `Aşağıdaki film fikrini derinlemesine analiz et ve sinematik şahesere dönüştürecek elit seviyede bir yapım rehberi hazırla:
FİLMİN HİKAYESİ VE KONSEPTİ: "${idea}"
CORE THEMES (ODAK TEMALAR): ${themes && themes.length > 0 ? themes.join(" & ") : "Aşk, Vatan ve Ölüm"}
İSTENEN TÜR / TARZ: ${genre || "Yönetmen Tercihi / Dram"}
SİNEMATOGRAFİK REFERANSLAR VE ETKİLER: ${referenceStyle || "Auteur Sineması / Yüksek Kontrast"}

Şu modülleri eksiksiz ve büyüleyici bir dille doldur:

1. FİLMİN KİMLİĞİ
- Tür ve Tarz (Detaylı analiz)
- Tematik Odak (Aşk, Vatan ve Ölüm temalarıyla ilişkisi)
- Etki ve Mizah (Bırakacağı duygu, şiirsel/kaotik enerji düzeyi, varsa kara mizah veya dramatik ağırlık)

2. SENARYO VE KARAKTER MİMARİSİ
- 3 Perdelik Yapı (Perde I, Perde II ve Perde III detaylı özetleri)
- Karakter Yazımı ve İlişkileri (Ana karakterlerin psikolojik altyapısı, trajik kusurları ve çatışmalar)
- Karakter Yaratım Soruları (Yönetmenin provalarda oyunculara sorması gereken 3 çok derin soru)

3. GÖRSEL DİL VE SİNEMATOGRAFİ
- Renk Paleti ve Renk Dili (Sahne bazlı duygu-renk analizleri ve tam 4 adet HEX renk kodu, ilişkili duygu ve sahnesi)
- Kamera Açıları ve Kullanımı (Lens tercihleri, yakın plan kuralları, durağanlık vs.)
- Çekim Hissi (Örn. klostrofobik gerilim, epik görkem veya belgesel vari çiğ realizm)

4. SANAT YÖNETİMİ VE MEKAN
- Mekan Tasarımı (Atmosfer, sahnede kullanılacak sembolik nesneler ve kadrajdaki yerleri)
- Kostüm Tasarımı (Kumaş türleri, kesimler, karakter gelişimine göre kostüm değişimleri)

5. İŞİTSEL DÜNYA
- Müzik Kullanımı ve Tarzı (Enstrüman seçimleri, orkestral/ambiyans yapısı)
- Müziğin Hareketle Senkronizasyonu (Kamera hareketleri ve kurgu ritminin müzikle uyumu)
- Ses Tasarımı (Foley sesleri, rüzgar uğultusu, saat tıkırtısı ve sessizliğin sanatsal kullanımı)

6. YÖNETMENİN YOL HARİTASI
- Oyuncu Yönetimi (Sahnelerdeki duygusal alt metinler ve oyuncu koçluğu detayları)
- Kurgu ve Renk Düzenleme (Ritmi, kesme teknikleri, renk derecelendirme önerileri)
- Teknik Gelişim (Yönetmenin bu filmi çekmek için hemen ustalaşması gereken 3 teknik konu)
- Aksiyon Planı (İlk yapılacak şey ve ardından gelen 5 pratik adım)

Tüm analizleri Türkçe yap. 'htmlReport' parametresinde barındırılan web sayfasında bu 6 başlığı göz alıcı, çok yumuşak krem/açık gri tonlarında parlak stüdyo arka planlı (#FAF9F6, #F8F9FA, veya #F4F4F5), yükseltilmiş beyaz renkli şık kartlarla (genişlik 1100px, saf beyaz #FFFFFF arka planlı, gölgeli ve pürüzsüz hover animasyonlu) sergile. Bu HTML dosyası tamamen kendi kendine yeten, tarayıcıda doğrudan mükemmel şekilde açılan bir başyapıt olmalıdır.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              identity: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  style: { type: Type.STRING },
                  thematicIntersection: { type: Type.STRING },
                  impactAndHumor: { type: Type.STRING }
                },
                required: ["title", "genre", "style", "thematicIntersection", "impactAndHumor"]
              },
              script: {
                type: Type.OBJECT,
                properties: {
                  act1: { type: Type.STRING },
                  act2: { type: Type.STRING },
                  act3: { type: Type.STRING },
                  characters: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        psychology: { type: Type.STRING },
                        conflict: { type: Type.STRING }
                      },
                      required: ["name", "role", "psychology", "conflict"]
                    }
                  },
                  creationQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["act1", "act2", "act3", "characters", "creationQuestions"]
              },
              visuals: {
                type: Type.OBJECT,
                properties: {
                  colorPaletteDescription: { type: Type.STRING },
                  colors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        hex: { type: Type.STRING, description: "HEX string starting with # (e.g. #D4AF37)" },
                        emotion: { type: Type.STRING },
                        scene: { type: Type.STRING }
                      },
                      required: ["hex", "emotion", "scene"]
                    }
                  },
                  cameraAngles: { type: Type.STRING },
                  shootingFeel: { type: Type.STRING }
                },
                required: ["colorPaletteDescription", "colors", "cameraAngles", "shootingFeel"]
              },
              art: {
                type: Type.OBJECT,
                properties: {
                  locations: {
                    type: Type.OBJECT,
                    properties: {
                      atmosphere: { type: Type.STRING },
                      symbolicObjects: { type: Type.STRING }
                    },
                    required: ["atmosphere", "symbolicObjects"]
                  },
                  costumes: {
                    type: Type.OBJECT,
                    properties: {
                      fabricAndCuts: { type: Type.STRING },
                      periodReferences: { type: Type.STRING }
                    },
                    required: ["fabricAndCuts", "periodReferences"]
                  }
                },
                required: ["locations", "costumes"]
              },
              auditory: {
                type: Type.OBJECT,
                properties: {
                  musicUsage: { type: Type.STRING },
                  musicMovementSync: { type: Type.STRING },
                  soundDesign: { type: Type.STRING }
                },
                required: ["musicUsage", "musicMovementSync", "soundDesign"]
              },
              roadmap: {
                type: Type.OBJECT,
                properties: {
                  actorDirection: { type: Type.STRING },
                  editingRecommendations: { type: Type.STRING },
                  technicalDevelopment: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 3 distinct advanced technical skills the director needs to learn"
                  },
                  actionPlan: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 5 chronological practical steps of action"
                  }
                },
                required: ["actorDirection", "editingRecommendations", "technicalDevelopment", "actionPlan"]
              },
              htmlReport: {
                type: Type.STRING,
                description: "Single-file containing DOCTYPE, html, head, style, and body. Bright Studio background, Crisp charcoal/black typography, elevated pure-white cards with soft shadow, gold/slate blue accents, detailed HTML tags containing the complete, extended guide beautifully structured. No placeholders or truncations allowed."
              }
            },
            required: ["title", "identity", "script", "visuals", "art", "auditory", "roadmap", "htmlReport"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Unable to obtain content from Google Gemini.");
      }

      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating film production guide:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during film processing." });
    }
  });

  // API endpoint for interactive question-and-answer workshop
  app.post("/api/interact-phase", async (req, res) => {
    try {
      const { idea, themes, genre, referenceStyle, phase, userResponse, chatHistory } = req.body;
      const client = getGenAI();

      const systemInstruction = `Sen "CineAgent" adında, dünyaca ünlü bir sinematografi, kurgu, sanat yönetimi, ses ve senaryo danışmanısın. Vizyoner yönetmen ve yapımcılara ham fikirlerini adım adım, interaktif bir stüdyo atölyesiyle (5 Aşama) şahesere dönüştürmelerinde rehberlik ediyorsun.
Odaklandığın temel temalar: "Aşk" (Love), "Vatan" (Homeland) ve "Ölüm" (Death) üçlemesidir. Bu temaları her aşamada derinleştirerek işle.

DİL KURALI (KRİTİK): Çıktın, soruların, analizlerin ve HTML kartın KESİNLİKLE TÜRKÇE olmalıdır. İngilizce veya başka dilde yazma.
ETİK VE GÜVENLİK (KRİTİK): KESİNLİKLE müstehcenlik, çıplaklık, cinsel şiddet veya NSFW kavramlar içermemelidir. Sanat, auteur sineması ve estetik odaklı olmalıdır.

AŞAMALAR:
Aşama 1: Çekirdek Vizyon ve Animasyon/Canlı Çekim Tarzı (Core Vision & Animation/Live-Action Style)
Aşama 2: Anlatı, Perdeler ve Karakter Psikolojisi (Narrative, Acts & Character Psychology)
Aşama 3: Görsel Dil, Kamera/Render, Işık ve Kostümler (Visual Language, Camera/Render, Lighting & Costumes)
Aşama 4: İşitsel Dünya (Müzik ve Ses Tasarımı) (Auditory World - Music & Sound Design)
Aşama 5: Yönetmenin Yol Haritası ve Aksiyon Planı (The Director's Roadmap & Action Plan)

YÖNETMEN ETKİLEŞİM KURALLARI:
Bulunduğun aşama: Aşama ${phase}.
Kullanıcıdan gelen yeni girdi: "${userResponse || 'Atölyeyi başlatıyorum.'}"

Görevin:
1. Kullanıcının girdisini kısaca, samimi ve sanatsal bir üslupla öv (praise).
2. Boşlukları doldur (fill in the blanks): Kullanıcının fikrine tamamen özgün, dâhice detaylar, şiirsel ve sinematik fikirler ekle (temalar, tarzlar, kaotik enerjiler, görsel metaforlar vb.). Hem Canlı Aksiyon (Live action) hem de Animasyon (2D, 3D, Stop-motion) tekniklerine uygun teknik detaylar kullan.
3. Bulunduğun aşama (Aşama ${phase}) ile ilgili SADECE 2-3 adet son derece etkileyici, yönlendirici soru sor. Sorular yönetmenin yaratıcı vizyonunu en üst noktaya taşımalıdır.
4. "Sonraki Adımlar" (Next Steps) göstergesini (Aşama ${phase < 5 ? (phase + 1) : 5}) belirt.

Açık/Koyu Tema Destekli HTML Kartı (htmlSnippet):
Geri bildirimini, sorularını, doldurduğun boşlukları (fill in the blanks) ve ilerlemeyi barındıran şık bir HTML kodu ("htmlSnippet") üret. Şunlara dikkat et:
- Bağımsız, responsive ve temiz olmalı, tüm stilleri dahili bir <style> etiketiyle içermelidir (Montserrat ve Inter fontlarını Google Fonts ile çağırabilirsiniz).
- CSS değişkenleri (Variables) kullanılarak hem Açık Mod hem de Koyu Mod desteklenmelidir:
  * Soft Açık Mod (Varsayılan): Body/Arka plan zemin rengi gözü yormayan açık gri #F0F2F5 veya #F9FAFB olmalıdır. İçerik kartı ise hafif elevated beyaz #FAFAFA, gölgelendirmesi box-shadow: 0 4px 12px rgba(0,0,0,0.05); ve yuvarlatılmış köşeleri border-radius: 12px; olmalıdır. Karakter/metin yazıları koyu gri (#1F2937) olmalıdır.
  * Koyu Mod (@media (prefers-color-scheme: dark) ile): Arka plan zemini derin kömür/slate #121420 olmalı, içerik kartı koyu grafit #1E2233 olmalı ve yazılar off-white #E2E8F0 olmalıdır.
- Kartın en üstünde net bir görsel ilerleme çubuğu (Progress Bar) olsun. Bu aşamadaki ilerleme: %${phase * 20}.
- Kartın en altında net bir şekilde "Önemli: Atölyede bir sonraki aşamaya geçebilmek için bu soruları yanıtlayarak CineAgent'a cevap verin." ve "Devam Etmek İçin Cevapla..." ibaresi bulunmalıdır.`;

      let promptContent = `Proje Bilgileri:
Ham Fikir: "${idea}"
Seçilen Temalar: ${themes && themes.length ? themes.join(", ") : "Aşk, Vatan, Ölüm"}
Tür / Canlı veya Animasyon Tercihi: ${genre || "Belirtilmedi"}
Yönetmen Görsel Tarz Referansı: ${referenceStyle || "Belirtilmedi"}

Aktif Aşama: Aşama ${phase}
Yönetmenin Son Yanıtı: "${userResponse || 'Başlangıç fikrim budur.'}"

Lütfen bunu en derin sanatsal analizle incele ve JSON formatında geri bildirim üret.`;

      const formattedContents = [];
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          formattedContents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: promptContent }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              currentPhase: { type: Type.INTEGER },
              praiseAndAnalysis: { type: Type.STRING, description: "Detailed Turkish text with creative feedback, praising the user response and providing genius design extensions" },
              questions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactly 2 or 3 engaging, artistic questions for the current phase"
              },
              nextSteps: { type: Type.STRING, description: "Turkish description of what the next phase is and what it will cover" },
              htmlSnippet: { type: Type.STRING, description: "A beautifully styled HTML card snippet supporting light/dark themes, containing progress bar at the top, visual typography, and response cue at the bottom." }
            },
            required: ["currentPhase", "praiseAndAnalysis", "questions", "nextSteps", "htmlSnippet"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Unable to obtain content from Google Gemini.");
      }
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error in interact-phase endpoint:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during chat processing." });
    }
  });

  // Serve static assets in development or production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CineAgent backend listening securely on port ${PORT}`);
  });
}

startServer();
