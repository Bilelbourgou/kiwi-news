export interface NewsArticleItem {
  id: string;
  category: string;
  region: string;
  title: string;
  imageUrl: string;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  sourcesCount: number;
  publishedAgo?: string;
  readingTime?: string;
}

export interface RelatedStoryItem {
  id: string;
  category: string;
  region: string;
  title: string;
  imageUrl: string;
  date: string;
  readingTime: string;
}

export interface SourceItem {
  name: string;
  bias: "Left" | "Center" | "Right";
}

export interface ArticleDetailData {
  id: string;
  category: string;
  region: string;
  title: string;
  author: string;
  publishedDate: string;
  readingTime: string;
  imageUrl: string;
  imageCaption: string;
  imageCredit: string;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  sourcesCount: number;
  overallBiasLabel: string;
  overallBiasPercentage: number;
  paragraphs: string[];
  aiSummaryPoints: string[];
  sourceBreakdown: {
    total: number;
    leftCount: number;
    leftPercentage: number;
    centerCount: number;
    centerPercentage: number;
    rightCount: number;
    rightPercentage: number;
  };
  topSources: SourceItem[];
  relatedStories: RelatedStoryItem[];
}

export const TOP_NEWS_ARTICLES: NewsArticleItem[] = [
  {
    id: "1",
    category: "Politics",
    region: "United States",
    title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    leftPercentage: 20,
    centerPercentage: 31,
    rightPercentage: 49,
    sourcesCount: 12,
    publishedAgo: "2h ago",
    readingTime: "12 min read",
  },
  {
    id: "2",
    category: "Health",
    region: "United States",
    title: "Researchers Make Case for Grapes as a 'Superfood' After Review of Health Evidence",
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 18,
    centerPercentage: 42,
    rightPercentage: 40,
    sourcesCount: 7,
    publishedAgo: "3h ago",
    readingTime: "6 min read",
  },
  {
    id: "3",
    category: "Science",
    region: "Switzerland",
    title: "CERN Finds High-Significance Hint of Physics Beyond Standard Model",
    imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 16,
    centerPercentage: 62,
    rightPercentage: 22,
    sourcesCount: 8,
    publishedAgo: "4h ago",
    readingTime: "8 min read",
  },
  {
    id: "4",
    category: "World",
    region: "Nicaragua",
    title: "Indigenous Leader Brooklyn Rivera Dies in Nicaragua After Nearly 3 Years of Detention",
    imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 54,
    centerPercentage: 28,
    rightPercentage: 18,
    sourcesCount: 63,
    publishedAgo: "5h ago",
    readingTime: "5 min read",
  },
  {
    id: "5",
    category: "World",
    region: "Middle East",
    title: "UN Security Council to Hold Emergency Meeting as Israel Pushes Deeper into Lebanon",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 22,
    centerPercentage: 35,
    rightPercentage: 43,
    sourcesCount: 15,
    publishedAgo: "5h ago",
    readingTime: "7 min read",
  },
  {
    id: "6",
    category: "Business",
    region: "Global",
    title: "Oil Prices Dip as OPEC+ Considers Output Increase Amid Weak Demand",
    imageUrl: "https://images.unsplash.com/photo-1527018607619-a508a2be00be?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 25,
    centerPercentage: 50,
    rightPercentage: 25,
    sourcesCount: 11,
    publishedAgo: "6h ago",
    readingTime: "4 min read",
  },
  {
    id: "7",
    category: "Technology",
    region: "United States",
    title: "SpaceX Launches Starship Test Flight in Milestone for Mars Program",
    imageUrl: "https://images.unsplash.com/photo-1517976487502-5743c5b5aa77?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 12,
    centerPercentage: 45,
    rightPercentage: 43,
    sourcesCount: 9,
    publishedAgo: "7h ago",
    readingTime: "9 min read",
  },
  {
    id: "8",
    category: "Business",
    region: "United States",
    title: "Apple Unveils AI-Powered Features Across iPhone, iPad and Mac",
    imageUrl: "https://images.unsplash.com/photo-1510519138161-5844a49f70d7?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 15,
    centerPercentage: 40,
    rightPercentage: 45,
    sourcesCount: 10,
    publishedAgo: "8h ago",
    readingTime: "6 min read",
  },
  {
    id: "9",
    category: "Climate",
    region: "Global",
    title: "2025 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says",
    imageUrl: "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 33,
    centerPercentage: 34,
    rightPercentage: 33,
    sourcesCount: 14,
    publishedAgo: "9h ago",
    readingTime: "5 min read",
  },
  {
    id: "10",
    category: "Economy",
    region: "United States",
    title: "Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 30,
    centerPercentage: 45,
    rightPercentage: 25,
    sourcesCount: 13,
    publishedAgo: "10h ago",
    readingTime: "8 min read",
  },
  {
    id: "11",
    category: "Soccer",
    region: "Europe",
    title: "Real Madrid Win Champions League After Comeback Victory in Final",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 10,
    centerPercentage: 20,
    rightPercentage: 70,
    sourcesCount: 26,
    publishedAgo: "11h ago",
    readingTime: "6 min read",
  },
  {
    id: "12",
    category: "Environment",
    region: "Canada",
    title: "Wildfires Force Thousands to Evacuate Across Western Canada",
    imageUrl: "https://images.unsplash.com/photo-1602980085566-6c451f228b3f?auto=format&fit=crop&w=800&q=80",
    leftPercentage: 27,
    centerPercentage: 33,
    rightPercentage: 40,
    sourcesCount: 17,
    publishedAgo: "12h ago",
    readingTime: "7 min read",
  },
];

