-- ══════════════════════════════════════════════════════
-- Migration 007: Seed data
-- Badge types, personality archetypes, research frameworks,
-- regulations, and Provo/BYU sample hunts
-- ══════════════════════════════════════════════════════

-- ── Badge Types (42 badges) ────────────────────────────

INSERT INTO public.badge_types (code, name, description, icon_url, category, criteria) VALUES
-- Learning & Mastery (10)
('FIRST_FIND', 'First Discovery', 'You completed your first find! Every explorer starts with a single step.', NULL, 'learning', '{"type":"count","entity":"find_completions","min":1}'),
('FIRST_HUNT', 'Hunt Beginner', 'You finished your first complete hunt. Your adventure has begun!', NULL, 'learning', '{"type":"count","entity":"play_sessions","filter":{"status":"completed"},"min":1}'),
('HUNTS_5', 'Explorer', 'Five hunts completed! You are building strong exploration skills.', NULL, 'learning', '{"type":"count","entity":"play_sessions","filter":{"status":"completed"},"min":5}'),
('HUNTS_25', 'Trailblazer', 'Twenty-five hunts! Your dedication to learning through exploration is impressive.', NULL, 'learning', '{"type":"count","entity":"play_sessions","filter":{"status":"completed"},"min":25}'),
('MASTERY_RUN', 'Mastery Run', 'You scored 90%+ on three consecutive finds. Your careful thinking paid off!', NULL, 'learning', '{"type":"consecutive","entity":"find_completions","filter":{"min_score":90},"min":3}'),
('PERFECT_HUNT', 'Perfect Hunt', 'Every find answered correctly on the first try. Outstanding focus and preparation!', NULL, 'learning', '{"type":"custom","rule":"all_finds_first_attempt_correct"}'),
('SUBJECT_EXPLORER', 'Subject Explorer', 'You completed hunts in three different subjects. Your curiosity spans many areas!', NULL, 'learning', '{"type":"distinct","entity":"hunts","field":"subject_domains","min":3}'),
('STANDARDS_CHAMPION', 'Standards Champion', 'You mastered challenges aligned to five educational standards. Strong foundation!', NULL, 'learning', '{"type":"count","entity":"task_standard_alignments","min":5}'),
('COMEBACK_KID', 'Comeback Kid', 'You improved your score after an initial struggle. Persistence is a superpower!', NULL, 'learning', '{"type":"custom","rule":"improved_score_after_low"}'),
('AI_LITERACY_HERO', 'AI Literacy Hero', 'You completed the AI literacy module. You understand how AI helps in learning!', NULL, 'learning', '{"type":"milestone","milestone":"ai_literacy_completed"}'),

-- Physical Activity (4)
('DISTANCE_1K', '1K Walker', 'You walked one kilometer during hunts. Moving your body helps your brain!', NULL, 'physical', '{"type":"sum","entity":"find_completions","field":"distance_meters","min":1000}'),
('DISTANCE_2K', '2K Trekker', 'Two kilometers explored! Your legs and brain are both getting stronger.', NULL, 'physical', '{"type":"sum","entity":"find_completions","field":"distance_meters","min":2000}'),
('DISTANCE_5K', '5K Adventurer', 'Five kilometers of exploration! That takes real commitment.', NULL, 'physical', '{"type":"sum","entity":"find_completions","field":"distance_meters","min":5000}'),
('MOVEMENT_WEEK', 'Active Week', 'You were physically active during hunts every day for a week. Healthy habits!', NULL, 'physical', '{"type":"consecutive_days","entity":"play_sessions","min":7}'),

-- Nature & Environment (3)
('NATURE_HUNT', 'Nature Observer', 'You completed a nature-themed hunt. The outdoors is full of wonder!', NULL, 'nature', '{"type":"count","entity":"play_sessions","filter":{"subject":"science_nature","status":"completed"},"min":1}'),
('NATURE_HUNTS_5', 'Nature Expert', 'Five nature hunts completed! You are becoming a keen observer of the natural world.', NULL, 'nature', '{"type":"count","entity":"play_sessions","filter":{"subject":"science_nature","status":"completed"},"min":5}'),
('GREEN_WEEK', 'Green Week', 'You explored nature every day this week. Your connection to the outdoors is growing!', NULL, 'nature', '{"type":"consecutive_days","entity":"play_sessions","filter":{"subject":"science_nature"},"min":7}'),

