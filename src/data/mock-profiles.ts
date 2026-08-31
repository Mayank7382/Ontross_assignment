import type { ProfileResponse } from "../schemas/profile.schema";

/**
 * Deterministic fixture data, keyed by public identifier.
 * Add new entries here to simulate additional profiles for demo/testing.
 * None of this data represents a real person; names and details are
 * fabricated for demonstration purposes only.
 */
export const MOCK_PROFILES: Record<
  string,
  Omit<ProfileResponse, "requestedUrl" | "meta">
> = {
  "jane-doe-1234a5": {
    publicIdentifier: "jane-doe-1234a5",
    name: "Jane Doe",
    headline: "Senior Software Engineer at Acme Corp | Distributed Systems",
    location: "Bengaluru, Karnataka, India",
    about:
      "Backend engineer with 8+ years building high-throughput distributed systems. Previously at Initech and Globex. Passionate about mentoring and open source.",
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Acme Corp",
        companyLogoUrl: "https://example.com/logos/acme.png",
        employmentType: "Full-time",
        location: "Bengaluru, Karnataka, India",
        startDate: "2022-03",
        endDate: null,
        isCurrent: true,
        description:
          "Leading the platform reliability team; reduced P99 latency by 40% across core services.",
      },
      {
        title: "Software Engineer",
        company: "Initech",
        companyLogoUrl: "https://example.com/logos/initech.png",
        employmentType: "Full-time",
        location: "Pune, Maharashtra, India",
        startDate: "2019-06",
        endDate: "2022-02",
        isCurrent: false,
        description: "Built internal tooling for the payments team.",
      },
    ],
    education: [
      {
        school: "National Institute of Technology",
        schoolLogoUrl: "https://example.com/logos/nit.png",
        degree: "Bachelor of Technology",
        fieldOfStudy: "Computer Science",
        startYear: 2015,
        endYear: 2019,
        activities: "ACM student chapter, competitive programming club",
      },
    ],
    skills: [
      { name: "Distributed Systems", endorsementCount: 42 },
      { name: "TypeScript", endorsementCount: 31 },
      { name: "System Design", endorsementCount: 27 },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect – Associate",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2023-01",
        expirationDate: "2026-01",
        credentialId: "AWS-SAA-000000",
        credentialUrl: "https://example.com/verify/aws-saa-000000",
      },
    ],
    languages: [
      { name: "English", proficiency: "Full professional proficiency" },
      { name: "Hindi", proficiency: "Native or bilingual proficiency" },
    ],
    images: {
      profilePictureUrl: "https://example.com/avatars/jane-doe.jpg",
      backgroundImageUrl: "https://example.com/backgrounds/jane-doe.jpg",
    },
  },

  "mayank-gupta-ab5337197": {
    publicIdentifier: "mayank-gupta-ab5337197",
    name: "Mayank Gupta",
    headline:
      "Software Development Engineer | Backend & Agentic AI | Python, LLMs & AI Systems | Immediate Joiner",
    location: "Bengaluru, Karnataka, India",
    about:
      "Software Development Engineer with experience in Backend Engineering, AI Systems, LLM evaluation, data analysis, and enterprise technology projects. Currently working at Keywords Studios on an Amazon Nova Agentic AI project, contributing to AI system quality, workflow automation, data analysis, and production support. Skilled in Python, SQL, JavaScript, TypeScript, REST APIs, LLMs, Agentic AI, automation, and system design. Previously worked with OPEN Financial Technologies on digital banking and analytics projects involving enterprise clients such as Axis Bank and HDFC Bank. Actively exploring opportunities in Software Engineering, Backend Engineering, AI/ML Engineering, GenAI, Agentic AI, and Data/AI Systems.",
    experience: [
      {
        title: "Software Development Engineer – Backend | Amazon Nova Agentic AI Project",
        company: "Keywords Studios",
        companyLogoUrl: null,
        employmentType: "Full-time",
        location: "Bengaluru, India",
        startDate: "2025-07",
        endDate: "2026-07",
        isCurrent: false,
        description:
          "Worked on enterprise AI and technology initiatives involving LLM-based systems, agentic workflows, backend processes, and AI quality evaluation. Used Python and SQL for data analysis, workflow automation, validation, and operational problem-solving. Evaluated AI system outputs and supported improvements to prompting, safety, reliability, and response quality. Collaborated across Engineering, Product, QA, and Operations. Supported production workflows through issue analysis, L2 support, release coordination, documentation, and SLA-driven delivery. Built and improved automation workflows using tools such as n8n and Make.com.",
      },
      {
        title: "Data Scientist Intern / Business Analyst Intern",
        company: "OPEN Financial Technologies",
        companyLogoUrl: null,
        employmentType: "Internship",
        location: "Bengaluru, India",
        startDate: "2024-11",
        endDate: "2025-05",
        isCurrent: false,
        description:
          "Worked on digital banking and analytics initiatives for enterprise clients including Axis Bank and HDFC Bank. Analyzed business and operational data using Python, SQL, Excel, and Power BI. Supported data-driven decision-making through dashboards, reporting, and performance analysis. Assisted with requirement analysis, process optimization, and stakeholder coordination.",
      },
    ],
    education: [
      {
        school: "Lovely Professional University",
        schoolLogoUrl: null,
        degree: "Master of Computer Applications (MCA)",
        fieldOfStudy: "Computer Applications",
        startYear: 2023,
        endYear: 2025,
        activities: null,
      },
      {
        school: "Lovely Professional University",
        schoolLogoUrl: null,
        degree: "Bachelor of Computer Applications (BCA)",
        fieldOfStudy: "Computer Applications",
        startYear: null,
        endYear: null,
        activities: null,
      },
    ],
    skills: [
      { name: "Python", endorsementCount: null },
      { name: "SQL", endorsementCount: null },
      { name: "JavaScript", endorsementCount: null },
      { name: "TypeScript", endorsementCount: null },
      { name: "Backend Development", endorsementCount: null },
      { name: "REST APIs", endorsementCount: null },
      { name: "Data Structures & Algorithms", endorsementCount: null },
      { name: "Object-Oriented Programming", endorsementCount: null },
      { name: "System Design", endorsementCount: null },
      { name: "Software Architecture", endorsementCount: null },
      { name: "LLMs", endorsementCount: null },
      { name: "Generative AI", endorsementCount: null },
      { name: "Agentic AI", endorsementCount: null },
      { name: "AI Agents", endorsementCount: null },
      { name: "LangChain", endorsementCount: null },
      { name: "LangGraph", endorsementCount: null },
      { name: "Prompt Engineering", endorsementCount: null },
      { name: "LLM Evaluation", endorsementCount: null },
      { name: "Machine Learning", endorsementCount: null },
      { name: "Data Analysis", endorsementCount: null },
      { name: "Power BI", endorsementCount: null },
      { name: "Excel", endorsementCount: null },
      { name: "n8n", endorsementCount: null },
      { name: "Make.com", endorsementCount: null },
      { name: "Git", endorsementCount: null },
      { name: "GitHub", endorsementCount: null },
      { name: "Jira", endorsementCount: null },
      { name: "Confluence", endorsementCount: null },
      { name: "Agile", endorsementCount: null },
      { name: "Automation", endorsementCount: null },
      { name: "API Integration", endorsementCount: null },
    ],
    certifications: [
      {
        name: "Project Management & Agile Fundamentals",
        issuingOrganization: "Not specified",
        issueDate: null,
        expirationDate: null,
        credentialId: null,
        credentialUrl: null,
      },
      {
        name: "Advanced Excel, SQL & Power BI for Data Analytics",
        issuingOrganization: "Not specified",
        issueDate: null,
        expirationDate: null,
        credentialId: null,
        credentialUrl: null,
      },
      {
        name: "Python for Data Science & Machine Learning",
        issuingOrganization: "Not specified",
        issueDate: null,
        expirationDate: null,
        credentialId: null,
        credentialUrl: null,
      },
    ],
    languages: [
      { name: "English", proficiency: null },
      { name: "Hindi", proficiency: null },
    ],
    images: {
      profilePictureUrl: null,
      backgroundImageUrl: null,
    },
  },

  "arjun-mehta-9b8c7d": {
    publicIdentifier: "arjun-mehta-9b8c7d",
    name: "Arjun Mehta",
    headline: "Product Manager | B2B SaaS | Ex-Flipkart",
    location: "Mumbai, Maharashtra, India",
    about: null,
    experience: [
      {
        title: "Product Manager",
        company: "NimbusTech",
        companyLogoUrl: null,
        employmentType: "Full-time",
        location: "Mumbai, Maharashtra, India",
        startDate: "2021-08",
        endDate: null,
        isCurrent: true,
        description: null,
      },
    ],
    education: [
      {
        school: "Indian Institute of Management",
        schoolLogoUrl: null,
        degree: "MBA",
        fieldOfStudy: "Marketing",
        startYear: 2017,
        endYear: 2019,
        activities: null,
      },
    ],
    skills: [{ name: "Product Strategy", endorsementCount: null }],
    certifications: [],
    languages: [{ name: "English", proficiency: null }],
    images: {
      profilePictureUrl: null,
      backgroundImageUrl: null,
    },
  },
};
