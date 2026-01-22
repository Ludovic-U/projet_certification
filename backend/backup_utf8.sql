--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg130+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg130+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BudgetCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BudgetCategory" AS ENUM (
    'MOYENS_HUMAINS_INTERNES',
    'AMENAGEMENTS_MOBILIER',
    'EQUIPEMENTS_PEDAGOGIQUES',
    'PRESTATIONS',
    'COMMUNICATION_EVENEMENTIEL'
);


ALTER TYPE public."BudgetCategory" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Action" (
    "actionId" integer NOT NULL,
    "actionName" text NOT NULL,
    "actionObj" text,
    "projectId" integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Action" OWNER TO postgres;

--
-- Name: Action_actionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Action_actionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Action_actionId_seq" OWNER TO postgres;

--
-- Name: Action_actionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Action_actionId_seq" OWNED BY public."Action"."actionId";


--
-- Name: Budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Budget" (
    "budgetId" integer NOT NULL,
    "subActionId" integer NOT NULL,
    category public."BudgetCategory" NOT NULL,
    nature text,
    quantity integer,
    unit text,
    "avgUnitCostTtc" numeric(65,30),
    total numeric(65,30)
);


ALTER TABLE public."Budget" OWNER TO postgres;

--
-- Name: Budget_budgetId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Budget_budgetId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Budget_budgetId_seq" OWNER TO postgres;

--
-- Name: Budget_budgetId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Budget_budgetId_seq" OWNED BY public."Budget"."budgetId";


--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    "clientId" integer NOT NULL,
    "clientName" text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    secteur text,
    "statusJuridique" text
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: ClientUserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientUserRole" (
    "clientId" integer NOT NULL,
    "userId" integer NOT NULL,
    "isManager" boolean DEFAULT false NOT NULL,
    "position" text
);


ALTER TABLE public."ClientUserRole" OWNER TO postgres;

--
-- Name: Client_clientId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Client_clientId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Client_clientId_seq" OWNER TO postgres;

--
-- Name: Client_clientId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Client_clientId_seq" OWNED BY public."Client"."clientId";


--
-- Name: Deliverable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Deliverable" (
    "deliverableId" integer NOT NULL,
    "subActionId" integer NOT NULL,
    file text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Deliverable" OWNER TO postgres;

--
-- Name: Deliverable_deliverableId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Deliverable_deliverableId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Deliverable_deliverableId_seq" OWNER TO postgres;

--
-- Name: Deliverable_deliverableId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Deliverable_deliverableId_seq" OWNED BY public."Deliverable"."deliverableId";


--
-- Name: Financeur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Financeur" (
    "FinanceurName" text NOT NULL,
    "financeurId" integer NOT NULL
);


ALTER TABLE public."Financeur" OWNER TO postgres;

--
-- Name: FinanceurProjet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FinanceurProjet" (
    "projectId" integer NOT NULL,
    "financeurId" integer NOT NULL,
    montant integer NOT NULL,
    pourcentage integer NOT NULL
);


ALTER TABLE public."FinanceurProjet" OWNER TO postgres;

--
-- Name: Financeur_financeurId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Financeur_financeurId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Financeur_financeurId_seq" OWNER TO postgres;

--
-- Name: Financeur_financeurId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Financeur_financeurId_seq" OWNED BY public."Financeur"."financeurId";


--
-- Name: Option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Option" (
    "optionId" integer NOT NULL,
    label text NOT NULL,
    "questionId" integer NOT NULL
);


ALTER TABLE public."Option" OWNER TO postgres;

--
-- Name: Option_optionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Option_optionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Option_optionId_seq" OWNER TO postgres;

--
-- Name: Option_optionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Option_optionId_seq" OWNED BY public."Option"."optionId";


--
-- Name: Permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Permission" (
    "permId" integer NOT NULL,
    "permName" text NOT NULL,
    "permDesc" text
);


ALTER TABLE public."Permission" OWNER TO postgres;