-- Social & Prosocial (7)
('TEAM_CAPTAIN', 'Team Leader', 'You served as team captain. Your leadership helped everyone learn together!', NULL, 'social', '{"type":"count","entity":"team_members","filter":{"role":"captain"},"min":1}'),
('KIND_COMMENTER', 'Kind Communicator', 'Your messages are consistently kind and encouraging. You make teams better!', NULL, 'social', '{"type":"count","entity":"team_messages","filter":{"moderation_status":"approved"},"min":20}'),
('HELPER', 'Helpful Hand', 'You helped a teammate improve their answer. Teaching others deepens your own understanding!', NULL, 'social', '{"type":"count","entity":"mentor_sessions","filter":{"mentee_improved":true},"min":1}'),
('TEAM_BUILDER', 'Team Builder', 'You participated in five different teams. Collaboration is a core skill!', NULL, 'social', '{"type":"distinct","entity":"team_members","field":"team_id","min":5}'),
('KUDOS_50', 'Kudos Champion', 'You received 50 kudos from peers. Your positive impact is recognized!', NULL, 'social', '{"type":"count","entity":"kudos","filter":{"as":"receiver"},"min":50}'),
('GRATITUDE_WALL', 'Gratitude Writer', 'You posted on the gratitude wall five times. Recognizing others builds community!', NULL, 'social', '{"type":"count","entity":"wall_posts","min":5}'),
('COOPERATIVE_VICTOR', 'Cooperative Champion', 'Your team achieved the highest cooperative score. Everyone contributed!', NULL, 'social', '{"type":"custom","rule":"highest_cooperative_score"}'),

-- Team Competition (3)
('TEAM_HUNT_WINNER', 'Winning Team', 'Your team finished first! Great teamwork and problem-solving.', NULL, 'competition', '{"type":"custom","rule":"team_first_place"}'),
('TEAM_LEADERBOARD_TOP_3', 'Top Team', 'Your team placed in the top 3. Consistent effort from every member!', NULL, 'competition', '{"type":"custom","rule":"team_top_three"}'),
('CONSENSUS_CHAMPION', 'Consensus Builder', 'Your team reached unanimous agreement five times. Listening and reasoning together!', NULL, 'competition', '{"type":"count","entity":"consensus","filter":{"status":"resolved","unanimous":true},"min":5}'),

-- Consistency & Habits (5)
('STREAK_3', '3-Day Streak', 'Three days in a row! Building a learning habit takes consistency.', NULL, 'consistency', '{"type":"streak","min":3}'),
('STREAK_7', 'Weekly Warrior', 'A full week of daily exploration! Your dedication is building strong habits.', NULL, 'consistency', '{"type":"streak","min":7}'),
('STREAK_10', '10-Day Champion', 'Ten consecutive days! Your commitment to learning is remarkable.', NULL, 'consistency', '{"type":"streak","min":10}'),
('STREAK_30', 'Monthly Master', 'Thirty days straight! This level of consistency leads to deep learning.', NULL, 'consistency', '{"type":"streak","min":30}'),
('SESSION_GOALS_5', 'Goal Setter', 'You set and met five session goals. Planning ahead improves results!', NULL, 'consistency', '{"type":"count","entity":"session_goals","filter":{"achieved":true},"min":5}'),

-- Content Creation (3)
('APPROVED_CREATOR', 'Content Creator', 'Your first content submission was approved! Sharing knowledge helps everyone.', NULL, 'creation', '{"type":"count","entity":"content_submissions","filter":{"review_status":"approved"},"min":1}'),
('CONTENT_10', 'Prolific Creator', 'Ten approved submissions! You are making real contributions to the community.', NULL, 'creation', '{"type":"count","entity":"content_submissions","filter":{"review_status":"approved"},"min":10}'),
('STANDARDS_ALIGNED', 'Standards Author', 'Your content aligns with educational standards. Quality contributions!', NULL, 'creation', '{"type":"custom","rule":"content_with_standards"}'),

