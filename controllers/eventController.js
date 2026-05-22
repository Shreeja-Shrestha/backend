const axios = require("axios");

exports.getEvents = async (req, res) => {
  try {
    const response = await axios.get(
      "https://date.nager.at/api/v3/PublicHolidays/2026/NP"
    );

    // 🔹 Description map
    const descriptions = {
  "Buddha Jayanti":
    "Marks the birth, enlightenment, and death of Lord Buddha in Lumbini, a UNESCO World Heritage Site. Devotees gather for prayers, meditation, and peaceful processions.",

  "Dashain":
    "Nepal’s longest and most significant Hindu festival celebrating the victory of good over evil. Families reunite to receive tika and blessings from elders.",

  "Tihar":
    "Also known as the Festival of Lights, Tihar honors crows, dogs, cows, and siblings over five days with lamps, rangoli, and cultural rituals.",

  "Holi":
    "A vibrant festival of colors symbolizing joy, unity, and the arrival of spring. Celebrated with music, dancing, and colored powders.",

  "Maha Shivaratri":
    "A sacred festival dedicated to Lord Shiva, observed with fasting and night-long worship at temples like Pashupatinath.",

  "Maghe Sankranti":
    "Marks the transition toward warmer days and is celebrated with traditional foods like sesame sweets and yam.",

  "Teej":
    "A festival celebrated by women through fasting, singing, and dancing, praying for marital happiness and well-being.",

  "Indra Jatra":
    "One of Kathmandu’s biggest festivals featuring chariot processions of the Living Goddess Kumari and traditional masked dances.",

  "Janai Purnima":
    "A sacred Hindu festival where men renew their holy thread and families visit pilgrimage sites for rituals and blessings.",

  "Krishna Janmashtami":
    "Celebrates the birth of Lord Krishna with fasting, devotional songs, and temple visits across Nepal.",

  "Nepali New Year":
    "Marks the beginning of the Bikram Sambat calendar, celebrated with cultural programs, street festivals, and gatherings, especially in Bhaktapur.",

  "Gai Jatra":
    "A unique Newari festival honoring deceased loved ones through processions, satire, and cultural performances.",

  "Ghode Jatra":
    "A historic horse festival in Kathmandu organized by the Nepal Army to ward off evil spirits, featuring horse races and displays.",

  "Chhath":
    "A deeply spiritual festival dedicated to the Sun God, celebrated with rituals performed at rivers and ponds, especially in the Terai region.",

  "Losar":
    "New Year festival of Himalayan communities marked by traditional dances, rituals, and festive meals.",

  "Bisket Jatra":
    "A dramatic New Year festival in Bhaktapur featuring chariot pulling and symbolic tug-of-war rituals.",

  "Rato Machhindranath Jatra":
    "A grand chariot festival in Lalitpur dedicated to the rain god, believed to bring good harvest and prosperity.",

  "Seto Machhindranath Jatra":
    "A major festival in Kathmandu honoring the rain deity, celebrated with processions through the city.",

  "Tamu Lhosar":
    "New Year celebration of the Gurung community, marked by feasts, dances, and cultural pride.",

  "Sonam Lhosar":
    "New Year festival of the Tamang community celebrated with rituals, traditional dress, and gatherings.",

  "Udhauli":
    "A Kirat festival marking seasonal migration to lower regions, celebrated with Sakela dance and rituals.",

  "Ubhauli":
    "A Kirat festival marking the beginning of the farming season, celebrated with traditional dances and offerings.",

  "Yomari Punhi":
    "A Newari harvest festival where sweet dumplings called Yomari are prepared to celebrate abundance and gratitude.",

  //  Tourism / Experience-based (important for your app)

  "Pokhara Street Festival":
    "A lively street festival in Lakeside Pokhara featuring local cuisine, music, and cultural performances attracting tourists and locals.",

  "Christmas in Thamel":
    "A festive celebration in Kathmandu’s tourist hub with lights, music, nightlife, and international visitors.",

  "Rara Festival":
    "A tourism-focused event near Rara Lake showcasing local culture, nature, and promoting eco-tourism.",

  "Spring Trekking Season":
    "One of the best trekking seasons in Nepal, known for blooming rhododendrons and pleasant weather.",

  "Autumn Trekking Season":
    "Peak trekking season with clear skies and breathtaking Himalayan views, ideal for adventure travel."
};
    //  SAFE API EVENTS
    let apiEvents = [];

    if (Array.isArray(response.data)) {
      apiEvents = response.data.map(e => ({
        date: e.date,
        title: e.localName,
        location: "Nepal",
        description: descriptions[e.localName] || e.name
      }));
    } else {
      console.log("API returned invalid data:", response.data);
    }

    //  CUSTOM NEPALI EVENTS (EXTENDED)
    const customEvents = [
      // Cultural Festivals
      { date: "2026-10-20", title: "Dashain", location: "Nepal", description: descriptions["Dashain"] },
      { date: "2026-11-05", title: "Tihar", location: "Nepal", description: descriptions["Tihar"] },
      { date: "2026-03-01", title: "Maha Shivaratri", location: "Kathmandu", description: descriptions["Maha Shivaratri"] },
      { date: "2026-03-08", title: "Holi", location: "Nepal", description: descriptions["Holi"] },

      // Kathmandu Valley
      { date: "2026-09-07", title: "Indra Jatra", location: "Kathmandu", description: descriptions["Indra Jatra"] },
      { date: "2026-08-10", title: "Gai Jatra", location: "Kathmandu", description: descriptions["Gai Jatra"] },
      { date: "2026-03-20", title: "Ghode Jatra", location: "Kathmandu", description: descriptions["Ghode Jatra"] },

      // Religious & National
      { date: "2026-05-05", title: "Buddha Jayanti", location: "Lumbini", description: descriptions["Buddha Jayanti"] },
      { date: "2026-04-14", title: "Nepali New Year", location: "Bhaktapur", description: descriptions["Nepali New Year"] },

      // Terai
      { date: "2026-11-10", title: "Chhath", location: "Terai", description: descriptions["Chhath"] },

      // Ethnic Festivals
      { date: "2026-02-12", title: "Sonam Lhosar", location: "Nepal", description: descriptions["Sonam Lhosar"] },
      { date: "2026-12-30", title: "Tamu Lhosar", location: "Nepal", description: descriptions["Tamu Lhosar"] },
      { date: "2026-01-20", title: "Maghe Sankranti", location: "Nepal", description: descriptions["Maghe Sankranti"] },
      { date: "2026-05-01", title: "Ubhauli", location: "Eastern Nepal", description: descriptions["Ubhauli"] },
      { date: "2026-12-01", title: "Udhauli", location: "Eastern Nepal", description: descriptions["Udhauli"] },
      { date: "2026-12-15", title: "Yomari Punhi", location: "Kathmandu Valley", description: descriptions["Yomari Punhi"] },

      // Tourism Events
      { date: "2026-03-15", title: "Pokhara Street Festival", location: "Pokhara", description: "Food, music and tourism event." },
      { date: "2026-12-25", title: "Christmas in Thamel", location: "Kathmandu", description: "Tourist celebration with lights and nightlife." },
      { date: "2026-04-20", title: "Rara Festival", location: "Rara Lake", description: "Promotes tourism and culture." },

      // Seasonal Travel
      { date: "2026-03-10", title: "Spring Trekking Season", location: "Nepal", description: "Best trekking season with rhododendron bloom." },
      { date: "2026-09-15", title: "Autumn Trekking Season", location: "Nepal", description: "Clear skies and best mountain views." }
    ];

    // FALLBACK if API fails
    if (apiEvents.length === 0) {
      console.log("Using fallback events");

      apiEvents = [
        {
          date: "2026-05-05",
          title: "Buddha Jayanti",
          location: "Lumbini",
          description: "Fallback event"
        }
      ];
    }

    //  MERGE ALL EVENTS
    const allEvents = [...apiEvents, ...customEvents];

    res.json(allEvents);

  } catch (err) {
    console.error("API FAILED:", err.message);

    //  FULL FALLBACK (NEVER FAILS)
    res.json([
      {
        date: "2026-05-05",
        title: "Buddha Jayanti",
        location: "Lumbini",
        description: "Fallback event"
      },
      {
        date: "2026-04-14",
        title: "Nepali New Year",
        location: "Bhaktapur",
        description: "Fallback event"
      }
    ]);
  }
};