--
-- Name: Permission_permId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Permission_permId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Permission_permId_seq" OWNER TO postgres;

--
-- Name: Permission_permId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Permission_permId_seq" OWNED BY public."Permission"."permId";


--
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    "projectId" integer NOT NULL,
    "projectName" text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "projectManager" integer NOT NULL,
    "projectStage" text,
    "projectStatus" text,
    "projectDesc" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "clientId" integer NOT NULL,
    "SWOT_opportunity" text,
    "SWOT_strength" text,
    "SWOT_threat" text,
    "SWOT_weakness" text
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- Name: Project_projectId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Project_projectId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Project_projectId_seq" OWNER TO postgres;

--
-- Name: Project_projectId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_projectId_seq" OWNED BY public."Project"."projectId";


--
-- Name: Question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Question" (
    "questionId" integer NOT NULL,
    label text NOT NULL,
    category text NOT NULL,
    "numberOfSelectionableOpt" integer,
    "isRelevant" boolean,
    "hasMultipleOpenResponse" boolean,
    "shouldMultiply" boolean,
    "questionIdParent" integer,
    keyword text DEFAULT 'Mot cl├®'::text NOT NULL
);


ALTER TABLE public."Question" OWNER TO postgres;

--
-- Name: Question_questionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Question_questionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Question_questionId_seq" OWNER TO postgres;

--
-- Name: Question_questionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Question_questionId_seq" OWNED BY public."Question"."questionId";


--
-- Name: Response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Response" (
    "responseId" integer NOT NULL,
    label text,
    "projectId" integer NOT NULL,
    "questionId" integer NOT NULL,
    "optionId" integer,
    "responseIdParent" integer,
    keyword text
);


ALTER TABLE public."Response" OWNER TO postgres;

--
-- Name: Response_responseId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Response_responseId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Response_responseId_seq" OWNER TO postgres;

--
-- Name: Response_responseId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Response_responseId_seq" OWNED BY public."Response"."responseId";


--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    "roleId" integer NOT NULL,
    "roleName" text NOT NULL,
    "roleDesc" text
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermission" (
    "roleId" integer NOT NULL,
    "permId" integer NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO postgres;

--
-- Name: Role_roleId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Role_roleId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Role_roleId_seq" OWNER TO postgres;

--
-- Name: Role_roleId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Role_roleId_seq" OWNED BY public."Role"."roleId";


--
-- Name: SubAction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SubAction" (
    "subActionId" integer NOT NULL,
    "actionId" integer NOT NULL,
    description text,
    "piloteGrtId" integer,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SubAction" OWNER TO postgres;

--
-- Name: SubAction_subActionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SubAction_subActionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SubAction_subActionId_seq" OWNER TO postgres;

--
-- Name: SubAction_subActionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SubAction_subActionId_seq" OWNED BY public."SubAction"."subActionId";


--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    "taskId" integer NOT NULL,
    sub_action_id integer NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: TaskAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskAssignment" (
    "userId" integer NOT NULL,
    "taskId" integer NOT NULL
);


ALTER TABLE public."TaskAssignment" OWNER TO postgres;

--
-- Name: Task_taskId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Task_taskId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Task_taskId_seq" OWNER TO postgres;

--
-- Name: Task_taskId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Task_taskId_seq" OWNED BY public."Task"."taskId";


--
-- Name: Type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Type" (
    "typeId" integer NOT NULL,
    label text NOT NULL
);


ALTER TABLE public."Type" OWNER TO postgres;

--
-- Name: Type_typeId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Type_typeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Type_typeId_seq" OWNER TO postgres;

--
-- Name: Type_typeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Type_typeId_seq" OWNED BY public."Type"."typeId";


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    "userId" integer NOT NULL,
    username text NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    password text,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRole" (
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO postgres;

--
-- Name: UserSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserSession" (
    "sessionId" integer NOT NULL,
    "userId" integer NOT NULL,
    "tokenHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    ip text,
    "userAgent" text
);