-- Mental Health & Self-Regulation (5)
('THOUGHTFUL_SHARER', 'Thoughtful Sharer', 'You reviewed your privacy settings carefully. Taking control of your data shows maturity!', NULL, 'wellbeing', '{"type":"count","entity":"privacy_events","filter":{"event_type":"privacy_settings_changed"},"min":1}'),
('PRIVACY_REVIEW_10', 'Privacy Pro', 'You reviewed your privacy settings ten times. Staying informed about your data is important!', NULL, 'wellbeing', '{"type":"count","entity":"privacy_events","filter":{"event_type":"privacy_settings_viewed"},"min":10}'),
('REFLECTION_3', 'Reflective Learner', 'You wrote three reflections. Looking back on your learning helps it stick!', NULL, 'wellbeing', '{"type":"count","entity":"reflections","min":3}'),
('TIME_AWARE', 'Time Manager', 'You responded to a time-awareness reminder by taking a break. Healthy habits!', NULL, 'wellbeing', '{"type":"custom","rule":"responded_to_break_reminder"}'),
('ANXIETY_WARRIOR', 'Calm Explorer', 'You completed anxiety-sensitive hunts with confidence. Your courage grew with each step!', NULL, 'wellbeing', '{"type":"custom","rule":"completed_anxiety_sensitive_hunts"}'),

-- Mentor Mastery (2)
('MENTOR_MASTERY', 'Mentor Master', 'You mentored five teammates who showed improvement. Teaching is the deepest form of learning!', NULL, 'mentor', '{"type":"count","entity":"mentor_sessions","filter":{"mentee_improved":true},"min":5}'),
('MENTOR_TRAINER', 'Mentor Trainer', 'You completed the mentor training module. You are ready to guide others!', NULL, 'mentor', '{"type":"milestone","milestone":"mentor_training_completed"}');

-- ── Personality Archetypes ─────────────────────────────

INSERT INTO public.personality_archetypes (code, name, description, traits) VALUES
('STRATEGIST', 'The Strategist', 'Plans ahead, thinks through options, helps the team stay organized.', '{"openness":"high","conscientiousness":"high"}'),
('EXPLORER', 'The Explorer', 'Curious and adventurous, eager to try new approaches and discover new things.', '{"openness":"high","extraversion":"moderate"}'),
('CONNECTOR', 'The Connector', 'Brings people together, great at communication and building team spirit.', '{"extraversion":"high","agreeableness":"high"}'),
('SUPPORTER', 'The Supporter', 'Encourages others, patient and kind, helps teammates who are struggling.', '{"agreeableness":"high","conscientiousness":"moderate"}'),
('ANALYST', 'The Analyst', 'Detail-oriented, notices patterns, excels at breaking down complex problems.', '{"conscientiousness":"high","openness":"moderate"}'),
('CREATOR', 'The Creator', 'Imaginative and inventive, generates new ideas and creative solutions.', '{"openness":"high","extraversion":"moderate"}'),
('LEADER', 'The Leader', 'Takes initiative, motivates the team, comfortable making decisions under pressure.', '{"extraversion":"high","conscientiousness":"high"}'),
('GUARDIAN', 'The Guardian', 'Reliable and steady, keeps the team on track, remembers important details.', '{"conscientiousness":"high","agreeableness":"moderate"}');

-- ── Research Frameworks (15) ───────────────────────────

INSERT INTO public.research_frameworks (code, name, description, source_citation, used_in_app) VALUES
('STOP_FLOW', 'Stop Flow (Findamine 6-Step)', 'PRIME→CLUE→NAVIGATE→CHALLENGE→CAPTURE→FEEDBACK instructional cycle', 'Combines 5E, Kolb, and Retrieval Practice', true),
('FIVE_E', '5E Instructional Model', 'Engage, Explore, Explain, Elaborate, Evaluate', 'Bybee (2006); Liu et al. (2021, 61 studies, g=0.82)', true),
('KOLB', 'Experiential Learning Cycle', 'Concrete Experience → Reflective Observation → Abstract Conceptualization → Active Experimentation', 'Kolb (1984)', true),
('RETRIEVAL_PRACTICE', 'Retrieval Practice', 'Testing + immediate feedback produces 3.5x effect of retrieval alone', 'Adesope et al. (2017, 118 studies)', true),
('FOUR_PILLARS', 'Four Pillars of Learning', 'Active, Engaged, Meaningful, Social', 'Hirsh-Pasek et al. (2015)', true),
('SDT', 'Self-Determination Theory', 'Autonomy, Competence, Relatedness', 'Ryan & Deci (2000, 2020)', true),
('FLOW', 'Flow Theory', 'Challenge-skill balance, clear goals, immediate feedback', 'Csikszentmihalyi (1990)', true),
('ZPD', 'Zone of Proximal Development', 'Scaffolding, fading, target 70-85% success', 'Vygotsky (1978)', true),
('SPACED_REPETITION', 'Spaced Repetition', 'Review at expanding intervals (1h, 24h, 1w, 1mo)', 'Ebbinghaus (1885); SM-2 algorithm', true),
('COLLABORATIVE', 'Collaborative Learning', 'Peer interaction + consensus > parallel tasks', 'Tenenbaum et al. (2020, 119 studies, g=0.40)', true),
('PHYSICAL_ACTIVITY', 'Physical Activity & Cognition', 'Movement improves on-task behavior and cognition', 'Singh et al. (2019)', true),
('PLACE_BASED', 'Place-Based Learning', 'Learning tied to physical locations and local context', 'Gruenewald (2003)', true),
('TEAM_FORMATION', 'Research-Based Team Formation', 'Personality, mindset, and performance-based grouping', 'BFI-C, GM-C, SRQ-A instruments', true),
('ADDIE', 'ADDIE Model', 'Analyze, Design, Develop, Implement, Evaluate', 'Branson et al. (1975)', false),
('BLOOM', 'Bloom''s Taxonomy', 'Remember, Understand, Apply, Analyze, Evaluate, Create', 'Anderson & Krathwohl (2001)', false);