export const ARTICLE_DETAIL_1: ArticleDetailData = {
  id: "1",
  category: "Politics",
  region: "United States",
  title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
  author: "David Morgan",
  publishedDate: "May 31, 2026",
  readingTime: "12 min read",
  imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
  imageCaption: "President Donald Trump in the Cabinet Room at the White House, Washington, D.C., May 30, 2026.",
  imageCredit: "Photo: Andrew Harnik/Getty Images",
  leftPercentage: 20,
  centerPercentage: 31,
  rightPercentage: 49,
  sourcesCount: 12,
  overallBiasLabel: "Right",
  overallBiasPercentage: 49,
  paragraphs: [
    "The Trump administration has sent Iran a revised nuclear deal proposal that includes tougher terms on uranium enrichment and stronger verification measures, according to a report published Saturday.",
    "The new proposal, delivered through intermediaries in Oman, requires Iran to halt all uranium enrichment on its soil and ship its stockpile of enriched uranium out of the country. It also demands unrestricted access for international inspectors to all Iranian nuclear facilities, including military sites.",
    '"This is a take-it-or-leave-it proposal," a senior administration official told the Wall Street Journal. "The President wants a deal, but he will not accept a weak agreement that puts America or our allies at risk."',
    "Iran has not yet officially responded to the proposal. However, Iranian Foreign Minister Hossein Amir-Abdollahian said last week that any deal must respect Iran's right to peaceful nuclear energy and include the lifting of all U.S. sanctions.",
    "The revised proposal comes after several rounds of indirect talks between U.S. and Iranian officials failed to produce a breakthrough. The Trump administration has warned that if diplomacy fails, it is prepared to take other action to prevent Iran from obtaining a nuclear weapon.",
    'European allies have urged both sides to continue negotiations. "We believe diplomacy is still the best path forward," said a spokesperson for the EU\'s foreign policy chief.',
    'Israel, which has long opposed the 2015 nuclear deal with Iran, praised the Trump administration\'s tougher stance. "This is the kind of leadership that was missing in the past," said Israeli Prime Minister Benjamin Netanyahu in a statement.',
    "The fate of the proposal now rests with Iran, as global attention remains focused on whether a new nuclear agreement can be reached—or if tensions will escalate further.",
  ],
  aiSummaryPoints: [
    "The Trump administration has sent Iran a revised nuclear deal proposal with tougher terms, including a complete halt to uranium enrichment and the removal of enriched uranium stockpiles.",
    "The proposal also demands unrestricted inspector access to all nuclear sites, including military facilities.",
    "Iran has not responded officially but says any deal must respect its right to peaceful nuclear energy and include sanctions relief.",
    "The U.S. warns it is prepared to take other action if diplomacy fails, while European allies urge continued negotiations.",
    "Israel supports the tougher stance, praising the administration's determination to prevent Iran from acquiring nuclear weapons.",
  ],
  sourceBreakdown: {
    total: 12,
    leftCount: 2,
    leftPercentage: 20,
    centerCount: 4,
    centerPercentage: 31,
    rightCount: 6,
    rightPercentage: 49,
  },
  topSources: [
    { name: "Fox News", bias: "Right" },
    { name: "The Wall Street Journal", bias: "Center" },
    { name: "Reuters", bias: "Center" },
    { name: "BBC", bias: "Center" },
    { name: "CNN", bias: "Left" },
    { name: "The New York Times", bias: "Center" },
    { name: "The Washington Post", bias: "Center" },
    { name: "Newsmax", bias: "Right" },
  ],
  relatedStories: [
    {
      id: "rel-1",
      category: "World",
      region: "Middle East",
      title: "Iran Says It Will Not Negotiate Under 'Maximum Pressure'",
      imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
      date: "May 29, 2026",
      readingTime: "8 min read",
    },
    {
      id: "rel-2",
      category: "Politics",
      region: "United States",
      title: "Bipartisan Group Urges Diplomacy With Iran",
      imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
      date: "May 28, 2026",
      readingTime: "6 min read",
    },
    {
      id: "rel-3",
      category: "Politics",
      region: "United States",
      title: "US Sanctions More Iranian Entities Over Nuclear Program",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
      date: "May 28, 2026",
      readingTime: "6 min read",
    },
    {
      id: "rel-4",
      category: "Science",
      region: "Nuclear Policy",
      title: "What's in the 2015 Iran Nuclear Deal?",
      imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80",
      date: "May 25, 2026",
      readingTime: "10 min read",
    },
    {
      id: "rel-5",
      category: "World",
      region: "Middle East",
      title: "Oman Hosts Another Round of US-Iran Nuclear Talks",
      imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=400&q=80",
      date: "May 27, 2026",
      readingTime: "7 min read",
    },
    {
      id: "rel-6",
      category: "World",
      region: "Middle East",
      title: "Israel Reaffirms Red Line Over Iranian Nuclear Program",
      imageUrl: "https://images.unsplash.com/photo-1527018607619-a508a2be00be?auto=format&fit=crop&w=400&q=80",
      date: "May 24, 2026",
      readingTime: "6 min read",
    },
  ],
};

export function getArticleDetail(id: string): ArticleDetailData {
  if (id === "1" || !id) {
    return ARTICLE_DETAIL_1;
  }

  const base = TOP_NEWS_ARTICLES.find((a) => a.id === id);
  if (!base) {
    return ARTICLE_DETAIL_1;
  }

  // Derive detail for other articles
  return {
    ...ARTICLE_DETAIL_1,
    id: base.id,
    category: base.category,
    region: base.region,
    title: base.title,
    imageUrl: base.imageUrl,
    leftPercentage: base.leftPercentage,
    centerPercentage: base.centerPercentage,
    rightPercentage: base.rightPercentage,
    sourcesCount: base.sourcesCount,
    overallBiasLabel:
      base.rightPercentage > base.leftPercentage
        ? "Right"
        : base.leftPercentage > base.rightPercentage
        ? "Left"
        : "Center",
    overallBiasPercentage: Math.max(
      base.leftPercentage,
      base.centerPercentage,
      base.rightPercentage
    ),
  };
}