ALTER TABLE public."UserSession" OWNER TO postgres;

--
-- Name: UserSession_sessionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserSession_sessionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserSession_sessionId_seq" OWNER TO postgres;

--
-- Name: UserSession_sessionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserSession_sessionId_seq" OWNED BY public."UserSession"."sessionId";


--
-- Name: User_userId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_userId_seq" OWNER TO postgres;

--
-- Name: User_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_userId_seq" OWNED BY public."User"."userId";


--
-- Name: _ProjectQuestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ProjectQuestion" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_ProjectQuestion" OWNER TO postgres;

--
-- Name: _ProjectType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ProjectType" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_ProjectType" OWNER TO postgres;

--
-- Name: _TypeQuestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_TypeQuestion" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_TypeQuestion" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Action actionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action" ALTER COLUMN "actionId" SET DEFAULT nextval('public."Action_actionId_seq"'::regclass);


--
-- Name: Budget budgetId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget" ALTER COLUMN "budgetId" SET DEFAULT nextval('public."Budget_budgetId_seq"'::regclass);


--
-- Name: Client clientId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client" ALTER COLUMN "clientId" SET DEFAULT nextval('public."Client_clientId_seq"'::regclass);


--
-- Name: Deliverable deliverableId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deliverable" ALTER COLUMN "deliverableId" SET DEFAULT nextval('public."Deliverable_deliverableId_seq"'::regclass);


--
-- Name: Financeur financeurId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Financeur" ALTER COLUMN "financeurId" SET DEFAULT nextval('public."Financeur_financeurId_seq"'::regclass);


--
-- Name: Option optionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Option" ALTER COLUMN "optionId" SET DEFAULT nextval('public."Option_optionId_seq"'::regclass);


--
-- Name: Permission permId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission" ALTER COLUMN "permId" SET DEFAULT nextval('public."Permission_permId_seq"'::regclass);


--
-- Name: Project projectId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN "projectId" SET DEFAULT nextval('public."Project_projectId_seq"'::regclass);


--
-- Name: Question questionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question" ALTER COLUMN "questionId" SET DEFAULT nextval('public."Question_questionId_seq"'::regclass);


--
-- Name: Response responseId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response" ALTER COLUMN "responseId" SET DEFAULT nextval('public."Response_responseId_seq"'::regclass);


--
-- Name: Role roleId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role" ALTER COLUMN "roleId" SET DEFAULT nextval('public."Role_roleId_seq"'::regclass);


--
-- Name: SubAction subActionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubAction" ALTER COLUMN "subActionId" SET DEFAULT nextval('public."SubAction_subActionId_seq"'::regclass);


--
-- Name: Task taskId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task" ALTER COLUMN "taskId" SET DEFAULT nextval('public."Task_taskId_seq"'::regclass);


--
-- Name: Type typeId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Type" ALTER COLUMN "typeId" SET DEFAULT nextval('public."Type_typeId_seq"'::regclass);


--
-- Name: User userId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN "userId" SET DEFAULT nextval('public."User_userId_seq"'::regclass);


--
-- Name: UserSession sessionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSession" ALTER COLUMN "sessionId" SET DEFAULT nextval('public."UserSession_sessionId_seq"'::regclass);


--
-- Data for Name: Action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Action" ("actionId", "actionName", "actionObj", "projectId", "startDate") FROM stdin;
\.


--
-- Data for Name: Budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Budget" ("budgetId", "subActionId", category, nature, quantity, unit, "avgUnitCostTtc", total) FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" ("clientId", "clientName", description, "createdAt", secteur, "statusJuridique") FROM stdin;
1	F2S	figures de skills	2025-10-14 10:04:00.48	ACCOMPAGNEMENT	SARL
6	TULLE	1330	2025-12-22 11:10:33.068	BTP	ASSOCIATION
5	TestCLient-mod	testeurs	2025-11-17 08:29:08.057	BTP	ASSOCIATION
\.