-- ── Key Regulations ────────────────────────────────────

INSERT INTO public.regulations (code, name, jurisdiction, jurisdiction_type, description, enforcing_authority) VALUES
('COPPA', 'Children''s Online Privacy Protection Act', 'US Federal', 'federal', 'Protects children under 13. Requires verifiable parental consent.', 'FTC'),
('FERPA', 'Family Educational Rights and Privacy Act', 'US Federal', 'federal', 'Protects student education records. Requires school/district DPA.', 'US Dept of Education'),
('CA_AB_2273', 'California Age-Appropriate Design Code', 'California', 'state', 'DPIA required, privacy by default, no dark patterns, age-appropriate language.', 'California AG'),
('NY_CDPA', 'New York Child Data Protection Act', 'New York', 'state', 'Under-13 COPPA, 13-17 consent, no conditioning, consent frequency limits.', 'New York AG'),
('GDPR', 'General Data Protection Regulation', 'EU', 'supranational', 'Lawful basis, parental consent for under-16, right to erasure, security.', 'EU DPAs'),
('UT_STUDENT', 'Utah Student Data Protection Act', 'Utah', 'state', 'Student data privacy in educational technology.', 'Utah USBE');

-- ── Research Citations (selected key studies) ──────────

INSERT INTO public.research_citations (authors, year, title, journal, key_finding) VALUES
('Hirsh-Pasek, Zosh, Golinkoff, Gray, Robb & Kaufman', 2015, 'Putting Education in Educational Apps', 'Psychological Science in the Public Interest', 'Four Pillars: Active, Engaged, Meaningful, Social'),
('Ryan & Deci', 2000, 'Self-Determination Theory and Facilitation of Intrinsic Motivation', 'American Psychologist', 'Autonomy, competence, relatedness predict motivation'),
('Bybee', 2006, 'The BSCS 5E Instructional Model', 'NSTA', '5E model produces g=0.82 effect size'),
('Adesope, Trevisan & Sundararajan', 2017, 'Rethinking the Use of Tests', 'Psychological Bulletin', 'Retrieval practice 3.5x more effective than study alone'),
('Tenenbaum, Winstone, Leman & Avery', 2020, 'How Effective Is Peer Interaction in Facilitating Learning?', 'Educational Psychology Review', 'Consensus tasks > parallel tasks, g=0.40'),
('Kolb', 1984, 'Experiential Learning', 'Prentice Hall', 'Learning cycle: experience → reflect → conceptualize → experiment'),
('Dweck', 2006, 'Mindset: The New Psychology of Success', 'Random House', 'Growth mindset predicts challenge-seeking and persistence'),
('Muradoglu, Kizilcec & Cimpian', 2024, 'Growth Mindset Scale for Children', 'Child Development', 'GM-C validated for ages 4-12+'),
('Singh, Uijtdewilligen, Twisk, van Mechelen & Chinapaw', 2019, 'Physical Activity and Performance at School', 'Archives of Pediatrics', 'Movement improves on-task behavior'),
('Lo', 2016, 'Taking Selfies in the Field', 'Journal of Educational Technology & Society', 'Geo-selfies strengthen conceptual understanding');
