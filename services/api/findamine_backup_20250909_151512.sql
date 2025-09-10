--
-- PostgreSQL database dump
--

\restrict sL4X2zna8y2cZIsIHCKff5o7lBsJA1JfYrbFoWNHlFB1dhOkuQUh1W83CmOQVCK

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ClueReleaseSchedule; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."ClueReleaseSchedule" AS ENUM (
    'ALL_AT_ONCE',
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'CUSTOM'
);


ALTER TYPE public."ClueReleaseSchedule" OWNER TO findamine_master;

--
-- Name: GameStatus; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."GameStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."GameStatus" OWNER TO findamine_master;

--
-- Name: PointTrackingMode; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."PointTrackingMode" AS ENUM (
    'HISTORICAL',
    'REAL_TIME'
);


ALTER TYPE public."PointTrackingMode" OWNER TO findamine_master;

--
-- Name: PrivacyLevel; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."PrivacyLevel" AS ENUM (
    'PRIVATE',
    'MINIONS_ONLY',
    'MINIONS_AND_FRENEMIES',
    'PUBLIC'
);


ALTER TYPE public."PrivacyLevel" OWNER TO findamine_master;

--
-- Name: PrizeDelivery; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."PrizeDelivery" AS ENUM (
    'IN_PERSON',
    'ELECTRONIC'
);


ALTER TYPE public."PrizeDelivery" OWNER TO findamine_master;

--
-- Name: PrizeDistribution; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."PrizeDistribution" AS ENUM (
    'TOP_PLAYERS',
    'RANDOM_LOTTERY'
);


ALTER TYPE public."PrizeDistribution" OWNER TO findamine_master;

--
-- Name: PrizeType; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."PrizeType" AS ENUM (
    'OVERALL_GAME',
    'DAILY',
    'WEEKLY'
);


ALTER TYPE public."PrizeType" OWNER TO findamine_master;

--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."QuestionType" AS ENUM (
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE'
);


ALTER TYPE public."QuestionType" OWNER TO findamine_master;

--
-- Name: TimeDiscountType; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."TimeDiscountType" AS ENUM (
    'NONE',
    'LINEAR',
    'CURVE_LINEAR'
);


ALTER TYPE public."TimeDiscountType" OWNER TO findamine_master;

--
-- Name: TreatmentAssignmentType; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."TreatmentAssignmentType" AS ENUM (
    'RANDOM',
    'MANUAL',
    'AUTO_FUTURE'
);


ALTER TYPE public."TreatmentAssignmentType" OWNER TO findamine_master;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: findamine_master
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'GAME_MASTER',
    'PLAYER'
);


ALTER TYPE public."UserRole" OWNER TO findamine_master;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Badge; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Badge" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Badge" OWNER TO findamine_master;