--
-- Data for Name: ClientUserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientUserRole" ("clientId", "userId", "isManager", "position") FROM stdin;
1	1	f	Developpeur
1	2	f	testeur_assis
1	3	f	testeur
1	4	f	testeur
6	5	f	CEO
5	6	f	responsable
6	7	f	testeur
\.


--
-- Data for Name: Deliverable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Deliverable" ("deliverableId", "subActionId", file, "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: Financeur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Financeur" ("FinanceurName", "financeurId") FROM stdin;
Fond Propre	1
R├®gion Normandie	4
R├®gion Aquitaine	5
\.


--
-- Data for Name: FinanceurProjet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FinanceurProjet" ("projectId", "financeurId", montant, pourcentage) FROM stdin;
14	1	0	100
14	4	0	100
\.


--
-- Data for Name: Option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Option" ("optionId", label, "questionId") FROM stdin;
1	< 10	9
2	entre 10 et 50	9
3	> 50	9
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" ("permId", "permName", "permDesc") FROM stdin;
1	view_super_admin_dashboard	Voir le dahsboard super_admin
2	user:create:any	Cr├®er n'importe quel utilisateur
3	user:read:any	Voir n'importe quel utilisateur
4	user:update:any	Modifier n'importe quel utilisateur
5	user:delete:any	Cr├®er n'importe quel utilisateur
6	client:create	Cr├®er un client
7	client:update	Modifier un client
8	clientUserRole:update:any	Modifier le r├┤le d'un utilisateur
9	project:create:any	Cr├®er un projet pour n'importe quel client
10	project:read:any	Voir n'importe quel projet
11	project:update:any	Modifier n'importe quel projet
12	project:delete:any	Supprimer n'importe quel projet
13	user:create:org	Cr├®er un utilisateur li├® au client
14	user:read:org	Voir les utilisateurs li├®s au client
15	user:update:org	Modifier les utilisateurs li├®s au client
16	user:delete:org	Supprimer les utilisateurs li├®s au client
17	project:create:org	Cr├®er un projet
18	project:read:org	Voir les projets li├®s au client
19	project:update:org	Modifier les projets li├®s au client
20	project:delete:org	Supprimer les projets li├®s au client
21	clientUserRole:update:org	Modifier le r├┤le d'un utilisateur li├® au client
22	user:read:proj	Voir les utilisateurs li├®s ├á un projet
23	user:update:proj	Assigner les utilisateurs ├á des taches
24	project:read:own	Voir ses projets
25	project:update:own	Modifier ses projets
26	client:read:any	\N
27	financeur:manage	cr├®er, modifier, supprimer un financeur
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" ("projectId", "projectName", "startDate", "endDate", "projectManager", "projectStage", "projectStatus", "projectDesc", "createdAt", "clientId", "SWOT_opportunity", "SWOT_strength", "SWOT_threat", "SWOT_weakness") FROM stdin;
1	Test	2025-10-14 10:08:52.827	\N	1	Id├®ation	en cours	projettest	2025-10-14 10:08:52.829	1	\N	\N	\N	\N
7	azertyhj	2025-10-14 10:31:19.758	\N	1	Id├®ation	en cours	azertyu	2025-10-14 10:31:19.76	1	\N	\N	\N	\N
9	ertyu	2025-10-14 12:21:04.486	\N	1	Id├®ation	en cours	efghj	2025-10-14 12:21:04.488	1	\N	\N	\N	\N
13	ProjetDecembre	2025-12-17 08:13:02.285	\N	1	Id├®ation	en cours	recettage ideation	2025-12-17 08:13:02.287	5	\N	\N	\N	\N
15	Test chef de proj	2025-12-23 10:44:09.28	\N	1	Id├®ation	en cours	azert	2025-12-23 10:44:09.282	1	\N	\N	\N	\N
16	tesdt	2025-12-23 10:44:30.098	\N	2	Id├®ation	en cours	ert	2025-12-23 10:44:30.099	1	\N	\N	\N	\N
17	testtype	2026-01-01 00:00:00	\N	2	Id├®ation	en cours	azergh	2026-01-12 14:02:20.786	1	\N	\N	\N	\N
14	INV inno	2025-12-22 11:17:01.817	\N	1	Id├®ation	en cours	Investisssment inno	2025-12-22 11:17:01.818	6	xcvcv	strenght bla fghjkjhgffgh	\N	sdfghgfgf
18	testprojjanv	2026-01-19 00:00:00	\N	6	Id├®ation	en cours	testmod	2026-01-19 11:41:55.136	5	\N	\N	\N	\N
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Question" ("questionId", label, category, "numberOfSelectionableOpt", "isRelevant", "hasMultipleOpenResponse", "shouldMultiply", "questionIdParent", keyword) FROM stdin;
8	comment allez vous?	ideation	\N	f	f	f	\N	├ºa va?
9	quels sont les effectifs d'apprentis attendus?	ideation	\N	f	f	f	8	effectifs
10	Quelle temp├®rature il fera demain	ideation	\N	f	t	f	8	m├®t├®o
11	azert	ideation	\N	f	f	f	8	zer
12	zerfcder	ideation	\N	f	f	f	8	a
13	├®"erdsz	ideation	\N	f	f	f	8	zerf
14	azerfcxsz	ideation	\N	f	f	f	9	vbn
15	azerfcxs	ideation	\N	f	f	f	9	adfvc
16	zefgvcfty	ideation	\N	f	f	f	9	vhyg
17	azertfddfghj	ideation	\N	f	f	f	10	bgfv
18	r(tfdfghbvcdrtgh	ideation	\N	f	f	f	11	dfgbvc
\.


--
-- Data for Name: Response; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Response" ("responseId", label, "projectId", "questionId", "optionId", "responseIdParent", keyword) FROM stdin;
19	Je suis malade	13	8	\N	\N	malade
20	75	13	9	\N	\N	effectifs : 75
21	peut beau, peut etre pas beau	13	10	\N	\N	chai pas
22	zefvc	1	8	\N	\N	\N
23	azertyujhgfdfgh	1	10	\N	\N	\N
24	rep	1	17	\N	\N	mot r├®ponse
25	bien 	14	8	\N	\N	\N
26	├®azert	18	8	\N	\N	\N
27	beau temps, moche temps 	18	10	\N	\N	\N
28	aze	18	9	\N	\N	\N
29	aze	18	9	\N	\N	\N
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" ("roleId", "roleName", "roleDesc") FROM stdin;
1	super_admin	Acc├¿s complet
2	admin_client	Acc├¿s son organisation
3	chef_de_projet	Acc├¿s ├á ses projets
4	contributeur	Rapporte ses info sans acc├¿s ├á l'application
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermission" ("roleId", "permId") FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
2	13
2	14
2	15
2	16
2	17
2	18
2	19
2	20
2	21
3	22
3	23
3	24
3	25
1	26
1	27
\.


--
-- Data for Name: SubAction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SubAction" ("subActionId", "actionId", description, "piloteGrtId", "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" ("taskId", sub_action_id, name, description) FROM stdin;
\.


--
-- Data for Name: TaskAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskAssignment" ("userId", "taskId") FROM stdin;
\.


--
-- Data for Name: Type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Type" ("typeId", label) FROM stdin;
1	General
2	Investissements Innovants
4	Type test
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" ("userId", username, firstname, lastname, password, email, "createdAt") FROM stdin;
1	admin.admin	admin	admin	$2b$10$DQJHBkbgxaEfq3e2vUH1KOqqDvkz9ODSj5zqxeQfqXaRyRhQ1tnrq	admin@admin.com	2025-10-14 09:58:46.046
3	jnuh.uhnuj	jnuh	uhnuj	\N	test@uhnuj.com	2025-11-03 15:48:48.998
2	azerer.aze	azerer	aze	$2b$10$DQJHBkbgxaEfq3e2vUH1KOqqDvkz9ODSj5zqxeQfqXaRyRhQ1tnrq	a@a.com	2025-10-14 12:24:19.225
4	zerg.testcontr	zerg	testcontr	\N	c@c.com	2025-12-23 15:46:22.397
5	thierry .bisson	Thierry 	Bisson	\N	example@example.com	2025-12-23 15:56:17.452
6	testtt.test	testtt	test	\N	t@t.com	2026-01-19 11:41:09.263
7	azert.azerty	azert	azerty	\N	u@u.com	2026-01-20 08:36:43.821
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" ("userId", "roleId") FROM stdin;
1	1
3	2
2	3
4	4
5	2
6	2
7	4
\.


--
-- Data for Name: UserSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserSession" ("sessionId", "userId", "tokenHash", "createdAt", "expiresAt", ip, "userAgent") FROM stdin;
32	2	44611eb32c9a8ab99b71b14ce0b4876d9c0d653c288f685ce4f463113b88a4cf	2025-12-19 13:48:00.942	2025-12-20 13:48:00.94	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0
35	2	f15e7ef4f854ba9fde545fe113ec867132ea86a644eac13571a161b28d1b951c	2025-12-22 11:18:17.829	2025-12-23 11:18:17.827	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
45	1	6e5a131dbe84f1525c88e3aa5868404c4d4dc73fef22395a7d64f34fca062822	2026-01-21 08:22:01.342	2026-01-22 08:22:01.339	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0
46	1	486c64d4f8993d55929f58922ac66d50e1d6546879d694f0d37862d0be53c990	2026-01-22 10:59:48.104	2026-01-23 10:59:48.085	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0
\.


--
-- Data for Name: _ProjectQuestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ProjectQuestion" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ProjectType; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ProjectType" ("A", "B") FROM stdin;
1	1
17	4
14	2
18	1
18	2
\.


--
-- Data for Name: _TypeQuestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_TypeQuestion" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c2656fd8-acbf-49c7-950b-d8ae12cb61f8	8fa99c985d0fddb35aa0ab6098353888a65272ddd66eda0af267b5d8b8d90e1c	2025-10-14 09:57:11.981658+00	20250814094118_init	\N	\N	2025-10-14 09:57:11.887951+00	1
696c684b-c603-44aa-8958-782a9357ff8d	2d26a49f11239af47a2d6a43805f5ca93165585dbe4168efd8a1450f4e383781	2025-10-14 09:57:12.005261+00	20250902134122_add_unique_perm_name	\N	\N	2025-10-14 09:57:11.987468+00	1
a07b1551-5455-4684-a6d9-53bf7431b99c	f50f64067f1d9f7cabdd853dcd0a205b3375dce1b134887498a5dacacc6efa53	2025-10-14 09:57:12.026425+00	20250902150624_add_unique_role_name	\N	\N	2025-10-14 09:57:12.01029+00	1
60d5584a-3aec-4837-88ce-dd592b1fea8a	9cb51e0b7636fa960d2bd9f801893d4151f9fbecb6d7514cfd9cd8926b70ca3d	2025-10-14 09:57:12.049078+00	20250903093615_update_user_password_optional	\N	\N	2025-10-14 09:57:12.032678+00	1
2d57e4b4-1e83-470c-ab9f-c175ca4a7d66	2a34219d34e23c7a66cf691c702fe00dbf3ac6afd9ee3f2d3a088d4dc8f94de6	2025-10-14 09:57:12.10594+00	20250915124307_frontend_api_routes	\N	\N	2025-10-14 09:57:12.055251+00	1
1733a30e-b62e-404d-9221-b0b376d02536	eec9785852c2ea190ce9d2f266a2365de6eab6e88085b6cf1b90cf958f0a5020	2025-10-14 09:57:12.140193+00	20251007085745_add_join_table	\N	\N	2025-10-14 09:57:12.111107+00	1
e7a2e7dd-4798-42db-8170-91401f2d01f5	e869bad865dc19cd70cd01e4e9e02491eba0ff4d9185434952e2b7830f79f4e2	2025-10-14 09:57:12.162798+00	20251007123418_deleting_option_by_cascade	\N	\N	2025-10-14 09:57:12.145305+00	1
\.


--
-- Name: Action_actionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Action_actionId_seq"', 1, false);


--
-- Name: Budget_budgetId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Budget_budgetId_seq"', 1, false);


--
-- Name: Client_clientId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Client_clientId_seq"', 6, true);


--
-- Name: Deliverable_deliverableId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Deliverable_deliverableId_seq"', 1, false);


--
-- Name: Financeur_financeurId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Financeur_financeurId_seq"', 5, true);


--
-- Name: Option_optionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Option_optionId_seq"', 3, true);


--
-- Name: Permission_permId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Permission_permId_seq"', 27, true);


--
-- Name: Project_projectId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_projectId_seq"', 18, true);


--
-- Name: Question_questionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Question_questionId_seq"', 18, true);


--
-- Name: Response_responseId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Response_responseId_seq"', 29, true);


--
-- Name: Role_roleId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Role_roleId_seq"', 4, true);


--
-- Name: SubAction_subActionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SubAction_subActionId_seq"', 1, false);


--
-- Name: Task_taskId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Task_taskId_seq"', 1, false);


--
-- Name: Type_typeId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Type_typeId_seq"', 4, true);


--
-- Name: UserSession_sessionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserSession_sessionId_seq"', 46, true);


--
-- Name: User_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userId_seq"', 7, true);


--
-- Name: Action Action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("actionId");


--
-- Name: Budget Budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_pkey" PRIMARY KEY ("budgetId");


--
-- Name: ClientUserRole ClientUserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientUserRole"
    ADD CONSTRAINT "ClientUserRole_pkey" PRIMARY KEY ("clientId", "userId");


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("clientId");


--
-- Name: Deliverable Deliverable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deliverable"
    ADD CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("deliverableId");


--
-- Name: FinanceurProjet FinanceurProjet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinanceurProjet"
    ADD CONSTRAINT "FinanceurProjet_pkey" PRIMARY KEY ("projectId", "financeurId");


--
-- Name: Financeur Financeur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Financeur"
    ADD CONSTRAINT "Financeur_pkey" PRIMARY KEY ("financeurId");


--
-- Name: Option Option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Option"
    ADD CONSTRAINT "Option_pkey" PRIMARY KEY ("optionId");


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("permId");


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("projectId");


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("questionId");


--
-- Name: Response Response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response"
    ADD CONSTRAINT "Response_pkey" PRIMARY KEY ("responseId");


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId");


--
-- Name: SubAction SubAction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubAction"
    ADD CONSTRAINT "SubAction_pkey" PRIMARY KEY ("subActionId");


--
-- Name: TaskAssignment TaskAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("userId", "taskId");


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("taskId");


--
-- Name: Type Type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Type"
    ADD CONSTRAINT "Type_pkey" PRIMARY KEY ("typeId");


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId");


--
-- Name: UserSession UserSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_pkey" PRIMARY KEY ("sessionId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");


--
-- Name: _ProjectQuestion _ProjectQuestion_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectQuestion"
    ADD CONSTRAINT "_ProjectQuestion_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProjectType _ProjectType_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectType"
    ADD CONSTRAINT "_ProjectType_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _TypeQuestion _TypeQuestion_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TypeQuestion"
    ADD CONSTRAINT "_TypeQuestion_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Client_clientName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Client_clientName_key" ON public."Client" USING btree ("clientName");


--
-- Name: Financeur_FinanceurName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Financeur_FinanceurName_key" ON public."Financeur" USING btree ("FinanceurName");


--
-- Name: Permission_permName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Permission_permName_key" ON public."Permission" USING btree ("permName");


--
-- Name: Project_projectName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Project_projectName_key" ON public."Project" USING btree ("projectName");


--
-- Name: Role_roleName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Role_roleName_key" ON public."Role" USING btree ("roleName");


--
-- Name: UserSession_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserSession_userId_idx" ON public."UserSession" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: _ProjectQuestion_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ProjectQuestion_B_index" ON public."_ProjectQuestion" USING btree ("B");


--
-- Name: _ProjectType_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ProjectType_B_index" ON public."_ProjectType" USING btree ("B");


--
-- Name: _TypeQuestion_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_TypeQuestion_B_index" ON public."_TypeQuestion" USING btree ("B");


--
-- Name: Action Action_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"("projectId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Budget Budget_subActionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Budget"
    ADD CONSTRAINT "Budget_subActionId_fkey" FOREIGN KEY ("subActionId") REFERENCES public."SubAction"("subActionId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClientUserRole ClientUserRole_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientUserRole"
    ADD CONSTRAINT "ClientUserRole_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"("clientId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientUserRole ClientUserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientUserRole"
    ADD CONSTRAINT "ClientUserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deliverable Deliverable_subActionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Deliverable"
    ADD CONSTRAINT "Deliverable_subActionId_fkey" FOREIGN KEY ("subActionId") REFERENCES public."SubAction"("subActionId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FinanceurProjet FinanceurProjet_financeurId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinanceurProjet"
    ADD CONSTRAINT "FinanceurProjet_financeurId_fkey" FOREIGN KEY ("financeurId") REFERENCES public."Financeur"("financeurId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FinanceurProjet FinanceurProjet_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinanceurProjet"
    ADD CONSTRAINT "FinanceurProjet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"("projectId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Option Option_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Option"
    ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"("questionId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"("clientId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_projectManager_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_projectManager_fkey" FOREIGN KEY ("projectManager") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Question Question_questionIdParent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_questionIdParent_fkey" FOREIGN KEY ("questionIdParent") REFERENCES public."Question"("questionId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Response Response_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response"
    ADD CONSTRAINT "Response_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public."Option"("optionId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Response Response_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response"
    ADD CONSTRAINT "Response_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"("projectId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Response Response_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response"
    ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"("questionId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Response Response_responseIdParent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Response"
    ADD CONSTRAINT "Response_responseIdParent_fkey" FOREIGN KEY ("responseIdParent") REFERENCES public."Response"("responseId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RolePermission RolePermission_permId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permId_fkey" FOREIGN KEY ("permId") REFERENCES public."Permission"("permId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"("roleId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SubAction SubAction_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubAction"
    ADD CONSTRAINT "SubAction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"("actionId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SubAction SubAction_piloteGrtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubAction"
    ADD CONSTRAINT "SubAction_piloteGrtId_fkey" FOREIGN KEY ("piloteGrtId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TaskAssignment TaskAssignment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"("taskId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskAssignment TaskAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAssignment"
    ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_sub_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_sub_action_id_fkey" FOREIGN KEY (sub_action_id) REFERENCES public."SubAction"("subActionId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"("roleId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserSession UserSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"("userId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _ProjectQuestion _ProjectQuestion_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectQuestion"
    ADD CONSTRAINT "_ProjectQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"("projectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectQuestion _ProjectQuestion_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectQuestion"
    ADD CONSTRAINT "_ProjectQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES public."Question"("questionId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectType _ProjectType_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectType"
    ADD CONSTRAINT "_ProjectType_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"("projectId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectType _ProjectType_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProjectType"
    ADD CONSTRAINT "_ProjectType_B_fkey" FOREIGN KEY ("B") REFERENCES public."Type"("typeId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TypeQuestion _TypeQuestion_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TypeQuestion"
    ADD CONSTRAINT "_TypeQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES public."Question"("questionId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TypeQuestion _TypeQuestion_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_TypeQuestion"
    ADD CONSTRAINT "_TypeQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES public."Type"("typeId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

