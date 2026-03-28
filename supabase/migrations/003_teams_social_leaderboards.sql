-- ── Teams ──────────────────────────────────────────────

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'forming'
    CHECK (status IN ('forming', 'ready', 'active', 'completed', 'disbanded')),
  max_size INT DEFAULT 6,
  formation_method TEXT CHECK (formation_method IN ('manual', 'random', 'personality', 'balanced', 'self_select')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_teams_hunt ON public.teams(hunt_id);
CREATE INDEX idx_teams_status ON public.teams(status);

CREATE TRIGGER set_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_all" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "teams_insert_auth" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- teams_update policy added after team_members table

-- ── Team Members ───────────────────────────────────────

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_team_members_unique ON public.team_members(team_id, user_id) WHERE status = 'active';
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select_all" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "team_members_insert_auth" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "team_members_update_own_or_admin" ON public.team_members
  FOR UPDATE USING (
    user_id = public.user_id()
    OR public.user_role() IN ('teacher', 'game_master', 'admin')
  );

-- Now that team_members exists, add the deferred policy
CREATE POLICY "teams_update_member_or_admin" ON public.teams
  FOR UPDATE USING (
    public.user_role() IN ('teacher', 'game_master', 'admin', 'researcher')
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = public.user_id() AND tm.role = 'captain'
    )
  );

-- ── Team Join Requests ─────────────────────────────────

CREATE TABLE public.team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_join_requests_team ON public.team_join_requests(team_id);

ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "join_requests_select" ON public.team_join_requests
  FOR SELECT USING (
    user_id = public.user_id()
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_join_requests.team_id
      AND tm.user_id = public.user_id() AND tm.role = 'captain'
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

CREATE POLICY "join_requests_insert_auth" ON public.team_join_requests
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "join_requests_update_captain" ON public.team_join_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_join_requests.team_id
      AND tm.user_id = public.user_id() AND tm.role = 'captain'
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

-- ── Team Chat Messages ─────────────────────────────────

CREATE TABLE public.team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  message TEXT NOT NULL CHECK (char_length(message) <= 280),
  moderated BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_team_messages_team ON public.team_messages(team_id, created_at);

ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_team_member" ON public.team_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_messages.team_id
      AND tm.user_id = public.user_id() AND tm.status = 'active'
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

CREATE POLICY "messages_insert_team_member" ON public.team_messages
  FOR INSERT WITH CHECK (
    user_id = public.user_id()
    AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_messages.team_id
      AND tm.user_id = public.user_id() AND tm.status = 'active'
    )
  );

-- ── Friends ────────────────────────────────────────────

CREATE TABLE public.friend_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id),
  addressee_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT no_self_friend CHECK (requester_id != addressee_id)
);

CREATE UNIQUE INDEX idx_friends_pair ON public.friend_connections(
  LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id)
);
CREATE INDEX idx_friends_requester ON public.friend_connections(requester_id);
CREATE INDEX idx_friends_addressee ON public.friend_connections(addressee_id);

CREATE TRIGGER set_friends_updated_at
  BEFORE UPDATE ON public.friend_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.friend_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select_own" ON public.friend_connections
  FOR SELECT USING (requester_id = public.user_id() OR addressee_id = public.user_id());

CREATE POLICY "friends_insert_own" ON public.friend_connections
  FOR INSERT WITH CHECK (requester_id = public.user_id());

CREATE POLICY "friends_update_involved" ON public.friend_connections
  FOR UPDATE USING (requester_id = public.user_id() OR addressee_id = public.user_id());

CREATE POLICY "friends_delete_involved" ON public.friend_connections
  FOR DELETE USING (requester_id = public.user_id() OR addressee_id = public.user_id());

-- ── Kudos ──────────────────────────────────────────────

