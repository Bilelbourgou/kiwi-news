/**
 * KIWI News — Seed Data
 *
 * Run this in Supabase Dashboard → SQL Editor AFTER running schema.sql.
 * Inserts realistic sources, articles, and analyses for UI development.
 */

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Sources
-- ─────────────────────────────────────────────────────────────────────────────

insert into sources (id, name, listing_url, parser_strategy, active, logo_url) values
  ('11111111-0000-0000-0000-000000000001', 'Reuters',          'https://www.reuters.com',          'reuters',  true, 'https://logos-world.net/wp-content/uploads/2020/12/Reuters-Logo.png'),
  ('11111111-0000-0000-0000-000000000002', 'BBC News',         'https://www.bbc.com/news',         'bbc',      true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/BBC_News_logo_2022.svg/320px-BBC_News_logo_2022.svg.png'),
  ('11111111-0000-0000-0000-000000000003', 'NPR',              'https://www.npr.org',              'npr',      true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/National_Public_Radio_logo.svg/320px-National_Public_Radio_logo.svg.png'),
  ('11111111-0000-0000-0000-000000000004', 'Fox News',         'https://www.foxnews.com',          'foxnews',  true, null),
  ('11111111-0000-0000-0000-000000000005', 'The Guardian',     'https://www.theguardian.com',      'guardian', true, null),
  ('11111111-0000-0000-0000-000000000006', 'Associated Press', 'https://apnews.com',               'ap',       true, null)
on conflict (listing_url) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Articles
-- ─────────────────────────────────────────────────────────────────────────────

insert into articles (id, source_id, url, canonical_url, title, image_url, published_at, raw_text, scraped_at, analyzed_at) values

  -- Article 1 (Reuters)
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'https://www.reuters.com/world/us/trump-sends-iran-revised-peace-proposal-tougher-terms-2026-09-24/',
    'https://www.reuters.com/world/us/trump-sends-iran-revised-peace-proposal-tougher-terms-2026-09-24/',
    'Trump Sends Iran Revised Peace Proposal With Tougher Terms',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    '2026-09-24T00:00:00Z',
    E'The Trump administration has sent Iran a revised nuclear deal proposal that includes tougher terms on uranium enrichment and stronger verification measures, according to a report published Saturday.\n\nThe new proposal, delivered through intermediaries in Oman, requires Iran to halt all uranium enrichment on its soil and ship its stockpile of enriched uranium out of the country. It also demands unrestricted access for international inspectors to all Iranian nuclear facilities, including military sites.\n\n"This is a take-it-or-leave-it proposal," a senior administration official told the Wall Street Journal. "The President wants a deal, but he will not accept a weak agreement that puts America or our allies at risk."\n\nIran has not yet officially responded to the proposal. However, Iranian Foreign Minister Hossein Amir-Abdollahian said last week that any deal must respect Iran\'s right to peaceful nuclear energy and include the lifting of all U.S. sanctions.\n\nThe revised proposal comes after several rounds of indirect talks between U.S. and Iranian officials failed to produce a breakthrough. The Trump administration has warned that if diplomacy fails, it is prepared to take other action to prevent Iran from obtaining a nuclear weapon.',
    now(),
    now()
  ),

  -- Article 2 (BBC News)
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000002',
    'https://www.bbc.com/news/science-environment-cern-standard-model-2026',
    'https://www.bbc.com/news/science-environment-cern-standard-model-2026',
    'CERN Finds High-Significance Hint of Physics Beyond Standard Model',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
    '2026-09-23T20:00:00Z',
    E'Scientists at CERN''s Large Hadron Collider have announced a statistically significant deviation from the predictions of the Standard Model of particle physics — the most comprehensive theory of fundamental particles and forces.\n\nThe result, presented at the annual High Energy Physics conference in Geneva, shows a 4.2 sigma discrepancy in the decay rate of a rare B-meson particle. In physics, a 5 sigma result is typically required to claim a discovery.\n\n"This is the most exciting result we have seen in years," said Professor Elena Marchetti, lead physicist on the LHCb experiment. "If confirmed, it could point to the existence of new particles or forces beyond what our current theory predicts."\n\nThe Standard Model has been the backbone of particle physics for five decades. While extraordinarily successful at predicting the behavior of subatomic particles, it fails to account for dark matter, dark energy, and the asymmetry between matter and antimatter in the universe.\n\nA follow-up analysis using the full LHC Run 3 dataset is expected by early next year. If the signal persists, it could mark the beginning of a new era in fundamental physics.',
    now(),
    now()
  ),

  -- Article 3 (NPR)
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000003',
    'https://www.npr.org/2026/09/23/economy/fed-holds-rates-inflation-outlook',
    'https://www.npr.org/2026/09/23/economy/fed-holds-rates-inflation-outlook',
    'Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    '2026-09-23T18:00:00Z',
    E'The Federal Reserve held its benchmark interest rate steady on Wednesday, as policymakers signaled a cautious approach to both inflation and economic growth in the months ahead.\n\nThe decision, unanimous among the 12-member Federal Open Market Committee, keeps the federal funds rate in the 5.0 to 5.25 percent range for the fourth consecutive meeting.\n\nFed Chair Jerome Powell said the central bank remains "highly attentive" to inflation risks but acknowledged that economic growth has shown surprising resilience, complicating the path forward for monetary policy.\n\n"We are committed to bringing inflation back to our 2 percent goal," Powell said at a press conference following the meeting. "But we will proceed carefully, given the uncertainties ahead."\n\nCore PCE inflation, the Fed\'s preferred measure, stood at 2.7 percent in August, above the 2 percent target but well below the peak of 4.7 percent seen in 2023. The labor market remains solid, with unemployment at 4.1 percent.\n\nMarkets reacted calmly to the announcement, with the S&P 500 rising 0.4 percent and the 10-year Treasury yield holding steady at 4.35 percent. Analysts widely expect the Fed to begin cutting rates in early 2027 if inflation continues to decline.',
    now(),
    now()
  ),

  -- Article 4 (Fox News)
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    '11111111-0000-0000-0000-000000000004',
    'https://www.foxnews.com/politics/senate-passes-border-security-act-record-margin',
    'https://www.foxnews.com/politics/senate-passes-border-security-act-record-margin',
    'Senate Passes Sweeping Border Security Act in Bipartisan Vote',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
    '2026-09-23T16:00:00Z',
    E'The Senate passed a sweeping border security package Wednesday by a vote of 68 to 32, sending the bill to the House in what supporters called a historic bipartisan achievement on one of America''s most divisive policy challenges.\n\nThe legislation, which includes $14 billion for border infrastructure, expanded deportation authority, and new limits on asylum claims, attracted support from 14 Democratic senators alongside all 54 Republicans.\n\n"This is what Americans have been asking for," said Senate Majority Leader John Thune. "A secure border is not a partisan issue. It is a national security imperative."\n\nCritics on the left argued the bill goes too far in restricting legal pathways for asylum seekers. Immigrant advocacy groups said they would challenge several provisions in court.\n\nThe bill now faces a difficult path in the House, where progressive Democrats have vowed to block it unless paired with a pathway to legal status for undocumented immigrants who arrived as children.\n\nThe White House said President Trump would sign the bill if passed in its current form.',
    now(),
    now()
  ),

  -- Article 5 (The Guardian)
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    '11111111-0000-0000-0000-000000000005',
    'https://www.theguardian.com/environment/2026/sep/23/eu-climate-service-2026-hottest-year',
    'https://www.theguardian.com/environment/2026/sep/23/eu-climate-service-2026-hottest-year',
    '2026 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says',
    'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=800&q=80',
    '2026-09-23T14:00:00Z',
    E'The European Union''s Copernicus Climate Change Service has confirmed that 2026 is on course to rank among the three hottest years ever recorded, with global average temperatures running 1.54°C above pre-industrial levels through August.\n\nThe agency''s monthly bulletin, released Wednesday, found that August 2026 was the second warmest August on record globally, with sea surface temperatures in the North Atlantic reaching new highs for the fifth consecutive summer.\n\n"The data is deeply alarming," said Samantha Burgess, deputy director of the Copernicus Climate Change Service. "We are witnessing an acceleration in warming that is outpacing our most pessimistic projections from just a decade ago."\n\nThe findings come weeks before the COP31 climate conference in São Paulo, where world leaders are expected to revisit national emissions reduction targets under the Paris Agreement.\n\nEnvironmental campaigners called on governments to move faster on phasing out fossil fuels. "Another year of records, another year of delay," said Friederike Otto, a climate attribution scientist at Imperial College London. "The window for meaningful action is closing fast."\n\nThe EU announced last week it would accelerate its net-zero target from 2050 to 2045 in response to the worsening data.',
    now(),
    now()
  ),

  -- Article 6 (Associated Press)
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    '11111111-0000-0000-0000-000000000006',
    'https://apnews.com/article/spacex-starship-test-flight-mars-2026',
    'https://apnews.com/article/spacex-starship-test-flight-mars-2026',
    'SpaceX Starship Completes Full Test Flight in Milestone for Mars Program',
    'https://images.unsplash.com/photo-1517976487502-5743c5b5aa77?auto=format&fit=crop&w=800&q=80',
    '2026-09-22T22:00:00Z',
    E'SpaceX successfully completed the first full end-to-end test flight of its Starship rocket system on Tuesday, with both the Super Heavy booster and the Starship upper stage achieving controlled splashdowns in the Gulf of Mexico.\n\nThe flight, designated Starship Flight 9, lasted approximately 90 minutes from liftoff at the Starbase facility in Boca Chica, Texas. It was the first time both stages completed their full planned trajectories, a critical milestone toward SpaceX''s ambition to send humans to Mars.\n\n"Starship is ready," SpaceX founder Elon Musk posted on X following the splashdown. "Mars here we come."\n\nThe successful test is expected to clear a regulatory hurdle for NASA''s Artemis program, which plans to use a modified Starship as a lunar lander for its crewed Moon mission, now targeting 2027.\n\nFAA administrator Misha Chapin congratulated SpaceX on the achievement and said the agency would expedite its review of operational launch licenses for the vehicle.\n\nSpaceX plans at least two more test flights before the year''s end, with the goal of achieving orbital refueling — a key technology needed for any Mars mission — by mid-2027.',
    now(),
    now()
  )