--
-- Name: ChatPost; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."ChatPost" (
    id text NOT NULL,
    "gameId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatPost" OWNER TO findamine_master;

--
-- Name: ClueFinding; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."ClueFinding" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "foundAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    points integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gameClueId" text NOT NULL,
    "gpsLatitude" double precision NOT NULL,
    "gpsLongitude" double precision NOT NULL,
    "selfiePhoto" text,
    "shareFind" boolean DEFAULT false NOT NULL,
    "sharePhoto" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ClueFinding" OWNER TO findamine_master;

--
-- Name: ClueLocation; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."ClueLocation" (
    id text NOT NULL,
    "identifyingName" text NOT NULL,
    "anonymizedName" text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    text text NOT NULL,
    hint text,
    "gpsVerificationRadius" double precision DEFAULT 1.5 NOT NULL,
    "requiresSelfie" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClueLocation" OWNER TO findamine_master;

--
-- Name: CluePhoto; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."CluePhoto" (
    id text NOT NULL,
    filename text NOT NULL,
    "originalName" text NOT NULL,
    description text,
    "isCluePhoto" boolean DEFAULT false NOT NULL,
    "isFavorited" boolean DEFAULT false NOT NULL,
    "uploadedBy" text NOT NULL,
    "clueLocationId" text NOT NULL,
    "gameId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CluePhoto" OWNER TO findamine_master;

--
-- Name: Game; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Game" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status public."GameStatus" DEFAULT 'DRAFT'::public."GameStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isOngoing" boolean DEFAULT false NOT NULL,
    "clueReleaseSchedule" public."ClueReleaseSchedule" DEFAULT 'ALL_AT_ONCE'::public."ClueReleaseSchedule" NOT NULL,
    "customReleaseTimes" jsonb,
    "baseCluePoints" integer DEFAULT 100 NOT NULL,
    "timeDiscountType" public."TimeDiscountType" DEFAULT 'NONE'::public."TimeDiscountType" NOT NULL,
    "timeDiscountRate" double precision DEFAULT 0.0 NOT NULL,
    "profileCompletionPoints" integer DEFAULT 50 NOT NULL,
    "referralPoints" integer DEFAULT 25 NOT NULL,
    "followerPoints" integer DEFAULT 10 NOT NULL,
    "privacyBonusPoints" jsonb,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "pointTrackingMode" public."PointTrackingMode" DEFAULT 'HISTORICAL'::public."PointTrackingMode" NOT NULL,
    "gameCenterAddress" text,
    "gameCenterLat" double precision,
    "gameCenterLng" double precision,
    "maxPlayers" integer DEFAULT 10000000 NOT NULL
);


ALTER TABLE public."Game" OWNER TO findamine_master;

--
-- Name: GameClue; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."GameClue" (
    id text NOT NULL,
    "gameId" text NOT NULL,
    "clueLocationId" text NOT NULL,
    "customName" text,
    "customText" text,
    "customHint" text,
    points integer DEFAULT 100 NOT NULL,
    "releaseTime" timestamp(3) without time zone,
    "isReleased" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GameClue" OWNER TO findamine_master;

--
-- Name: GamePhoto; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."GamePhoto" (
    id text NOT NULL,
    filename text NOT NULL,
    "originalName" text NOT NULL,
    description text,
    "isGameCenter" boolean DEFAULT false NOT NULL,
    "isFavorited" boolean DEFAULT false NOT NULL,
    "uploadedBy" text NOT NULL,
    "gameId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GamePhoto" OWNER TO findamine_master;

--
-- Name: GameSurvey; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."GameSurvey" (
    id text NOT NULL,
    "gameId" text NOT NULL,
    "surveyId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    points integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GameSurvey" OWNER TO findamine_master;

--
-- Name: GameTreatment; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."GameTreatment" (
    id text NOT NULL,
    "gameId" text NOT NULL,
    "treatmentId" text NOT NULL,
    "assignmentType" public."TreatmentAssignmentType" DEFAULT 'RANDOM'::public."TreatmentAssignmentType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GameTreatment" OWNER TO findamine_master;

--
-- Name: LoginAttempt; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."LoginAttempt" (
    id text NOT NULL,
    "userId" text,
    email text NOT NULL,
    password text NOT NULL,
    success boolean NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    browser text,
    "browserVersion" text,
    os text,
    "osVersion" text,
    "deviceType" text,
    "deviceModel" text,
    country text,
    region text,
    city text,
    "attemptedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LoginAttempt" OWNER TO findamine_master;

--
-- Name: PageView; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."PageView" (
    id text NOT NULL,
    "userId" text,
    "pageName" text NOT NULL,
    "pageUrl" text NOT NULL,
    "pageTitle" text,
    referrer text,
    "ipAddress" text,
    "userAgent" text,
    browser text,
    "browserVersion" text,
    os text,
    "osVersion" text,
    "deviceType" text,
    "deviceModel" text,
    country text,
    region text,
    city text,
    "sessionId" text,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PageView" OWNER TO findamine_master;

--
-- Name: PlayerGame; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."PlayerGame" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "gameId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leftAt" timestamp(3) without time zone,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "privacyLevel" public."PrivacyLevel" DEFAULT 'PRIVATE'::public."PrivacyLevel" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PlayerGame" OWNER TO findamine_master;

--
-- Name: PointScale; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."PointScale" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    options jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PointScale" OWNER TO findamine_master;

--
-- Name: Prize; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Prize" (
    id text NOT NULL,
    "gameId" text NOT NULL,
    name text NOT NULL,
    description text,
    type public."PrizeType" NOT NULL,
    distribution public."PrizeDistribution" NOT NULL,
    value text,
    frequency text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    delivery public."PrizeDelivery" DEFAULT 'ELECTRONIC'::public."PrizeDelivery" NOT NULL
);


ALTER TABLE public."Prize" OWNER TO findamine_master;

--
-- Name: ProfileData; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."ProfileData" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "phoneNumber" text,
    "homeAddress" text,
    education text,
    "highSchool" text,
    college text,
    "shoppingPatterns" text,
    points integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfileData" OWNER TO findamine_master;

--
-- Name: Referral; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Referral" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "referredId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    points integer DEFAULT 25 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Referral" OWNER TO findamine_master;

--
-- Name: SocialConnection; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."SocialConnection" (
    id text NOT NULL,
    "followerId" text NOT NULL,
    "followingId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    points integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SocialConnection" OWNER TO findamine_master;

--
-- Name: Survey; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Survey" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Survey" OWNER TO findamine_master;

--
-- Name: SurveyQuestion; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."SurveyQuestion" (
    id text NOT NULL,
    "surveyId" text NOT NULL,
    question text NOT NULL,
    type public."QuestionType" NOT NULL,
    "pointScaleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SurveyQuestion" OWNER TO findamine_master;

--
-- Name: SurveyResponse; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."SurveyResponse" (
    id text NOT NULL,
    "userId" text NOT NULL,
    answer text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gameSurveyId" text NOT NULL,
    "questionId" text NOT NULL
);


ALTER TABLE public."SurveyResponse" OWNER TO findamine_master;

--
-- Name: Team; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Team" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isCrossGame" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "gameId" text
);


ALTER TABLE public."Team" OWNER TO findamine_master;

--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."TeamMember" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeamMember" OWNER TO findamine_master;

--
-- Name: Treatment; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."Treatment" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Treatment" OWNER TO findamine_master;

--
-- Name: TreatmentAssignment; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."TreatmentAssignment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "gameTreatmentId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TreatmentAssignment" OWNER TO findamine_master;

--
-- Name: User; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastName" text,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'PLAYER'::public."UserRole" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bestFindMemory" text,
    degrees text[],
    education text[],
    "favoritePlayZones" text[],
    hobbies text[],
    "homeCity" text,
    "profilePicture" text,
    "statusMessage" text,
    "workHistory" text[],
    "gamerTag" text,
    "agreedToPrivacy" boolean DEFAULT false NOT NULL,
    "agreedToTerms" boolean DEFAULT false NOT NULL,
    country text,
    "dateOfBirth" timestamp(3) without time zone,
    "isPaidUser" boolean DEFAULT false NOT NULL,
    "privacyVersion" text,
    state text,
    "termsVersion" text
);


ALTER TABLE public."User" OWNER TO findamine_master;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: findamine_master
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO findamine_master;

--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Badge" (id, name, description, icon, "isActive", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: ChatPost; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."ChatPost" (id, "gameId", "userId", content, "isDeleted", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
cmfd1g7o300rf9we4kuri5kll	game2	cmfd1g7fb001l9we4wiyyzv98	Should we split up to cover more ground?	f	\N	\N	2025-09-08 19:52:13.484	2025-09-09 21:04:01.492
cmfd1g7o600rh9we4jim5v193	game2	cmfd1g7fq002i9we49e2zwjs2	Good idea! I'll take the north side	f	\N	\N	2025-09-08 17:36:57.578	2025-09-09 21:04:01.494
cmfd1g7o600rj9we4ly989auh	game2	cmfd1g7fl00279we4ptzl63t0	I'll cover the athletic buildings	f	\N	\N	2025-09-08 16:55:17.358	2025-09-09 21:04:01.495
cmfd1g7o700rl9we4v9pa7dtt	game2	player_14	Let's meet back here in an hour	f	\N	\N	2025-09-07 19:06:33.443	2025-09-09 21:04:01.495
cmfd1g7o700rn9we49z60su3l	game2	cmfd1g7fd001p9we4faowsm7v	Should we split up to cover more ground?	f	\N	\N	2025-09-06 23:04:16.909	2025-09-09 21:04:01.495
cmfd1g7o700rp9we4pzyll1kz	game2	player_16	Good idea! I'll take the north side	f	\N	\N	2025-09-09 02:19:32.179	2025-09-09 21:04:01.496
cmfd1g7o800rr9we4eyx2zmal	game2	cmfd1g7fe001s9we40xamhqjt	I'll cover the athletic buildings	f	\N	\N	2025-09-08 18:37:00.06	2025-09-09 21:04:01.496
cmfd1g7o800rt9we46z6ntfeo	game2	cmfd1g7fk00269we4roz15cia	Let's meet back here in an hour	f	\N	\N	2025-09-09 17:41:22.135	2025-09-09 21:04:01.496
cmfd1g7o800rv9we45pgxwh60	game2	cmfd1g7fq002j9we4a3mbk43l	Don't forget to share your findings!	f	\N	\N	2025-09-09 01:17:18.164	2025-09-09 21:04:01.497
cmfd1g7o900rx9we4i88usshk	game2	player_10	This campus is huge! So many places to explore	f	\N	\N	2025-09-09 20:37:16.96	2025-09-09 21:04:01.497
cmfd1g7o900rz9we4bjugct3q	game2	cmfd1g7fb001m9we4kptyb7zx	I never knew about half these locations	f	\N	\N	2025-09-08 18:16:14.548	2025-09-09 21:04:01.497
cmfd1g7o900s19we4dr7kbbky	game2	cmfd1g7f7001f9we4ldetuaz2	The historical facts in the clues are really interesting	f	\N	\N	2025-09-08 05:24:24.698	2025-09-09 21:04:01.498
cmfd1g7oa00s39we4cvf3qfpd	game2	cmfd1g7fb001l9we4wiyyzv98	Learning so much about the area through this game	f	\N	\N	2025-09-07 10:41:33.028	2025-09-09 21:04:01.498
cmfd1g7oa00s59we4qo40wqcx	game2	cmfd1g7fd001p9we4faowsm7v	Should we split up to cover more ground?	f	\N	\N	2025-09-09 04:17:39.201	2025-09-09 21:04:01.498
cmfd1g7oa00s79we46te3p7j2	game2	player_14	Good idea! I'll take the north side	f	\N	\N	2025-09-09 08:46:49.25	2025-09-09 21:04:01.499
cmfd1g7oa00s99we4olznlj6c	game2	player_10	I'll cover the athletic buildings	f	\N	\N	2025-09-09 18:12:53.53	2025-09-09 21:04:01.499
cmfd1g7ob00sb9we4q9j2v1i5	game2	cmfd1g7fb001m9we4kptyb7zx	Has anyone found the clue near the library yet?	f	\N	\N	2025-09-09 10:03:09.383	2025-09-09 21:04:01.499
cmfd1g7ob00sd9we4ryk3wxxa	game2	cmfd1g7fd001p9we4faowsm7v	I'm stuck on the one about the bronze statue. Any hints?	f	\N	\N	2025-09-09 14:25:08.241	2025-09-09 21:04:01.499
cmfd1g7ob00sf9we4723t7ymg	game2	cmfd1g7fd001q9we4jd5qwrf7	Check the west side of the building!	f	\N	\N	2025-09-08 19:34:39.689	2025-09-09 21:04:01.5
cmfd1g7oc00sh9we4v6vr7w9g	game2	player_17	Thanks! That helped a lot!	f	\N	\N	2025-09-08 10:27:30.54	2025-09-09 21:04:01.5
cmfd1g7oc00sj9we4bpysno5b	game2	cmfd1g7fn002b9we4zhmqh7z5	The GPS verification is tricky on this one	f	\N	\N	2025-09-07 20:51:05.282	2025-09-09 21:04:01.5
cmfd1g7oc00sl9we4enafn4fo	game1	cmfd1g7fi00219we438was4wo	Should we split up to cover more ground?	f	\N	\N	2025-09-07 16:46:46.681	2025-09-09 21:04:01.501
cmfd1g7oc00sn9we4oj6u2hdn	game1	player_10	Good idea! I'll take the north side	f	\N	\N	2025-09-08 14:51:57.576	2025-09-09 21:04:01.501
cmfd1g7od00sp9we4qmyykyc0	game1	cmfd1g7fk00249we4z4fi7drx	I'll cover the athletic buildings	f	\N	\N	2025-09-06 22:46:19.13	2025-09-09 21:04:01.501
cmfd1g7od00sr9we4h9sv6xs1	game1	cmfd1g7f8001h9we4xl87qe5x	Let's meet back here in an hour	f	\N	\N	2025-09-09 09:51:28.715	2025-09-09 21:04:01.502
cmfd1g7od00st9we4r46gs02d	game1	cmfd1g7fj00239we4994zi1hy	Don't forget to share your findings!	f	\N	\N	2025-09-09 19:38:09.094	2025-09-09 21:04:01.502
cmfd1g7oe00sv9we4on3sm4rc	game1	cmfd1g7f6001e9we4i0t0bcaq	Has anyone found the clue near the library yet?	f	\N	\N	2025-09-08 18:02:51.01	2025-09-09 21:04:01.502
cmfd1g7oe00sx9we4h1jdjxs2	game1	cmfd1g7fr002k9we4373hx6bo	I'm stuck on the one about the bronze statue. Any hints?	f	\N	\N	2025-09-08 20:10:24.26	2025-09-09 21:04:01.502
cmfd1g7oe00sz9we49cdeg27e	game1	cmfd1g7f8001h9we4xl87qe5x	Check the west side of the building!	f	\N	\N	2025-09-09 04:21:07.307	2025-09-09 21:04:01.503
cmfd1g7of00t19we4pgxqkjzn	game1	cmfd1g7fi00219we438was4wo	Thanks! That helped a lot!	f	\N	\N	2025-09-07 09:09:46.523	2025-09-09 21:04:01.503
cmfd1g7of00t39we43mx4qxjx	game1	cmfd1g7fk00269we4roz15cia	The GPS verification is tricky on this one	f	\N	\N	2025-09-07 04:43:38.308	2025-09-09 21:04:01.503
cmfd1g7of00t59we49d73ebft	game1	cmfd1g7f5001c9we4sn9qrszs	Has anyone found the clue near the library yet?	f	\N	\N	2025-09-07 10:17:34.156	2025-09-09 21:04:01.504
cmfd1g7of00t79we4mvobg0vi	game1	cmfd1g7fj00239we4994zi1hy	I'm stuck on the one about the bronze statue. Any hints?	f	\N	\N	2025-09-08 16:21:44.524	2025-09-09 21:04:01.504
cmfd1g7og00t99we4ynt158ah	game1	player2	Check the west side of the building!	f	\N	\N	2025-09-09 15:11:35.228	2025-09-09 21:04:01.504
cmfd1g7og00tb9we451zbbg5y	game1	cmfd1g7fc001o9we4cwszx3ev	Has anyone found the clue near the library yet?	f	\N	\N	2025-09-06 22:06:46.492	2025-09-09 21:04:01.504
cmfd1g7oh00td9we4btys4lt6	game1	cmfd1g7fi00209we4hcbjnaxr	I'm stuck on the one about the bronze statue. Any hints?	f	\N	\N	2025-09-07 19:47:21.162	2025-09-09 21:04:01.505
cmfd1g7oh00tf9we4oaboid5x	game1	cmfd1g7fi00219we438was4wo	Has anyone found the clue near the library yet?	f	\N	\N	2025-09-09 01:22:59.708	2025-09-09 21:04:01.505
cmfd1g7oh00th9we4xorsp5lk	game1	cmfd1g7f6001d9we4b7mn55ov	I'm stuck on the one about the bronze statue. Any hints?	f	\N	\N	2025-09-07 02:08:24.505	2025-09-09 21:04:01.506
cmfd1g7oi00tj9we44aoxwyy6	game1	player_11	Check the west side of the building!	f	\N	\N	2025-09-07 14:31:04.666	2025-09-09 21:04:01.506
cmfd1g7oi00tl9we4eql9c012	game1	player_19	Thanks! That helped a lot!	f	\N	\N	2025-09-08 07:21:01.741	2025-09-09 21:04:01.506
\.


--
-- Data for Name: ClueFinding; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."ClueFinding" (id, "userId", "foundAt", points, "createdAt", "gameClueId", "gpsLatitude", "gpsLongitude", "selfiePhoto", "shareFind", "sharePhoto") FROM stdin;
cmfd1g7gr006l9we46skim485	cmfd1g7fh001y9we4zqnwaqtk	2025-09-06 15:49:21.819	100	2025-09-09 21:04:01.228	gameclue2_11	40.76143897553851	-73.97756809221035	selfie_cmfd1g7fh001y9we4zqnwaqtk_gameclue2_11.jpg	t	f
cmfd1g7gt006n9we4zyindrtm	cmfd1g7fh001y9we4zqnwaqtk	2025-09-06 01:27:06.813	100	2025-09-09 21:04:01.23	gameclue2_12	40.76478176912764	-73.98081005141425	\N	f	f
cmfd1g7gu006p9we40asnz3j6	cmfd1g7fh001y9we4zqnwaqtk	2025-09-03 13:17:07.515	100	2025-09-09 21:04:01.23	gameclue2_13	40.75995888090598	-73.97986475848255	selfie_cmfd1g7fh001y9we4zqnwaqtk_gameclue2_13.jpg	f	f
cmfd1g7gv006r9we4d4g7piu8	cmfd1g7fh001y9we4zqnwaqtk	2025-09-05 20:49:35.361	100	2025-09-09 21:04:01.231	gameclue2_20	40.66022135256305	-73.96900537825655	\N	f	f
cmfd1g7gv006t9we4g3ncb68b	player1	2025-09-04 06:03:28.049	100	2025-09-09 21:04:01.232	gameclue2_15	40.70811683213801	-74.01214499480189	\N	f	f
cmfd1g7gw006v9we4dp7lrq04	player1	2025-09-09 14:39:18.44	100	2025-09-09 21:04:01.232	gameclue2_20	40.66020865512154	-73.96896401992404	selfie_player1_gameclue2_20.jpg	f	t
cmfd1g7gx006x9we41ummatoe	player1	2025-09-03 06:52:20.044	100	2025-09-09 21:04:01.233	gameclue2_13	40.75997799883771	-73.9799429877952	selfie_player1_gameclue2_13.jpg	f	t
cmfd1g7gy006z9we4lqjrkl8e	player1	2025-09-08 19:57:53.93	100	2025-09-09 21:04:01.234	gameclue2_17	40.70548677093243	-74.01344393319336	selfie_player1_gameclue2_17.jpg	t	f
cmfd1g7gy00719we4tqb5iiyr	player1	2025-09-03 09:30:34	100	2025-09-09 21:04:01.235	gameclue2_12	40.7647630476682	-73.98078585546449	selfie_player1_gameclue2_12.jpg	f	f
cmfd1g7gz00739we4z6v8xbhj	player1	2025-09-05 02:35:04.365	100	2025-09-09 21:04:01.236	gameclue2_19	40.67116963846439	-73.96378796179066	selfie_player1_gameclue2_19.jpg	f	f
cmfd1g7h000759we4s1ral568	player_17	2025-09-04 14:04:07.626	100	2025-09-09 21:04:01.236	gameclue2_13	40.75997728074135	-73.97987010888613	selfie_player_17_gameclue2_13.jpg	t	f
cmfd1g7h100779we4b6wmz531	player_17	2025-09-08 11:36:05.455	100	2025-09-09 21:04:01.237	gameclue2_12	40.76483256250165	-73.98076514616255	\N	f	t
cmfd1g7h100799we4qrvdrf6w	player_17	2025-09-06 02:17:15.881	100	2025-09-09 21:04:01.238	gameclue2_14	40.7127023878262	-74.01336871851213	\N	t	f
cmfd1g7h2007b9we40i44i8mw	player_17	2025-09-05 19:02:57.042	100	2025-09-09 21:04:01.238	gameclue2_20	40.66021151815485	-73.96901563592847	selfie_player_17_gameclue2_20.jpg	f	f
cmfd1g7h3007d9we4ecmf8g8b	player_17	2025-09-09 07:14:35.073	100	2025-09-09 21:04:01.239	gameclue2_11	40.7614192534754	-73.97760886209844	selfie_player_17_gameclue2_11.jpg	f	f
cmfd1g7h3007f9we4hhba3t1c	player_17	2025-09-05 09:13:08.908	100	2025-09-09 21:04:01.24	gameclue2_17	40.70545902280188	-74.01341803552714	\N	f	f
cmfd1g7h4007h9we4dfvo3b52	player_14	2025-09-08 11:05:41.437	100	2025-09-09 21:04:01.24	gameclue2_14	40.7127127719433	-74.01343169081593	\N	f	t
cmfd1g7h5007j9we4fzwzo3h2	player_14	2025-09-05 01:24:41.605	100	2025-09-09 21:04:01.241	gameclue2_13	40.75998371829456	-73.9798841945314	selfie_player_14_gameclue2_13.jpg	f	f
cmfd1g7h5007l9we4z9f8yh8e	player_14	2025-09-05 22:10:47.746	100	2025-09-09 21:04:01.242	gameclue2_11	40.76144893270156	-73.97757268277962	selfie_player_14_gameclue2_11.jpg	t	f
cmfd1g7h6007n9we4fg5z3z7v	player_14	2025-09-04 20:54:25.904	100	2025-09-09 21:04:01.242	gameclue2_15	40.70807041379505	-74.0121028819816	selfie_player_14_gameclue2_15.jpg	f	f
cmfd1g7h7007p9we45xifh95r	player_14	2025-09-08 18:43:15.756	100	2025-09-09 21:04:01.243	gameclue2_18	40.70743808217233	-74.0032536566421	selfie_player_14_gameclue2_18.jpg	f	f
cmfd1g7h7007r9we4fc65s6lf	player_14	2025-09-02 21:58:31.225	100	2025-09-09 21:04:01.244	gameclue2_17	40.70553930069771	-74.01343617155628	selfie_player_14_gameclue2_17.jpg	f	f
cmfd1g7h8007t9we4ttskmlpi	player_14	2025-09-07 20:23:27.693	100	2025-09-09 21:04:01.244	gameclue2_16	40.70738928800811	-74.01048840827906	\N	t	f
cmfd1g7h8007v9we41tvkdzef	player_14	2025-09-06 18:28:43.155	100	2025-09-09 21:04:01.245	gameclue2_20	40.66020318223116	-73.9690026319178	\N	f	f
cmfd1g7h9007x9we4krddiere	player_14	2025-09-04 21:30:08.868	100	2025-09-09 21:04:01.246	gameclue2_19	40.67116683852898	-73.96378508840816	selfie_player_14_gameclue2_19.jpg	f	f
cmfd1g7ha007z9we436w48j98	cmfd1g7fb001m9we4kptyb7zx	2025-09-08 14:03:20.256	100	2025-09-09 21:04:01.246	gameclue2_15	40.70813584762013	-74.01214412618901	\N	f	f
cmfd1g7ha00819we4a78l2m7i	cmfd1g7fb001m9we4kptyb7zx	2025-09-07 10:11:39.833	100	2025-09-09 21:04:01.247	gameclue2_11	40.76136119951101	-73.9776256020182	\N	f	f
cmfd1g7hb00839we46up0bff3	cmfd1g7fb001m9we4kptyb7zx	2025-09-07 10:44:23.108	100	2025-09-09 21:04:01.247	gameclue2_17	40.70551097892064	-74.01338997512627	selfie_cmfd1g7fb001m9we4kptyb7zx_gameclue2_17.jpg	t	f
cmfd1g7hc00859we4jneo2x6g	cmfd1g7fb001m9we4kptyb7zx	2025-09-06 08:10:20.044	100	2025-09-09 21:04:01.248	gameclue2_18	40.70738527588215	-74.00334486080335	\N	t	f
cmfd1g7hc00879we44n07gq98	cmfd1g7fb001m9we4kptyb7zx	2025-09-06 17:44:21.543	100	2025-09-09 21:04:01.249	gameclue2_20	40.66023328976848	-73.96896502621705	selfie_cmfd1g7fb001m9we4kptyb7zx_gameclue2_20.jpg	f	t
cmfd1g7hd00899we4hpvcpj6a	cmfd1g7fb001m9we4kptyb7zx	2025-09-04 02:39:41.905	100	2025-09-09 21:04:01.25	gameclue2_19	40.67117442614521	-73.9638335551572	\N	f	f
cmfd1g7hf008b9we4pce5fmu6	cmfd1g7fb001m9we4kptyb7zx	2025-09-03 08:36:32.097	100	2025-09-09 21:04:01.252	gameclue2_16	40.707361764198	-74.0105064720316	\N	f	f
cmfd1g7hg008d9we4wy8v21f3	cmfd1g7fb001m9we4kptyb7zx	2025-09-07 23:12:30.347	100	2025-09-09 21:04:01.253	gameclue2_13	40.75999883984989	-73.97985156236368	selfie_cmfd1g7fb001m9we4kptyb7zx_gameclue2_13.jpg	f	t
cmfd1g7hh008f9we4nz7lgvkl	cmfd1g7fb001m9we4kptyb7zx	2025-09-07 01:56:05.796	100	2025-09-09 21:04:01.253	gameclue2_12	40.76484567807159	-73.98081144675223	\N	f	f
cmfd1g7hi008h9we4mth1kire	player2	2025-09-08 08:44:19.947	100	2025-09-09 21:04:01.254	gameclue2_14	40.71273593352781	-74.0133959791246	\N	t	f
cmfd1g7hj008j9we474z2xqad	player2	2025-09-09 13:18:12.141	100	2025-09-09 21:04:01.255	gameclue2_13	40.76001992778487	-73.97987331710756	selfie_player2_gameclue2_13.jpg	f	t
cmfd1g7hj008l9we4qkiww5w5	player2	2025-09-04 10:35:14.111	100	2025-09-09 21:04:01.256	gameclue2_15	40.70805687663417	-74.01211015474944	\N	t	f
cmfd1g7hk008n9we4dihdt9x0	player2	2025-09-04 20:50:06.415	100	2025-09-09 21:04:01.257	gameclue2_19	40.67122174884361	-73.96376796770527	\N	t	f
cmfd1g7hl008p9we4lomga22e	player2	2025-09-09 05:04:01.419	100	2025-09-09 21:04:01.257	gameclue2_20	40.66021413578041	-73.969041800284	\N	f	f
cmfd1g7hm008r9we4iravpdwi	cmfd1g7fe001s9we40xamhqjt	2025-09-09 17:58:47.317	100	2025-09-09 21:04:01.258	gameclue2_14	40.71272050704166	-74.0133561989802	\N	t	f
cmfd1g7hm008t9we4rkev3zb4	cmfd1g7fe001s9we40xamhqjt	2025-09-03 23:09:28.608	100	2025-09-09 21:04:01.259	gameclue2_11	40.76142804959819	-73.97757937325873	selfie_cmfd1g7fe001s9we40xamhqjt_gameclue2_11.jpg	f	f
cmfd1g7hn008v9we4ngi1mwyx	cmfd1g7fe001s9we40xamhqjt	2025-09-06 11:52:30.271	100	2025-09-09 21:04:01.259	gameclue2_13	40.75998741773135	-73.97987239190036	\N	f	f
cmfd1g7ho008x9we417lwbmdb	cmfd1g7fd001q9we4jd5qwrf7	2025-09-04 11:02:47.711	100	2025-09-09 21:04:01.261	gameclue2_16	40.70735794523932	-74.01051462079707	\N	t	t
cmfd1g7hp008z9we4s7321pq5	cmfd1g7fd001q9we4jd5qwrf7	2025-09-06 13:30:04.71	100	2025-09-09 21:04:01.262	gameclue2_13	40.75996638397142	-73.97989390944986	selfie_cmfd1g7fd001q9we4jd5qwrf7_gameclue2_13.jpg	f	t
cmfd1g7hq00919we4z4wio4dx	cmfd1g7fe001r9we4lqdek9a3	2025-09-03 23:13:46.007	100	2025-09-09 21:04:01.263	gameclue2_11	40.76144066023687	-73.97756133002754	\N	t	f
cmfd1g7hr00939we4227yv86n	cmfd1g7fe001r9we4lqdek9a3	2025-09-03 02:32:48.824	100	2025-09-09 21:04:01.264	gameclue2_15	40.70807751245787	-74.01205482203449	selfie_cmfd1g7fe001r9we4lqdek9a3_gameclue2_15.jpg	f	t
cmfd1g7hs00959we4ogvinrau	cmfd1g7fe001r9we4lqdek9a3	2025-09-06 10:34:21.944	100	2025-09-09 21:04:01.264	gameclue2_16	40.70741846598053	-74.01052018299005	\N	f	t
cmfd1g7ht00979we4w0axcsvg	cmfd1g7f5001b9we4nnn2tc8d	2025-09-08 20:27:34.512	100	2025-09-09 21:04:01.265	gameclue2_18	40.70738598519088	-74.00326177200336	\N	f	f
cmfd1g7ht00999we4noorzm7n	cmfd1g7f5001b9we4nnn2tc8d	2025-09-06 19:09:14.183	100	2025-09-09 21:04:01.266	gameclue2_20	40.66022539913018	-73.96900868537958	\N	f	f
cmfd1g7hu009b9we4m2vt17om	cmfd1g7f5001b9we4nnn2tc8d	2025-09-08 15:07:04.211	100	2025-09-09 21:04:01.267	gameclue2_11	40.76135967474467	-73.97757840434465	selfie_cmfd1g7f5001b9we4nnn2tc8d_gameclue2_11.jpg	t	t
cmfd1g7hv009d9we4faqivex1	cmfd1g7fm002a9we4gdks3s55	2025-09-06 02:24:05.833	100	2025-09-09 21:04:01.267	gameclue2_15	40.70808343335985	-74.01208485281248	\N	t	f
cmfd1g7hv009f9we4zsrvjdk2	cmfd1g7fm002a9we4gdks3s55	2025-09-07 17:12:57.43	100	2025-09-09 21:04:01.268	gameclue2_18	40.7074179094273	-74.00334949052153	\N	f	f
cmfd1g7hw009h9we4a7isujtk	cmfd1g7fm002a9we4gdks3s55	2025-09-07 00:41:39.065	100	2025-09-09 21:04:01.269	gameclue2_20	40.66015470939261	-73.96901151802383	\N	t	t
cmfd1g7hx009j9we4eoyzjo46	cmfd1g7fm002a9we4gdks3s55	2025-09-03 17:09:09.343	100	2025-09-09 21:04:01.269	gameclue2_16	40.70739077092176	-74.01045968257303	\N	t	f
cmfd1g7hx009l9we4qd5egsst	cmfd1g7fm002a9we4gdks3s55	2025-09-04 23:10:54.99	100	2025-09-09 21:04:01.27	gameclue2_11	40.76137202026645	-73.97755126067223	\N	f	t
cmfd1g7hy009n9we4wqwbpbkx	cmfd1g7fl00289we4orc3zbyd	2025-09-03 14:35:53.547	100	2025-09-09 21:04:01.27	gameclue2_17	40.70551049440554	-74.01344004217096	selfie_cmfd1g7fl00289we4orc3zbyd_gameclue2_17.jpg	t	t
cmfd1g7hz009p9we4i4b5qd5q	cmfd1g7fl00289we4orc3zbyd	2025-09-09 09:04:06.64	100	2025-09-09 21:04:01.271	gameclue2_19	40.67117730498875	-73.96381335520758	\N	f	f
cmfd1g7hz009r9we4oibylvq5	cmfd1g7fl00289we4orc3zbyd	2025-09-08 10:02:56.356	100	2025-09-09 21:04:01.272	gameclue2_13	40.75996248362723	-73.97989627539496	\N	t	t
cmfd1g7i0009t9we4yzyu7nsl	cmfd1g7fl00289we4orc3zbyd	2025-09-04 07:44:22.774	100	2025-09-09 21:04:01.272	gameclue2_15	40.70813632793458	-74.01211331060286	\N	f	f
cmfd1g7i0009v9we4hr48lzu4	player_21	2025-09-09 08:53:47.808	100	2025-09-09 21:04:01.273	gameclue2_20	40.66015058190811	-73.96901071076532	selfie_player_21_gameclue2_20.jpg	t	t
cmfd1g7i1009x9we4hw3wl6a2	player_21	2025-09-09 09:01:43.477	100	2025-09-09 21:04:01.273	gameclue2_18	40.70739331583505	-74.00325370028564	selfie_player_21_gameclue2_18.jpg	t	f
cmfd1g7i1009z9we4uv9b405m	player_21	2025-09-06 18:49:56.369	100	2025-09-09 21:04:01.274	gameclue2_11	40.76143833058595	-73.97760244576288	\N	t	f
cmfd1g7i200a19we45k7nco6t	player_21	2025-09-05 17:02:56.86	100	2025-09-09 21:04:01.274	gameclue2_15	40.70809992911188	-74.01207308644308	\N	f	t
cmfd1g7i200a39we4mazmigvh	player_21	2025-09-06 12:59:55.637	100	2025-09-09 21:04:01.275	gameclue2_17	40.70551475918052	-74.01342322235736	\N	f	f
cmfd1g7i300a59we4fziumef0	player_21	2025-09-05 06:40:25.667	100	2025-09-09 21:04:01.275	gameclue2_19	40.6711617887063	-73.96376953717872	\N	f	f
cmfd1g7i300a79we4vzee7o0j	cmfd1g7fg001v9we4iq5yn0f4	2025-09-03 09:44:13.175	100	2025-09-09 21:04:01.276	gameclue2_20	40.6601892604277	-73.96904885183795	selfie_cmfd1g7fg001v9we4iq5yn0f4_gameclue2_20.jpg	f	f
cmfd1g7i400a99we4xpo7a3r4	cmfd1g7fg001v9we4iq5yn0f4	2025-09-08 16:32:26.846	100	2025-09-09 21:04:01.276	gameclue2_18	40.70739101367769	-74.00325436579656	selfie_cmfd1g7fg001v9we4iq5yn0f4_gameclue2_18.jpg	f	f
cmfd1g7i400ab9we4flqcupgb	cmfd1g7fg001v9we4iq5yn0f4	2025-09-06 00:02:38.531	100	2025-09-09 21:04:01.277	gameclue2_19	40.67120221515508	-73.96375994968078	selfie_cmfd1g7fg001v9we4iq5yn0f4_gameclue2_19.jpg	t	f
cmfd1g7i500ad9we4enlkbxhx	cmfd1g7fg001v9we4iq5yn0f4	2025-09-08 03:32:40.23	100	2025-09-09 21:04:01.277	gameclue2_17	40.70546775524092	-74.0133641073408	\N	t	t
cmfd1g7i600af9we4q5ty3cat	cmfd1g7fl00279we4ptzl63t0	2025-09-06 23:35:09.928	100	2025-09-09 21:04:01.278	gameclue2_16	40.70742152613619	-74.01048992480406	\N	f	t
cmfd1g7i600ah9we45ou0omc3	cmfd1g7fl00279we4ptzl63t0	2025-09-09 01:35:58.949	100	2025-09-09 21:04:01.279	gameclue2_19	40.67119698514892	-73.96376700268063	\N	f	t
cmfd1g7i700aj9we41hbcimvi	cmfd1g7fl00279we4ptzl63t0	2025-09-06 22:21:11.118	100	2025-09-09 21:04:01.279	gameclue2_18	40.70737176080888	-74.00325779233248	\N	f	f
cmfd1g7i700al9we4oszom97k	cmfd1g7fl00279we4ptzl63t0	2025-09-09 17:11:19.197	100	2025-09-09 21:04:01.28	gameclue2_13	40.76000664207165	-73.97991307919453	\N	f	f
cmfd1g7i800an9we4cd6m9cfi	cmfd1g7fl00279we4ptzl63t0	2025-09-04 10:20:39.211	100	2025-09-09 21:04:01.28	gameclue2_11	40.76142006492743	-73.97757436792295	\N	t	f
cmfd1g7i800ap9we4gng5ysyw	cmfd1g7fl00279we4ptzl63t0	2025-09-04 17:19:02.409	100	2025-09-09 21:04:01.281	gameclue2_17	40.70546604093765	-74.01341063421319	\N	f	f
cmfd1g7i900ar9we42s7n905j	cmfd1g7fl00279we4ptzl63t0	2025-09-05 07:45:06.198	100	2025-09-09 21:04:01.281	gameclue2_20	40.6602217303323	-73.96903214992105	\N	f	f
cmfd1g7ia00at9we4jp1gymrg	cmfd1g7fl00279we4ptzl63t0	2025-09-03 17:52:34.624	100	2025-09-09 21:04:01.282	gameclue2_14	40.71268424882012	-74.01343099230819	\N	f	f
cmfd1g7ia00av9we472fhbyih	cmfd1g7fl00279we4ptzl63t0	2025-09-08 00:54:27.86	100	2025-09-09 21:04:01.283	gameclue2_15	40.70811473067284	-74.01210072569569	selfie_cmfd1g7fl00279we4ptzl63t0_gameclue2_15.jpg	f	t
cmfd1g7ib00ax9we4adq8e49c	cmfd1g7fn002c9we45gooto2o	2025-09-08 23:41:02.568	100	2025-09-09 21:04:01.283	gameclue2_15	40.70808300517433	-74.01213209324297	\N	f	f
cmfd1g7ib00az9we4694zswfs	cmfd1g7fn002c9we45gooto2o	2025-09-03 03:25:22.898	100	2025-09-09 21:04:01.284	gameclue2_18	40.70738889812873	-74.00329107012945	selfie_cmfd1g7fn002c9we45gooto2o_gameclue2_18.jpg	f	f
cmfd1g7ic00b19we4s38wvuvz	cmfd1g7fn002c9we45gooto2o	2025-09-08 17:16:48.655	100	2025-09-09 21:04:01.285	gameclue2_14	40.71269325165522	-74.0133977874027	\N	t	f
cmfd1g7id00b39we4hlv8cpv7	cmfd1g7fn002c9we45gooto2o	2025-09-08 16:05:21.977	100	2025-09-09 21:04:01.285	gameclue2_13	40.76001849323278	-73.97985568375046	\N	f	f
cmfd1g7id00b59we45ov3bgdj	cmfd1g7fn002c9we45gooto2o	2025-09-05 11:44:36.568	100	2025-09-09 21:04:01.286	gameclue2_16	40.70738137929571	-74.01054737185859	selfie_cmfd1g7fn002c9we45gooto2o_gameclue2_16.jpg	f	f
cmfd1g7ie00b79we4ftl046sv	cmfd1g7fn002c9we45gooto2o	2025-09-08 19:22:30.54	100	2025-09-09 21:04:01.286	gameclue2_19	40.67117200061372	-73.96384856192938	\N	f	t
cmfd1g7ie00b99we4nwg8y34s	cmfd1g7fn002c9we45gooto2o	2025-09-04 22:15:49.03	100	2025-09-09 21:04:01.287	gameclue2_20	40.66023714511551	-73.96904295375448	\N	f	f
cmfd1g7if00bb9we4iwxuy3ct	cmfd1g7fn002c9we45gooto2o	2025-09-04 14:03:45.422	100	2025-09-09 21:04:01.287	gameclue2_12	40.76481320336469	-73.98084674994813	\N	f	f
cmfd1g7ig00bd9we4wsxdserb	cmfd1g7fq002j9we4a3mbk43l	2025-09-09 01:23:37.923	100	2025-09-09 21:04:01.288	gameclue2_12	40.76476961215592	-73.98077237417772	\N	f	f
cmfd1g7ig00bf9we4jh20xnvr	cmfd1g7fb001l9we4wiyyzv98	2025-09-03 07:26:04.402	100	2025-09-09 21:04:01.289	gameclue2_20	40.66020981503873	-73.968960764697	\N	f	f
cmfd1g7ih00bh9we4fyhdz8s4	cmfd1g7fb001l9we4wiyyzv98	2025-09-09 02:39:51.502	100	2025-09-09 21:04:01.289	gameclue2_19	40.67117022872355	-73.96379801937012	selfie_cmfd1g7fb001l9we4wiyyzv98_gameclue2_19.jpg	t	t
cmfd1g7ih00bj9we4q2jjxix8	cmfd1g7fb001l9we4wiyyzv98	2025-09-07 04:38:21.013	100	2025-09-09 21:04:01.29	gameclue2_16	40.70743705073819	-74.01048454762224	\N	f	f
cmfd1g7ii00bl9we4xsu5yqxh	cmfd1g7fb001l9we4wiyyzv98	2025-09-08 02:47:52.209	100	2025-09-09 21:04:01.29	gameclue2_11	40.76137846975938	-73.97756880183344	\N	f	f
cmfd1g7ij00bn9we4l2h9aqir	cmfd1g7fh001z9we44cn4y9fv	2025-09-05 00:15:45.34	100	2025-09-09 21:04:01.291	gameclue2_13	40.76002770279362	-73.97990628661171	\N	f	t
cmfd1g7ij00bp9we4i92wrbbk	cmfd1g7fh001z9we44cn4y9fv	2025-09-07 14:40:56.647	100	2025-09-09 21:04:01.292	gameclue2_17	40.70549246229206	-74.01343409590768	selfie_cmfd1g7fh001z9we44cn4y9fv_gameclue2_17.jpg	f	f
cmfd1g7ik00br9we4ytvon13d	cmfd1g7fh001z9we44cn4y9fv	2025-09-03 07:55:01.64	100	2025-09-09 21:04:01.292	gameclue2_20	40.66015233202176	-73.9689928902415	selfie_cmfd1g7fh001z9we44cn4y9fv_gameclue2_20.jpg	f	f
cmfd1g7ik00bt9we4tsh9hoq9	cmfd1g7fh001z9we44cn4y9fv	2025-09-08 08:34:31.419	100	2025-09-09 21:04:01.293	gameclue2_12	40.76476794012491	-73.98080899936359	\N	t	t
cmfd1g7il00bv9we4ub6949qe	cmfd1g7fh001z9we44cn4y9fv	2025-09-07 23:52:50.297	100	2025-09-09 21:04:01.293	gameclue2_15	40.70811824991059	-74.01213247708428	selfie_cmfd1g7fh001z9we44cn4y9fv_gameclue2_15.jpg	f	f
cmfd1g7im00bx9we4kkms5jeh	cmfd1g7fh001z9we44cn4y9fv	2025-09-06 12:01:37.031	100	2025-09-09 21:04:01.294	gameclue2_19	40.67118430233776	-73.9638294896465	\N	f	f
cmfd1g7im00bz9we4x0yx6c89	cmfd1g7fh001z9we44cn4y9fv	2025-09-08 21:03:04.152	100	2025-09-09 21:04:01.295	gameclue2_11	40.76142173791594	-73.97760814423971	\N	f	f
cmfd1g7in00c19we4xj5frja2	cmfd1g7fh001z9we44cn4y9fv	2025-09-04 14:25:14.633	100	2025-09-09 21:04:01.295	gameclue2_18	40.70737316086412	-74.00329456760203	\N	f	f
cmfd1g7in00c39we4y8xsmvmw	cmfd1g7fc001n9we4kxoirq3o	2025-09-04 01:13:22.094	100	2025-09-09 21:04:01.296	gameclue2_11	40.76135512031412	-73.97760779939514	selfie_cmfd1g7fc001n9we4kxoirq3o_gameclue2_11.jpg	f	f
cmfd1g7io00c59we4eamt0sqh	cmfd1g7fc001n9we4kxoirq3o	2025-09-07 06:37:48.054	100	2025-09-09 21:04:01.296	gameclue2_13	40.75995505960737	-73.97993933749484	selfie_cmfd1g7fc001n9we4kxoirq3o_gameclue2_13.jpg	t	f
cmfd1g7io00c79we4hwgrx2cd	cmfd1g7fc001n9we4kxoirq3o	2025-09-08 23:16:08.53	100	2025-09-09 21:04:01.297	gameclue2_12	40.76484337459314	-73.98084672376251	\N	f	f
cmfd1g7ip00c99we49uzk57vw	cmfd1g7fc001n9we4kxoirq3o	2025-09-03 05:14:21.213	100	2025-09-09 21:04:01.298	gameclue2_19	40.67120070662035	-73.96381189050966	selfie_cmfd1g7fc001n9we4kxoirq3o_gameclue2_19.jpg	f	f
cmfd1g7iq00cb9we4jc90btql	cmfd1g7fc001n9we4kxoirq3o	2025-09-03 13:23:21.039	100	2025-09-09 21:04:01.298	gameclue2_15	40.70813232652311	-74.01211353394407	selfie_cmfd1g7fc001n9we4kxoirq3o_gameclue2_15.jpg	t	f
cmfd1g7iq00cd9we4ixien0i4	cmfd1g7fr002l9we46vt8jg6q	2025-09-05 23:47:15.211	100	2025-09-09 21:04:01.299	gameclue2_15	40.70813094917404	-74.01208018183826	\N	f	f
cmfd1g7ir00cf9we4vp8j1c17	cmfd1g7fr002l9we46vt8jg6q	2025-09-06 20:29:08.841	100	2025-09-09 21:04:01.299	gameclue2_11	40.76137217156419	-73.97756249147248	selfie_cmfd1g7fr002l9we46vt8jg6q_gameclue2_11.jpg	f	t
cmfd1g7ir00ch9we4uqoib6fl	cmfd1g7fr002l9we46vt8jg6q	2025-09-04 19:23:00.812	100	2025-09-09 21:04:01.3	gameclue2_20	40.66019379455763	-73.96900039112118	\N	f	t
cmfd1g7is00cj9we4r96jxaoc	cmfd1g7fr002l9we46vt8jg6q	2025-09-08 05:46:17.28	100	2025-09-09 21:04:01.301	gameclue2_18	40.70739567410038	-74.00331440645947	\N	f	f
cmfd1g7it00cl9we4wwqpca51	cmfd1g7fr002l9we46vt8jg6q	2025-09-09 13:01:42.772	100	2025-09-09 21:04:01.301	gameclue2_16	40.70739877700952	-74.01054752509289	selfie_cmfd1g7fr002l9we46vt8jg6q_gameclue2_16.jpg	f	t
cmfd1g7it00cn9we4pibs8ac4	cmfd1g7fr002l9we46vt8jg6q	2025-09-07 21:03:34.728	100	2025-09-09 21:04:01.302	gameclue2_13	40.76004343003115	-73.97994340050276	\N	f	f
cmfd1g7iu00cp9we4lwzbbo4z	player_16	2025-09-03 02:40:02.349	100	2025-09-09 21:04:01.302	gameclue2_18	40.70738063137168	-74.00328585089208	\N	f	t
cmfd1g7iu00cr9we42raqgoo9	player_16	2025-09-05 23:13:35.708	100	2025-09-09 21:04:01.303	gameclue2_20	40.66019877367516	-73.96903347424707	selfie_player_16_gameclue2_20.jpg	f	t
cmfd1g7iv00ct9we46l5v51oi	player_16	2025-09-06 02:10:00.327	100	2025-09-09 21:04:01.304	gameclue2_19	40.67115018389757	-73.96382634511357	\N	f	f
cmfd1g7iw00cv9we4k0051ts3	player_16	2025-09-05 08:27:17.54	100	2025-09-09 21:04:01.304	gameclue2_17	40.70554387119981	-74.0133523013055	\N	f	f
cmfd1g7iw00cx9we4kv9dl8pp	player_16	2025-09-09 14:42:26.313	100	2025-09-09 21:04:01.305	gameclue2_12	40.76484086500612	-73.98078351683732	selfie_player_16_gameclue2_12.jpg	f	f
cmfd1g7ix00cz9we40m70cb1h	cmfd1g7f9001j9we44ui8f2av	2025-09-06 01:58:06.873	100	2025-09-09 21:04:01.305	gameclue2_18	40.70739270309087	-74.00331590060215	selfie_cmfd1g7f9001j9we44ui8f2av_gameclue2_18.jpg	f	t
cmfd1g7ix00d19we4gywwg850	cmfd1g7f9001j9we44ui8f2av	2025-09-06 02:57:19.062	100	2025-09-09 21:04:01.306	gameclue2_12	40.76476904314026	-73.98083291931667	\N	f	f
cmfd1g7iy00d39we44dhvapyw	cmfd1g7f9001j9we44ui8f2av	2025-09-03 19:44:39.269	100	2025-09-09 21:04:01.306	gameclue2_16	40.70740876284657	-74.01051158170115	selfie_cmfd1g7f9001j9we44ui8f2av_gameclue2_16.jpg	t	f
cmfd1g7iy00d59we4ur24pswm	cmfd1g7f9001j9we44ui8f2av	2025-09-07 09:24:30.684	100	2025-09-09 21:04:01.307	gameclue2_17	40.70548115604601	-74.01340679817218	selfie_cmfd1g7f9001j9we44ui8f2av_gameclue2_17.jpg	f	f
cmfd1g7iz00d79we4zrx2urvn	cmfd1g7f9001j9we44ui8f2av	2025-09-04 16:06:20.751	100	2025-09-09 21:04:01.307	gameclue2_14	40.71273550484926	-74.01340339989703	\N	f	f
cmfd1g7j000d99we4owkxshs6	cmfd1g7f9001j9we44ui8f2av	2025-09-08 08:11:16.168	100	2025-09-09 21:04:01.308	gameclue2_11	40.76140096586088	-73.97764204116999	\N	f	f
cmfd1g7j000db9we4we7xi7jz	player_18	2025-09-04 22:40:28.833	100	2025-09-09 21:04:01.309	gameclue2_15	40.70810991535259	-74.01212511449853	\N	f	f
cmfd1g7j100dd9we4lcldvupq	player_18	2025-09-09 00:52:53.599	100	2025-09-09 21:04:01.309	gameclue2_13	40.75999092197168	-73.97991511570784	selfie_player_18_gameclue2_13.jpg	f	f
cmfd1g7j100df9we4uj0w2kk0	player_18	2025-09-05 04:57:36.984	100	2025-09-09 21:04:01.31	gameclue2_17	40.70554914069794	-74.01335463634622	selfie_player_18_gameclue2_17.jpg	f	t
cmfd1g7j200dh9we45jjjj2bi	player_12	2025-09-08 05:42:11.17	100	2025-09-09 21:04:01.31	gameclue2_17	40.70545586240937	-74.01343466073821	\N	f	f
cmfd1g7j200dj9we4tgg0p3tu	player_12	2025-09-06 17:55:38.254	100	2025-09-09 21:04:01.311	gameclue2_12	40.76475748904389	-73.9808135933702	selfie_player_12_gameclue2_12.jpg	f	f
cmfd1g7j300dl9we4baqlky97	player_12	2025-09-04 18:07:16.155	100	2025-09-09 21:04:01.311	gameclue2_16	40.70740188954255	-74.01052850913099	\N	t	f
cmfd1g7j300dn9we4pjo7oe7n	player_12	2025-09-03 12:03:00.915	100	2025-09-09 21:04:01.312	gameclue2_15	40.70814243395294	-74.01207859126472	\N	f	f
cmfd1g7j400dp9we4m5wum7d0	player_12	2025-09-09 02:48:38.151	100	2025-09-09 21:04:01.312	gameclue2_14	40.71273506656377	-74.01344549058399	\N	f	f
cmfd1g7j400dr9we4w8rffqxv	player_12	2025-09-04 06:03:02.651	100	2025-09-09 21:04:01.313	gameclue2_13	40.76000546686268	-73.97994429229979	\N	t	f
cmfd1g7j500dt9we4le4tmxfk	player_12	2025-09-04 00:01:58.695	100	2025-09-09 21:04:01.313	gameclue2_20	40.66017805015954	-73.96901818542652	selfie_player_12_gameclue2_20.jpg	t	f
cmfd1g7j500dv9we47ydr2y8q	player_12	2025-09-08 05:21:07.904	100	2025-09-09 21:04:01.314	gameclue2_18	40.70744570885428	-74.00328727073057	\N	f	f
cmfd1g7j600dx9we416yciked	player_12	2025-09-08 12:08:31.527	100	2025-09-09 21:04:01.314	gameclue2_19	40.6712295771886	-73.96378337219518	selfie_player_12_gameclue2_19.jpg	f	f
cmfd1g7j700dz9we49y9xoo09	player_12	2025-09-03 20:02:49.775	100	2025-09-09 21:04:01.315	gameclue2_11	40.76135203483044	-73.97755961922628	\N	f	f
cmfd1g7j700e19we490cau5sn	player3	2025-09-04 19:30:34.832	100	2025-09-09 21:04:01.316	gameclue2_14	40.71269365535387	-74.01338904044255	selfie_player3_gameclue2_14.jpg	f	t
cmfd1g7j800e39we4si57frc2	player3	2025-09-09 18:09:49.379	100	2025-09-09 21:04:01.316	gameclue2_13	40.76002545688998	-73.97987430057853	\N	f	t
cmfd1g7j800e59we4k0xjj1vv	player3	2025-09-07 18:10:33	100	2025-09-09 21:04:01.317	gameclue2_15	40.70813699855841	-74.01205761154637	selfie_player3_gameclue2_15.jpg	f	t
cmfd1g7j900e79we4fsvww9u1	player3	2025-09-08 16:07:45.894	100	2025-09-09 21:04:01.317	gameclue2_16	40.70739643688123	-74.01051126699036	selfie_player3_gameclue2_16.jpg	t	f
cmfd1g7j900e99we4ygsihjw4	player3	2025-09-04 00:52:04.133	100	2025-09-09 21:04:01.318	gameclue2_18	40.70738031411205	-74.00333754854806	selfie_player3_gameclue2_18.jpg	f	f
cmfd1g7ja00eb9we4nhw7rv34	cmfd1g7f7001f9we4ldetuaz2	2025-09-08 15:22:11.138	100	2025-09-09 21:04:01.318	gameclue2_11	40.76138577445137	-73.9775963759942	\N	f	f
cmfd1g7ja00ed9we4rqmb4594	cmfd1g7f7001f9we4ldetuaz2	2025-09-03 01:42:39.221	100	2025-09-09 21:04:01.319	gameclue2_16	40.70742617633871	-74.01051865190574	\N	f	f
cmfd1g7jb00ef9we4qmc8sc9k	cmfd1g7f7001f9we4ldetuaz2	2025-09-09 08:39:20.462	100	2025-09-09 21:04:01.32	gameclue2_19	40.67122769970221	-73.9637995403916	\N	t	f
cmfd1g7jc00eh9we4hwiyf1y0	cmfd1g7f7001f9we4ldetuaz2	2025-09-03 20:25:53.602	100	2025-09-09 21:04:01.32	gameclue2_20	40.66019611887322	-73.96895317756444	selfie_cmfd1g7f7001f9we4ldetuaz2_gameclue2_20.jpg	f	f
cmfd1g7jc00ej9we4a61q1cbb	cmfd1g7f7001f9we4ldetuaz2	2025-09-03 09:31:56.97	100	2025-09-09 21:04:01.321	gameclue2_15	40.70812034840517	-74.01205036465417	\N	f	t
cmfd1g7jd00el9we4hspgcwnm	cmfd1g7f7001f9we4ldetuaz2	2025-09-07 03:15:25.267	100	2025-09-09 21:04:01.321	gameclue2_17	40.70550100000659	-74.0133650743757	\N	f	f
cmfd1g7jd00en9we48rw7d53i	cmfd1g7f7001f9we4ldetuaz2	2025-09-07 22:53:25.134	100	2025-09-09 21:04:01.322	gameclue2_13	40.76001637881479	-73.97992234389133	\N	t	f
cmfd1g7je00ep9we4k71lz0zv	cmfd1g7f7001f9we4ldetuaz2	2025-09-05 04:29:29.71	100	2025-09-09 21:04:01.322	gameclue2_12	40.76482392396554	-73.9807541131013	selfie_cmfd1g7f7001f9we4ldetuaz2_gameclue2_12.jpg	f	f
cmfd1g7jf00er9we43mjam6t2	cmfd1g7f7001f9we4ldetuaz2	2025-09-08 07:05:33.998	100	2025-09-09 21:04:01.323	gameclue2_14	40.71271912697352	-74.0133738980788	\N	f	f
cmfd1g7jg00et9we4x6abuook	cmfd1g7f7001f9we4ldetuaz2	2025-09-06 09:07:27.965	100	2025-09-09 21:04:01.324	gameclue2_18	40.70735397910563	-74.0032903283874	selfie_cmfd1g7f7001f9we4ldetuaz2_gameclue2_18.jpg	f	f
cmfd1g7jg00ev9we48647rm30	cmfd1g7fs002n9we42y31eyfe	2025-09-08 13:04:34.761	100	2025-09-09 21:04:01.325	gameclue2_20	40.66015063754596	-73.96896987740595	\N	f	f
cmfd1g7jh00ex9we4a9a699u2	cmfd1g7fs002n9we42y31eyfe	2025-09-05 17:59:30.825	100	2025-09-09 21:04:01.325	gameclue2_14	40.71265960213284	-74.01341684913054	\N	f	f
cmfd1g7jh00ez9we49ujay2ad	cmfd1g7fs002n9we42y31eyfe	2025-09-06 02:25:28.744	100	2025-09-09 21:04:01.326	gameclue2_15	40.70810641839635	-74.01209790173155	selfie_cmfd1g7fs002n9we42y31eyfe_gameclue2_15.jpg	f	f
cmfd1g7ji00f19we4fl8a8tsm	cmfd1g7fs002n9we42y31eyfe	2025-09-03 00:39:28.509	100	2025-09-09 21:04:01.326	gameclue2_12	40.7648205574531	-73.98080479136347	selfie_cmfd1g7fs002n9we42y31eyfe_gameclue2_12.jpg	t	f
cmfd1g7ji00f39we488sp8c1g	cmfd1g7fs002n9we42y31eyfe	2025-09-07 14:09:02.615	100	2025-09-09 21:04:01.327	gameclue2_18	40.70738164764393	-74.00329127558182	\N	f	f
cmfd1g7jj00f59we4ih9r0205	cmfd1g7fs002n9we42y31eyfe	2025-09-04 16:06:00.473	100	2025-09-09 21:04:01.327	gameclue2_17	40.70548197875531	-74.01339762964825	\N	f	f
cmfd1g7jj00f79we4lvem4rkq	cmfd1g7fs002n9we42y31eyfe	2025-09-08 14:50:01.915	100	2025-09-09 21:04:01.328	gameclue2_11	40.76143409541216	-73.97759911514616	\N	t	t
cmfd1g7jk00f99we44xmo02vf	cmfd1g7fs002n9we42y31eyfe	2025-09-04 22:58:27.991	100	2025-09-09 21:04:01.329	gameclue2_19	40.67120031846005	-73.9637929929227	\N	t	f
cmfd1g7jl00fb9we42t12hevn	cmfd1g7fs002n9we42y31eyfe	2025-09-03 22:07:48.578	100	2025-09-09 21:04:01.329	gameclue2_13	40.76002139247152	-73.97990262770074	\N	f	f
cmfd1g7jm00fd9we4mce0pt9c	cmfd1g7fo002e9we48hp0gd97	2025-09-05 08:23:35.76	100	2025-09-09 21:04:01.33	gameclue2_12	40.7647824518664	-73.98079891384016	\N	f	f
cmfd1g7jm00ff9we4bsmk499f	cmfd1g7fq002i9we49e2zwjs2	2025-09-09 17:56:47.78	100	2025-09-09 21:04:01.331	gameclue2_12	40.76479318019774	-73.98079187320747	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_12.jpg	t	f
cmfd1g7jn00fh9we4vxsgk7va	cmfd1g7fq002i9we49e2zwjs2	2025-09-08 21:28:40.941	100	2025-09-09 21:04:01.331	gameclue2_11	40.76140800997903	-73.97756434132702	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_11.jpg	t	f
cmfd1g7jn00fj9we42v92gnyt	cmfd1g7fq002i9we49e2zwjs2	2025-09-05 20:27:17.659	100	2025-09-09 21:04:01.332	gameclue2_18	40.70743579639729	-74.00326080930103	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_18.jpg	f	t
cmfd1g7jo00fl9we4pvx6tu4a	cmfd1g7fq002i9we49e2zwjs2	2025-09-06 08:36:00.16	100	2025-09-09 21:04:01.332	gameclue2_13	40.76004702989503	-73.97985421020248	\N	f	f
cmfd1g7jp00fn9we4tulnjbpo	cmfd1g7fq002i9we49e2zwjs2	2025-09-03 21:43:28.003	100	2025-09-09 21:04:01.333	gameclue2_14	40.71267382532084	-74.01340944860152	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_14.jpg	f	f
cmfd1g7jq00fp9we4b2rfsy0l	cmfd1g7fq002i9we49e2zwjs2	2025-09-07 12:21:14.76	100	2025-09-09 21:04:01.334	gameclue2_19	40.67121209648877	-73.9637646698997	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_19.jpg	f	f
cmfd1g7jq00fr9we4fjksy6p9	cmfd1g7fq002i9we49e2zwjs2	2025-09-08 22:42:14.129	100	2025-09-09 21:04:01.335	gameclue2_16	40.70739751038882	-74.0104805417464	\N	f	f
cmfd1g7jr00ft9we4mk21q61a	cmfd1g7fq002i9we49e2zwjs2	2025-09-03 13:06:55.36	100	2025-09-09 21:04:01.335	gameclue2_15	40.70811099721156	-74.0120798007482	selfie_cmfd1g7fq002i9we49e2zwjs2_gameclue2_15.jpg	f	f
cmfd1g7js00fv9we4cikj4rwf	player_10	2025-09-07 11:42:13.677	100	2025-09-09 21:04:01.336	gameclue2_17	40.70552275379357	-74.01343169875148	\N	t	f
cmfd1g7js00fx9we4665uavv6	player_10	2025-09-07 19:56:43.219	100	2025-09-09 21:04:01.337	gameclue2_13	40.76001947694368	-73.97990063182596	\N	t	f
cmfd1g7jt00fz9we482la60yf	player_10	2025-09-09 17:08:05.814	100	2025-09-09 21:04:01.338	gameclue2_18	40.70735219888675	-74.00327522277905	selfie_player_10_gameclue2_18.jpg	f	t
cmfd1g7ju00g19we4y58yfm33	player_10	2025-09-03 02:23:25.353	100	2025-09-09 21:04:01.339	gameclue2_20	40.6601665225126	-73.96895187010966	\N	f	f
cmfd1g7jv00g39we4ebi0ea0m	player_10	2025-09-05 09:03:14.734	100	2025-09-09 21:04:01.34	gameclue2_11	40.76140237461174	-73.9776447515668	selfie_player_10_gameclue2_11.jpg	f	f
cmfd1g7jw00g59we49daevb75	player_10	2025-09-07 01:53:25.055	100	2025-09-09 21:04:01.34	gameclue2_15	40.70813736173061	-74.01205511162831	\N	t	f
cmfd1g7jw00g79we4ao3xrt52	player_10	2025-09-07 01:05:05.313	100	2025-09-09 21:04:01.341	gameclue2_16	40.7073562562226	-74.01052173973032	\N	f	f
cmfd1g7jx00g99we4w0jdjok9	player_10	2025-09-07 20:11:07.678	100	2025-09-09 21:04:01.342	gameclue2_12	40.76484341773777	-73.98081641156836	selfie_player_10_gameclue2_12.jpg	f	t
cmfd1g7jy00gb9we4xprqy93w	cmfd1g7fk00269we4roz15cia	2025-09-07 04:15:13.366	100	2025-09-09 21:04:01.342	gameclue2_18	40.70736354196423	-74.00332825493166	\N	f	f
cmfd1g7jy00gd9we4c2iyvg5n	cmfd1g7fk00269we4roz15cia	2025-09-06 02:00:28.315	100	2025-09-09 21:04:01.343	gameclue2_13	40.76001952441095	-73.97991869596825	\N	f	f
cmfd1g7jz00gf9we4xmbudvn7	cmfd1g7fk00269we4roz15cia	2025-09-07 05:44:53.828	100	2025-09-09 21:04:01.343	gameclue2_12	40.76482530713994	-73.98084914275071	selfie_cmfd1g7fk00269we4roz15cia_gameclue2_12.jpg	t	f
cmfd1g7k000gh9we4s34oqt7w	cmfd1g7fk00269we4roz15cia	2025-09-09 12:20:19.329	100	2025-09-09 21:04:01.344	gameclue2_16	40.70735308202249	-74.01047155783552	selfie_cmfd1g7fk00269we4roz15cia_gameclue2_16.jpg	f	f
cmfd1g7k100gj9we4ay7nsq7i	cmfd1g7fk00269we4roz15cia	2025-09-04 18:25:01.394	100	2025-09-09 21:04:01.345	gameclue2_19	40.67116825913752	-73.96377928478016	selfie_cmfd1g7fk00269we4roz15cia_gameclue2_19.jpg	f	f
cmfd1g7k200gl9we4yigl9b0v	cmfd1g7fi00219we438was4wo	2025-09-08 03:39:06.831	100	2025-09-09 21:04:01.346	gameclue2_20	40.66024199330986	-73.96902613925695	selfie_cmfd1g7fi00219we438was4wo_gameclue2_20.jpg	f	f
cmfd1g7k300gn9we4cevtj9fs	cmfd1g7fn002b9we4zhmqh7z5	2025-09-08 08:53:03.774	100	2025-09-09 21:04:01.347	gameclue2_20	40.66022196742282	-73.96898673039738	\N	f	f
cmfd1g7k300gp9we4wtlzxtxy	cmfd1g7fn002b9we4zhmqh7z5	2025-09-04 12:02:07.732	100	2025-09-09 21:04:01.348	gameclue2_15	40.70808288103451	-74.01214029912373	\N	t	f
cmfd1g7k400gr9we4ex3dyybe	cmfd1g7fn002b9we4zhmqh7z5	2025-09-06 13:31:38.643	100	2025-09-09 21:04:01.348	gameclue2_18	40.70735944563967	-74.0033307385453	\N	f	f
cmfd1g7k500gt9we4qy31b3qf	cmfd1g7fn002b9we4zhmqh7z5	2025-09-04 20:51:55.385	100	2025-09-09 21:04:01.349	gameclue2_12	40.76479922709777	-73.98084238426591	selfie_cmfd1g7fn002b9we4zhmqh7z5_gameclue2_12.jpg	f	f
cmfd1g7k500gv9we448nekqub	cmfd1g7fn002b9we4zhmqh7z5	2025-09-06 14:30:13.353	100	2025-09-09 21:04:01.35	gameclue2_13	40.75995787524106	-73.9799091120029	selfie_cmfd1g7fn002b9we4zhmqh7z5_gameclue2_13.jpg	f	f
cmfd1g7k600gx9we4gkt4hfb2	cmfd1g7fn002b9we4zhmqh7z5	2025-09-04 20:07:59.408	100	2025-09-09 21:04:01.35	gameclue2_14	40.71274771731368	-74.01335708072929	selfie_cmfd1g7fn002b9we4zhmqh7z5_gameclue2_14.jpg	f	f
cmfd1g7k600gz9we4rnqbpcc9	cmfd1g7fn002b9we4zhmqh7z5	2025-09-09 03:27:46.275	100	2025-09-09 21:04:01.351	gameclue2_17	40.70545485294014	-74.013351658877	selfie_cmfd1g7fn002b9we4zhmqh7z5_gameclue2_17.jpg	f	f
cmfd1g7k700h19we4a7d4s1l1	cmfd1g7fn002b9we4zhmqh7z5	2025-09-06 04:59:43.741	100	2025-09-09 21:04:01.352	gameclue2_19	40.67116270007728	-73.96384238326358	selfie_cmfd1g7fn002b9we4zhmqh7z5_gameclue2_19.jpg	f	t
cmfd1g7k800h39we4pt0lh643	cmfd1g7fd001p9we4faowsm7v	2025-09-03 23:51:35.934	100	2025-09-09 21:04:01.352	gameclue2_19	40.67122234040568	-73.96379698298655	selfie_cmfd1g7fd001p9we4faowsm7v_gameclue2_19.jpg	f	f
cmfd1g7k800h59we4y4a9cfzl	cmfd1g7fd001p9we4faowsm7v	2025-09-07 09:50:03.328	100	2025-09-09 21:04:01.353	gameclue2_20	40.66023286552564	-73.96897359369096	\N	f	f
cmfd1g7k900h79we4g7zgrvtg	cmfd1g7fd001p9we4faowsm7v	2025-09-06 04:44:21.918	100	2025-09-09 21:04:01.353	gameclue2_17	40.70547135654611	-74.01335956569261	\N	f	f
cmfd1g7k900h99we4bgb1x7ny	cmfd1g7fd001p9we4faowsm7v	2025-09-09 11:31:15.999	100	2025-09-09 21:04:01.354	gameclue2_12	40.76479932757032	-73.98077401179995	\N	f	f
cmfd1g7ka00hb9we49xvz32qo	cmfd1g7fd001p9we4faowsm7v	2025-09-05 23:19:47.354	100	2025-09-09 21:04:01.355	gameclue2_13	40.7599615924374	-73.97994776487245	selfie_cmfd1g7fd001p9we4faowsm7v_gameclue2_13.jpg	t	f
cmfd1g7kb00hd9we4lwj4rrhf	player_10	2025-09-07 22:09:24.916	163	2025-09-09 21:04:01.355	cmfd1g7f300159we4a6eoli3b	40.24973948825628	-111.6471804048234	\N	t	f
cmfd1g7kb00hf9we4erdmf9ll	player_10	2025-09-08 10:47:20.432	248	2025-09-09 21:04:01.356	cmfd1g7f0000v9we4navdk4yb	40.24969226448874	-111.649039627455	selfie_player_10_cmfd1g7f0000v9we4navdk4yb.jpg	t	f
cmfd1g7kc00hh9we41ln1jhim	player_10	2025-09-08 08:48:57.071	165	2025-09-09 21:04:01.357	cmfd1g7f200119we4uecedevr	40.24773816219322	-111.6513865593965	selfie_player_10_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7kd00hj9we4rynfr3ze	player_10	2025-09-05 10:27:18.465	138	2025-09-09 21:04:01.357	cmfd1g7f1000x9we498dhzbd5	40.25419666865555	-111.6505111025861	\N	f	t
cmfd1g7kd00hl9we410rxrnhj	player_10	2025-09-03 23:18:12.805	122	2025-09-09 21:04:01.358	cmfd1g7f200139we4lo2xy1fx	40.25393129781236	-111.6491234734384	\N	t	f
cmfd1g7ke00hn9we43wnvd9l8	player_10	2025-09-03 14:01:25.719	249	2025-09-09 21:04:01.358	cmfd1g7f1000z9we4fva1gh9w	40.25253728943197	-111.6532919405903	selfie_player_10_cmfd1g7f1000z9we4fva1gh9w.jpg	f	f
cmfd1g7ke00hp9we466k4sg5e	player_10	2025-09-05 22:07:02.549	127	2025-09-09 21:04:01.359	cmfd1g7ex000r9we4daszuxvr	40.25142226314948	-111.6471772355915	selfie_player_10_cmfd1g7ex000r9we4daszuxvr.jpg	t	f
cmfd1g7kf00hr9we4t75aatrb	player_10	2025-09-03 08:31:35.563	121	2025-09-09 21:04:01.359	cmfd1g7ez000t9we43738h26y	40.25191360825362	-111.6521333292317	selfie_player_10_cmfd1g7ez000t9we43738h26y.jpg	f	f
cmfd1g7kg00ht9we4lvnna3sw	cmfd1g7fk00269we4roz15cia	2025-09-08 11:10:43.462	165	2025-09-09 21:04:01.36	cmfd1g7f200119we4uecedevr	40.24780499992004	-111.65138793521	\N	f	t
cmfd1g7kg00hv9we43dy016i5	cmfd1g7fk00269we4roz15cia	2025-09-04 16:19:07.142	122	2025-09-09 21:04:01.361	cmfd1g7f200139we4lo2xy1fx	40.2538999097893	-111.649125675155	\N	f	f
cmfd1g7kh00hx9we42qo5la1j	cmfd1g7fk00269we4roz15cia	2025-09-09 16:46:46.111	249	2025-09-09 21:04:01.361	cmfd1g7f1000z9we4fva1gh9w	40.25250674043338	-111.6532916208489	selfie_cmfd1g7fk00269we4roz15cia_cmfd1g7f1000z9we4fva1gh9w.jpg	t	f
cmfd1g7kh00hz9we418npfp20	cmfd1g7fk00269we4roz15cia	2025-09-03 14:54:46.027	248	2025-09-09 21:04:01.362	cmfd1g7f0000v9we4navdk4yb	40.24970703595729	-111.6490290518643	\N	f	t
cmfd1g7ki00i19we4sxvefc9p	cmfd1g7fk00269we4roz15cia	2025-09-06 02:08:25.118	121	2025-09-09 21:04:01.362	cmfd1g7ez000t9we43738h26y	40.25187612088398	-111.6521158324896	\N	f	t
cmfd1g7ki00i39we49hu5tli3	cmfd1g7fk00269we4roz15cia	2025-09-08 04:15:34.035	154	2025-09-09 21:04:01.363	cmfd1g7f300199we4igr9ok5t	40.24893216802865	-111.6480100356449	\N	f	f
cmfd1g7kj00i59we4c18p8faz	cmfd1g7fi00219we438was4wo	2025-09-02 23:44:57.301	127	2025-09-09 21:04:01.363	cmfd1g7ex000r9we4daszuxvr	40.25138559845097	-111.6472380886636	\N	t	f
cmfd1g7kj00i79we4ug8vtxas	cmfd1g7fn002b9we4zhmqh7z5	2025-09-06 22:19:29.465	127	2025-09-09 21:04:01.364	cmfd1g7ex000r9we4daszuxvr	40.25141841653517	-111.6472554670155	selfie_cmfd1g7fn002b9we4zhmqh7z5_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7kk00i99we4olhbxj28	cmfd1g7fn002b9we4zhmqh7z5	2025-09-04 07:26:38.959	122	2025-09-09 21:04:01.364	cmfd1g7f200139we4lo2xy1fx	40.25390561681635	-111.6491599864011	\N	f	f
cmfd1g7kl00ib9we4vt4q7ywu	cmfd1g7fn002b9we4zhmqh7z5	2025-09-06 17:16:09.198	121	2025-09-09 21:04:01.365	cmfd1g7ez000t9we43738h26y	40.25184263799677	-111.6520724550926	selfie_cmfd1g7fn002b9we4zhmqh7z5_cmfd1g7ez000t9we43738h26y.jpg	t	t
cmfd1g7kl00id9we4ryw4qgs8	cmfd1g7fn002b9we4zhmqh7z5	2025-09-07 17:31:00.703	154	2025-09-09 21:04:01.366	cmfd1g7f300199we4igr9ok5t	40.24886772370395	-111.6480464779239	selfie_cmfd1g7fn002b9we4zhmqh7z5_cmfd1g7f300199we4igr9ok5t.jpg	f	f
cmfd1g7km00if9we40ubh0cmn	cmfd1g7fn002b9we4zhmqh7z5	2025-09-04 01:05:03.075	165	2025-09-09 21:04:01.366	cmfd1g7f200119we4uecedevr	40.24773798233056	-111.6514113293535	selfie_cmfd1g7fn002b9we4zhmqh7z5_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7km00ih9we4fk78lqli	cmfd1g7fn002b9we4zhmqh7z5	2025-09-07 04:37:47.997	138	2025-09-09 21:04:01.367	cmfd1g7f1000x9we498dhzbd5	40.25416864511406	-111.6505519619778	\N	f	f
cmfd1g7kn00ij9we4zlqn1pni	cmfd1g7fn002b9we4zhmqh7z5	2025-09-09 16:58:07.285	163	2025-09-09 21:04:01.368	cmfd1g7f300159we4a6eoli3b	40.24968468294163	-111.6472209568263	selfie_cmfd1g7fn002b9we4zhmqh7z5_cmfd1g7f300159we4a6eoli3b.jpg	f	f
cmfd1g7ko00il9we4rffqvvm7	cmfd1g7fd001p9we4faowsm7v	2025-09-05 03:04:04.86	127	2025-09-09 21:04:01.368	cmfd1g7ex000r9we4daszuxvr	40.25141236076723	-111.647223180622	selfie_cmfd1g7fd001p9we4faowsm7v_cmfd1g7ex000r9we4daszuxvr.jpg	t	f
cmfd1g7ko00in9we40bpjrqme	cmfd1g7fd001p9we4faowsm7v	2025-09-03 02:14:33.854	122	2025-09-09 21:04:01.369	cmfd1g7f200139we4lo2xy1fx	40.25384230699626	-111.6491590923806	\N	f	f
cmfd1g7kp00ip9we4us0rrjn6	cmfd1g7fd001p9we4faowsm7v	2025-09-06 20:31:30.936	249	2025-09-09 21:04:01.37	cmfd1g7f1000z9we4fva1gh9w	40.25246037273349	-111.6533023752268	\N	f	f
cmfd1g7kq00ir9we4111qkxya	cmfd1g7fd001p9we4faowsm7v	2025-09-09 15:12:47.22	248	2025-09-09 21:04:01.37	cmfd1g7f0000v9we4navdk4yb	40.24965839704124	-111.6490168840203	selfie_cmfd1g7fd001p9we4faowsm7v_cmfd1g7f0000v9we4navdk4yb.jpg	f	f
cmfd1g7kq00it9we437jo1o7e	cmfd1g7fd001p9we4faowsm7v	2025-09-08 21:34:41.777	163	2025-09-09 21:04:01.371	cmfd1g7f300159we4a6eoli3b	40.2497039951293	-111.6472221988631	selfie_cmfd1g7fd001p9we4faowsm7v_cmfd1g7f300159we4a6eoli3b.jpg	t	t
cmfd1g7kr00iv9we4vm5odhpv	cmfd1g7f4001a9we471049ol1	2025-09-08 11:47:38.429	165	2025-09-09 21:04:01.371	cmfd1g7f200119we4uecedevr	40.24778745643336	-111.65139197775	selfie_cmfd1g7f4001a9we471049ol1_cmfd1g7f200119we4uecedevr.jpg	t	f
cmfd1g7kr00ix9we4lc7vq1wy	cmfd1g7f4001a9we471049ol1	2025-09-05 22:53:12.496	163	2025-09-09 21:04:01.372	cmfd1g7f300159we4a6eoli3b	40.2497466509423	-111.6471730057516	selfie_cmfd1g7f4001a9we471049ol1_cmfd1g7f300159we4a6eoli3b.jpg	f	f
cmfd1g7ks00iz9we4247n6ij8	cmfd1g7f4001a9we471049ol1	2025-09-03 15:10:16.983	185	2025-09-09 21:04:01.372	cmfd1g7f300179we4w0lkr8sf	40.24943422275026	-111.6516789303282	selfie_cmfd1g7f4001a9we471049ol1_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
cmfd1g7kt00j19we4u6womqr5	cmfd1g7fk00259we4ulkgqmnr	2025-09-07 01:42:20.782	165	2025-09-09 21:04:01.373	cmfd1g7f200119we4uecedevr	40.24776958681397	-111.651360906661	\N	f	f
cmfd1g7kt00j39we4gfyq1q2i	cmfd1g7fk00259we4ulkgqmnr	2025-09-06 22:21:32.06	127	2025-09-09 21:04:01.374	cmfd1g7ex000r9we4daszuxvr	40.2513626641687	-111.6471931845567	\N	f	f
cmfd1g7ku00j59we44gnp6lcd	cmfd1g7fk00259we4ulkgqmnr	2025-09-06 00:35:25.312	249	2025-09-09 21:04:01.374	cmfd1g7f1000z9we4fva1gh9w	40.25245128384567	-111.6533569996294	\N	f	f
cmfd1g7ku00j79we485rxsaix	cmfd1g7fk00259we4ulkgqmnr	2025-09-06 16:28:04.923	122	2025-09-09 21:04:01.375	cmfd1g7f200139we4lo2xy1fx	40.25384531584215	-111.6492107110954	selfie_cmfd1g7fk00259we4ulkgqmnr_cmfd1g7f200139we4lo2xy1fx.jpg	f	f
cmfd1g7kv00j99we4nelezh4b	cmfd1g7fk00259we4ulkgqmnr	2025-09-09 03:41:15.441	163	2025-09-09 21:04:01.375	cmfd1g7f300159we4a6eoli3b	40.24968966486021	-111.6472700768279	\N	f	f
cmfd1g7kw00jb9we48imm26y8	cmfd1g7fk00259we4ulkgqmnr	2025-09-04 07:50:11.191	154	2025-09-09 21:04:01.376	cmfd1g7f300199we4igr9ok5t	40.24890116267356	-111.6480419968167	selfie_cmfd1g7fk00259we4ulkgqmnr_cmfd1g7f300199we4igr9ok5t.jpg	f	t
cmfd1g7kw00jd9we4wbsty6uz	cmfd1g7fk00259we4ulkgqmnr	2025-09-03 20:00:57.086	185	2025-09-09 21:04:01.377	cmfd1g7f300179we4w0lkr8sf	40.24941134558409	-111.6516599464643	\N	t	f
cmfd1g7kx00jf9we4bxv277n5	cmfd1g7fk00259we4ulkgqmnr	2025-09-05 03:51:41.29	121	2025-09-09 21:04:01.377	cmfd1g7ez000t9we43738h26y	40.25187257601544	-111.6521339688892	\N	t	t
cmfd1g7ky00jh9we418fmquet	cmfd1g7fi00209we4hcbjnaxr	2025-09-08 18:37:20.547	185	2025-09-09 21:04:01.378	cmfd1g7f300179we4w0lkr8sf	40.2494308155289	-111.6516668483119	\N	t	f
cmfd1g7ky00jj9we4cssu8ypw	cmfd1g7fi00209we4hcbjnaxr	2025-09-05 20:23:35.699	249	2025-09-09 21:04:01.379	cmfd1g7f1000z9we4fva1gh9w	40.25251028276455	-111.6533066397929	\N	t	t
cmfd1g7kz00jl9we4nd1r9wdb	cmfd1g7fi00209we4hcbjnaxr	2025-09-08 18:03:51.494	122	2025-09-09 21:04:01.38	cmfd1g7f200139we4lo2xy1fx	40.25392201670186	-111.6491347790334	selfie_cmfd1g7fi00209we4hcbjnaxr_cmfd1g7f200139we4lo2xy1fx.jpg	t	f
cmfd1g7l000jn9we4hj7878w9	cmfd1g7fi00209we4hcbjnaxr	2025-09-06 23:22:07.782	138	2025-09-09 21:04:01.38	cmfd1g7f1000x9we498dhzbd5	40.2541186646922	-111.6505780565269	\N	f	f
cmfd1g7l000jp9we4rl0p2i6d	cmfd1g7fi00209we4hcbjnaxr	2025-09-07 07:31:25.413	154	2025-09-09 21:04:01.381	cmfd1g7f300199we4igr9ok5t	40.24892000853434	-111.6480408889097	selfie_cmfd1g7fi00209we4hcbjnaxr_cmfd1g7f300199we4igr9ok5t.jpg	f	t
cmfd1g7l100jr9we42ibj0lga	cmfd1g7fc001o9we4cwszx3ev	2025-09-06 23:56:32.974	163	2025-09-09 21:04:01.381	cmfd1g7f300159we4a6eoli3b	40.24967906194838	-111.6472220445667	\N	f	f
cmfd1g7l100jt9we4uuapa39h	cmfd1g7fc001o9we4cwszx3ev	2025-09-09 16:14:32.076	127	2025-09-09 21:04:01.382	cmfd1g7ex000r9we4daszuxvr	40.25137480240421	-111.6471795471655	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7ex000r9we4daszuxvr.jpg	t	t
cmfd1g7l200jv9we4k3puqhzg	cmfd1g7fc001o9we4cwszx3ev	2025-09-03 02:24:20.964	121	2025-09-09 21:04:01.382	cmfd1g7ez000t9we43738h26y	40.2518846150236	-111.6521621701622	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7ez000t9we43738h26y.jpg	t	f
cmfd1g7l300jx9we4rq6eqq6q	cmfd1g7fc001o9we4cwszx3ev	2025-09-06 02:08:23.651	248	2025-09-09 21:04:01.383	cmfd1g7f0000v9we4navdk4yb	40.24971015832411	-111.6489962429818	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7f0000v9we4navdk4yb.jpg	f	f
cmfd1g7l300jz9we43bfsota4	cmfd1g7fc001o9we4cwszx3ev	2025-09-04 20:09:46.351	154	2025-09-09 21:04:01.384	cmfd1g7f300199we4igr9ok5t	40.24885620991818	-111.6480632918558	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7f300199we4igr9ok5t.jpg	t	f
cmfd1g7l400k19we4cjoo8dnq	cmfd1g7fc001o9we4cwszx3ev	2025-09-08 05:21:09.678	249	2025-09-09 21:04:01.384	cmfd1g7f1000z9we4fva1gh9w	40.25254237445603	-111.6533584246424	\N	f	f
cmfd1g7l500k39we45isq41j0	cmfd1g7fc001o9we4cwszx3ev	2025-09-07 11:13:58.734	165	2025-09-09 21:04:01.385	cmfd1g7f200119we4uecedevr	40.24774302510588	-111.6513620389372	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7l500k59we4njsoecqw	cmfd1g7fc001o9we4cwszx3ev	2025-09-04 13:11:14.174	185	2025-09-09 21:04:01.386	cmfd1g7f300179we4w0lkr8sf	40.24939612996427	-111.6517073206674	selfie_cmfd1g7fc001o9we4cwszx3ev_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
cmfd1g7l600k79we445wu2389	player_20	2025-09-08 13:24:55.643	249	2025-09-09 21:04:01.386	cmfd1g7f1000z9we4fva1gh9w	40.25250503095032	-111.6533766361851	selfie_player_20_cmfd1g7f1000z9we4fva1gh9w.jpg	f	f
cmfd1g7l700k99we4g1xaikor	player_20	2025-09-04 22:08:42.518	185	2025-09-09 21:04:01.387	cmfd1g7f300179we4w0lkr8sf	40.24943617200756	-111.6516320969564	selfie_player_20_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
cmfd1g7l700kb9we4mtv44i07	player_20	2025-09-05 03:54:44.167	248	2025-09-09 21:04:01.388	cmfd1g7f0000v9we4navdk4yb	40.24968143952206	-111.6489933240651	\N	f	f
cmfd1g7l800kd9we4ua8cm7zb	player_20	2025-09-09 13:48:45.981	122	2025-09-09 21:04:01.388	cmfd1g7f200139we4lo2xy1fx	40.25387214164764	-111.6491242531332	\N	f	f
cmfd1g7l900kf9we4ouzeyk9f	player_20	2025-09-04 15:35:11.486	138	2025-09-09 21:04:01.389	cmfd1g7f1000x9we498dhzbd5	40.2541977905644	-111.6505173269192	\N	f	f
cmfd1g7l900kh9we4f98ndcbu	player_20	2025-09-07 09:17:25.346	121	2025-09-09 21:04:01.39	cmfd1g7ez000t9we43738h26y	40.25185675273568	-111.652073606285	\N	f	f
cmfd1g7la00kj9we47nnfvsi6	player_20	2025-09-07 02:49:16.572	154	2025-09-09 21:04:01.391	cmfd1g7f300199we4igr9ok5t	40.24883959712972	-111.648064277414	\N	t	t
cmfd1g7lb00kl9we44te5vj9a	player_20	2025-09-07 23:56:44.593	127	2025-09-09 21:04:01.391	cmfd1g7ex000r9we4daszuxvr	40.25136265432398	-111.6472561813631	selfie_player_20_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7lb00kn9we4khy8i4cp	cmfd1g7f9001i9we4tzqc1k6c	2025-09-05 16:24:03.438	249	2025-09-09 21:04:01.392	cmfd1g7f1000z9we4fva1gh9w	40.25245976460823	-111.6533551938076	selfie_cmfd1g7f9001i9we4tzqc1k6c_cmfd1g7f1000z9we4fva1gh9w.jpg	t	f
cmfd1g7lc00kp9we4urza4k1s	cmfd1g7f9001i9we4tzqc1k6c	2025-09-06 16:53:10.46	185	2025-09-09 21:04:01.392	cmfd1g7f300179we4w0lkr8sf	40.24940969330714	-111.6516646459835	\N	f	f
cmfd1g7lc00kr9we4e2oy11dd	cmfd1g7f9001i9we4tzqc1k6c	2025-09-03 15:52:32.209	154	2025-09-09 21:04:01.393	cmfd1g7f300199we4igr9ok5t	40.24893815768738	-111.6480873862962	\N	t	f
cmfd1g7ld00kt9we447lcdsi8	cmfd1g7f9001i9we4tzqc1k6c	2025-09-04 11:03:58.232	163	2025-09-09 21:04:01.393	cmfd1g7f300159we4a6eoli3b	40.24967425097596	-111.6472451632157	\N	f	f
cmfd1g7ld00kv9we4sgp48upp	cmfd1g7fh001x9we4v0blgs1w	2025-09-06 13:08:48.664	122	2025-09-09 21:04:01.394	cmfd1g7f200139we4lo2xy1fx	40.25384046535557	-111.6491530414262	\N	f	t
cmfd1g7le00kx9we4eozdevvu	cmfd1g7fh001x9we4v0blgs1w	2025-09-09 15:03:40.283	248	2025-09-09 21:04:01.394	cmfd1g7f0000v9we4navdk4yb	40.2497149607555	-111.6490093737448	\N	f	t
cmfd1g7le00kz9we46vky2xon	cmfd1g7fh001x9we4v0blgs1w	2025-09-05 09:03:15.646	127	2025-09-09 21:04:01.395	cmfd1g7ex000r9we4daszuxvr	40.25143146204177	-111.6472269808313	\N	t	f
cmfd1g7lf00l19we4xvd7t09v	cmfd1g7fh001x9we4v0blgs1w	2025-09-08 09:27:44.486	249	2025-09-09 21:04:01.395	cmfd1g7f1000z9we4fva1gh9w	40.25247365724593	-111.6533173980998	\N	t	f
cmfd1g7lf00l39we4py8er1ub	cmfd1g7f6001e9we4i0t0bcaq	2025-09-03 20:17:51.737	249	2025-09-09 21:04:01.396	cmfd1g7f1000z9we4fva1gh9w	40.25254073897851	-111.6533690441413	selfie_cmfd1g7f6001e9we4i0t0bcaq_cmfd1g7f1000z9we4fva1gh9w.jpg	f	f
cmfd1g7lg00l59we4fepgrz56	cmfd1g7f6001e9we4i0t0bcaq	2025-09-06 04:57:07.924	163	2025-09-09 21:04:01.396	cmfd1g7f300159we4a6eoli3b	40.24971609555909	-111.6471920457289	\N	t	t
cmfd1g7lh00l79we4hhv0nbom	cmfd1g7f6001e9we4i0t0bcaq	2025-09-03 04:15:46.42	165	2025-09-09 21:04:01.397	cmfd1g7f200119we4uecedevr	40.24777988211191	-111.6513586894311	\N	t	f
cmfd1g7lh00l99we4h9a20yy4	cmfd1g7f6001e9we4i0t0bcaq	2025-09-05 06:01:19.344	248	2025-09-09 21:04:01.398	cmfd1g7f0000v9we4navdk4yb	40.24966241253555	-111.6490324447042	selfie_cmfd1g7f6001e9we4i0t0bcaq_cmfd1g7f0000v9we4navdk4yb.jpg	t	f
cmfd1g7li00lb9we4a0wu1uhj	cmfd1g7f6001e9we4i0t0bcaq	2025-09-07 20:51:48.981	122	2025-09-09 21:04:01.398	cmfd1g7f200139we4lo2xy1fx	40.25388335077255	-111.6492043029713	selfie_cmfd1g7f6001e9we4i0t0bcaq_cmfd1g7f200139we4lo2xy1fx.jpg	f	f
cmfd1g7lp00ld9we440hpfiwk	cmfd1g7f6001e9we4i0t0bcaq	2025-09-08 09:35:11.044	127	2025-09-09 21:04:01.406	cmfd1g7ex000r9we4daszuxvr	40.25139677534395	-111.6472320632461	\N	t	f
cmfd1g7lq00lf9we4mehc345v	cmfd1g7f6001e9we4i0t0bcaq	2025-09-08 20:57:35.513	138	2025-09-09 21:04:01.406	cmfd1g7f1000x9we498dhzbd5	40.25417901730381	-111.6505116753713	\N	t	f
cmfd1g7lr00lh9we4lha6ahln	cmfd1g7ff001t9we4ewmqv5te	2025-09-06 01:31:50.289	165	2025-09-09 21:04:01.407	cmfd1g7f200119we4uecedevr	40.24779243182043	-111.6514199746964	selfie_cmfd1g7ff001t9we4ewmqv5te_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7ni00q39we4d37c6fz7	cmfd1g7fg001w9we4j30nmi1b	2025-09-06 13:25:51.951	163	2025-09-09 21:04:01.471	cmfd1g7f300159we4a6eoli3b	40.24976998372176	-111.6472491459313	\N	f	f
cmfd1g7lr00lj9we41v8yy67u	cmfd1g7ff001t9we4ewmqv5te	2025-09-06 10:00:18.573	248	2025-09-09 21:04:01.408	cmfd1g7f0000v9we4navdk4yb	40.24966295872181	-111.6490441121634	selfie_cmfd1g7ff001t9we4ewmqv5te_cmfd1g7f0000v9we4navdk4yb.jpg	f	t
cmfd1g7ls00ll9we45787iyx2	cmfd1g7ff001t9we4ewmqv5te	2025-09-05 12:16:33.533	121	2025-09-09 21:04:01.408	cmfd1g7ez000t9we43738h26y	40.25192197689682	-111.6521701849606	selfie_cmfd1g7ff001t9we4ewmqv5te_cmfd1g7ez000t9we43738h26y.jpg	t	f
cmfd1g7lt00ln9we4ewq0251e	cmfd1g7ff001t9we4ewmqv5te	2025-09-04 20:54:16.882	163	2025-09-09 21:04:01.409	cmfd1g7f300159we4a6eoli3b	40.24967612991155	-111.6472048819603	selfie_cmfd1g7ff001t9we4ewmqv5te_cmfd1g7f300159we4a6eoli3b.jpg	t	f
cmfd1g7lt00lp9we4icgx7yvr	player_19	2025-09-08 19:48:31.365	165	2025-09-09 21:04:01.41	cmfd1g7f200119we4uecedevr	40.24780907398007	-111.6513727826203	\N	f	t
cmfd1g7lu00lr9we4zvrdqmcw	player_19	2025-09-05 10:02:44.985	127	2025-09-09 21:04:01.41	cmfd1g7ex000r9we4daszuxvr	40.25139190887895	-111.6471898741759	\N	f	f
cmfd1g7lv00lt9we4sf7kjbdd	player_19	2025-09-04 07:36:15.54	248	2025-09-09 21:04:01.411	cmfd1g7f0000v9we4navdk4yb	40.24967957503741	-111.6489903845429	selfie_player_19_cmfd1g7f0000v9we4navdk4yb.jpg	f	t
cmfd1g7lw00lv9we44hmqshul	player_19	2025-09-09 18:54:40.556	121	2025-09-09 21:04:01.412	cmfd1g7ez000t9we43738h26y	40.25188118151399	-111.6521708585203	selfie_player_19_cmfd1g7ez000t9we43738h26y.jpg	f	t
cmfd1g7lw00lx9we4iciho3ft	player_19	2025-09-05 06:50:10.256	163	2025-09-09 21:04:01.413	cmfd1g7f300159we4a6eoli3b	40.24971639417792	-111.6472144902811	selfie_player_19_cmfd1g7f300159we4a6eoli3b.jpg	f	f
cmfd1g7lx00lz9we4z2bzfrc1	player_19	2025-09-06 14:54:16.297	249	2025-09-09 21:04:01.414	cmfd1g7f1000z9we4fva1gh9w	40.25247529364061	-111.6533547956819	selfie_player_19_cmfd1g7f1000z9we4fva1gh9w.jpg	f	f
cmfd1g7ly00m19we4sfh2as9b	player_19	2025-09-09 12:06:54.331	154	2025-09-09 21:04:01.414	cmfd1g7f300199we4igr9ok5t	40.2488519136451	-111.6480550822097	selfie_player_19_cmfd1g7f300199we4igr9ok5t.jpg	t	f
cmfd1g7m100m39we493orkk21	player_19	2025-09-05 04:47:56.879	122	2025-09-09 21:04:01.418	cmfd1g7f200139we4lo2xy1fx	40.25392517927249	-111.6491848096353	selfie_player_19_cmfd1g7f200139we4lo2xy1fx.jpg	f	f
cmfd1g7m200m59we44zzzn7h8	player_19	2025-09-03 18:38:06.276	138	2025-09-09 21:04:01.419	cmfd1g7f1000x9we498dhzbd5	40.25419907359258	-111.6506016770605	\N	t	t
cmfd1g7m300m79we47fpjl47t	player_11	2025-09-05 15:48:29.409	249	2025-09-09 21:04:01.419	cmfd1g7f1000z9we4fva1gh9w	40.25253148629774	-111.6533712091863	selfie_player_11_cmfd1g7f1000z9we4fva1gh9w.jpg	f	f
cmfd1g7m400m99we40ugejow3	cmfd1g7fa001k9we4wem31q38	2025-09-05 10:17:29.492	121	2025-09-09 21:04:01.42	cmfd1g7ez000t9we43738h26y	40.25192413938696	-111.6521266207514	\N	t	f
cmfd1g7m500mb9we4nfp4qcw0	cmfd1g7fa001k9we4wem31q38	2025-09-04 01:20:27.271	249	2025-09-09 21:04:01.421	cmfd1g7f1000z9we4fva1gh9w	40.25253638565873	-111.6533442685905	\N	f	f
cmfd1g7m600md9we47njzmxqt	cmfd1g7fa001k9we4wem31q38	2025-09-03 06:25:44.428	165	2025-09-09 21:04:01.422	cmfd1g7f200119we4uecedevr	40.24782578286881	-111.6513423143419	selfie_cmfd1g7fa001k9we4wem31q38_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7m700mf9we4gygutw2j	cmfd1g7fa001k9we4wem31q38	2025-09-04 18:11:45.965	138	2025-09-09 21:04:01.423	cmfd1g7f1000x9we498dhzbd5	40.25421665376076	-111.6505853503972	\N	f	f
cmfd1g7m700mh9we4ycoyndil	cmfd1g7fa001k9we4wem31q38	2025-09-06 10:12:09.314	185	2025-09-09 21:04:01.424	cmfd1g7f300179we4w0lkr8sf	40.24944022080626	-111.6516429771533	selfie_cmfd1g7fa001k9we4wem31q38_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
cmfd1g7m800mj9we4k8y2dca9	cmfd1g7fa001k9we4wem31q38	2025-09-08 10:41:25.025	163	2025-09-09 21:04:01.424	cmfd1g7f300159we4a6eoli3b	40.2496841879321	-111.6471846761824	selfie_cmfd1g7fa001k9we4wem31q38_cmfd1g7f300159we4a6eoli3b.jpg	f	t
cmfd1g7m900ml9we4l3mgdi7v	cmfd1g7fa001k9we4wem31q38	2025-09-04 17:44:15.325	127	2025-09-09 21:04:01.425	cmfd1g7ex000r9we4daszuxvr	40.25137356310633	-111.6472466162155	selfie_cmfd1g7fa001k9we4wem31q38_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7ma00mn9we4w54ox9ol	cmfd1g7fa001k9we4wem31q38	2025-09-08 16:35:27.964	248	2025-09-09 21:04:01.426	cmfd1g7f0000v9we4navdk4yb	40.24968501839209	-111.6490785374444	\N	f	f
cmfd1g7ma00mp9we40cgthyrj	cmfd1g7fa001k9we4wem31q38	2025-09-07 23:22:51.37	154	2025-09-09 21:04:01.427	cmfd1g7f300199we4igr9ok5t	40.24891490425321	-111.6480540919668	\N	t	t
cmfd1g7mb00mr9we490pommxp	cmfd1g7fa001k9we4wem31q38	2025-09-07 07:09:36.803	122	2025-09-09 21:04:01.427	cmfd1g7f200139we4lo2xy1fx	40.25391854047137	-111.6491257313246	selfie_cmfd1g7fa001k9we4wem31q38_cmfd1g7f200139we4lo2xy1fx.jpg	t	f
cmfd1g7mc00mt9we4m8c9ink9	cmfd1g7fs002m9we4z2vmoo1a	2025-09-04 06:56:40.244	121	2025-09-09 21:04:01.429	cmfd1g7ez000t9we43738h26y	40.25185623041147	-111.6521668698599	selfie_cmfd1g7fs002m9we4z2vmoo1a_cmfd1g7ez000t9we43738h26y.jpg	f	f
cmfd1g7md00mv9we4afc6ckhv	cmfd1g7fs002m9we4z2vmoo1a	2025-09-05 02:58:24.389	127	2025-09-09 21:04:01.429	cmfd1g7ex000r9we4daszuxvr	40.25135588812321	-111.6472693803177	\N	f	f
cmfd1g7me00mx9we4j5y9e59x	cmfd1g7fr002k9we4373hx6bo	2025-09-08 06:11:24.787	248	2025-09-09 21:04:01.43	cmfd1g7f0000v9we4navdk4yb	40.24966280746062	-111.6490481343012	\N	t	t
cmfd1g7me00mz9we4n9pm1alr	cmfd1g7fr002k9we4373hx6bo	2025-09-03 17:14:53.075	127	2025-09-09 21:04:01.431	cmfd1g7ex000r9we4daszuxvr	40.25135663039815	-111.6472468614986	\N	f	f
cmfd1g7mf00n19we4fo1m1jf2	cmfd1g7fr002k9we4373hx6bo	2025-09-03 08:10:59.978	163	2025-09-09 21:04:01.432	cmfd1g7f300159we4a6eoli3b	40.24971020731164	-111.6472212032407	selfie_cmfd1g7fr002k9we4373hx6bo_cmfd1g7f300159we4a6eoli3b.jpg	t	f
cmfd1g7mg00n39we4dm520p2p	cmfd1g7f8001h9we4xl87qe5x	2025-09-02 21:31:05.461	248	2025-09-09 21:04:01.432	cmfd1g7f0000v9we4navdk4yb	40.2496396774227	-111.6490304366583	selfie_cmfd1g7f8001h9we4xl87qe5x_cmfd1g7f0000v9we4navdk4yb.jpg	f	t
cmfd1g7mg00n59we4szm34fwc	cmfd1g7f8001h9we4xl87qe5x	2025-09-08 17:01:21.54	165	2025-09-09 21:04:01.433	cmfd1g7f200119we4uecedevr	40.24774321147657	-111.6514159862307	\N	f	f
cmfd1g7mh00n79we4s0c2vkza	cmfd1g7f8001h9we4xl87qe5x	2025-09-06 14:13:35.02	122	2025-09-09 21:04:01.433	cmfd1g7f200139we4lo2xy1fx	40.25384654616753	-111.6491888548722	selfie_cmfd1g7f8001h9we4xl87qe5x_cmfd1g7f200139we4lo2xy1fx.jpg	f	f
cmfd1g7mi00n99we4an51psk0	cmfd1g7f8001h9we4xl87qe5x	2025-09-03 13:24:13.944	185	2025-09-09 21:04:01.434	cmfd1g7f300179we4w0lkr8sf	40.24943011982403	-111.6516213528817	selfie_cmfd1g7f8001h9we4xl87qe5x_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
cmfd1g7mj00nb9we4p0ga5m83	cmfd1g7f8001h9we4xl87qe5x	2025-09-05 14:24:55.95	154	2025-09-09 21:04:01.435	cmfd1g7f300199we4igr9ok5t	40.24892517640274	-111.6480072464669	selfie_cmfd1g7f8001h9we4xl87qe5x_cmfd1g7f300199we4igr9ok5t.jpg	t	f
cmfd1g7mj00nd9we4rtsxpufb	cmfd1g7f8001h9we4xl87qe5x	2025-09-05 12:37:06.257	138	2025-09-09 21:04:01.436	cmfd1g7f1000x9we498dhzbd5	40.25413270812111	-111.6505815014116	\N	t	f
cmfd1g7mk00nf9we40j5yc6r4	cmfd1g7fj00239we4994zi1hy	2025-09-04 15:25:55.255	154	2025-09-09 21:04:01.436	cmfd1g7f300199we4igr9ok5t	40.24886106237965	-111.6481009428539	\N	f	f
cmfd1g7mk00nh9we4wjmamflm	cmfd1g7fj00239we4994zi1hy	2025-09-04 01:50:10.034	127	2025-09-09 21:04:01.437	cmfd1g7ex000r9we4daszuxvr	40.25134249990336	-111.6472166598916	selfie_cmfd1g7fj00239we4994zi1hy_cmfd1g7ex000r9we4daszuxvr.jpg	t	f
cmfd1g7ml00nj9we4k5y68q16	cmfd1g7ff001u9we4d22offi8	2025-09-09 04:26:23.357	121	2025-09-09 21:04:01.437	cmfd1g7ez000t9we43738h26y	40.25183984605304	-111.6521686391647	\N	f	t
cmfd1g7ml00nl9we48fa3qaat	cmfd1g7ff001u9we4d22offi8	2025-09-04 08:35:39.872	163	2025-09-09 21:04:01.438	cmfd1g7f300159we4a6eoli3b	40.24972008889264	-111.6472507869414	selfie_cmfd1g7ff001u9we4d22offi8_cmfd1g7f300159we4a6eoli3b.jpg	f	f
cmfd1g7mm00nn9we4ly2nezg1	cmfd1g7ff001u9we4d22offi8	2025-09-07 17:34:30.758	154	2025-09-09 21:04:01.439	cmfd1g7f300199we4igr9ok5t	40.24884401247344	-111.6480554871108	selfie_cmfd1g7ff001u9we4d22offi8_cmfd1g7f300199we4igr9ok5t.jpg	f	f
cmfd1g7mn00np9we4jzqygo6a	cmfd1g7ff001u9we4d22offi8	2025-09-06 14:20:39.465	127	2025-09-09 21:04:01.44	cmfd1g7ex000r9we4daszuxvr	40.25134442316487	-111.6472629101447	\N	f	f
cmfd1g7mo00nr9we4ho01xvrm	cmfd1g7ff001u9we4d22offi8	2025-09-06 11:04:08.084	165	2025-09-09 21:04:01.441	cmfd1g7f200119we4uecedevr	40.24774622100169	-111.6514195996011	selfie_cmfd1g7ff001u9we4d22offi8_cmfd1g7f200119we4uecedevr.jpg	f	f
cmfd1g7mp00nt9we4ofgnd9vt	cmfd1g7ff001u9we4d22offi8	2025-09-04 01:50:18.374	248	2025-09-09 21:04:01.442	cmfd1g7f0000v9we4navdk4yb	40.24971090153767	-111.6490792795104	\N	t	f
cmfd1g7mq00nv9we44qlpw4jc	cmfd1g7fk00249we4z4fi7drx	2025-09-07 04:20:42.4	121	2025-09-09 21:04:01.442	cmfd1g7ez000t9we43738h26y	40.25187410745959	-111.6520972248991	\N	f	f
cmfd1g7mq00nx9we4z18xwmd1	cmfd1g7fk00249we4z4fi7drx	2025-09-05 00:39:28.855	127	2025-09-09 21:04:01.443	cmfd1g7ex000r9we4daszuxvr	40.25143831230145	-111.6472367984055	selfie_cmfd1g7fk00249we4z4fi7drx_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7mr00nz9we4beife4yv	cmfd1g7fk00249we4z4fi7drx	2025-09-07 06:48:20.131	185	2025-09-09 21:04:01.443	cmfd1g7f300179we4w0lkr8sf	40.24943752961744	-111.6516696951951	\N	f	f
cmfd1g7ms00o19we4th8x2c3f	cmfd1g7fo002d9we446b2hwup	2025-09-07 22:54:19.465	165	2025-09-09 21:04:01.444	cmfd1g7f200119we4uecedevr	40.2478180728126	-111.6513404612246	\N	t	f
cmfd1g7ms00o39we48hhq0l3b	cmfd1g7fo002d9we446b2hwup	2025-09-08 05:49:19.124	163	2025-09-09 21:04:01.445	cmfd1g7f300159we4a6eoli3b	40.24968339239573	-111.6471985557794	\N	f	f
cmfd1g7mt00o59we40z49ndzu	cmfd1g7fo002d9we446b2hwup	2025-09-04 11:18:55.775	249	2025-09-09 21:04:01.445	cmfd1g7f1000z9we4fva1gh9w	40.25254889629245	-111.6533236461201	selfie_cmfd1g7fo002d9we446b2hwup_cmfd1g7f1000z9we4fva1gh9w.jpg	f	t
cmfd1g7mv00o79we4pdfe2kk5	cmfd1g7fo002d9we446b2hwup	2025-09-04 15:49:46.662	248	2025-09-09 21:04:01.448	cmfd1g7f0000v9we4navdk4yb	40.24968916894777	-111.6490492531306	selfie_cmfd1g7fo002d9we446b2hwup_cmfd1g7f0000v9we4navdk4yb.jpg	f	f
cmfd1g7mw00o99we47l33lh9t	cmfd1g7fo002d9we446b2hwup	2025-09-08 13:42:00.196	122	2025-09-09 21:04:01.448	cmfd1g7f200139we4lo2xy1fx	40.25390702965858	-111.6491568206885	\N	f	f
cmfd1g7mx00ob9we44p1gpxbu	cmfd1g7fo002d9we446b2hwup	2025-09-07 04:51:00.831	138	2025-09-09 21:04:01.449	cmfd1g7f1000x9we498dhzbd5	40.25417731791497	-111.6505793613021	\N	f	f
cmfd1g7mx00od9we40cg4ifov	cmfd1g7fo002d9we446b2hwup	2025-09-08 13:19:04.413	185	2025-09-09 21:04:01.45	cmfd1g7f300179we4w0lkr8sf	40.24942069701799	-111.6516343151498	\N	t	f
cmfd1g7my00of9we49hml2bgt	cmfd1g7fo002d9we446b2hwup	2025-09-09 01:21:00.441	127	2025-09-09 21:04:01.45	cmfd1g7ex000r9we4daszuxvr	40.25143502352251	-111.6472255368478	\N	f	f
cmfd1g7mz00oh9we4n4ma90ws	player_15	2025-09-06 15:25:43.235	127	2025-09-09 21:04:01.451	cmfd1g7ex000r9we4daszuxvr	40.25135214154135	-111.6472322876562	\N	f	t
cmfd1g7n000oj9we4xlkeeofj	cmfd1g7fj00229we469ztyy6c	2025-09-08 07:34:02.979	185	2025-09-09 21:04:01.452	cmfd1g7f300179we4w0lkr8sf	40.24944030613144	-111.6516288958277	\N	t	f
cmfd1g7n000ol9we4x5itp4es	cmfd1g7fj00229we469ztyy6c	2025-09-08 05:31:33.502	163	2025-09-09 21:04:01.453	cmfd1g7f300159we4a6eoli3b	40.24974233690975	-111.647188453119	selfie_cmfd1g7fj00229we469ztyy6c_cmfd1g7f300159we4a6eoli3b.jpg	f	f
cmfd1g7n100on9we4fg63ynni	cmfd1g7fj00229we469ztyy6c	2025-09-04 12:20:08.276	154	2025-09-09 21:04:01.453	cmfd1g7f300199we4igr9ok5t	40.2488510399251	-111.6480614693064	\N	f	f
cmfd1g7n200op9we4xqed7xnf	cmfd1g7fj00229we469ztyy6c	2025-09-03 06:43:35.416	127	2025-09-09 21:04:01.454	cmfd1g7ex000r9we4daszuxvr	40.25140984654203	-111.647261460809	selfie_cmfd1g7fj00229we469ztyy6c_cmfd1g7ex000r9we4daszuxvr.jpg	t	f
cmfd1g7n300or9we4vuqu30ri	cmfd1g7fp002f9we4k9pjjzcu	2025-09-07 10:51:47.392	127	2025-09-09 21:04:01.455	cmfd1g7ex000r9we4daszuxvr	40.25142035632356	-111.6472347903131	\N	f	t
cmfd1g7n400ot9we4tjk7vzr3	cmfd1g7fp002f9we4k9pjjzcu	2025-09-03 08:01:45.606	185	2025-09-09 21:04:01.456	cmfd1g7f300179we4w0lkr8sf	40.24943319712049	-111.6516224523133	\N	f	t
cmfd1g7n400ov9we4jr8pgnh0	cmfd1g7fp002f9we4k9pjjzcu	2025-09-09 20:53:07.645	154	2025-09-09 21:04:01.457	cmfd1g7f300199we4igr9ok5t	40.24885919567723	-111.6480803487523	selfie_cmfd1g7fp002f9we4k9pjjzcu_cmfd1g7f300199we4igr9ok5t.jpg	f	f
cmfd1g7n500ox9we4n2bjni77	cmfd1g7f6001d9we4b7mn55ov	2025-09-03 21:37:58.573	127	2025-09-09 21:04:01.458	cmfd1g7ex000r9we4daszuxvr	40.25140569359559	-111.6472484170082	\N	f	f
cmfd1g7n600oz9we47fycaelu	cmfd1g7fp002g9we4fwxmmn0c	2025-09-03 06:52:42.862	122	2025-09-09 21:04:01.458	cmfd1g7f200139we4lo2xy1fx	40.25387277091351	-111.6491791923497	\N	f	t
cmfd1g7n600p19we452nt3z2y	cmfd1g7fp002g9we4fwxmmn0c	2025-09-04 07:15:39.398	154	2025-09-09 21:04:01.459	cmfd1g7f300199we4igr9ok5t	40.24889568224792	-111.6480431767193	\N	f	f
cmfd1g7n700p39we4huqpyj7d	cmfd1g7fp002g9we4fwxmmn0c	2025-09-03 16:53:04.215	249	2025-09-09 21:04:01.459	cmfd1g7f1000z9we4fva1gh9w	40.25250747837765	-111.6533529560275	selfie_cmfd1g7fp002g9we4fwxmmn0c_cmfd1g7f1000z9we4fva1gh9w.jpg	t	f
cmfd1g7n700p59we4zmd3d244	cmfd1g7fp002g9we4fwxmmn0c	2025-09-05 16:24:01.508	163	2025-09-09 21:04:01.46	cmfd1g7f300159we4a6eoli3b	40.24974184162885	-111.6472594448365	\N	t	f
cmfd1g7n800p79we4kwsjvvgy	cmfd1g7fp002g9we4fwxmmn0c	2025-09-03 14:27:12.914	121	2025-09-09 21:04:01.46	cmfd1g7ez000t9we43738h26y	40.25189923189089	-111.6521429347797	selfie_cmfd1g7fp002g9we4fwxmmn0c_cmfd1g7ez000t9we43738h26y.jpg	f	f
cmfd1g7n900p99we4rb2tcu28	cmfd1g7fp002g9we4fwxmmn0c	2025-09-04 23:40:17.927	248	2025-09-09 21:04:01.461	cmfd1g7f0000v9we4navdk4yb	40.24971487213612	-111.6490142993721	selfie_cmfd1g7fp002g9we4fwxmmn0c_cmfd1g7f0000v9we4navdk4yb.jpg	f	f
cmfd1g7n900pb9we44eu28yme	cmfd1g7fp002g9we4fwxmmn0c	2025-09-03 22:59:47.346	165	2025-09-09 21:04:01.462	cmfd1g7f200119we4uecedevr	40.24773766932714	-111.6513619059048	\N	f	t
cmfd1g7na00pd9we4nnyt5gfy	cmfd1g7f5001c9we4sn9qrszs	2025-09-03 02:11:32.276	163	2025-09-09 21:04:01.462	cmfd1g7f300159we4a6eoli3b	40.24969693837458	-111.6472601847513	\N	f	f
cmfd1g7na00pf9we47buqrq7r	cmfd1g7f5001c9we4sn9qrszs	2025-09-04 09:00:39.501	249	2025-09-09 21:04:01.463	cmfd1g7f1000z9we4fva1gh9w	40.25247400446356	-111.6533706018541	\N	f	f
cmfd1g7nb00ph9we4cmc8bbye	cmfd1g7f5001c9we4sn9qrszs	2025-09-08 02:54:35.089	165	2025-09-09 21:04:01.463	cmfd1g7f200119we4uecedevr	40.24777338215502	-111.6514094815392	\N	f	f
cmfd1g7nc00pj9we47m7jyg0c	cmfd1g7f5001c9we4sn9qrszs	2025-09-05 17:21:41.086	248	2025-09-09 21:04:01.464	cmfd1g7f0000v9we4navdk4yb	40.2496406672802	-111.6490024134699	\N	f	f
cmfd1g7nc00pl9we4pleqk6ik	cmfd1g7f5001c9we4sn9qrszs	2025-09-07 12:32:27.663	138	2025-09-09 21:04:01.465	cmfd1g7f1000x9we498dhzbd5	40.25415211697992	-111.6505444547671	\N	f	t
cmfd1g7nd00pn9we4y343vuy5	player_13	2025-09-08 03:21:30.543	248	2025-09-09 21:04:01.466	cmfd1g7f0000v9we4navdk4yb	40.24972080175564	-111.6490078902909	selfie_player_13_cmfd1g7f0000v9we4navdk4yb.jpg	f	f
cmfd1g7ne00pp9we4upegix7l	player_13	2025-09-03 13:25:49.736	185	2025-09-09 21:04:01.466	cmfd1g7f300179we4w0lkr8sf	40.24939814039755	-111.6516892233719	\N	f	f
cmfd1g7ne00pr9we4jj785ra6	player_13	2025-09-07 17:26:49.689	122	2025-09-09 21:04:01.467	cmfd1g7f200139we4lo2xy1fx	40.25387170705737	-111.6492005704372	\N	f	f
cmfd1g7nf00pt9we4046hvlo7	cmfd1g7fg001w9we4j30nmi1b	2025-09-09 11:00:07.295	165	2025-09-09 21:04:01.468	cmfd1g7f200119we4uecedevr	40.24779018712959	-111.6513527564483	\N	f	f
cmfd1g7ng00pv9we4epmom14k	cmfd1g7fg001w9we4j30nmi1b	2025-09-05 23:22:30.57	122	2025-09-09 21:04:01.468	cmfd1g7f200139we4lo2xy1fx	40.25387502273601	-111.6491250782566	\N	f	f
cmfd1g7nh00px9we4u3d1s22u	cmfd1g7fg001w9we4j30nmi1b	2025-09-07 07:51:28.269	185	2025-09-09 21:04:01.469	cmfd1g7f300179we4w0lkr8sf	40.24943808255571	-111.6516271158489	selfie_cmfd1g7fg001w9we4j30nmi1b_cmfd1g7f300179we4w0lkr8sf.jpg	t	f
cmfd1g7nh00pz9we4gi5jcsjl	cmfd1g7fg001w9we4j30nmi1b	2025-09-04 19:02:12.346	249	2025-09-09 21:04:01.47	cmfd1g7f1000z9we4fva1gh9w	40.25245412813967	-111.6533284723852	selfie_cmfd1g7fg001w9we4j30nmi1b_cmfd1g7f1000z9we4fva1gh9w.jpg	f	t
cmfd1g7ni00q19we4218z4kjc	cmfd1g7fg001w9we4j30nmi1b	2025-09-02 23:36:42.759	138	2025-09-09 21:04:01.47	cmfd1g7f1000x9we498dhzbd5	40.25420861248993	-111.6505104974315	selfie_cmfd1g7fg001w9we4j30nmi1b_cmfd1g7f1000x9we498dhzbd5.jpg	t	f
cmfd1g7nj00q59we4qjrxj7qm	cmfd1g7fg001w9we4j30nmi1b	2025-09-09 03:47:04.269	121	2025-09-09 21:04:01.472	cmfd1g7ez000t9we43738h26y	40.2518460423412	-111.6521448155366	\N	f	f
cmfd1g7nk00q79we472deyo2g	cmfd1g7fg001w9we4j30nmi1b	2025-09-07 02:01:00.852	154	2025-09-09 21:04:01.473	cmfd1g7f300199we4igr9ok5t	40.24885397007265	-111.6480900075245	\N	f	f
cmfd1g7nl00q99we4rlkf4l4k	cmfd1g7fm00299we4sxis3ytu	2025-09-09 20:26:50.709	127	2025-09-09 21:04:01.473	cmfd1g7ex000r9we4daszuxvr	40.25139716298989	-111.6472443444502	selfie_cmfd1g7fm00299we4sxis3ytu_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7nl00qb9we4inf5ayre	cmfd1g7f8001g9we4s309hn4s	2025-09-03 16:51:30.104	165	2025-09-09 21:04:01.474	cmfd1g7f200119we4uecedevr	40.24778008440074	-111.6513757030814	\N	f	f
cmfd1g7nm00qd9we4uydsrq4o	cmfd1g7f8001g9we4s309hn4s	2025-09-06 08:44:31.63	122	2025-09-09 21:04:01.474	cmfd1g7f200139we4lo2xy1fx	40.25387003315476	-111.6491496146363	selfie_cmfd1g7f8001g9we4s309hn4s_cmfd1g7f200139we4lo2xy1fx.jpg	t	f
cmfd1g7nm00qf9we46lyhu98k	cmfd1g7f8001g9we4s309hn4s	2025-09-05 12:08:00.842	127	2025-09-09 21:04:01.475	cmfd1g7ex000r9we4daszuxvr	40.2513497773798	-111.6472181600295	\N	f	t
cmfd1g7nn00qh9we44n8r045a	cmfd1g7f8001g9we4s309hn4s	2025-09-05 13:07:44.947	163	2025-09-09 21:04:01.476	cmfd1g7f300159we4a6eoli3b	40.24970632247869	-111.6472541002257	\N	f	t
cmfd1g7no00qj9we4z613zxcj	cmfd1g7f8001g9we4s309hn4s	2025-09-04 18:15:50.784	154	2025-09-09 21:04:01.476	cmfd1g7f300199we4igr9ok5t	40.24887118848719	-111.6480202006386	\N	f	t
cmfd1g7no00ql9we4rrb6ef0g	cmfd1g7f8001g9we4s309hn4s	2025-09-04 14:47:57.845	185	2025-09-09 21:04:01.477	cmfd1g7f300179we4w0lkr8sf	40.24941514615966	-111.6517109061462	selfie_cmfd1g7f8001g9we4s309hn4s_cmfd1g7f300179we4w0lkr8sf.jpg	f	t
cmfd1g7np00qn9we4m1hdon8p	cmfd1g7f8001g9we4s309hn4s	2025-09-08 09:03:40.134	138	2025-09-09 21:04:01.477	cmfd1g7f1000x9we498dhzbd5	40.25419099935227	-111.6505511509006	selfie_cmfd1g7f8001g9we4s309hn4s_cmfd1g7f1000x9we498dhzbd5.jpg	f	f
cmfd1g7np00qp9we4qare0myx	cmfd1g7f8001g9we4s309hn4s	2025-09-07 22:22:14.826	248	2025-09-09 21:04:01.478	cmfd1g7f0000v9we4navdk4yb	40.24967002461013	-111.6490841257187	\N	t	f
cmfd1g7nq00qr9we4skew7n9e	cmfd1g7f8001g9we4s309hn4s	2025-09-07 08:31:09.06	121	2025-09-09 21:04:01.478	cmfd1g7ez000t9we43738h26y	40.25190340932913	-111.6521487481716	selfie_cmfd1g7f8001g9we4s309hn4s_cmfd1g7ez000t9we43738h26y.jpg	f	f
cmfd1g7nr00qt9we43qvolrvg	cmfd1g7f8001g9we4s309hn4s	2025-09-04 17:04:39.218	249	2025-09-09 21:04:01.479	cmfd1g7f1000z9we4fva1gh9w	40.25249630078194	-111.6533673901151	selfie_cmfd1g7f8001g9we4s309hn4s_cmfd1g7f1000z9we4fva1gh9w.jpg	t	f
cmfd1g7nr00qv9we4p3qfklc9	cmfd1g7fp002h9we4cozrxoag	2025-09-04 16:40:08.757	121	2025-09-09 21:04:01.48	cmfd1g7ez000t9we43738h26y	40.25190956197137	-111.6521479942869	\N	f	f
cmfd1g7ns00qx9we4a6i1pavb	cmfd1g7fp002h9we4cozrxoag	2025-09-09 01:00:20.881	165	2025-09-09 21:04:01.481	cmfd1g7f200119we4uecedevr	40.24773995182719	-111.6514232276151	\N	f	f
cmfd1g7nt00qz9we4xj6e49zd	cmfd1g7fp002h9we4cozrxoag	2025-09-09 04:33:22.578	122	2025-09-09 21:04:01.482	cmfd1g7f200139we4lo2xy1fx	40.25386765437066	-111.6491448838761	\N	f	t
cmfd1g7nu00r19we4y144lvvr	cmfd1g7fp002h9we4cozrxoag	2025-09-08 10:17:16.628	127	2025-09-09 21:04:01.482	cmfd1g7ex000r9we4daszuxvr	40.2513495602607	-111.6471766615248	selfie_cmfd1g7fp002h9we4cozrxoag_cmfd1g7ex000r9we4daszuxvr.jpg	f	f
cmfd1g7nv00r39we4w412drll	cmfd1g7fp002h9we4cozrxoag	2025-09-04 02:11:27.246	138	2025-09-09 21:04:01.483	cmfd1g7f1000x9we498dhzbd5	40.25421652054737	-111.6505567625854	selfie_cmfd1g7fp002h9we4cozrxoag_cmfd1g7f1000x9we498dhzbd5.jpg	f	f
cmfd1g7nv00r59we42mnivdvx	cmfd1g7fp002h9we4cozrxoag	2025-09-05 13:28:10.179	248	2025-09-09 21:04:01.484	cmfd1g7f0000v9we4navdk4yb	40.24964633071006	-111.6490049976246	\N	f	f
cmfd1g7nw00r79we4uh7tirjl	cmfd1g7fp002h9we4cozrxoag	2025-09-09 02:16:09.034	249	2025-09-09 21:04:01.484	cmfd1g7f1000z9we4fva1gh9w	40.25245800643875	-111.6532989062699	\N	f	t
cmfd1g7nx00r99we47zemb6gu	cmfd1g7fp002h9we4cozrxoag	2025-09-07 16:51:53.489	163	2025-09-09 21:04:01.485	cmfd1g7f300159we4a6eoli3b	40.24974993176179	-111.6472531395059	\N	f	f
cmfd1g7nx00rb9we4fzzx4pb2	cmfd1g7fp002h9we4cozrxoag	2025-09-08 11:20:47.824	154	2025-09-09 21:04:01.486	cmfd1g7f300199we4igr9ok5t	40.24886798374097	-111.648104361957	\N	f	f
cmfd1g7ny00rd9we4lahvchwk	cmfd1g7fp002h9we4cozrxoag	2025-09-07 14:45:12.368	185	2025-09-09 21:04:01.487	cmfd1g7f300179we4w0lkr8sf	40.24942279483096	-111.6516310871569	selfie_cmfd1g7fp002h9we4cozrxoag_cmfd1g7f300179we4w0lkr8sf.jpg	f	f
\.


--
-- Data for Name: ClueLocation; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."ClueLocation" (id, "identifyingName", "anonymizedName", latitude, longitude, text, hint, "gpsVerificationRadius", "requiresSelfie", "createdAt", "updatedAt") FROM stdin;
clue1	Central Park Fountain	The Fountain	40.7829	-73.9654	Look for the bronze statue by the water feature	Near the heart of the park	1.5	t	2025-09-07 17:51:09.94	2025-09-07 17:51:09.94
clue2	Library Steps	Stone Steps	40.7831	-73.9712	Count the steps to knowledge	Where books meet the sky	1.5	t	2025-09-07 17:51:09.94	2025-09-07 17:51:09.94
clue3	Coffee Shop Corner	The Corner Cafe	40.7805	-73.9733	Find the daily special menu	Where caffeine flows freely	1.5	t	2025-09-07 17:51:09.94	2025-09-07 17:51:09.94
cmfack5nf00009wndsiv1xqyp	Metropolitan Museum of Art	Art Museum	40.7794	-73.9632	Find the grand staircase in this world-famous art museum.	Look for the iconic steps where many movies have been filmed.	20	t	2025-09-07 23:51:42.747	2025-09-07 23:51:42.747
cmfack5ni00019wnd2kcsjgya	Guggenheim Museum	Spiral Museum	40.783	-73.959	Discover the unique spiral architecture of this modern art museum.	The building itself is a work of art with a distinctive shape.	15	t	2025-09-07 23:51:42.751	2025-09-07 23:51:42.751
cmfack5nj00029wnd0lzce3wg	Central Park Zoo	Animal Park	40.7681	-73.9719	Visit the sea lions at this urban zoo in the heart of the park.	Listen for the barking sounds near the water.	25	t	2025-09-07 23:51:42.751	2025-09-07 23:51:42.751
cmfack5nj00039wndx9rrpe00	Belvedere Castle	Park Castle	40.7795	-73.9692	Climb to the top of this Victorian castle for panoramic views.	It's the highest point in Central Park.	20	t	2025-09-07 23:51:42.752	2025-09-07 23:51:42.752
cmfack5nk00049wndzhsxk6q3	Strawberry Fields	Memorial Garden	40.7756	-73.9762	Pay tribute at this peaceful memorial garden dedicated to a music legend.	Look for the mosaic with the word 'Imagine'.	15	t	2025-09-07 23:51:42.752	2025-09-07 23:51:42.752
cmfack5nk00059wndljym5z74	Rockefeller Center	Art Deco Complex	40.7587	-73.9787	Find the famous ice skating rink and golden statue.	Look for the golden figure above the skating area.	30	t	2025-09-07 23:51:42.753	2025-09-07 23:51:42.753
cmfack5nl00069wndga8lraw9	St. Patrick's Cathedral	Gothic Cathedral	40.7584	-73.9762	Marvel at the stunning Gothic architecture of this historic cathedral.	It's the largest Gothic-style Catholic cathedral in the United States.	20	t	2025-09-07 23:51:42.753	2025-09-07 23:51:42.753
cmfack5nm00079wndik6olf9d	Museum of Modern Art	Modern Art Gallery	40.7614	-73.9776	Discover contemporary masterpieces in this world-renowned museum.	Look for the famous painting with melting clocks.	25	t	2025-09-07 23:51:42.754	2025-09-07 23:51:42.754
cmfack5nm00089wndqj1ededo	Carnegie Hall	Concert Venue	40.7648	-73.9808	Stand where the world's greatest musicians have performed.	This legendary venue has hosted performances for over 130 years.	15	t	2025-09-07 23:51:42.755	2025-09-07 23:51:42.755
cmfack5nn00099wndfip98z2q	Radio City Music Hall	Art Deco Theater	40.76	-73.9799	Experience the grandeur of this iconic Art Deco theater.	Look for the famous Rockettes and the Great Stage.	20	t	2025-09-07 23:51:42.755	2025-09-07 23:51:42.755
cmfack5nn000a9wnd10enhn5g	One World Trade Center	Freedom Tower	40.7127	-74.0134	Visit the tallest building in the Western Hemisphere.	This tower stands as a symbol of resilience and hope.	30	t	2025-09-07 23:51:42.756	2025-09-07 23:51:42.756
cmfack5no000b9wndwyqt9uol	Trinity Church	Historic Church	40.7081	-74.0121	Explore this historic church that survived the Great Fire of 1776.	Look for the famous cemetery with notable graves.	20	t	2025-09-07 23:51:42.756	2025-09-07 23:51:42.756
cmfack5no000c9wndra3yzavn	Federal Hall	Historic Building	40.7074	-74.0105	Stand where George Washington was inaugurated as President.	This building witnessed the birth of American democracy.	15	t	2025-09-07 23:51:42.757	2025-09-07 23:51:42.757
cmfack5np000d9wnddh55wsyz	Charging Bull	Bronze Statue	40.7055	-74.0134	Find the famous bronze bull that symbolizes Wall Street's power.	This statue represents the strength and resilience of the American people.	10	t	2025-09-07 23:51:42.757	2025-09-07 23:51:42.757
cmfack5np000e9wndzx4lnxqo	South Street Seaport	Historic Port	40.7074	-74.0033	Explore this historic port area with its cobblestone streets.	Look for the tall ships and maritime museum.	25	t	2025-09-07 23:51:42.758	2025-09-07 23:51:42.758
cmfack5nq000f9wndr4p2jdfb	Brooklyn Museum	Art Museum	40.6712	-73.9638	Discover one of the largest art museums in the United States.	This museum houses an extensive collection of Egyptian art.	30	t	2025-09-07 23:51:42.758	2025-09-07 23:51:42.758
cmfack5nq000g9wnd07vowc5s	Prospect Park	Urban Park	40.6602	-73.969	Find the beautiful lake and boathouse in this expansive park.	This park was designed by the same architects as Central Park.	40	t	2025-09-07 23:51:42.759	2025-09-07 23:51:42.759
cmfack5nr000h9wnd87iua02k	Coney Island Boardwalk	Historic Boardwalk	40.5749	-73.9857	Walk along this historic boardwalk and enjoy the ocean views.	Look for the famous amusement park and hot dog stands.	50	t	2025-09-07 23:51:42.759	2025-09-07 23:51:42.759
cmfack5nr000i9wnd78hng7lf	DUMBO	Historic District	40.7033	-73.9881	Explore this trendy neighborhood under the Manhattan Bridge.	This area is famous for its cobblestone streets and art galleries.	30	t	2025-09-07 23:51:42.759	2025-09-07 23:51:42.759
cmfack5nr000j9wnduaz34kwp	Brooklyn Heights Promenade	Scenic Walkway	40.6962	-73.9969	Enjoy stunning views of Manhattan from this elevated walkway.	This promenade offers one of the best views of the NYC skyline.	25	t	2025-09-07 23:51:42.76	2025-09-07 23:51:42.76
cmfack5ns000k9wnd5dwqpb3u	Flushing Meadows Park	World's Fair Park	40.7505	-73.8444	Visit the site of two World's Fairs and see the iconic Unisphere.	This park hosted the 1964-65 World's Fair.	40	t	2025-09-07 23:51:42.76	2025-09-07 23:51:42.76
cmfack5ns000l9wnd4p07153h	Museum of the Moving Image	Film Museum	40.7566	-73.8444	Explore the history of film, television, and digital media.	This museum is dedicated to the art and technology of moving images.	20	t	2025-09-07 23:51:42.761	2025-09-07 23:51:42.761
cmfack5nt000m9wnddm92ladm	Queens Botanical Garden	Botanical Garden	40.7515	-73.8256	Discover beautiful gardens and sustainable landscapes.	This garden focuses on environmental stewardship and education.	30	t	2025-09-07 23:51:42.761	2025-09-07 23:51:42.761
cmfack5nt000n9wndxfasdynu	Astoria Park	Riverside Park	40.7806	-73.9217	Enjoy waterfront views and the largest public pool in NYC.	This park offers stunning views of the East River and Manhattan.	35	t	2025-09-07 23:51:42.761	2025-09-07 23:51:42.761
cmfack5nt000o9wndrji00p9j	Socrates Sculpture Park	Outdoor Art Park	40.7706	-73.9361	Experience contemporary art in this outdoor sculpture park.	This park transforms a former landfill into a vibrant art space.	25	t	2025-09-07 23:51:42.762	2025-09-07 23:51:42.762
cmfack5nu000p9wnddpeqn8h4	Bronx Zoo	Wildlife Park	40.8506	-73.8769	Visit one of the largest metropolitan zoos in the world.	This zoo is home to over 4,000 animals representing 650 species.	50	t	2025-09-07 23:51:42.762	2025-09-07 23:51:42.762
cmfack5nu000q9wndt8dg3o25	New York Botanical Garden	Plant Garden	40.8621	-73.8801	Explore 250 acres of beautiful gardens and plant collections.	This garden features a historic glasshouse and native forest.	40	t	2025-09-07 23:51:42.762	2025-09-07 23:51:42.762
cmfack5nu000r9wndke4ubw83	Yankee Stadium	Baseball Stadium	40.8296	-73.9262	Visit the home of the most successful team in baseball history.	This stadium is known as 'The House That Ruth Built'.	30	t	2025-09-07 23:51:42.763	2025-09-07 23:51:42.763
cmfack5nv000s9wndaa2qb2ol	Arthur Avenue	Little Italy	40.8569	-73.8844	Experience authentic Italian culture and cuisine.	This area is known for its traditional Italian markets and restaurants.	25	t	2025-09-07 23:51:42.763	2025-09-07 23:51:42.763
cmfack5nw000t9wndmi674ozr	Van Cortlandt Park	Large Park	40.8976	-73.8979	Explore the third largest park in New York City.	This park features a historic house and extensive hiking trails.	45	t	2025-09-07 23:51:42.764	2025-09-07 23:51:42.764
cmfack5nw000u9wndoj37v9ht	Staten Island Ferry	Ferry Terminal	40.6415	-74.0776	Take in the free ferry ride with spectacular views of the Statue of Liberty.	This ferry offers the best free view of the NYC skyline.	20	t	2025-09-07 23:51:42.765	2025-09-07 23:51:42.765
cmfack5nw000v9wnd4ng5mwxv	Snug Harbor Cultural Center	Cultural Center	40.6453	-74.1031	Discover this historic cultural center with beautiful gardens.	This center was once a home for retired sailors.	35	t	2025-09-07 23:51:42.765	2025-09-07 23:51:42.765
cmfack5nx000w9wnd64jm5bhq	Fort Wadsworth	Historic Fort	40.6064	-74.0561	Explore this historic military fort with views of the Verrazano Bridge.	This fort has protected New York Harbor for over 200 years.	30	t	2025-09-07 23:51:42.765	2025-09-07 23:51:42.765
cmfack5nx000x9wnd4hf5n51a	Conference House Park	Historic Park	40.5032	-74.2519	Visit the site of the 1776 peace conference during the Revolutionary War.	This is where the last attempt at peace was made before independence.	25	t	2025-09-07 23:51:42.766	2025-09-07 23:51:42.766
cmfack5ny000y9wndo65gc4cl	Staten Island Museum	Local Museum	40.6415	-74.0776	Learn about Staten Island's natural and cultural history.	This museum features exhibits on local history and natural science.	20	t	2025-09-07 23:51:42.766	2025-09-07 23:51:42.766
cmfack5ny000z9wndtpxbwgpy	High Line Park	Elevated Park	40.748	-74.0048	Walk along this unique elevated park built on an old railway.	This park offers great views of the city and Hudson River.	30	t	2025-09-07 23:51:42.766	2025-09-07 23:51:42.766
cmfack5ny00109wnddiucoj5k	Chelsea Market	Food Market	40.7424	-74.0061	Explore this famous food market in a converted factory building.	This market is housed in the former Nabisco factory.	25	t	2025-09-07 23:51:42.767	2025-09-07 23:51:42.767
cmfack5nz00119wnd8w9xbgur	Washington Square Park	Historic Square	40.7308	-73.9973	Visit this famous park with its iconic arch and fountain.	This park is the heart of Greenwich Village.	30	t	2025-09-07 23:51:42.767	2025-09-07 23:51:42.767
cmfack5nz00129wndnwtgw7yi	Union Square	Public Square	40.7357	-73.991	Experience this vibrant public square with its farmers market.	This square is known for its political demonstrations and events.	25	t	2025-09-07 23:51:42.768	2025-09-07 23:51:42.768
cmfack5nz00139wnddop2m0yz	Madison Square Park	Urban Park	40.7411	-73.9897	Relax in this peaceful park with views of the Flatiron Building.	This park is famous for its Shake Shack location.	20	t	2025-09-07 23:51:42.768	2025-09-07 23:51:42.768
cmfack5o000149wndkn74aln8	BYU Library	University Library	40.2518	-111.6493	Find the main library with its distinctive architecture and extensive collections.	This library is one of the largest academic libraries in the western United States.	30	t	2025-09-07 23:51:42.768	2025-09-07 23:51:42.768
cmfack5o000159wnd4klqs9l4	BYU Museum of Art	Art Museum	40.2508	-111.6508	Discover contemporary and historical art in this beautiful museum.	This museum features rotating exhibitions and permanent collections.	25	t	2025-09-07 23:51:42.769	2025-09-07 23:51:42.769
cmfack5o100169wndqml2296z	BYU Marriott Center	Sports Arena	40.2528	-111.6518	Visit the home of BYU basketball and other major events.	This arena can seat over 19,000 people.	35	t	2025-09-07 23:51:42.769	2025-09-07 23:51:42.769
cmfack5o100179wndjszhubp6	BYU LaVell Edwards Stadium	Football Stadium	40.2558	-111.6548	Stand where BYU football history is made.	This stadium is named after the legendary football coach.	40	t	2025-09-07 23:51:42.769	2025-09-07 23:51:42.769
cmfack5o100189wnd42gks6x9	BYU Wilkinson Student Center	Student Center	40.2518	-111.6508	Explore the heart of student life on campus.	This building houses dining, services, and student activities.	30	t	2025-09-07 23:51:42.77	2025-09-07 23:51:42.77
cmfack5o200199wndm2xyp1ug	BYU Spencer W. Kimball Tower	Administration Building	40.2508	-111.6498	Find the main administration building with its distinctive tower.	This building is named after a former university president.	25	t	2025-09-07 23:51:42.77	2025-09-07 23:51:42.77
cmfack5o2001a9wnd64nog0xy	BYU JSB Building	Business School	40.2528	-111.6508	Visit the home of the Marriott School of Business.	This building houses one of the top business programs in the country.	30	t	2025-09-07 23:51:42.77	2025-09-07 23:51:42.77
cmfack5o2001b9wnd5udc9jti	BYU Life Sciences Building	Science Building	40.2538	-111.6518	Explore the cutting-edge research facilities in life sciences.	This building houses biology, chemistry, and other science departments.	25	t	2025-09-07 23:51:42.771	2025-09-07 23:51:42.771
cmfack5o3001c9wndt8uyg6qb	BYU Engineering Building	Engineering School	40.2548	-111.6528	Discover the innovative engineering programs and labs.	This building is home to various engineering disciplines.	30	t	2025-09-07 23:51:42.771	2025-09-07 23:51:42.771
cmfack5o3001d9wndxnslrlps	BYU Law School	Law Building	40.2508	-111.6488	Visit the prestigious J. Reuben Clark Law School.	This building houses one of the top law schools in the region.	25	t	2025-09-07 23:51:42.772	2025-09-07 23:51:42.772
cmfack5o4001e9wnd5qm3148m	BYU Fine Arts Building	Arts Building	40.2518	-111.6518	Experience the creative arts programs and performances.	This building houses music, theater, and visual arts programs.	25	t	2025-09-07 23:51:42.772	2025-09-07 23:51:42.772
cmfack5o4001f9wndwp1xk6j3	BYU Education Building	Education School	40.2528	-111.6498	Learn about teacher education and educational research.	This building is home to the McKay School of Education.	25	t	2025-09-07 23:51:42.772	2025-09-07 23:51:42.772
cmfack5o4001g9wnd7irro9rl	BYU Computer Science Building	CS Building	40.2538	-111.6508	Explore the technology and computer science programs.	This building houses cutting-edge computer science research.	25	t	2025-09-07 23:51:42.773	2025-09-07 23:51:42.773
cmfack5o5001h9wnd605e4lqu	BYU Physical Education Building	PE Building	40.2548	-111.6518	Find the home of physical education and exercise science.	This building includes gyms, pools, and fitness facilities.	30	t	2025-09-07 23:51:42.773	2025-09-07 23:51:42.773
cmfack5o5001i9wndoa9s3qbx	BYU Heritage Halls	Student Housing	40.2508	-111.6528	Visit the traditional student housing complex.	These halls provide a unique living-learning environment.	35	t	2025-09-07 23:51:42.773	2025-09-07 23:51:42.773
cmfack5o5001j9wndfnl63n19	BYU Helaman Halls	Freshman Housing	40.2558	-111.6538	Explore the freshman residence halls and dining facilities.	This complex is designed specifically for first-year students.	40	t	2025-09-07 23:51:42.774	2025-09-07 23:51:42.774
cmfack5o6001k9wnd1yc9jxb5	BYU Wyview Park	Student Apartments	40.2568	-111.6548	Visit the student apartment complex with family housing.	This complex provides housing for married students and families.	35	t	2025-09-07 23:51:42.774	2025-09-07 23:51:42.774
cmfack5o6001l9wnd7ogwrwsh	BYU Cannon Center	Dining Hall	40.2518	-111.6528	Experience the main dining facility on campus.	This dining hall serves thousands of students daily.	25	t	2025-09-07 23:51:42.775	2025-09-07 23:51:42.775
cmfack5o6001m9wnddsi2sxh5	BYU Bookstore	Campus Store	40.2508	-111.6508	Find textbooks, BYU merchandise, and campus supplies.	This store is the main source for academic materials.	20	t	2025-09-07 23:51:42.775	2025-09-07 23:51:42.775
cmfack5o7001n9wndl8uzffrp	BYU Testing Center	Exam Facility	40.2528	-111.6518	Visit the centralized testing facility for campus exams.	This center administers thousands of exams each semester.	25	t	2025-09-07 23:51:42.775	2025-09-07 23:51:42.775
cmfack5o7001o9wnd7vv1zy7g	BYU Information Technology Building	IT Building	40.2538	-111.6508	Explore the technology services and support center.	This building provides IT support for the entire campus.	25	t	2025-09-07 23:51:42.776	2025-09-07 23:51:42.776
cmfack5o7001p9wndzjhwy3l1	BYU Conference Center	Event Center	40.2508	-111.6498	Visit the venue for major conferences and events.	This center hosts university-wide meetings and presentations.	30	t	2025-09-07 23:51:42.776	2025-09-07 23:51:42.776
cmfack5o8001q9wnduygl4pz1	BYU Museum of Peoples and Cultures	Anthropology Museum	40.2518	-111.6508	Discover artifacts and exhibits from cultures around the world.	This museum showcases archaeological and ethnographic collections.	20	t	2025-09-07 23:51:42.776	2025-09-07 23:51:42.776
cmfack5o8001r9wndur9yjwhp	BYU Monte L. Bean Life Science Museum	Natural History Museum	40.2528	-111.6518	Explore exhibits on wildlife, ecosystems, and natural history.	This museum features dioramas and interactive exhibits.	25	t	2025-09-07 23:51:42.776	2025-09-07 23:51:42.776
cmfack5o8001s9wndxtrv6kex	BYU Planetarium	Space Theater	40.2538	-111.6508	Experience the wonders of the universe in this immersive theater.	This planetarium offers shows about astronomy and space.	20	t	2025-09-07 23:51:42.777	2025-09-07 23:51:42.777
cmfack5o9001t9wndbegpbyyb	Provo City Center Temple	Historic Temple	40.2338	-111.6585	Visit this beautiful temple that was rebuilt from a historic tabernacle.	This temple combines historic architecture with modern functionality.	30	t	2025-09-07 23:51:42.777	2025-09-07 23:51:42.777
cmfack5o9001u9wnd4j0mzjdk	Provo City Library	Public Library	40.2338	-111.6585	Explore this modern library with its unique architecture.	This library features a distinctive glass facade and modern design.	25	t	2025-09-07 23:51:42.777	2025-09-07 23:51:42.777
cmfack5o9001v9wndh6lnpy6e	Provo City Hall	Government Building	40.2338	-111.6585	Visit the seat of Provo city government.	This building houses the mayor's office and city council chambers.	20	t	2025-09-07 23:51:42.778	2025-09-07 23:51:42.778
cmfack5oa001w9wnd2axgxjg1	Provo Pioneer Memorial Park	Historic Park	40.2338	-111.6585	Learn about Provo's pioneer heritage in this memorial park.	This park commemorates the early settlers of Provo Valley.	25	t	2025-09-07 23:51:42.778	2025-09-07 23:51:42.778
cmfack5oa001x9wndtlvmwl86	Provo River Trail	Scenic Trail	40.2338	-111.6585	Walk or bike along this beautiful riverside trail.	This trail follows the Provo River through the city.	30	t	2025-09-07 23:51:42.778	2025-09-07 23:51:42.778
cmfack5oa001y9wndyxktxmqd	Provo Canyon	Mountain Canyon	40.35	-111.6	Explore this scenic canyon with waterfalls and hiking trails.	This canyon is famous for Bridal Veil Falls and outdoor recreation.	50	t	2025-09-07 23:51:42.779	2025-09-07 23:51:42.779
cmfack5ob001z9wndwzfv7gne	Bridal Veil Falls	Waterfall	40.35	-111.6	Marvel at this stunning 600-foot waterfall in Provo Canyon.	This waterfall is one of Utah's most photographed natural features.	30	t	2025-09-07 23:51:42.779	2025-09-07 23:51:42.779
cmfack5ob00209wndt74rjeka	Sundance Resort	Mountain Resort	40.4	-111.6	Visit Robert Redford's famous mountain resort and film festival venue.	This resort hosts the annual Sundance Film Festival.	40	t	2025-09-07 23:51:42.779	2025-09-07 23:51:42.779
cmfack5ob00219wndpudj7mwu	Provo Towne Centre	Shopping Mall	40.2338	-111.6585	Shop and dine at Provo's premier shopping destination.	This mall features major retailers and restaurants.	35	t	2025-09-07 23:51:42.78	2025-09-07 23:51:42.78
cmfack5oc00229wnd3lwurzc3	Provo Municipal Airport	Local Airport	40.2338	-111.6585	Visit the local airport serving Provo and surrounding areas.	This airport provides regional air service.	40	t	2025-09-07 23:51:42.78	2025-09-07 23:51:42.78
cmfack5oc00239wndyg6dta2x	Provo Recreation Center	Sports Complex	40.2338	-111.6585	Enjoy swimming, fitness, and recreational activities.	This center features pools, gyms, and sports courts.	30	t	2025-09-07 23:51:42.78	2025-09-07 23:51:42.78
cmfack5oc00249wnd4e3bjy0m	Provo High School	Public High School	40.2338	-111.6585	Visit the main public high school in Provo.	This school serves the Provo School District.	25	t	2025-09-07 23:51:42.781	2025-09-07 23:51:42.781
cmfack5oc00259wnda1ooncma	Provo Tabernacle	Historic Building	40.2338	-111.6585	See the historic tabernacle that was converted into a temple.	This building has a rich history in Provo's religious community.	25	t	2025-09-07 23:51:42.781	2025-09-07 23:51:42.781
cmfack5od00269wnd5vkgrtcr	Provo Farmers Market	Local Market	40.2338	-111.6585	Experience local produce and crafts at the farmers market.	This market showcases local vendors and artisans.	30	t	2025-09-07 23:51:42.781	2025-09-07 23:51:42.781
cmfack5od00279wndou6cn5r4	Provo Arts Center	Cultural Center	40.2338	-111.6585	Enjoy performances and cultural events in downtown Provo.	This center hosts concerts, plays, and community events.	25	t	2025-09-07 23:51:42.781	2025-09-07 23:51:42.781
cmfack5od00289wndzio7iusv	Provo Historic District	Historic Area	40.2338	-111.6585	Explore the historic downtown area with its preserved buildings.	This district features Victorian-era architecture.	35	t	2025-09-07 23:51:42.782	2025-09-07 23:51:42.782
cmfack5oe00299wndhttfqs6r	Provo River	Local River	40.2338	-111.6585	Enjoy fishing, kayaking, or walking along the Provo River.	This river is popular for outdoor recreation.	40	t	2025-09-07 23:51:42.782	2025-09-07 23:51:42.782
cmfack5oe002a9wndry2quarn	Provo Canyon Road	Scenic Drive	40.35	-111.6	Take a scenic drive through this beautiful mountain canyon.	This road offers stunning views of mountains and waterfalls.	50	t	2025-09-07 23:51:42.782	2025-09-07 23:51:42.782
cmfack5oe002b9wndtq6fppnu	Provo Peak	Mountain Peak	40.4	-111.6	Hike to the summit of this prominent mountain peak.	This peak offers panoramic views of Utah Valley.	60	t	2025-09-07 23:51:42.783	2025-09-07 23:51:42.783
cmfack5of002c9wndyvdm9rel	Provo Municipal Golf Course	Golf Course	40.2338	-111.6585	Play a round of golf at this scenic municipal course.	This course offers beautiful mountain views.	45	t	2025-09-07 23:51:42.783	2025-09-07 23:51:42.783
cmfack5of002d9wndqlgqv36g	Provo Community Hospital	Medical Center	40.2338	-111.6585	Visit the main medical facility serving Provo and surrounding areas.	This hospital provides comprehensive healthcare services.	35	t	2025-09-07 23:51:42.784	2025-09-07 23:51:42.784
cmfack5of002e9wndh51u43b9	Provo Fire Station	Fire Department	40.2338	-111.6585	See the main fire station serving the Provo community.	This station houses the city's fire and emergency services.	25	t	2025-09-07 23:51:42.784	2025-09-07 23:51:42.784
cmfack5og002f9wnd8xvd7n9d	Provo Police Department	Police Station	40.2338	-111.6585	Visit the headquarters of Provo's police department.	This building houses the city's law enforcement services.	25	t	2025-09-07 23:51:42.784	2025-09-07 23:51:42.784
cmfack5og002g9wndcdz8zusf	Provo Post Office	Postal Service	40.2338	-111.6585	Visit the main post office serving Provo residents.	This facility provides postal services for the community.	20	t	2025-09-07 23:51:42.784	2025-09-07 23:51:42.784
cmfack5og002h9wnd9hfuq2zs	Provo Cemetery	Historic Cemetery	40.2338	-111.6585	Explore this historic cemetery with graves dating back to pioneer times.	This cemetery contains the graves of many early Provo settlers.	30	t	2025-09-07 23:51:42.785	2025-09-07 23:51:42.785
cmfd1g7ei00019we4pwvplsqb	Brigham Young Statue	Historic Campus Statue	40.249089	-111.649233	Find the statue of the university's founder standing proudly in the center of campus.	Look for the bronze figure with outstretched arm near the main campus walkway.	44.1561404980484	f	2025-09-09 21:04:01.146	2025-09-09 21:04:01.146
cmfd1g7ek00029we4tzyri8rr	Harold B. Lee Library	Main Campus Library	40.249686	-111.64904	Locate the tallest building on campus, home to millions of books and resources.	This tower of knowledge can be seen from across the valley.	39.76741556481154	t	2025-09-09 21:04:01.149	2025-09-09 21:04:01.149
cmfd1g7el00039we4bgofbzs4	Wilkinson Student Center	Student Union Building	40.250415	-111.652478	Find the heart of student life where food, activities, and gatherings take place.	Students congregate here between classes for meals and socializing.	30.56579491828252	t	2025-09-09 21:04:01.149	2025-09-09 21:04:01.149
cmfd1g7el00049we4w35hpjpr	LaVell Edwards Stadium	Football Stadium	40.2535	-111.6528	Discover where Cougar football teams have played for decades.	The roar of the crowd echoes from this athletic venue on game days.	38.07187128690901	f	2025-09-09 21:04:01.15	2025-09-09 21:04:01.15
cmfd1g7em00059we4344e9j2v	Marriott Center	Basketball Arena	40.251878	-111.652122	Find the dome-shaped building where basketball games create thunderous noise.	This rounded roof structure hosts sporting events and large gatherings.	34.88661891542546	t	2025-09-09 21:04:01.15	2025-09-09 21:04:01.15
cmfd1g7em00069we4l81si6ro	Tanner Building	Business School	40.249444	-111.651667	Locate the building where future business leaders study commerce and economics.	This modern facility houses the school of management and business education.	44.47376865753243	f	2025-09-09 21:04:01.151	2025-09-09 21:04:01.151
cmfd1g7en00079we42l1tiymx	Jesse Knight Building	Humanities Building	40.248611	-111.650278	Find where languages, literature, and liberal arts are taught.	Students of words and culture gather in this academic building.	32.32667348008809	t	2025-09-09 21:04:01.151	2025-09-09 21:04:01.151
cmfd1g7en00089we4wnwsgfxm	Eyring Science Center	Science Laboratory Building	40.248889	-111.648056	Discover the building where scientific experiments and research take place.	Chemistry, biology, and physics labs fill this research facility.	33.19030029183354	t	2025-09-09 21:04:01.152	2025-09-09 21:04:01.152
cmfd1g7eo00099we4kuop7vaw	Monte L. Bean Life Science Museum	Natural History Museum	40.249722	-111.647222	Find the building displaying nature's wonders and biological specimens.	Preserved animals and natural exhibits are housed in this educational space.	26.05527906013803	t	2025-09-09 21:04:01.152	2025-09-09 21:04:01.152
cmfd1g7eo000a9we4vl6lbx6o	Helaman Halls	Freshman Dormitories	40.253889	-111.649167	Locate where first-year students begin their college journey.	These residence halls house new students adapting to university life.	40.07336163908705	f	2025-09-09 21:04:01.153	2025-09-09 21:04:01.153
cmfd1g7ep000b9we4ydcumu6c	Benson Science Building	Chemistry Building	40.248333	-111.648889	Find where chemical reactions and molecular studies take place.	The scent of scientific discovery fills this chemistry-focused facility.	37.30539677578476	t	2025-09-09 21:04:01.153	2025-09-09 21:04:01.153
cmfd1g7ep000c9we4cq2jy080	Joseph F. Smith Building	Education Building	40.251111	-111.651111	Discover where future teachers learn the art of education.	This building prepares educators who will shape young minds.	28.35428994566922	f	2025-09-09 21:04:01.154	2025-09-09 21:04:01.154
cmfd1g7eq000d9we47ajlbbk1	Joseph Knight Building	Engineering Complex	40.2475	-111.649444	Find where innovative engineers solve tomorrow's problems.	Technology and engineering solutions are developed in this modern complex.	49.84037531553128	f	2025-09-09 21:04:01.154	2025-09-09 21:04:01.154
cmfd1g7eq000e9we4zofy8hia	Conference Center	Large Assembly Hall	40.2525	-111.653333	Locate the venue for major university gatherings and ceremonies.	Important university events and conferences take place in this spacious hall.	28.66389127736382	t	2025-09-09 21:04:01.155	2025-09-09 21:04:01.155
cmfd1g7eq000f9we4vjn4uam2	Cannon Center	Student Dining Hall	40.254167	-111.650556	Find where residential students gather for daily meals.	The aroma of food and student conversations fill this dining facility.	32.7359187518871	f	2025-09-09 21:04:01.155	2025-09-09 21:04:01.155
cmfd1g7er000g9we43hj6de6m	Abraham Smoot Building	Administration Building	40.250278	-111.650833	Discover the building housing university administrative offices.	Important university decisions and student services are centered here.	30.31430300760179	t	2025-09-09 21:04:01.155	2025-09-09 21:04:01.155
cmfd1g7er000h9we43l8yedpq	Morris Center	Fine Arts Complex	40.251944	-111.647778	Find where creative arts and cultural performances come alive.	Music, theater, and artistic expression flourish in this cultural center.	46.76997287081815	f	2025-09-09 21:04:01.156	2025-09-09 21:04:01.156
cmfd1g7es000i9we4k0o5y1v3	Hinckley Alumni Center	Alumni Building	40.247778	-111.651389	Locate where graduates maintain connections to their alma mater.	Former students gather here to celebrate their university heritage.	31.20356198404509	t	2025-09-09 21:04:01.156	2025-09-09 21:04:01.156
cmfd1g7es000j9we47go5vyh6	Clyde Building	Engineering Research Facility	40.246944	-111.65	Find the building dedicated to advanced engineering research.	Cutting-edge technological research and development happens here.	25.52901933395795	f	2025-09-09 21:04:01.156	2025-09-09 21:04:01.156
cmfd1g7es000k9we4fwnkrchp	Richards Athletic Center	Indoor Sports Complex	40.252222	-111.653889	Discover the facility for indoor athletic training and activities.	Athletes train and compete in various indoor sports within these walls.	35.39385035229418	t	2025-09-09 21:04:01.157	2025-09-09 21:04:01.157
cmfd1g7et000l9we44aqaa5je	Museum of Art	Art Gallery	40.25	-111.648611	Find where artistic masterpieces and cultural exhibits are displayed.	Visual arts and cultural treasures are preserved and showcased here.	33.36754308289123	t	2025-09-09 21:04:01.157	2025-09-09 21:04:01.157
cmfd1g7et000m9we4hf2svlsq	Kimball Tower	Residential Tower	40.253056	-111.648333	Locate the tall residence hall housing upper-class students.	This vertical living space provides elevated views of campus and valley.	30.45965167935625	t	2025-09-09 21:04:01.158	2025-09-09 21:04:01.158
cmfd1g7et000n9we4g76p6jfo	Spencer W. Kimball Tower	Academic Tower	40.250556	-111.6475	Find the tower dedicated to academic excellence and learning.	This prominent tower stands as a symbol of educational achievement.	28.88549411885015	f	2025-09-09 21:04:01.158	2025-09-09 21:04:01.158
cmfd1g7eu000o9we4zuo6l21k	BYU Bookstore	Campus Store	40.251667	-111.651944	Discover where students purchase textbooks and university merchandise.	Academic materials and school-spirited items are sold at this campus retailer.	28.88298931976559	f	2025-09-09 21:04:01.158	2025-09-09 21:04:01.158
cmfd1g7eu000p9we4z3h54v6t	Harris Fine Arts Center	Performing Arts Building	40.251389	-111.647222	Find where theatrical performances and musical concerts take place.	The stage comes alive with dramatic and musical performances in this venue.	30.6500168876033	f	2025-09-09 21:04:01.159	2025-09-09 21:04:01.159
\.


--
-- Data for Name: CluePhoto; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."CluePhoto" (id, filename, "originalName", description, "isCluePhoto", "isFavorited", "uploadedBy", "clueLocationId", "gameId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Game" (id, name, description, status, "startDate", "endDate", "isOngoing", "clueReleaseSchedule", "customReleaseTimes", "baseCluePoints", "timeDiscountType", "timeDiscountRate", "profileCompletionPoints", "referralPoints", "followerPoints", "privacyBonusPoints", "createdBy", "createdAt", "updatedAt", "pointTrackingMode", "gameCenterAddress", "gameCenterLat", "gameCenterLng", "maxPlayers") FROM stdin;
game1	BYU Campus	Updated at 2025-09-09T18:47:29.792Z	ACTIVE	2025-09-07 00:00:00	2025-10-07 00:00:00	f	ALL_AT_ONCE	\N	100	NONE	5	50	25	10	{"PUBLIC": 50, "PRIVATE": 0, "MINIONS_ONLY": 10, "MINIONS_AND_FRENEMIES": 25}	test_user_123	2025-09-07 17:50:57.248	2025-09-09 18:47:29.793	HISTORICAL	332 Campus Dr, Provo, UT 84604, USA	40.25041474647053	-111.6524178547873	999
game2	NYC	Updated at 2025-09-09T18:47:39.315Z	ACTIVE	2025-09-07 00:00:00	2025-10-22 00:00:00	f	ALL_AT_ONCE	\N	100	NONE	5	50	25	10	{"PUBLIC": 50, "PRIVATE": 0, "MINIONS_ONLY": 10, "MINIONS_AND_FRENEMIES": 25}	test_user_123	2025-09-07 17:50:57.248	2025-09-09 18:47:39.316	HISTORICAL	230 Broadway, New York, NY 10007, USA	40.7128	-74.006	999
\.


--
-- Data for Name: GameClue; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."GameClue" (id, "gameId", "clueLocationId", "customName", "customText", "customHint", points, "releaseTime", "isReleased", "createdAt", "updatedAt") FROM stdin;
gameclue2_11	game2	cmfack5nm00079wndik6olf9d	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_12	game2	cmfack5nm00089wndqj1ededo	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_13	game2	cmfack5nn00099wndfip98z2q	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_14	game2	cmfack5nn000a9wnd10enhn5g	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_15	game2	cmfack5no000b9wndwyqt9uol	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_16	game2	cmfack5no000c9wndra3yzavn	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_17	game2	cmfack5np000d9wnddh55wsyz	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_18	game2	cmfack5np000e9wndzx4lnxqo	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_19	game2	cmfack5nq000f9wndr4p2jdfb	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
gameclue2_20	game2	cmfack5nq000g9wnd07vowc5s	\N	\N	\N	100	2025-09-07 17:52:13.971	t	2025-09-07 17:52:13.971	2025-09-07 17:52:13.971
cmfd1g7ex000r9we4daszuxvr	game1	cmfd1g7eu000p9we4z3h54v6t	\N	\N	\N	127	2025-09-09 21:04:01.161	t	2025-09-09 21:04:01.162	2025-09-09 21:04:01.162
cmfd1g7ez000t9we43738h26y	game1	cmfd1g7em00059we4344e9j2v	\N	\N	\N	121	2025-09-09 21:05:01.163	t	2025-09-09 21:04:01.164	2025-09-09 21:04:01.164
cmfd1g7f0000v9we4navdk4yb	game1	cmfd1g7ek00029we4tzyri8rr	\N	\N	\N	248	2025-09-09 21:06:01.164	t	2025-09-09 21:04:01.165	2025-09-09 21:04:01.165
cmfd1g7f1000x9we498dhzbd5	game1	cmfd1g7eq000f9we4vjn4uam2	\N	\N	\N	138	2025-09-09 21:07:01.165	t	2025-09-09 21:04:01.165	2025-09-09 21:04:01.165
cmfd1g7f1000z9we4fva1gh9w	game1	cmfd1g7eq000e9we4zofy8hia	\N	\N	\N	249	2025-09-09 21:08:01.165	t	2025-09-09 21:04:01.166	2025-09-09 21:04:01.166
cmfd1g7f200119we4uecedevr	game1	cmfd1g7es000i9we4k0o5y1v3	\N	\N	\N	165	2025-09-09 21:09:01.165	t	2025-09-09 21:04:01.166	2025-09-09 21:04:01.166
cmfd1g7f200139we4lo2xy1fx	game1	cmfd1g7eo000a9we4vl6lbx6o	\N	\N	\N	122	2025-09-09 21:10:01.166	t	2025-09-09 21:04:01.167	2025-09-09 21:04:01.167
cmfd1g7f300159we4a6eoli3b	game1	cmfd1g7eo00099we4kuop7vaw	\N	\N	\N	163	2025-09-09 21:11:01.167	t	2025-09-09 21:04:01.167	2025-09-09 21:04:01.167
cmfd1g7f300179we4w0lkr8sf	game1	cmfd1g7em00069we4l81si6ro	\N	\N	\N	185	2025-09-09 21:12:01.167	t	2025-09-09 21:04:01.168	2025-09-09 21:04:01.168
cmfd1g7f300199we4igr9ok5t	game1	cmfd1g7en00089we4wnwsgfxm	\N	\N	\N	154	2025-09-09 21:13:01.167	t	2025-09-09 21:04:01.168	2025-09-09 21:04:01.168
\.


--
-- Data for Name: GamePhoto; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."GamePhoto" (id, filename, "originalName", description, "isGameCenter", "isFavorited", "uploadedBy", "gameId", "createdAt", "updatedAt") FROM stdin;
cmfcvz2e4001j9wfnftk35uny	94ac6b10-d70f-46a1-b0ec-f98e0a636592.jpg	1810_23_0021_1200_4_579f3a75-0875-4aab-9537-138cdc28e607.jpg	Arial view	f	f	test_user_123	game1	2025-09-09 18:30:43.42	2025-09-09 18:30:43.42
cmfcvz2e6001l9wfn2nopydj8	e7c80c4c-a7af-48f5-9861-8d9c3edc49d4.jpg	73836.jpg	Animated view	f	f	test_user_123	game1	2025-09-09 18:30:43.423	2025-09-09 18:30:43.423
cmfcwhcar000v9wvtabhe67lg	ae2eae94-3f2c-4804-9f57-535ba0dbf648.gif	manhattanmap12.gif		f	f	test_user_123	game2	2025-09-09 18:44:56.067	2025-09-09 18:44:56.067
\.


--
-- Data for Name: GameSurvey; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."GameSurvey" (id, "gameId", "surveyId", "isActive", points, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GameTreatment; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."GameTreatment" (id, "gameId", "treatmentId", "assignmentType", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LoginAttempt; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."LoginAttempt" (id, "userId", email, password, success, "ipAddress", "userAgent", browser, "browserVersion", os, "osVersion", "deviceType", "deviceModel", country, region, city, "attemptedAt", "createdAt") FROM stdin;
cmfac7966000a9w41s2sx83hf	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	2025-09-07 23:41:40.775	2025-09-07 23:41:40.775
cmfaccl84000e9w41v52zj8u9	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-07 23:45:49.684	2025-09-07 23:45:49.684
cmfacfo1r000o9w41o5q14abg	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-07 23:48:13.311	2025-09-07 23:48:13.311
cmfbfxk82001b9w7jtebmk721	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-08 18:13:53.186	2025-09-08 18:13:53.186
cmfbp658w001m9wib43jcwr5s	\N	mark.keith@gmail.com	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	f	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	2025-09-08 22:32:30.224	2025-09-08 22:32:30.224
cmfbp65ac001n9wibno4gel8k	\N	mark.keith@gmail.com	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	f	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	2025-09-08 22:32:30.277	2025-09-08 22:32:30.277
cmfcvfhe300059wfnytrr2pvv	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-09 18:15:29.739	2025-09-09 18:15:29.739
cmfcx9l9o00019w78rokeb6bc	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-09 19:06:54.054	2025-09-09 19:06:54.054
cmfcxed5a00099w78l7eevr9d	test_user_123	gamemanager@findamine.app	ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f	t	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	2025-09-09 19:10:36.814	2025-09-09 19:10:36.814
\.


--
-- Data for Name: PageView; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."PageView" (id, "userId", "pageName", "pageUrl", "pageTitle", referrer, "ipAddress", "userAgent", browser, "browserVersion", os, "osVersion", "deviceType", "deviceModel", country, region, city, "sessionId", "viewedAt", "createdAt") FROM stdin;
cmfac7nyx000c9w41bn52t8b4	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757288519960_6bmwpvn48	2025-09-07 23:41:59.961	2025-09-07 23:41:59.961
cmfaccm8o000g9w41zog2efeq	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:45:51.001	2025-09-07 23:45:51.001
cmfacdvup000i9w41fwlaxx7d	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:46:50.09	2025-09-07 23:46:50.09
cmfacdvuz000k9w41yiveiwtv	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:46:50.1	2025-09-07 23:46:50.1
cmfacdy4o000m9w41mp670ew6	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:46:53.065	2025-09-07 23:46:53.065
cmfacfoug000q9w41vc02wntw	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:48:14.345	2025-09-07 23:48:14.345
cmfach1c3000s9w418tj0wege	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:49:17.187	2025-09-07 23:49:17.187
cmfach1c6000u9w41yqv5hk3h	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:49:17.191	2025-09-07 23:49:17.191
cmfachzuf000w9w41o2si0580	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757289001910_kfq9ssv1h	2025-09-07 23:50:01.911	2025-09-07 23:50:01.911
cmfaclz7w000y9w41km8gb097	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:53:07.71	2025-09-07 23:53:07.71
cmfaclz8300109w415eeib2t0	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:53:07.732	2025-09-07 23:53:07.732
cmfacm00900129w41oai1ccte	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:53:08.746	2025-09-07 23:53:08.746
cmfacolmb00149w41m9vxioat	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:10.068	2025-09-07 23:55:10.068
cmfacolmg00169w418mpr3m9m	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:10.072	2025-09-07 23:55:10.072
cmfacookp00189w4191xbkznn	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:13.897	2025-09-07 23:55:13.897
cmfacookq001a9w41ohnwks0m	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:13.899	2025-09-07 23:55:13.899
cmfacopd0001c9w41tyadway8	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:14.916	2025-09-07 23:55:14.916
cmfacou1j001e9w414pt2xn2s	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:20.984	2025-09-07 23:55:20.984
cmfacou1l001g9w41ahd6xo26	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:20.985	2025-09-07 23:55:20.985
cmfacou1z001i9w41q0rfsd38	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:21	2025-09-07 23:55:21
cmfacou26001k9w416qc130ck	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:21.001	2025-09-07 23:55:21.001
cmfacou3w001m9w415aa84tzx	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:21.068	2025-09-07 23:55:21.068
cmfacou49001o9w414t6d9jq2	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:21.081	2025-09-07 23:55:21.081
cmfacovn1001q9w41yk0oqxqj	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:23.054	2025-09-07 23:55:23.054
cmfacovn4001s9w41qnsy0ham	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:23.056	2025-09-07 23:55:23.056
cmfacox84001u9w41vjto7mwd	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.108	2025-09-07 23:55:25.108
cmfacox85001w9w41r1nlbq4m	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.11	2025-09-07 23:55:25.11
cmfacox8e001y9w41uthbis5o	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.118	2025-09-07 23:55:25.118
cmfacox8f00209w41rd9wymg7	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.119	2025-09-07 23:55:25.119
cmfacox8g00229w41ptmri58q	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.121	2025-09-07 23:55:25.121
cmfacox8q00249w414go9hmn9	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:25.131	2025-09-07 23:55:25.131
cmfacoyjb00269w41kvkgygie	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:26.808	2025-09-07 23:55:26.808
cmfacoyjq00289w41amql4vmy	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:55:26.823	2025-09-07 23:55:26.823
cmfacp710002a9w41r1cog928	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757289337811_61e0okj0h	2025-09-07 23:55:37.812	2025-09-07 23:55:37.812
cmfacpsvm002c9w41wesxpf3p	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:56:06.13	2025-09-07 23:56:06.13
cmfacpx5e002e9w41ahnpt4of	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:56:11.666	2025-09-07 23:56:11.666
cmfacpx5p002g9w417t1a2f58	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:56:11.677	2025-09-07 23:56:11.677
cmfacr9rh002i9w41pagvxzg5	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757289434668_k1agru30t	2025-09-07 23:57:14.67	2025-09-07 23:57:14.67
cmfacrnv5002k9w41f84ww5wt	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757289452944_j8taxuwlq	2025-09-07 23:57:32.945	2025-09-07 23:57:32.945
cmfacsui3002m9w41qzysb11v	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:58:28.203	2025-09-07 23:58:28.203
cmfacsui6002o9w41krxns5ov	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:58:28.206	2025-09-07 23:58:28.206
cmfacsuip002q9w41k919ae7r	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:58:28.226	2025-09-07 23:58:28.226
cmfacsuiz002s9w413xc0k6d8	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:58:28.236	2025-09-07 23:58:28.236
cmfacsuja002u9w41cbntfqku	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-07 23:58:28.246	2025-09-07 23:58:28.246
cmfacw84e002w9w416b7wh6e8	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 00:01:05.815	2025-09-08 00:01:05.815
cmfacw84i002y9w415j0ok315	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 00:01:05.827	2025-09-08 00:01:05.827
cmfacw85b00309w41urp3qbm5	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 00:01:05.856	2025-09-08 00:01:05.856
cmfacw85q00329w416xkq6i7p	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 00:01:05.87	2025-09-08 00:01:05.87
cmfacw86100349w41tkm5q9fw	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 00:01:05.881	2025-09-08 00:01:05.881
cmfbagtkl00009wac8zkofr0y	\N	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757346054066_eh3y6whzp	2025-09-08 15:40:54.069	2025-09-08 15:40:54.069
cmfbalra400029wacogcr1yv4	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 15:44:44.38	2025-09-08 15:44:44.38
cmfbfi9y400019w7jgs2nbhrv	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:02:00.024	2025-09-08 18:02:00.024
cmfbfi9yl00039w7j1odcq3el	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:02:00.046	2025-09-08 18:02:00.046
cmfbfwum300059w7jbp27mc8j	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:19.988	2025-09-08 18:13:19.988
cmfbfwum700079w7j5fxff21z	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:20	2025-09-08 18:13:20
cmfbfwven00099w7jpfwxj2yq	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:21.023	2025-09-08 18:13:21.023
cmfbfwxm0000b9w7jt5n1rum2	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:23.881	2025-09-08 18:13:23.881
cmfbfwxm6000d9w7j5u7gcdgy	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:23.886	2025-09-08 18:13:23.886
cmfbfx0pk000f9w7j1mr274x9	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:27.897	2025-09-08 18:13:27.897
cmfbfx0pl000h9w7jyxgexnoe	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:27.898	2025-09-08 18:13:27.898
cmfbfx0q0000j9w7j9h0t1x6f	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:27.913	2025-09-08 18:13:27.913
cmfbfx0sm000l9w7js6zdmgtp	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:28.007	2025-09-08 18:13:28.007
cmfbfx0st000n9w7ju6ygiftf	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:28.013	2025-09-08 18:13:28.013
cmfbfx0t5000p9w7jla3ev08k	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:28.026	2025-09-08 18:13:28.026
cmfbfx2a5000r9w7jazn2eh4q	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:29.934	2025-09-08 18:13:29.934
cmfbfx2af000t9w7jel0q8izo	test_user_123	/{*path}	http://localhost:4000/admin/users	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:29.943	2025-09-08 18:13:29.943
cmfbfx38u000v9w7j7cv5hr0c	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.182	2025-09-08 18:13:31.182
cmfbfx38v000x9w7jb6m5m5m0	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.183	2025-09-08 18:13:31.183
cmfbfx397000z9w7j1jq5mhcr	test_user_123	/{*path}	http://localhost:4000/player/minions	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.195	2025-09-08 18:13:31.195
cmfbfx39900119w7j4ubflc7e	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.198	2025-09-08 18:13:31.198
cmfbfx39c00139w7jgxpetrs6	test_user_123	/{*path}	http://localhost:4000/player/frenemies	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.196	2025-09-08 18:13:31.196
cmfbfx3a100159w7j2uz2edrq	test_user_123	/{*path}	http://localhost:4000/player/search?limit=50&offset=0	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:31.226	2025-09-08 18:13:31.226
cmfbfx74p00179w7jtjvf5rxt	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:36.217	2025-09-08 18:13:36.217
cmfbfx75500199w7jbzm5rt6v	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:36.233	2025-09-08 18:13:36.233
cmfbfxl0u001d9w7j5vhvioba	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:13:54.223	2025-09-08 18:13:54.223
cmfbfympw001f9w7joiuqiag3	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:14:43.076	2025-09-08 18:14:43.076
cmfbfymq6001h9w7jebjl9l3k	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 18:14:43.087	2025-09-08 18:14:43.087
cmfbfyrzd001j9w7j631o66zi	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757355289896_2e78a1vnq	2025-09-08 18:14:49.898	2025-09-08 18:14:49.898
cmfbfyrzq001l9w7jsb14tjku	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757355289909_ze395lo0h	2025-09-08 18:14:49.911	2025-09-08 18:14:49.911
cmfbghl56001n9w7jwyzek1ee	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757356167484_jsqux5tzi	2025-09-08 18:29:27.486	2025-09-08 18:29:27.486
cmfbghl5r001p9w7j02jediqu	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757356167518_84piq081x	2025-09-08 18:29:27.52	2025-09-08 18:29:27.52
cmfbojde700019wibxm0srnsr	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:14:47.688	2025-09-08 22:14:47.688
cmfbojded00039wibfr89zmi2	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:14:47.701	2025-09-08 22:14:47.701
cmfbojdgz00059wibi33rzpsb	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:14:47.795	2025-09-08 22:14:47.795
cmfbojdhk00079wib26v88ac3	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:14:47.816	2025-09-08 22:14:47.816
cmfbojdhv00099wib4234882l	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:14:47.827	2025-09-08 22:14:47.827
cmfbolbbp000b9wib3wuxz6xr	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757369778323_qsokuwrpv	2025-09-08 22:16:18.325	2025-09-08 22:16:18.325
cmfbolbc5000d9wibpbv1co9m	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757369778340_dzv3y4hi7	2025-09-08 22:16:18.341	2025-09-08 22:16:18.341
cmfbotc0o000f9wibdjqk0y1w	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:22:32.467	2025-09-08 22:22:32.467
cmfboteup000h9wibx8lhtw4q	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370156144_esdpjbt36	2025-09-08 22:22:36.146	2025-09-08 22:22:36.146
cmfbotev1000j9wibqot05wz6	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370156156_4o5omv9jn	2025-09-08 22:22:36.158	2025-09-08 22:22:36.158
cmfbou240000l9wibml8x748h	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:23:06.288	2025-09-08 22:23:06.288
cmfbou4a2000n9wibbtc8adv2	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370189096_kk3je5iwy	2025-09-08 22:23:09.098	2025-09-08 22:23:09.098
cmfbou4ah000p9wib4670ikbs	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370189112_56svkm5as	2025-09-08 22:23:09.113	2025-09-08 22:23:09.113
cmfbowxxg000r9wib2gx7ganw	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:25:20.836	2025-09-08 22:25:20.836
cmfbox18z000t9wibm2ltk695	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370325138_jfbfuyxzq	2025-09-08 22:25:25.14	2025-09-08 22:25:25.14
cmfbox19a000v9wibt1ovu54b	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370325149_kzwu6nk8h	2025-09-08 22:25:25.151	2025-09-08 22:25:25.151
cmfboxn54000x9wib1saodjh2	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:25:53.512	2025-09-08 22:25:53.512
cmfboy2pl000z9wib3ces0lts	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370373688_6c8e1y5h4	2025-09-08 22:26:13.689	2025-09-08 22:26:13.689
cmfboy2px00119wibbqnbiqvm	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370373700_dyqyuqi7f	2025-09-08 22:26:13.701	2025-09-08 22:26:13.701
cmfbp1j2i00139wib3ji0ojca	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:28:54.849	2025-09-08 22:28:54.849
cmfbp1j2o00159wibgq1758r8	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:28:54.865	2025-09-08 22:28:54.865
cmfbp1j5300179wib1giy9tuy	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:28:54.951	2025-09-08 22:28:54.951
cmfbp1j5m00199wibnnr97k0x	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:28:54.97	2025-09-08 22:28:54.97
cmfbp1j5v001b9wib8uebmqwd	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:28:54.979	2025-09-08 22:28:54.979
cmfbp1l2i001d9wib3f02eti3	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370537449_ik4a635r0	2025-09-08 22:28:57.45	2025-09-08 22:28:57.45
cmfbp1l2u001f9wibedn1vz3h	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370537461_icjztvfkf	2025-09-08 22:28:57.463	2025-09-08 22:28:57.463
cmfbp1t12001h9wibnd5g1k1r	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:29:07.767	2025-09-08 22:29:07.767
cmfbp1ujy001j9wibg4jr3hsg	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370549741_plli9nzx3	2025-09-08 22:29:09.742	2025-09-08 22:29:09.742
cmfbp1uka001l9wibiy3povyx	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370549753_r98say98s	2025-09-08 22:29:09.754	2025-09-08 22:29:09.754
cmfbp65an001o9wib5he2bajy	\N	/{*path}	http://localhost:4000/game-master/games/game1	\N	\N	::1	curl/8.7.1	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370750287_n2mibawb8	2025-09-08 22:32:30.288	2025-09-08 22:32:30.288
cmfbp6vn6001q9wiblwiwsey3	test_user_123	/{*path}	http://localhost:4000/clue-locations/cmfack5nj00029wnd0lzce3wg	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.434	2025-09-08 22:33:04.434
cmfbp6vne001s9wibcx2dy1uu	test_user_123	/{*path}	http://localhost:4000/clue-findings/by-game-clue?gameId=game1&clueLocationId=cmfack5nj00029wnd0lzce3wg	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.443	2025-09-08 22:33:04.443
cmfbp6vnl001u9wibszcxw3k1	test_user_123	/{*path}	http://localhost:4000/clue-findings/by-clue-location/cmfack5nj00029wnd0lzce3wg?excludeGameId=game1&since=2023-09-08T22:33:04.429Z	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.449	2025-09-08 22:33:04.449
cmfbp6vno001w9wibtemktmd9	test_user_123	/{*path}	http://localhost:4000/api/geocode/reverse?lat=40.75660657452931&lng=-73.98920614441145	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.452	2025-09-08 22:33:04.452
cmfbp6vnx001y9wibxdt1xa2j	test_user_123	/{*path}	http://localhost:4000/clue-locations/cmfack5nj00029wnd0lzce3wg	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.461	2025-09-08 22:33:04.461
cmfbp6vnz00209wibhjcpz9hk	test_user_123	/{*path}	http://localhost:4000/clue-findings/by-game-clue?gameId=game1&clueLocationId=cmfack5nj00029wnd0lzce3wg	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.464	2025-09-08 22:33:04.464
cmfbp6vo200229wib5ez3xnq0	test_user_123	/{*path}	http://localhost:4000/clue-findings/by-clue-location/cmfack5nj00029wnd0lzce3wg?excludeGameId=game1&since=2023-09-08T22:33:04.459Z	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.467	2025-09-08 22:33:04.467
cmfbp6vo500249wibase8vhhj	test_user_123	/{*path}	http://localhost:4000/api/geocode/reverse?lat=40.75660657452931&lng=-73.98920614441145	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:04.469	2025-09-08 22:33:04.469
cmfbp7ebg00269wib03xu89sk	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:28.636	2025-09-08 22:33:28.636
cmfbp7ebh00289wibf9tyw2er	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:28.638	2025-09-08 22:33:28.638
cmfbp7ed1002a9wibaqcer7ys	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:28.694	2025-09-08 22:33:28.694
cmfbp7ede002c9wibg0x7wf23	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:28.707	2025-09-08 22:33:28.707
cmfbp7edu002e9wibs9wtbdb7	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:33:28.723	2025-09-08 22:33:28.723
cmfbp7g4w002g9wib7g5umz7i	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370810991_adayi5p83	2025-09-08 22:33:30.993	2025-09-08 22:33:30.993
cmfbp7g55002i9wib2kmmixiy	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370811000_qx1fqk8fr	2025-09-08 22:33:31.001	2025-09-08 22:33:31.001
cmfbp7mnm002k9wibvnk12083	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370819442_n9tj4px1j	2025-09-08 22:33:39.443	2025-09-08 22:33:39.443
cmfbp7mny002m9wibx77wqw3n	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757370819453_ywovpua5p	2025-09-08 22:33:39.455	2025-09-08 22:33:39.455
cmfbpc9hn002o9wibcti8sqrh	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:15.65	2025-09-08 22:37:15.65
cmfbpc9i2002q9wibcunfkg3p	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:15.675	2025-09-08 22:37:15.675
cmfbpc9ij002s9wibwbhr8rv1	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:15.692	2025-09-08 22:37:15.692
cmfbpc9jf002u9wibun53vq0h	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:15.723	2025-09-08 22:37:15.723
cmfbpc9jp002w9wibu2mpehqa	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:15.734	2025-09-08 22:37:15.734
cmfbpcau9002y9wibo9ouipbk	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371037408_fmlz815sv	2025-09-08 22:37:17.409	2025-09-08 22:37:17.409
cmfbpcauv00309wibviv0ysu7	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371037430_82tzgdoas	2025-09-08 22:37:17.432	2025-09-08 22:37:17.432
cmfbpcg5b00329wibe6wz3wl0	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757284964099_6lsmc4eh6	2025-09-08 22:37:24.288	2025-09-08 22:37:24.288
cmfbpchpy00349wibgz9xuv9b	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371046325_2n0exn9md	2025-09-08 22:37:26.327	2025-09-08 22:37:26.327
cmfbpchq700369wibkgzr8h81	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371046335_2y2kwb1wx	2025-09-08 22:37:26.336	2025-09-08 22:37:26.336
cmfbpcq0u00389wib4ngihc9e	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371057084_idzhqwqic	2025-09-08 22:37:37.086	2025-09-08 22:37:37.086
cmfbpcq14003a9wibo18tv1mq	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757371057095_uuearceoj	2025-09-08 22:37:37.096	2025-09-08 22:37:37.096
cmfcqvfd000019wlmr7fe71ko	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075503_b79r88evi	2025-09-09 16:07:55.509	2025-09-09 16:07:55.509
cmfcqvfd700039wlm5n6l72j9	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:07:55.531	2025-09-09 16:07:55.531
cmfcqvffh00059wlmyz5zi4wh	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:07:55.613	2025-09-09 16:07:55.613
cmfcqvfg700079wlm0w81x7ja	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:07:55.639	2025-09-09 16:07:55.639
cmfcqvfgh00099wlmmgyxbkrp	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:07:55.649	2025-09-09 16:07:55.649
cmfcqvhkp000b9wlm0y6uhnlb	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434078392_4q37jmqzs	2025-09-09 16:07:58.393	2025-09-09 16:07:58.393
cmfcqvhl1000d9wlmmegauo6j	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434078404_4ehsmuysd	2025-09-09 16:07:58.405	2025-09-09 16:07:58.405
cmfcqvo7n000f9wlm9muzzunr	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:08:06.996	2025-09-09 16:08:06.996
cmfcqvqcg000h9wlmqpfp83mp	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434089758_dvnz8xs6o	2025-09-09 16:08:09.761	2025-09-09 16:08:09.761
cmfcqvqdp000j9wlmvide0v95	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434089805_z6fdvn5f7	2025-09-09 16:08:09.806	2025-09-09 16:08:09.806
cmfcqvwhx000l9wlmbd6z1jru	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434097731_2kl21j0al	2025-09-09 16:08:17.733	2025-09-09 16:08:17.733
cmfcqvwia000n9wlmcaoyu1a4	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434097745_0r693t97s	2025-09-09 16:08:17.746	2025-09-09 16:08:17.746
cmfcqw6pk000p9wlmknp7t5ng	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:08:30.969	2025-09-09 16:08:30.969
cmfcqw9cg000r9wlm2g15h16p	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434114382_c8ktutr40	2025-09-09 16:08:34.384	2025-09-09 16:08:34.384
cmfcqw9cy000t9wlm423qn6ps	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434114401_70m9qk48a	2025-09-09 16:08:34.403	2025-09-09 16:08:34.403
cmfcqwffb000v9wlml7otw7xc	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:08:42.264	2025-09-09 16:08:42.264
cmfcqwhi1000x9wlm1vinq9eh	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434124952_gctvbnjok	2025-09-09 16:08:44.953	2025-09-09 16:08:44.953
cmfcqwhid000z9wlmlr850601	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434124964_tordcs436	2025-09-09 16:08:44.965	2025-09-09 16:08:44.965
cmfcqwo2800119wlmblb3rns5	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:08:53.456	2025-09-09 16:08:53.456
cmfcqxosz00139wlmkn3s1nbg	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434181074_82x4kij67	2025-09-09 16:09:41.075	2025-09-09 16:09:41.075
cmfcqxotc00159wlmo54h5nf8	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434181087_xoazgqfoc	2025-09-09 16:09:41.088	2025-09-09 16:09:41.088
cmfcqy0wk00179wlmkz89nh6r	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:09:56.756	2025-09-09 16:09:56.756
cmfcqy8kw00199wlmasbct3ms	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434206703_k7djhvdu1	2025-09-09 16:10:06.704	2025-09-09 16:10:06.704
cmfcqy8l8001b9wlm5mu65d5z	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434206715_17ngvzrr2	2025-09-09 16:10:06.716	2025-09-09 16:10:06.716
cmfcqyki1001d9wlmehe3d6w5	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434222152_16plqshtw	2025-09-09 16:10:22.153	2025-09-09 16:10:22.153
cmfcqykig001f9wlmawf6wkk7	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434222167_5bzlv4wxk	2025-09-09 16:10:22.168	2025-09-09 16:10:22.168
cmfcr0gve001h9wlmrf9jh4cr	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:11:50.762	2025-09-09 16:11:50.762
cmfcr0j0t001j9wlmoopod43y	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434313548_6pc8kpexq	2025-09-09 16:11:53.549	2025-09-09 16:11:53.549
cmfcr0j14001l9wlmxfum8jzt	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434313559_v33t73ccw	2025-09-09 16:11:53.56	2025-09-09 16:11:53.56
cmfcr2ahc001n9wlm183d02sf	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:13:15.788	2025-09-09 16:13:15.788
cmfcr2p2j001p9wlmm0i3qfhz	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434414697_znqow5kh9	2025-09-09 16:13:34.699	2025-09-09 16:13:34.699
cmfcr2p2w001r9wlmf6qjg0du	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434414711_bsxxua24t	2025-09-09 16:13:34.712	2025-09-09 16:13:34.712
cmfcr2st2001t9wlmes9imtju	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:13:39.542	2025-09-09 16:13:39.542
cmfcr2yjm001v9wlmkghp8i03	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434426977_4e0lwzkpe	2025-09-09 16:13:46.978	2025-09-09 16:13:46.978
cmfcr2yjx001x9wlmzwuh23oz	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434426989_8kulxzjk0	2025-09-09 16:13:46.99	2025-09-09 16:13:46.99
cmfcr346y001z9wlmae7ab9cb	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 16:13:54.298	2025-09-09 16:13:54.298
cmfcr3bh700219wlma1x3tb6z	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434443738_iczv4eq7z	2025-09-09 16:14:03.74	2025-09-09 16:14:03.74
cmfcr3bhk00239wlmp3ruga2j	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434443750_mr0glizci	2025-09-09 16:14:03.752	2025-09-09 16:14:03.752
cmfcvfaoe00019wfnvdxf87dg	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:21.031	2025-09-09 18:15:21.031
cmfcvfaof00039wfnkk62qvhf	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:21.033	2025-09-09 18:15:21.033
cmfcvfibt00079wfn3rnefqcy	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:30.953	2025-09-09 18:15:30.953
cmfcvfm7s00099wfnfke0svni	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:35.993	2025-09-09 18:15:35.993
cmfcvfm8a000b9wfn4w9fn7hr	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:36.011	2025-09-09 18:15:36.011
cmfcvfo71000d9wfnydtjf4gq	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757441738555_6hksv62un	2025-09-09 18:15:38.557	2025-09-09 18:15:38.557
cmfcvfo7i000f9wfn10wbgw1j	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757441738573_19n37v3jz	2025-09-09 18:15:38.574	2025-09-09 18:15:38.574
cmfcvft8h000h9wfnkami7ygi	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:15:45.089	2025-09-09 18:15:45.089
cmfcvfvjm000j9wfn3gk9puv5	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757441748081_3n5l5ueu4	2025-09-09 18:15:48.083	2025-09-09 18:15:48.083
cmfcvfvjz000l9wfng4p88mf7	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757441748094_ui3o2zkzy	2025-09-09 18:15:48.096	2025-09-09 18:15:48.096
cmfcvv3q0000n9wfnf3108a7f	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442458510_9zxl88xwr	2025-09-09 18:27:38.512	2025-09-09 18:27:38.512
cmfcvv3qj000p9wfn1h6jus1r	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442458538_2vl24e8rp	2025-09-09 18:27:38.54	2025-09-09 18:27:38.54
cmfcvv5mo000r9wfnu9jo4lxt	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:27:40.993	2025-09-09 18:27:40.993
cmfcvxc2m000t9wfnus64qiae	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442562653_lukahyhku	2025-09-09 18:29:22.654	2025-09-09 18:29:22.654
cmfcvxc2v000v9wfnfnq2fdg4	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442562663_husa60blc	2025-09-09 18:29:22.664	2025-09-09 18:29:22.664
cmfcvxf5z000x9wfnqpokidwl	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:29:26.663	2025-09-09 18:29:26.663
cmfcvxkdy000z9wfn1nks8ntd	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442573429_7997nhpeb	2025-09-09 18:29:33.43	2025-09-09 18:29:33.43
cmfcvxm9x00119wfng8vjd2gb	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442575876_483pljqj3	2025-09-09 18:29:35.878	2025-09-09 18:29:35.878
cmfcvxo2m00139wfnbrbbmwmq	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442578205_a85umrwx2	2025-09-09 18:29:38.206	2025-09-09 18:29:38.206
cmfcvxpva00159wfnbe0ruqh2	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442580533_uh7lxp14t	2025-09-09 18:29:40.534	2025-09-09 18:29:40.534
cmfcvxrem00179wfn32ssnd9z	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442582525_1nn23lhxi	2025-09-09 18:29:42.526	2025-09-09 18:29:42.526
cmfcvxt7l00199wfnlc2n799s	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442584864_tjsods1op	2025-09-09 18:29:44.865	2025-09-09 18:29:44.865
cmfcvxuvv001b9wfn5szhc96u	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442587034_p0iozunyc	2025-09-09 18:29:47.035	2025-09-09 18:29:47.035
cmfcvxwpj001d9wfnldbzadph	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442589399_jeon9pmt3	2025-09-09 18:29:49.4	2025-09-09 18:29:49.4
cmfcvxy6y001f9wfn7zcz1tsg	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442591321_lyqq6jk64	2025-09-09 18:29:51.322	2025-09-09 18:29:51.322
cmfcvy00w001h9wfn3ip5mu4w	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442593695_xd7sncudl	2025-09-09 18:29:53.696	2025-09-09 18:29:53.696
cmfcvz2gc001n9wfnep9uo2cr	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:30:43.497	2025-09-09 18:30:43.497
cmfcvz3pw001p9wfnuto7leb4	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442645140_h64vcrw1w	2025-09-09 18:30:45.141	2025-09-09 18:30:45.141
cmfcvz3q5001r9wfnb7mn1yfs	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442645148_9d0wt18b2	2025-09-09 18:30:45.149	2025-09-09 18:30:45.149
cmfcvzv1m001t9wfn0ommpu1j	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:31:20.554	2025-09-09 18:31:20.554
cmfcw010d001v9wfn67wzlz86	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442688284_pqyvw0byj	2025-09-09 18:31:28.286	2025-09-09 18:31:28.286
cmfcw010n001x9wfnjk3u3i7l	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757442688294_vmecuh3ce	2025-09-09 18:31:28.295	2025-09-09 18:31:28.295
cmfcwcozs00019wvt08qzfxua	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:19.24	2025-09-09 18:41:19.24
cmfcwcqld00039wvt6mzsl6wu	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443281311_6sdqn929f	2025-09-09 18:41:21.313	2025-09-09 18:41:21.313
cmfcwcqlr00059wvt9pro9zth	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443281326_yi9l70g1x	2025-09-09 18:41:21.328	2025-09-09 18:41:21.328
cmfcwczx700079wvt2rm6qkxk	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:33.403	2025-09-09 18:41:33.403
cmfcwczxd00099wvtc8hl71yt	test_user_123	/{*path}	http://localhost:4000/auth/profile	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:33.409	2025-09-09 18:41:33.409
cmfcwczxx000b9wvti0evnfey	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:33.43	2025-09-09 18:41:33.43
cmfcwczy8000d9wvt0zzy1trw	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:33.44	2025-09-09 18:41:33.44
cmfcwczyh000f9wvtiwf64he2	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:33.449	2025-09-09 18:41:33.449
cmfcwd1pi000h9wvty4z59iaw	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443295717_o30kttf0q	2025-09-09 18:41:35.719	2025-09-09 18:41:35.719
cmfcwd1pt000j9wvt9kjkyeeb	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443295729_11lzg2hrd	2025-09-09 18:41:35.73	2025-09-09 18:41:35.73
cmfcwd7ca000l9wvtrru32fi7	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:41:43.013	2025-09-09 18:41:43.013
cmfcwde0j000n9wvthgjq1zu1	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443311666_fy7viw2dh	2025-09-09 18:41:51.668	2025-09-09 18:41:51.668
cmfcwde0w000p9wvt7rv2lywh	test_user_123	/{*path}	http://localhost:4000/game-master/games/game1/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443311679_li8q49vki	2025-09-09 18:41:51.68	2025-09-09 18:41:51.68
cmfcwfwqp000r9wvtffkm76jv	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443429247_c831mt9s2	2025-09-09 18:43:49.249	2025-09-09 18:43:49.249
cmfcwfwry000t9wvt3atzkv4g	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443429293_pmci458l3	2025-09-09 18:43:49.294	2025-09-09 18:43:49.294
cmfcwhcc5000x9wvtr5ymebr8	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:44:56.117	2025-09-09 18:44:56.117
cmfcwhfa8000z9wvt68hlxjh0	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443499935_e5xb9xgz3	2025-09-09 18:44:59.936	2025-09-09 18:44:59.936
cmfcwhfag00119wvt9bfbetby	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443499943_a4oysxfyd	2025-09-09 18:44:59.945	2025-09-09 18:44:59.945
cmfcwhn6d00139wvtmeaaqpd1	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 18:45:10.166	2025-09-09 18:45:10.166
cmfcwhpol00159wvtunwq5j10	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443513412_uc1qo9rxx	2025-09-09 18:45:13.413	2025-09-09 18:45:13.413
cmfcwhpox00179wvtyj6kbp8t	test_user_123	/{*path}	http://localhost:4000/game-master/games/game2/clues	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757443513424_bhrermz70	2025-09-09 18:45:13.425	2025-09-09 18:45:13.425
cmfcx9mb600039w78wwg8tel7	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 19:06:55.411	2025-09-09 19:06:55.411
cmfcx9st400059w78mgtly0xv	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 19:07:03.833	2025-09-09 19:07:03.833
cmfcx9sts00079w78n1ys1pts	test_user_123	/{*path}	http://localhost:4000/game-master/games	\N	\N	::1	node	Unknown	Unknown	Unknown	Unknown	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 19:07:03.856	2025-09-09 19:07:03.856
cmfcxedy8000b9w78nrrprw5m	test_user_123	/{*path}	http://localhost:4000/admin/stats	\N	http://localhost:3000/	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	Chrome	140	macOS	10.15	desktop	Unknown	\N	\N	\N	session_1757434075530_yh72e4mvi	2025-09-09 19:10:37.857	2025-09-09 19:10:37.857
\.


--
-- Data for Name: PlayerGame; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."PlayerGame" (id, "userId", "gameId", "isActive", "joinedAt", "leftAt", "totalPoints", "privacyLevel", "createdAt", "updatedAt") FROM stdin;
cmfd1g7g7003v9we4lq5slonx	player_16	game2	t	2025-09-09 21:04:01.208	\N	500	PRIVATE	2025-09-09 21:04:01.208	2025-09-09 21:04:01.51
cmfd1g7gj005p9we40fqafiry	cmfd1g7f8001h9we4xl87qe5x	game1	t	2025-09-09 21:04:01.22	\N	1012	PRIVATE	2025-09-09 21:04:01.22	2025-09-09 21:04:01.51
cmfd1g7g6003p9we4kl3z56qc	cmfd1g7fh001z9we44cn4y9fv	game2	t	2025-09-09 21:04:01.207	\N	800	PRIVATE	2025-09-09 21:04:01.207	2025-09-09 21:04:01.51
cmfd1g7gi005j9we4ao8ykusw	cmfd1g7fa001k9we4wem31q38	game1	t	2025-09-09 21:04:01.219	\N	1672	PRIVATE	2025-09-09 21:04:01.219	2025-09-09 21:04:01.511
cmfd1g7fv002p9we4d0v17xcj	cmfd1g7fh001y9we4zqnwaqtk	game2	t	2025-09-09 21:04:01.196	\N	400	MINIONS_ONLY	2025-09-09 21:04:01.196	2025-09-09 21:04:01.511
cmfd1g7g300399we4ok139ucs	cmfd1g7fm002a9we4gdks3s55	game2	t	2025-09-09 21:04:01.203	\N	500	PRIVATE	2025-09-09 21:04:01.203	2025-09-09 21:04:01.512
cmfd1g7g4003f9we4o5i2p5k7	cmfd1g7fg001v9we4iq5yn0f4	game2	t	2025-09-09 21:04:01.204	\N	400	MINIONS_ONLY	2025-09-09 21:04:01.204	2025-09-09 21:04:01.512
cmfd1g7fz002t9we4c0knx8sz	player_17	game2	t	2025-09-09 21:04:01.199	\N	600	MINIONS_ONLY	2025-09-09 21:04:01.199	2025-09-09 21:04:01.513
cmfd1g7g5003j9we4hp04stzg	cmfd1g7fn002c9we45gooto2o	game2	t	2025-09-09 21:04:01.206	\N	800	PUBLIC	2025-09-09 21:04:01.206	2025-09-09 21:04:01.514
cmfd1g7gg00579we4ch15zznz	cmfd1g7f9001i9we4tzqc1k6c	game1	t	2025-09-09 21:04:01.216	\N	751	MINIONS_ONLY	2025-09-09 21:04:01.216	2025-09-09 21:04:01.514
cmfd1g7ge00519we4j7ykyx94	cmfd1g7fi00209we4hcbjnaxr	game1	t	2025-09-09 21:04:01.215	\N	848	PUBLIC	2025-09-09 21:04:01.215	2025-09-09 21:04:01.515
cmfacm5vi00039w9txw2dca4b	player2	game1	t	2024-02-02 05:16:13.948	\N	500	PUBLIC	2025-09-07 23:53:16.351	2025-09-09 21:04:01.515
cmfacm5vl00099w9t7ls3shr9	player2	game2	t	2025-03-04 01:35:52.036	\N	500	PRIVATE	2025-09-07 23:53:16.354	2025-09-09 21:04:01.515
cmfd1g7g200359we4bhfotqzs	cmfd1g7fe001r9we4lqdek9a3	game2	t	2025-09-09 21:04:01.203	\N	300	PRIVATE	2025-09-09 21:04:01.203	2025-09-09 21:04:01.515
cmfd1g7g6003n9we4f141n9rd	cmfd1g7fb001l9we4wiyyzv98	game2	t	2025-09-09 21:04:01.206	\N	400	PRIVATE	2025-09-09 21:04:01.206	2025-09-09 21:04:01.516
cmfd1g7ge004x9we40j0u9ww6	cmfd1g7f4001a9we471049ol1	game1	t	2025-09-09 21:04:01.214	\N	513	PUBLIC	2025-09-09 21:04:01.214	2025-09-09 21:04:01.516
cmfd1g7ga00499we435nrp727	cmfd1g7fo002e9we48hp0gd97	game2	t	2025-09-09 21:04:01.21	\N	100	MINIONS_ONLY	2025-09-09 21:04:01.21	2025-09-09 21:04:01.516
cmfd1g7g800419we4ntoj73fx	player_12	game2	t	2025-09-09 21:04:01.209	\N	1000	MINIONS_ONLY	2025-09-09 21:04:01.209	2025-09-09 21:04:01.517
cmfd1g7g200339we45cigz320	cmfd1g7fd001q9we4jd5qwrf7	game2	t	2025-09-09 21:04:01.202	\N	200	PRIVATE	2025-09-09 21:04:01.202	2025-09-09 21:04:01.517
cmfd1g7gj005n9we4qw2lfcbm	cmfd1g7fr002k9we4373hx6bo	game1	t	2025-09-09 21:04:01.219	\N	538	PRIVATE	2025-09-09 21:04:01.219	2025-09-09 21:04:01.517
cmfd1g7gg00599we413sxaurq	cmfd1g7fh001x9we4v0blgs1w	game1	t	2025-09-09 21:04:01.216	\N	746	PRIVATE	2025-09-09 21:04:01.216	2025-09-09 21:04:01.518
cmfd1g7gh005f9we4jy6onpbh	player_19	game1	t	2025-09-09 21:04:01.218	\N	1487	MINIONS_ONLY	2025-09-09 21:04:01.218	2025-09-09 21:04:01.518
cmfd1g7gi005h9we4awg89r1c	player_11	game1	t	2025-09-09 21:04:01.218	\N	249	PUBLIC	2025-09-09 21:04:01.218	2025-09-09 21:04:01.518
cmfd1g7g200379we4t900ays6	cmfd1g7f5001b9we4nnn2tc8d	game2	t	2025-09-09 21:04:01.203	\N	300	PUBLIC	2025-09-09 21:04:01.203	2025-09-09 21:04:01.519
cmfd1g7gj005l9we4f5g52usf	cmfd1g7fs002m9we4z2vmoo1a	game1	t	2025-09-09 21:04:01.219	\N	248	PRIVATE	2025-09-09 21:04:01.219	2025-09-09 21:04:01.52
cmfd1g7g0002x9we45t2obj6x	cmfd1g7fb001m9we4kptyb7zx	game2	t	2025-09-09 21:04:01.2	\N	900	MINIONS_ONLY	2025-09-09 21:04:01.2	2025-09-09 21:04:01.52
cmfd1g7gb004h9we4hzm84zo2	cmfd1g7fi00219we438was4wo	game2	t	2025-09-09 21:04:01.212	\N	227	MINIONS_ONLY	2025-09-09 21:04:01.212	2025-09-09 21:04:01.52
cmfd1g7gd004r9we438j3fyzc	cmfd1g7fi00219we438was4wo	game1	t	2025-09-09 21:04:01.213	\N	227	PUBLIC	2025-09-09 21:04:01.213	2025-09-09 21:04:01.52
cmfd1g7gc004l9we41xw64vhq	cmfd1g7fd001p9we4faowsm7v	game2	t	2025-09-09 21:04:01.212	\N	1409	MINIONS_ONLY	2025-09-09 21:04:01.212	2025-09-09 21:04:01.521
cmfd1g7gd004v9we4j3p0fhdx	cmfd1g7fd001p9we4faowsm7v	game1	t	2025-09-09 21:04:01.214	\N	1409	PRIVATE	2025-09-09 21:04:01.214	2025-09-09 21:04:01.521
cmfd1g7g4003h9we45apr9l03	cmfd1g7fl00279we4ptzl63t0	game2	t	2025-09-09 21:04:01.205	\N	900	PRIVATE	2025-09-09 21:04:01.205	2025-09-09 21:04:01.521
cmfd1g7gf00539we4q1w3fu69	cmfd1g7fc001o9we4cwszx3ev	game1	t	2025-09-09 21:04:01.215	\N	1412	MINIONS_ONLY	2025-09-09 21:04:01.215	2025-09-09 21:04:01.521
cmfd1g7gk005v9we4q708pehg	cmfd1g7fk00249we4z4fi7drx	game1	t	2025-09-09 21:04:01.221	\N	433	MINIONS_ONLY	2025-09-09 21:04:01.221	2025-09-09 21:04:01.522
cmfd1g7g3003b9we4h8ft9jb9	cmfd1g7fl00289we4orc3zbyd	game2	t	2025-09-09 21:04:01.204	\N	400	PRIVATE	2025-09-09 21:04:01.204	2025-09-09 21:04:01.522
cmfd1g7g7003t9we4uak3kwhf	cmfd1g7fr002l9we46vt8jg6q	game2	t	2025-09-09 21:04:01.207	\N	600	MINIONS_ONLY	2025-09-09 21:04:01.207	2025-09-09 21:04:01.523
cmfd1g7g100319we42hxd1rsc	cmfd1g7fe001s9we40xamhqjt	game2	t	2025-09-09 21:04:01.202	\N	300	MINIONS_ONLY	2025-09-09 21:04:01.202	2025-09-09 21:04:01.524
cmfd1g7gh005d9we438vk0g5x	cmfd1g7ff001t9we4ewmqv5te	game1	t	2025-09-09 21:04:01.217	\N	697	PRIVATE	2025-09-09 21:04:01.217	2025-09-09 21:04:01.524
cmfd1g7gb004f9we4k9vbp19l	cmfd1g7fk00269we4roz15cia	game2	t	2025-09-09 21:04:01.211	\N	1559	MINIONS_ONLY	2025-09-09 21:04:01.211	2025-09-09 21:04:01.524
cmfd1g7gd004p9we4hxrwxnpx	cmfd1g7fk00269we4roz15cia	game1	t	2025-09-09 21:04:01.213	\N	1559	PRIVATE	2025-09-09 21:04:01.213	2025-09-09 21:04:01.524
cmfd1g7gk005r9we45pqy3eqd	cmfd1g7fj00239we4994zi1hy	game1	t	2025-09-09 21:04:01.22	\N	281	PRIVATE	2025-09-09 21:04:01.22	2025-09-09 21:04:01.525
cmfacm5vg00019w9tc0tsgifa	player1	game1	t	2024-12-28 04:42:34.641	\N	600	PRIVATE	2025-09-07 23:53:16.349	2025-09-09 21:04:01.525
cmfacm5vk00079w9tf94fg7ub	player1	game2	t	2025-03-20 06:45:46.726	\N	600	PUBLIC	2025-09-07 23:53:16.353	2025-09-09 21:04:01.525
cmfd1g7ga004d9we4m9r9a0sg	player_10	game2	t	2025-09-09 21:04:01.211	\N	2133	MINIONS_ONLY	2025-09-09 21:04:01.211	2025-09-09 21:04:01.526
cmfd1g7gc004n9we4bv1uzp80	player_10	game1	t	2025-09-09 21:04:01.213	\N	2133	MINIONS_ONLY	2025-09-09 21:04:01.213	2025-09-09 21:04:01.526
cmfd1g7g900459we4oh0v6kbl	cmfd1g7f7001f9we4ldetuaz2	game2	t	2025-09-09 21:04:01.21	\N	1000	PUBLIC	2025-09-09 21:04:01.21	2025-09-09 21:04:01.526
cmfd1g7fz002v9we4gfvc5hvy	player_14	game2	t	2025-09-09 21:04:01.2	\N	900	PRIVATE	2025-09-09 21:04:01.2	2025-09-09 21:04:01.527
cmfd1g7ga004b9we4awbwg7iw	cmfd1g7fq002i9we49e2zwjs2	game2	t	2025-09-09 21:04:01.211	\N	800	MINIONS_ONLY	2025-09-09 21:04:01.211	2025-09-09 21:04:01.527
cmfd1g7g4003d9we47czvp78f	player_21	game2	t	2025-09-09 21:04:01.204	\N	600	MINIONS_ONLY	2025-09-09 21:04:01.204	2025-09-09 21:04:01.527
cmfacm5vj00059w9teu3xpe5q	player3	game1	t	2024-04-17 03:26:55.41	\N	500	PUBLIC	2025-09-07 23:53:16.352	2025-09-09 21:04:01.528
cmfacm5vm000b9w9tt9gbfbpb	player3	game2	t	2025-07-18 20:36:52.362	\N	500	PRIVATE	2025-09-07 23:53:16.355	2025-09-09 21:04:01.528
cmfd1g7g8003z9we4fu3a27ju	player_18	game2	t	2025-09-09 21:04:01.208	\N	300	PUBLIC	2025-09-09 21:04:01.208	2025-09-09 21:04:01.528
cmfd1g7g7003x9we4haaujjpc	cmfd1g7f9001j9we44ui8f2av	game2	t	2025-09-09 21:04:01.208	\N	600	PUBLIC	2025-09-09 21:04:01.208	2025-09-09 21:04:01.528
cmfd1g7gg005b9we490sisufy	cmfd1g7f6001e9we4i0t0bcaq	game1	t	2025-09-09 21:04:01.217	\N	1212	PRIVATE	2025-09-09 21:04:01.217	2025-09-09 21:04:01.529
cmfd1g7g6003r9we4xhzl7znx	cmfd1g7fc001n9we4kxoirq3o	game2	t	2025-09-09 21:04:01.207	\N	500	PUBLIC	2025-09-09 21:04:01.207	2025-09-09 21:04:01.529
cmfd1g7gf00559we47tk600wb	player_20	game1	t	2025-09-09 21:04:01.216	\N	1344	PRIVATE	2025-09-09 21:04:01.216	2025-09-09 21:04:01.53
cmfd1g7gk005t9we48zvtdzil	cmfd1g7ff001u9we4d22offi8	game1	t	2025-09-09 21:04:01.22	\N	978	MINIONS_ONLY	2025-09-09 21:04:01.22	2025-09-09 21:04:01.53
cmfd1g7ge004z9we4nus44f2n	cmfd1g7fk00259we4ulkgqmnr	game1	t	2025-09-09 21:04:01.215	\N	1286	PRIVATE	2025-09-09 21:04:01.215	2025-09-09 21:04:01.531
cmfd1g7gb004j9we40h6flmg6	cmfd1g7fn002b9we4zhmqh7z5	game2	t	2025-09-09 21:04:01.212	\N	1790	MINIONS_ONLY	2025-09-09 21:04:01.212	2025-09-09 21:04:01.532
cmfd1g7gd004t9we42jxifg1w	cmfd1g7fn002b9we4zhmqh7z5	game1	t	2025-09-09 21:04:01.214	\N	1790	PUBLIC	2025-09-09 21:04:01.214	2025-09-09 21:04:01.532
cmfd1g7g900479we44qofunuc	cmfd1g7fs002n9we42y31eyfe	game2	t	2025-09-09 21:04:01.21	\N	900	PRIVATE	2025-09-09 21:04:01.21	2025-09-09 21:04:01.532
cmfd1g7g5003l9we4jbgakisx	cmfd1g7fq002j9we4a3mbk43l	game2	t	2025-09-09 21:04:01.206	\N	100	MINIONS_ONLY	2025-09-09 21:04:01.206	2025-09-09 21:04:01.509
cmfd1g7gn00699we41a2lemrs	cmfd1g7f5001c9we4sn9qrszs	game1	t	2025-09-09 21:04:01.224	\N	963	PRIVATE	2025-09-09 21:04:01.224	2025-09-09 21:04:01.514
cmfd1g7gm00619we4afbivx83	cmfd1g7fj00229we469ztyy6c	game1	t	2025-09-09 21:04:01.222	\N	629	PUBLIC	2025-09-09 21:04:01.222	2025-09-09 21:04:01.517
cmfd1g7gp006j9we4uasagyzf	cmfd1g7fp002h9we4cozrxoag	game1	t	2025-09-09 21:04:01.225	\N	1672	MINIONS_ONLY	2025-09-09 21:04:01.225	2025-09-09 21:04:01.519
cmfd1g7gn00679we4zb4p6b13	cmfd1g7fp002g9we4fwxmmn0c	game1	t	2025-09-09 21:04:01.224	\N	1222	MINIONS_ONLY	2025-09-09 21:04:01.224	2025-09-09 21:04:01.519
cmfd1g7go006d9we4d5z191ou	cmfd1g7fg001w9we4j30nmi1b	game1	t	2025-09-09 21:04:01.224	\N	1297	MINIONS_ONLY	2025-09-09 21:04:01.224	2025-09-09 21:04:01.522
cmfd1g7gp006h9we41ibv0eyh	cmfd1g7f8001g9we4s309hn4s	game1	t	2025-09-09 21:04:01.225	\N	1672	MINIONS_ONLY	2025-09-09 21:04:01.225	2025-09-09 21:04:01.523
cmfd1g7go006b9we4x6yaztb2	player_13	game1	t	2025-09-09 21:04:01.224	\N	555	PRIVATE	2025-09-09 21:04:01.224	2025-09-09 21:04:01.523
cmfd1g7gl005x9we42qdu6u39	cmfd1g7fo002d9we446b2hwup	game1	t	2025-09-09 21:04:01.221	\N	1397	MINIONS_ONLY	2025-09-09 21:04:01.221	2025-09-09 21:04:01.525
cmfd1g7gm00639we476dk1r8n	cmfd1g7fp002f9we4k9pjjzcu	game1	t	2025-09-09 21:04:01.223	\N	466	PUBLIC	2025-09-09 21:04:01.223	2025-09-09 21:04:01.525
cmfd1g7gm005z9we4ijbnzulx	player_15	game1	t	2025-09-09 21:04:01.222	\N	127	MINIONS_ONLY	2025-09-09 21:04:01.222	2025-09-09 21:04:01.526
cmfd1g7gn00659we4ychippkc	cmfd1g7f6001d9we4b7mn55ov	game1	t	2025-09-09 21:04:01.223	\N	127	MINIONS_ONLY	2025-09-09 21:04:01.223	2025-09-09 21:04:01.529
cmfd1g7go006f9we4qciyl7rs	cmfd1g7fm00299we4sxis3ytu	game1	t	2025-09-09 21:04:01.225	\N	127	PUBLIC	2025-09-09 21:04:01.225	2025-09-09 21:04:01.53
\.


--
-- Data for Name: PointScale; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."PointScale" (id, name, description, options, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Prize; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Prize" (id, "gameId", name, description, type, distribution, value, frequency, "createdAt", "updatedAt", delivery) FROM stdin;
\.


--
-- Data for Name: ProfileData; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."ProfileData" (id, "userId", "phoneNumber", "homeAddress", education, "highSchool", college, "shoppingPatterns", points, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Referral; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Referral" (id, "referrerId", "referredId", "isActive", points, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SocialConnection; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."SocialConnection" (id, "followerId", "followingId", "isActive", points, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Survey; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Survey" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SurveyQuestion; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."SurveyQuestion" (id, "surveyId", question, type, "pointScaleId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SurveyResponse; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."SurveyResponse" (id, "userId", answer, points, "createdAt", "gameSurveyId", "questionId") FROM stdin;
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Team" (id, name, description, "isActive", "isCrossGame", "createdAt", "updatedAt", "gameId") FROM stdin;
\.


--
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."TeamMember" (id, "teamId", "userId", role, "joinedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Treatment; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."Treatment" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TreatmentAssignment; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."TreatmentAssignment" (id, "userId", "gameTreatmentId", "assignedAt", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public."User" (id, email, "createdAt", "firstName", "isActive", "lastName", password, role, "updatedAt", "bestFindMemory", degrees, education, "favoritePlayZones", hobbies, "homeCity", "profilePicture", "statusMessage", "workHistory", "gamerTag", "agreedToPrivacy", "agreedToTerms", country, "dateOfBirth", "isPaidUser", "privacyVersion", state, "termsVersion") FROM stdin;
player1	alice@example.com	2025-09-07 17:50:35.857	Alice	t	Johnson	$2b$12$3uJAVgS.S7qNa2VmseeZOu9.hrHlCvOcSu1ikMfe/Eha9Ufkl3m/a	PLAYER	2025-09-07 17:50:35.857	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player2	bob@example.com	2025-09-07 17:50:35.857	Bob	t	Smith	$2b$12$3uJAVgS.S7qNa2VmseeZOu9.hrHlCvOcSu1ikMfe/Eha9Ufkl3m/a	PLAYER	2025-09-07 17:50:35.857	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player3	carol@example.com	2025-09-07 17:50:35.857	Carol	t	Davis	$2b$12$3uJAVgS.S7qNa2VmseeZOu9.hrHlCvOcSu1ikMfe/Eha9Ufkl3m/a	PLAYER	2025-09-07 17:50:35.857	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_10	alex.johnson@email.com	2025-09-07 23:54:11.527	Alex	t	Johnson	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.527	\N	\N	\N	\N	\N	New York	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_11	sarah.williams@email.com	2025-09-07 23:54:11.53	Sarah	t	Williams	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.53	\N	\N	\N	\N	\N	Los Angeles	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_12	mike.brown@email.com	2025-09-07 23:54:11.531	Mike	t	Brown	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.531	\N	\N	\N	\N	\N	Chicago	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_13	emma.davis@email.com	2025-09-07 23:54:11.531	Emma	t	Davis	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.531	\N	\N	\N	\N	\N	Houston	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_14	james.miller@email.com	2025-09-07 23:54:11.532	James	t	Miller	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.532	\N	\N	\N	\N	\N	Phoenix	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_15	olivia.wilson@email.com	2025-09-07 23:54:11.533	Olivia	t	Wilson	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.533	\N	\N	\N	\N	\N	Philadelphia	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_16	william.moore@email.com	2025-09-07 23:54:11.534	William	t	Moore	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.534	\N	\N	\N	\N	\N	San Antonio	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_17	ava.taylor@email.com	2025-09-07 23:54:11.535	Ava	t	Taylor	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.535	\N	\N	\N	\N	\N	San Diego	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_18	oliver.anderson@email.com	2025-09-07 23:54:11.535	Oliver	t	Anderson	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.535	\N	\N	\N	\N	\N	Dallas	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_19	sophia.thomas@email.com	2025-09-07 23:54:11.536	Sophia	t	Thomas	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.536	\N	\N	\N	\N	\N	San Jose	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_20	noah.jackson@email.com	2025-09-07 23:54:11.537	Noah	t	Jackson	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.537	\N	\N	\N	\N	\N	Austin	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
player_21	isabella.white@email.com	2025-09-07 23:54:11.537	Isabella	t	White	$2b$12$j46PW.e23tM4qM6446K06ezj7Pxouhny6WgINXm3u8rXOTMVdhGsS	PLAYER	2025-09-07 23:54:11.537	\N	\N	\N	\N	\N	Jacksonville	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
test_user_123	gamemanager@findamine.app	2025-09-07 17:41:19.033	Game	t	Manager	$2b$12$3uJAVgS.S7qNa2VmseeZOu9.hrHlCvOcSu1ikMfe/Eha9Ufkl3m/a	GAME_MASTER	2025-09-09 21:04:01.084	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	\N	\N	f	\N	\N	\N
cmfd1g7ef00009we44jq3bvl0	admin@findamine.app	2025-09-09 21:04:01.144	System	t	Administrator	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	ADMIN	2025-09-09 21:04:01.144	\N	\N	\N	\N	\N	\N	\N	\N	\N	SysAdmin	t	t	\N	\N	f	\N	\N	\N
cmfd1g7f4001a9we471049ol1	mateo.brown1@student.byu.edu	2025-09-09 21:04:01.168	Mateo	t	Brown	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.168	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	MateoBrown767	t	t	USA	2001-10-04 06:00:00	f	\N	Utah	\N
cmfd1g7f5001b9we4nnn2tc8d	sophia.king2@student.byu.edu	2025-09-09 21:04:01.169	Sophia	t	King	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.169	\N	\N	\N	\N	\N	Orem	\N	\N	\N	SophiaKing309	t	t	USA	2000-04-26 06:00:00	f	\N	Utah	\N
cmfd1g7f5001c9we4sn9qrszs	evelyn.garcia3@student.byu.edu	2025-09-09 21:04:01.17	Evelyn	t	Garcia	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.17	\N	\N	\N	\N	\N	Orem	\N	\N	\N	EvelynGarcia627	t	t	USA	1999-09-01 06:00:00	f	\N	Utah	\N
cmfd1g7f6001d9we4b7mn55ov	joseph.miller4@student.byu.edu	2025-09-09 21:04:01.17	Joseph	t	Miller	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.17	\N	\N	\N	\N	\N	Logan	\N	\N	\N	JosephMiller971	t	t	USA	1996-10-18 06:00:00	f	\N	Utah	\N
cmfd1g7f6001e9we4i0t0bcaq	theodore.young5@student.byu.edu	2025-09-09 21:04:01.171	Theodore	t	Young	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.171	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	TheodoreYoung273	t	t	USA	2002-04-18 06:00:00	f	\N	Utah	\N
cmfd1g7f7001f9we4ldetuaz2	abigail.smith6@student.byu.edu	2025-09-09 21:04:01.171	Abigail	t	Smith	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.171	\N	\N	\N	\N	\N	Logan	\N	\N	\N	AbigailSmith179	t	t	USA	1998-12-15 07:00:00	f	\N	Utah	\N
cmfd1g7f8001g9we4s309hn4s	scarlett.mitchell7@student.byu.edu	2025-09-09 21:04:01.172	Scarlett	t	Mitchell	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.172	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	ScarlettMitchell552	t	t	USA	1997-10-14 06:00:00	f	\N	Utah	\N
cmfd1g7f8001h9we4xl87qe5x	noah.jackson8@student.byu.edu	2025-09-09 21:04:01.173	Noah	t	Jackson	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.173	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	NoahJackson643	t	t	USA	1997-07-19 06:00:00	f	\N	Utah	\N
cmfd1g7f9001i9we4tzqc1k6c	daniel.johnson9@student.byu.edu	2025-09-09 21:04:01.173	Daniel	t	Johnson	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.173	\N	\N	\N	\N	\N	Provo	\N	\N	\N	DanielJohnson246	t	t	USA	1998-07-17 06:00:00	f	\N	Utah	\N
cmfd1g7f9001j9we44ui8f2av	abigail.king10@student.byu.edu	2025-09-09 21:04:01.174	Abigail	t	King	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.174	\N	\N	\N	\N	\N	Provo	\N	\N	\N	AbigailKing611	t	t	USA	2000-11-08 07:00:00	f	\N	Utah	\N
cmfd1g7fa001k9we4wem31q38	benjamin.williams11@student.byu.edu	2025-09-09 21:04:01.174	Benjamin	t	Williams	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.174	\N	\N	\N	\N	\N	Provo	\N	\N	\N	BenjaminWilliams798	t	t	USA	1995-03-28 07:00:00	f	\N	Utah	\N
cmfd1g7fb001l9we4wiyyzv98	aiden.hill12@student.byu.edu	2025-09-09 21:04:01.175	Aiden	t	Hill	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.175	\N	\N	\N	\N	\N	Logan	\N	\N	\N	AidenHill110	t	t	USA	1998-02-16 07:00:00	f	\N	Utah	\N
cmfd1g7fb001m9we4kptyb7zx	ava.flores13@student.byu.edu	2025-09-09 21:04:01.176	Ava	t	Flores	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.176	\N	\N	\N	\N	\N	Provo	\N	\N	\N	AvaFlores724	t	t	USA	2001-03-12 07:00:00	f	\N	Utah	\N
cmfd1g7fc001n9we4kxoirq3o	joseph.lee14@student.byu.edu	2025-09-09 21:04:01.176	Joseph	t	Lee	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.176	\N	\N	\N	\N	\N	Logan	\N	\N	\N	JosephLee542	t	t	USA	2003-09-03 06:00:00	f	\N	Utah	\N
cmfd1g7fc001o9we4cwszx3ev	elijah.roberts15@student.byu.edu	2025-09-09 21:04:01.177	Elijah	t	Roberts	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.177	\N	\N	\N	\N	\N	Logan	\N	\N	\N	ElijahRoberts133	t	t	USA	2002-06-07 06:00:00	f	\N	Utah	\N
cmfd1g7fd001p9we4faowsm7v	jackson.campbell16@student.byu.edu	2025-09-09 21:04:01.177	Jackson	t	Campbell	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.177	\N	\N	\N	\N	\N	Logan	\N	\N	\N	JacksonCampbell3	t	t	USA	1997-12-14 07:00:00	f	\N	Utah	\N
cmfd1g7fd001q9we4jd5qwrf7	amelia.campbell17@student.byu.edu	2025-09-09 21:04:01.178	Amelia	t	Campbell	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.178	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	AmeliaCampbell767	t	t	USA	2002-06-06 06:00:00	f	\N	Utah	\N
cmfd1g7fe001r9we4lqdek9a3	alexander.taylor18@student.byu.edu	2025-09-09 21:04:01.178	Alexander	t	Taylor	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.178	\N	\N	\N	\N	\N	Logan	\N	\N	\N	AlexanderTaylor396	t	t	USA	2004-04-21 06:00:00	f	\N	Utah	\N
cmfd1g7fe001s9we40xamhqjt	lucas.king19@student.byu.edu	2025-09-09 21:04:01.179	Lucas	t	King	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.179	\N	\N	\N	\N	\N	Orem	\N	\N	\N	LucasKing941	t	t	USA	1999-08-24 06:00:00	f	\N	Utah	\N
cmfd1g7ff001t9we4ewmqv5te	daniel.allen20@student.byu.edu	2025-09-09 21:04:01.179	Daniel	t	Allen	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.179	\N	\N	\N	\N	\N	Orem	\N	\N	\N	DanielAllen415	t	t	USA	2000-12-14 07:00:00	f	\N	Utah	\N
cmfd1g7ff001u9we4d22offi8	camila.miller21@student.byu.edu	2025-09-09 21:04:01.18	Camila	t	Miller	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.18	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	CamilaMiller352	t	t	USA	2004-01-16 07:00:00	f	\N	Utah	\N
cmfd1g7fg001v9we4iq5yn0f4	daniel.torres22@student.byu.edu	2025-09-09 21:04:01.18	Daniel	t	Torres	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.18	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	DanielTorres652	t	t	USA	2002-01-02 07:00:00	f	\N	Utah	\N
cmfd1g7fg001w9we4j30nmi1b	oliver.harris23@student.byu.edu	2025-09-09 21:04:01.181	Oliver	t	Harris	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.181	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	OliverHarris362	t	t	USA	1995-12-21 07:00:00	f	\N	Utah	\N
cmfd1g7fh001x9we4v0blgs1w	jack.taylor24@student.byu.edu	2025-09-09 21:04:01.181	Jack	t	Taylor	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.181	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	JackTaylor346	t	t	USA	1996-03-18 07:00:00	f	\N	Utah	\N
cmfd1g7fh001y9we4zqnwaqtk	elizabeth.torres25@student.byu.edu	2025-09-09 21:04:01.181	Elizabeth	t	Torres	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.181	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	ElizabethTorres398	t	t	USA	1998-02-27 07:00:00	f	\N	Utah	\N
cmfd1g7fh001z9we44cn4y9fv	layla.roberts26@student.byu.edu	2025-09-09 21:04:01.182	Layla	t	Roberts	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.182	\N	\N	\N	\N	\N	Logan	\N	\N	\N	LaylaRoberts84	t	t	USA	2004-05-28 06:00:00	f	\N	Utah	\N
cmfd1g7fi00209we4hcbjnaxr	benjamin.torres27@student.byu.edu	2025-09-09 21:04:01.182	Benjamin	t	Torres	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.182	\N	\N	\N	\N	\N	Provo	\N	\N	\N	BenjaminTorres442	t	t	USA	2002-05-06 06:00:00	f	\N	Utah	\N
cmfd1g7fi00219we438was4wo	samuel.garcia28@student.byu.edu	2025-09-09 21:04:01.183	Samuel	t	Garcia	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.183	\N	\N	\N	\N	\N	Orem	\N	\N	\N	SamuelGarcia484	t	t	USA	1996-04-07 07:00:00	f	\N	Utah	\N
cmfd1g7fj00229we469ztyy6c	olivia.clark29@student.byu.edu	2025-09-09 21:04:01.183	Olivia	t	Clark	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.183	\N	\N	\N	\N	\N	Orem	\N	\N	\N	OliviaClark758	t	t	USA	2004-12-28 07:00:00	f	\N	Utah	\N
cmfd1g7fj00239we4994zi1hy	avery.nelson30@student.byu.edu	2025-09-09 21:04:01.184	Avery	t	Nelson	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.184	\N	\N	\N	\N	\N	Logan	\N	\N	\N	AveryNelson927	t	t	USA	2000-04-19 06:00:00	f	\N	Utah	\N
cmfd1g7fk00249we4z4fi7drx	evelyn.allen31@student.byu.edu	2025-09-09 21:04:01.184	Evelyn	t	Allen	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.184	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	EvelynAllen265	t	t	USA	2003-01-12 07:00:00	f	\N	Utah	\N
cmfd1g7fk00259we4ulkgqmnr	jackson.jones32@student.byu.edu	2025-09-09 21:04:01.184	Jackson	t	Jones	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.184	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	JacksonJones329	t	t	USA	2002-09-18 06:00:00	f	\N	Utah	\N
cmfd1g7fk00269we4roz15cia	noah.gonzalez33@student.byu.edu	2025-09-09 21:04:01.185	Noah	t	Gonzalez	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.185	\N	\N	\N	\N	\N	Orem	\N	\N	\N	NoahGonzalez98	t	t	USA	2000-01-12 07:00:00	f	\N	Utah	\N
cmfd1g7fl00279we4ptzl63t0	harper.nguyen34@student.byu.edu	2025-09-09 21:04:01.185	Harper	t	Nguyen	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.185	\N	\N	\N	\N	\N	Logan	\N	\N	\N	HarperNguyen239	t	t	USA	1999-07-19 06:00:00	f	\N	Utah	\N
cmfd1g7fl00289we4orc3zbyd	abigail.johnson35@student.byu.edu	2025-09-09 21:04:01.186	Abigail	t	Johnson	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.186	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	AbigailJohnson772	t	t	USA	1995-04-18 06:00:00	f	\N	Utah	\N
cmfd1g7fm00299we4sxis3ytu	olivia.hernandez36@student.byu.edu	2025-09-09 21:04:01.186	Olivia	t	Hernandez	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.186	\N	\N	\N	\N	\N	Orem	\N	\N	\N	OliviaHernandez750	t	t	USA	2003-01-23 07:00:00	f	\N	Utah	\N
cmfd1g7fm002a9we4gdks3s55	mateo.torres37@student.byu.edu	2025-09-09 21:04:01.187	Mateo	t	Torres	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.187	\N	\N	\N	\N	\N	Ogden	\N	\N	\N	MateoTorres18	t	t	USA	1995-11-12 07:00:00	f	\N	Utah	\N
cmfd1g7fn002b9we4zhmqh7z5	oliver.thomas38@student.byu.edu	2025-09-09 21:04:01.187	Oliver	t	Thomas	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.187	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	OliverThomas771	t	t	USA	2003-11-16 07:00:00	f	\N	Utah	\N
cmfd1g7fn002c9we45gooto2o	alexander.hall39@student.byu.edu	2025-09-09 21:04:01.188	Alexander	t	Hall	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.188	\N	\N	\N	\N	\N	Provo	\N	\N	\N	AlexanderHall76	t	t	USA	1999-10-02 06:00:00	f	\N	Utah	\N
cmfd1g7fo002d9we446b2hwup	theodore.martinez40@student.byu.edu	2025-09-09 21:04:01.188	Theodore	t	Martinez	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.188	\N	\N	\N	\N	\N	Provo	\N	\N	\N	TheodoreMartinez238	t	t	USA	1997-10-06 06:00:00	f	\N	Utah	\N
cmfd1g7fo002e9we48hp0gd97	theodore.smith41@student.byu.edu	2025-09-09 21:04:01.189	Theodore	t	Smith	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.189	\N	\N	\N	\N	\N	Provo	\N	\N	\N	TheodoreSmith682	t	t	USA	2001-01-04 07:00:00	f	\N	Utah	\N
cmfd1g7fp002f9we4k9pjjzcu	alexander.thompson42@student.byu.edu	2025-09-09 21:04:01.189	Alexander	t	Thompson	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.189	\N	\N	\N	\N	\N	Provo	\N	\N	\N	AlexanderThompson921	t	t	USA	2003-04-21 06:00:00	f	\N	Utah	\N
cmfd1g7fp002g9we4fwxmmn0c	lucas.moore43@student.byu.edu	2025-09-09 21:04:01.189	Lucas	t	Moore	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.189	\N	\N	\N	\N	\N	Logan	\N	\N	\N	LucasMoore37	t	t	USA	1995-07-19 06:00:00	f	\N	Utah	\N
cmfd1g7fp002h9we4cozrxoag	noah.jones44@student.byu.edu	2025-09-09 21:04:01.19	Noah	t	Jones	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.19	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	NoahJones183	t	t	USA	2000-04-09 06:00:00	f	\N	Utah	\N
cmfd1g7fq002i9we49e2zwjs2	layla.sanchez45@student.byu.edu	2025-09-09 21:04:01.19	Layla	t	Sanchez	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.19	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	LaylaSanchez324	t	t	USA	1999-01-11 07:00:00	f	\N	Utah	\N
cmfd1g7fq002j9we4a3mbk43l	mia.adams46@student.byu.edu	2025-09-09 21:04:01.191	Mia	t	Adams	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.191	\N	\N	\N	\N	\N	Provo	\N	\N	\N	MiaAdams336	t	t	USA	1996-01-15 07:00:00	f	\N	Utah	\N
cmfd1g7fr002k9we4373hx6bo	camila.harris47@student.byu.edu	2025-09-09 21:04:01.191	Camila	t	Harris	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.191	\N	\N	\N	\N	\N	Provo	\N	\N	\N	CamilaHarris881	t	t	USA	1995-07-15 06:00:00	f	\N	Utah	\N
cmfd1g7fr002l9we46vt8jg6q	henry.allen48@student.byu.edu	2025-09-09 21:04:01.192	Henry	t	Allen	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.192	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	HenryAllen314	t	t	USA	1995-07-28 06:00:00	f	\N	Utah	\N
cmfd1g7fs002m9we4z2vmoo1a	jackson.allen49@student.byu.edu	2025-09-09 21:04:01.192	Jackson	t	Allen	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.192	\N	\N	\N	\N	\N	Logan	\N	\N	\N	JacksonAllen419	t	t	USA	2001-02-15 07:00:00	f	\N	Utah	\N
cmfd1g7fs002n9we42y31eyfe	ethan.rivera50@student.byu.edu	2025-09-09 21:04:01.193	Ethan	t	Rivera	$2b$10$iWiJj5U2BusRQzdMbvEt2.6jZDdRG74dtMiqkbwGR5k//vBYi.WBi	PLAYER	2025-09-09 21:04:01.193	\N	\N	\N	\N	\N	Salt Lake City	\N	\N	\N	EthanRivera522	t	t	USA	1995-04-21 06:00:00	f	\N	Utah	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: findamine_master
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6b925b5d-7675-48a3-8674-92389bfb8386	65f92f712d9608b5bc9716f974cbb014c4e5e87f242e396b67c74760ed9d40d7	2025-09-07 17:40:38.094728-06	20250822163210_init	\N	\N	2025-09-07 17:40:38.092526-06	1
0ed70a01-d5f3-43c7-9a4d-bbfa8b73c76b	7265a9a4ff32e36c7068fa6d1285ae45706fb5b48f42decd0c5572094496df0a	2025-09-07 17:40:38.09648-06	20250822220538_add_user_auth_fields	\N	\N	2025-09-07 17:40:38.095005-06	1
4494fff8-0336-41b9-b9f9-5edb002b1db9	a193a2616857ff79a9aeb98b9364b236a88a19337baa945112512826807a8326	2025-09-07 17:40:38.111128-06	20250822223436_add_game_master_features	\N	\N	2025-09-07 17:40:38.096863-06	1
e6fad5b7-f903-4956-9bc1-405b4f687c31	0aa87a2202dffaff9fac594e877a7c04f9e7079d7e0158c1ef573d7869b56f98	2025-09-07 17:40:38.126443-06	20250822231526_restructure_game_master_features	\N	\N	2025-09-07 17:40:38.111667-06	1
074af6ab-3f4c-4b80-a49f-5a1fa6b01a4a	2ea37dcea12133ec1f3cd22c9be1787415467f273a481ab844cbbd5b6dcee3c6	2025-09-07 17:40:38.131211-06	20250827212545_add_analytics_and_gamertag	\N	\N	2025-09-07 17:40:38.126721-06	1
9104c7dc-3b28-47fe-b41f-94350f43f69e	c1f75acb7eeb51da3e9cf64720afb00e63755c3c2802757cf8cc1c37b4bfdeab	2025-09-07 17:40:38.132403-06	20250828182548_add_legal_and_compliance_fields	\N	\N	2025-09-07 17:40:38.131454-06	1
45c88bd8-ce84-4383-bc94-9c5c6c7fde3e	baac62f9a6eef0e0c2e90cbc4af65e4d0673e310a0f7bc86517788ac4cafb458	2025-09-07 17:40:38.135561-06	20250828195907_add_photo_management	\N	\N	2025-09-07 17:40:38.132647-06	1
c84fdb56-8858-45d4-8150-5748afc928fe	d31489e52014418114d8c90b24a148b4f296aed3d6d88d9763d227c626b7dc39	2025-09-08 16:27:34.423138-06	20250908222734_add_game_center_location	\N	\N	2025-09-08 16:27:34.420941-06	1
871cf584-dfab-4da5-8479-35fbe5f3ce8c	203d5a6604d538a39b0a575ee331bd7d5ebee72cc86127196f54233f8167d068	2025-09-09 10:15:11.055514-06	20250909161511_add_max_players	\N	\N	2025-09-09 10:15:11.052654-06	1
\.


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: ChatPost ChatPost_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ChatPost"
    ADD CONSTRAINT "ChatPost_pkey" PRIMARY KEY (id);


--
-- Name: ClueFinding ClueFinding_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ClueFinding"
    ADD CONSTRAINT "ClueFinding_pkey" PRIMARY KEY (id);


--
-- Name: ClueLocation ClueLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ClueLocation"
    ADD CONSTRAINT "ClueLocation_pkey" PRIMARY KEY (id);


--
-- Name: CluePhoto CluePhoto_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."CluePhoto"
    ADD CONSTRAINT "CluePhoto_pkey" PRIMARY KEY (id);


--
-- Name: GameClue GameClue_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameClue"
    ADD CONSTRAINT "GameClue_pkey" PRIMARY KEY (id);


--
-- Name: GamePhoto GamePhoto_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GamePhoto"
    ADD CONSTRAINT "GamePhoto_pkey" PRIMARY KEY (id);


--
-- Name: GameSurvey GameSurvey_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameSurvey"
    ADD CONSTRAINT "GameSurvey_pkey" PRIMARY KEY (id);


--
-- Name: GameTreatment GameTreatment_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameTreatment"
    ADD CONSTRAINT "GameTreatment_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempt LoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: PageView PageView_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PageView"
    ADD CONSTRAINT "PageView_pkey" PRIMARY KEY (id);


--
-- Name: PlayerGame PlayerGame_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PlayerGame"
    ADD CONSTRAINT "PlayerGame_pkey" PRIMARY KEY (id);


--
-- Name: PointScale PointScale_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PointScale"
    ADD CONSTRAINT "PointScale_pkey" PRIMARY KEY (id);


--
-- Name: Prize Prize_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Prize"
    ADD CONSTRAINT "Prize_pkey" PRIMARY KEY (id);


--
-- Name: ProfileData ProfileData_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ProfileData"
    ADD CONSTRAINT "ProfileData_pkey" PRIMARY KEY (id);


--
-- Name: Referral Referral_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);


--
-- Name: SocialConnection SocialConnection_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SocialConnection"
    ADD CONSTRAINT "SocialConnection_pkey" PRIMARY KEY (id);


--
-- Name: SurveyQuestion SurveyQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyQuestion"
    ADD CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY (id);


--
-- Name: SurveyResponse SurveyResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyResponse"
    ADD CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY (id);


--
-- Name: Survey Survey_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Survey"
    ADD CONSTRAINT "Survey_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- Name: TreatmentAssignment TreatmentAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TreatmentAssignment"
    ADD CONSTRAINT "TreatmentAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Treatment Treatment_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Treatment"
    ADD CONSTRAINT "Treatment_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ClueFinding_userId_gameClueId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "ClueFinding_userId_gameClueId_key" ON public."ClueFinding" USING btree ("userId", "gameClueId");


--
-- Name: GameClue_gameId_clueLocationId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "GameClue_gameId_clueLocationId_key" ON public."GameClue" USING btree ("gameId", "clueLocationId");


--
-- Name: GameSurvey_gameId_surveyId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "GameSurvey_gameId_surveyId_key" ON public."GameSurvey" USING btree ("gameId", "surveyId");


--
-- Name: GameTreatment_gameId_treatmentId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "GameTreatment_gameId_treatmentId_key" ON public."GameTreatment" USING btree ("gameId", "treatmentId");


--
-- Name: LoginAttempt_attemptedAt_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "LoginAttempt_attemptedAt_idx" ON public."LoginAttempt" USING btree ("attemptedAt");


--
-- Name: LoginAttempt_email_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "LoginAttempt_email_idx" ON public."LoginAttempt" USING btree (email);


--
-- Name: LoginAttempt_ipAddress_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "LoginAttempt_ipAddress_idx" ON public."LoginAttempt" USING btree ("ipAddress");


--
-- Name: LoginAttempt_success_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "LoginAttempt_success_idx" ON public."LoginAttempt" USING btree (success);


--
-- Name: PageView_ipAddress_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "PageView_ipAddress_idx" ON public."PageView" USING btree ("ipAddress");


--
-- Name: PageView_pageName_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "PageView_pageName_idx" ON public."PageView" USING btree ("pageName");


--
-- Name: PageView_sessionId_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "PageView_sessionId_idx" ON public."PageView" USING btree ("sessionId");


--
-- Name: PageView_userId_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "PageView_userId_idx" ON public."PageView" USING btree ("userId");


--
-- Name: PageView_viewedAt_idx; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE INDEX "PageView_viewedAt_idx" ON public."PageView" USING btree ("viewedAt");


--
-- Name: PlayerGame_userId_gameId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "PlayerGame_userId_gameId_key" ON public."PlayerGame" USING btree ("userId", "gameId");


--
-- Name: Referral_referrerId_referredId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "Referral_referrerId_referredId_key" ON public."Referral" USING btree ("referrerId", "referredId");


--
-- Name: SocialConnection_followerId_followingId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "SocialConnection_followerId_followingId_key" ON public."SocialConnection" USING btree ("followerId", "followingId");


--
-- Name: TeamMember_teamId_userId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON public."TeamMember" USING btree ("teamId", "userId");


--
-- Name: TreatmentAssignment_userId_gameTreatmentId_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "TreatmentAssignment_userId_gameTreatmentId_key" ON public."TreatmentAssignment" USING btree ("userId", "gameTreatmentId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_gamerTag_key; Type: INDEX; Schema: public; Owner: findamine_master
--

CREATE UNIQUE INDEX "User_gamerTag_key" ON public."User" USING btree ("gamerTag");


--
-- Name: Badge Badge_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatPost ChatPost_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ChatPost"
    ADD CONSTRAINT "ChatPost_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatPost ChatPost_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ChatPost"
    ADD CONSTRAINT "ChatPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClueFinding ClueFinding_gameClueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ClueFinding"
    ADD CONSTRAINT "ClueFinding_gameClueId_fkey" FOREIGN KEY ("gameClueId") REFERENCES public."GameClue"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClueFinding ClueFinding_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ClueFinding"
    ADD CONSTRAINT "ClueFinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CluePhoto CluePhoto_clueLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."CluePhoto"
    ADD CONSTRAINT "CluePhoto_clueLocationId_fkey" FOREIGN KEY ("clueLocationId") REFERENCES public."ClueLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CluePhoto CluePhoto_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."CluePhoto"
    ADD CONSTRAINT "CluePhoto_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CluePhoto CluePhoto_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."CluePhoto"
    ADD CONSTRAINT "CluePhoto_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GameClue GameClue_clueLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameClue"
    ADD CONSTRAINT "GameClue_clueLocationId_fkey" FOREIGN KEY ("clueLocationId") REFERENCES public."ClueLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameClue GameClue_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameClue"
    ADD CONSTRAINT "GameClue_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GamePhoto GamePhoto_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GamePhoto"
    ADD CONSTRAINT "GamePhoto_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GamePhoto GamePhoto_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GamePhoto"
    ADD CONSTRAINT "GamePhoto_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GameSurvey GameSurvey_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameSurvey"
    ADD CONSTRAINT "GameSurvey_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameSurvey GameSurvey_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameSurvey"
    ADD CONSTRAINT "GameSurvey_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameTreatment GameTreatment_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameTreatment"
    ADD CONSTRAINT "GameTreatment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GameTreatment GameTreatment_treatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."GameTreatment"
    ADD CONSTRAINT "GameTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES public."Treatment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Game Game_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LoginAttempt LoginAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PageView PageView_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PageView"
    ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PlayerGame PlayerGame_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PlayerGame"
    ADD CONSTRAINT "PlayerGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PlayerGame PlayerGame_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."PlayerGame"
    ADD CONSTRAINT "PlayerGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prize Prize_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Prize"
    ADD CONSTRAINT "Prize_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfileData ProfileData_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."ProfileData"
    ADD CONSTRAINT "ProfileData_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referral Referral_referredId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referral Referral_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SocialConnection SocialConnection_followerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SocialConnection"
    ADD CONSTRAINT "SocialConnection_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SocialConnection SocialConnection_followingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SocialConnection"
    ADD CONSTRAINT "SocialConnection_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SurveyQuestion SurveyQuestion_pointScaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyQuestion"
    ADD CONSTRAINT "SurveyQuestion_pointScaleId_fkey" FOREIGN KEY ("pointScaleId") REFERENCES public."PointScale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SurveyQuestion SurveyQuestion_surveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyQuestion"
    ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES public."Survey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SurveyResponse SurveyResponse_gameSurveyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyResponse"
    ADD CONSTRAINT "SurveyResponse_gameSurveyId_fkey" FOREIGN KEY ("gameSurveyId") REFERENCES public."GameSurvey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SurveyResponse SurveyResponse_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyResponse"
    ADD CONSTRAINT "SurveyResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."SurveyQuestion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SurveyResponse SurveyResponse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."SurveyResponse"
    ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeamMember TeamMember_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeamMember TeamMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Team Team_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES public."Game"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TreatmentAssignment TreatmentAssignment_gameTreatmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TreatmentAssignment"
    ADD CONSTRAINT "TreatmentAssignment_gameTreatmentId_fkey" FOREIGN KEY ("gameTreatmentId") REFERENCES public."GameTreatment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TreatmentAssignment TreatmentAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: findamine_master
--

ALTER TABLE ONLY public."TreatmentAssignment"
    ADD CONSTRAINT "TreatmentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sL4X2zna8y2cZIsIHCKff5o7lBsJA1JfYrbFoWNHlFB1dhOkuQUh1W83CmOQVCK