CREATE TABLE public.kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  message_type TEXT NOT NULL DEFAULT 'custom' CHECK (message_type IN ('predefined', 'custom')),
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  hunt_id UUID REFERENCES public.hunts(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT no_self_kudos CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_kudos_receiver ON public.kudos(receiver_id);
CREATE INDEX idx_kudos_sender ON public.kudos(sender_id);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kudos_select_involved" ON public.kudos
  FOR SELECT USING (sender_id = public.user_id() OR receiver_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE POLICY "kudos_insert_auth" ON public.kudos
  FOR INSERT WITH CHECK (sender_id = public.user_id());

-- ── Shout-outs ─────────────────────────────────────────

CREATE TABLE public.shoutouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  hunt_id UUID REFERENCES public.hunts(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shoutouts_receiver ON public.shoutouts(receiver_id);

ALTER TABLE public.shoutouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shoutouts_select_all" ON public.shoutouts
  FOR SELECT USING (true);

CREATE POLICY "shoutouts_insert_auth" ON public.shoutouts
  FOR INSERT WITH CHECK (sender_id = public.user_id());

-- ── Wall Posts ─────────────────────────────────────────

CREATE TABLE public.wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  post_type TEXT NOT NULL DEFAULT 'general'
    CHECK (post_type IN ('appreciation', 'highlight', 'general', 'who_helped', 'what_proud', 'peer_strength', 'growth', 'gratitude')),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_anonymous BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_wall_posts_team ON public.wall_posts(team_id, created_at);

ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wall_select_team_member" ON public.wall_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = wall_posts.team_id
      AND tm.user_id = public.user_id() AND tm.status = 'active'
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

CREATE POLICY "wall_insert_team_member" ON public.wall_posts
  FOR INSERT WITH CHECK (
    user_id = public.user_id()
    AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = wall_posts.team_id
      AND tm.user_id = public.user_id() AND tm.status = 'active'
    )
  );

-- ── Consensus ──────────────────────────────────────────

CREATE TABLE public.consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  find_id UUID REFERENCES public.finds(id),
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'expired')),
  agreed_answer TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_consensus_team ON public.consensus(team_id);

ALTER TABLE public.consensus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consensus_select_team" ON public.consensus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = consensus.team_id
      AND tm.user_id = public.user_id() AND tm.status = 'active'
    )
    OR public.user_role() IN ('teacher', 'admin')
  );

CREATE POLICY "consensus_insert_auth" ON public.consensus
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "consensus_update_admin" ON public.consensus
  FOR UPDATE USING (public.user_role() IN ('teacher', 'admin'));

CREATE TABLE public.consensus_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consensus_id UUID NOT NULL REFERENCES public.consensus(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  vote TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (consensus_id, user_id)
);

ALTER TABLE public.consensus_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_select_team" ON public.consensus_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consensus c
      JOIN public.team_members tm ON tm.team_id = c.team_id
      WHERE c.id = consensus_votes.consensus_id
      AND tm.user_id = public.user_id()
    )
  );

CREATE POLICY "votes_insert_own" ON public.consensus_votes
  FOR INSERT WITH CHECK (user_id = public.user_id());

-- ── Goals and Reflections ──────────────────────────────

CREATE TABLE public.session_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  hunt_id UUID REFERENCES public.hunts(id),
  goal_text TEXT NOT NULL,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_goals_user ON public.session_goals(user_id);

CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.session_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.session_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_own" ON public.session_goals
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin'));

CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  hunt_id UUID REFERENCES public.hunts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reflections_user ON public.reflections(user_id);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reflections_own" ON public.reflections
  FOR ALL USING (user_id = public.user_id() OR public.user_role() IN ('teacher', 'admin', 'researcher'));

-- ── Leaderboard ────────────────────────────────────────

CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID REFERENCES public.hunts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  team_id UUID REFERENCES public.teams(id),
  score INT NOT NULL DEFAULT 0,
  rank INT,
  entry_type TEXT NOT NULL DEFAULT 'user' CHECK (entry_type IN ('user', 'team')),
  period TEXT DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'all_time')),
  snapshot_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_leaderboard_hunt ON public.leaderboard_entries(hunt_id, entry_type, score DESC);
CREATE INDEX idx_leaderboard_user ON public.leaderboard_entries(user_id);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_select_all" ON public.leaderboard_entries
  FOR SELECT USING (true);

CREATE POLICY "leaderboard_admin" ON public.leaderboard_entries
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- ── Badges ─────────────────────────────────────────────

CREATE TABLE public.badge_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badge_types_select_all" ON public.badge_types
  FOR SELECT USING (true);

CREATE POLICY "badge_types_admin" ON public.badge_types
  FOR ALL USING (public.user_role() IN ('admin'));

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  badge_type_id UUID NOT NULL REFERENCES public.badge_types(id),
  hunt_id UUID REFERENCES public.hunts(id),
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, badge_type_id, hunt_id)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_all" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_admin" ON public.user_badges
  FOR ALL USING (public.user_role() IN ('admin', 'researcher'));

-- Add team_id FK to play_sessions now that teams table exists
ALTER TABLE public.play_sessions
  ADD CONSTRAINT fk_play_sessions_team
  FOREIGN KEY (team_id) REFERENCES public.teams(id);