on conflict (url) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Article Analyses
-- ─────────────────────────────────────────────────────────────────────────────

insert into article_analyses (
  article_id, summary, sentiment_score, sentiment_label,
  bias_score, bias_label, left_percentage, center_percentage, right_percentage,
  confidence, framing_notes, loaded_terms, disclaimer, model
) values

  -- Analysis for Article 1 (Trump / Iran — right-leaning coverage)
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'The Trump administration has sent Iran a revised nuclear deal proposal demanding a complete halt to uranium enrichment and unrestricted inspector access. Iran has not officially responded, while the U.S. warns of further action if diplomacy fails and allies urge continued negotiations.',
    -0.1,
    'neutral',
    0.29,
    'right',
    20, 31, 49,
    0.82,
    'The article frames the U.S. proposal as firm and principled, quoting only one anonymous official and giving more prominence to Israeli praise than to Iranian or European perspectives. Framing of the Iranian position as resistance rather than negotiation reflects a right-leaning editorial stance.',
    ARRAY['take-it-or-leave-it', 'maximum pressure', 'tougher terms'],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  ),

  -- Analysis for Article 2 (CERN — centrist/neutral science coverage)
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'CERN''s LHCb experiment has detected a 4.2 sigma deviation from Standard Model predictions in B-meson decay. While not yet a confirmed discovery, physicists say the result could indicate new particles or forces if confirmed with more data.',
    0.3,
    'positive',
    0.0,
    'center',
    12, 76, 12,
    0.91,
    'Science reporting with minimal ideological framing. Coverage is factual and balanced, citing expert sources directly. Positive sentiment reflects scientific excitement rather than political framing.',
    ARRAY[]::text[],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  ),

  -- Analysis for Article 3 (Fed / Economy — centrist)
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'The Federal Reserve held interest rates steady for the fourth consecutive meeting, citing both persistent inflation and resilient economic growth. Markets responded calmly, and analysts expect rate cuts to begin in early 2027.',
    0.1,
    'neutral',
    0.05,
    'center',
    28, 57, 15,
    0.88,
    'Financial and economic reporting with balanced framing. NPR coverage draws on official Fed statements and market data without strong partisan framing. Slight center-left lean in emphasis on caution.',
    ARRAY['committed to', 'highly attentive'],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  ),

  -- Analysis for Article 4 (Border Security — right-leaning)
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'The Senate passed a bipartisan border security bill 68-32, including $14 billion for infrastructure and new asylum restrictions. Progressive Democrats oppose it without a pathway for undocumented immigrants, and the House passage remains uncertain.',
    0.2,
    'positive',
    0.49,
    'right',
    8, 35, 57,
    0.85,
    'Fox News coverage leads with the bipartisan framing as a Republican success, quotes Majority Leader Thune prominently, and characterizes opposition as coming from "the left." Asylum seeker restrictions are framed as strength, not as humanitarian concerns.',
    ARRAY['sweeping', 'historic', 'secure border', 'national security imperative', 'vowed to block'],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  ),

  -- Analysis for Article 5 (Climate — left-leaning)
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    '2026 is on course to be one of the three hottest years ever recorded, with global temperatures at 1.54°C above pre-industrial levels through August. Climate scientists warn acceleration is outpacing projections ahead of COP31.',
    -0.3,
    'negative',
    -0.31,
    'left',
    54, 31, 15,
    0.87,
    'The Guardian''s coverage uses urgent, alarm-oriented language and prominently quotes climate campaigners and scientists critical of government inaction. Framing emphasizes acceleration and urgency, consistent with a left-leaning editorial stance on climate policy.',
    ARRAY['deeply alarming', 'acceleration', 'window for meaningful action is closing', 'another year of delay'],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  ),

  -- Analysis for Article 6 (SpaceX — centrist/positive)
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    'SpaceX completed the first full end-to-end Starship test flight, with both stages achieving controlled splashdowns. The milestone clears a path for NASA''s lunar lander program and advances SpaceX''s Mars ambitions.',
    0.6,
    'positive',
    0.1,
    'center',
    10, 72, 18,
    0.90,
    'Technology and science reporting with minimal ideological framing. AP coverage is factual and celebratory in tone, reflecting the significance of the engineering milestone. Slightly right-of-center on the entrepreneurship-positive framing of Musk''s comments.',
    ARRAY[]::text[],
    'AI-estimated political framing is based on language and source selection patterns, not editorial intent. This analysis is provided for informational purposes only.',
    'gpt-4o'
  )

on conflict (article_id) do nothing;
