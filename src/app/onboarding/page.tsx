"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./onboarding.css";

/* ═══════════════  SVG Mascot  ═══════════════ */
function Mascot({ size = 48, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            className={className}
        >
            <rect x="4" y="4" width="40" height="40" rx="12" fill="#C4622D" />
            <rect x="12" y="14" width="8" height="8" rx="2" fill="#F5F0E8" />
            <rect x="28" y="14" width="8" height="8" rx="2" fill="#F5F0E8" />
            <rect x="16" y="28" width="16" height="6" rx="3" fill="#F5F0E8" />
        </svg>
    );
}

/* ═══════════════  Constants  ═══════════════ */
const TOTAL_STEPS = 9;

const QUOTE_MAP: Record<string, string> = {
    "1": "Find your perfect influencers in minutes",
    "2": "Find your perfect influencers in minutes",
    "3": "Tell us about your brand",
    "4": "Tell us about your brand",
    "5": "Set your campaign parameters",
    "6": "Set your campaign parameters",
    "7": "Almost ready to find your matches",
    "8": "Almost ready to find your matches",
    "9": "Almost ready to find your matches",
};

const NICHES = [
    { emoji: "👗", name: "Fashion" },
    { emoji: "💄", name: "Beauty" },
    { emoji: "🍕", name: "Food & Bev" },
    { emoji: "💪", name: "Health" },
    { emoji: "📱", name: "Tech" },
    { emoji: "✈️", name: "Travel" },
    { emoji: "📚", name: "Education" },
    { emoji: "🏠", name: "Lifestyle" },
    { emoji: "💰", name: "Finance" },
    { emoji: "🎮", name: "Gaming" },
    { emoji: "🌿", name: "Wellness" },
    { emoji: "➕", name: "Other" },
];

const GOALS = [
    { emoji: "🎯", name: "Brand Awareness" },
    { emoji: "💰", name: "Drive Sales" },
    { emoji: "🚀", name: "Product Launch" },
    { emoji: "📱", name: "App Downloads" },
    { emoji: "🎪", name: "Event Promotion" },
    { emoji: "🎨", name: "Content Creation" },
];

const BUDGET_OPTIONS = ["Under ₹25k", "₹25k–1L", "₹1L–5L", "₹5L+"];

/* ═══════════════  Form data state  ═══════════════ */
interface FormData {
    brandName: string;
    brandDescription: string;
    logoFile: File | null;
    industries: string[];
    ageRange: string;
    gender: string;
    location: string;
    specificCity: string;
    platforms: string[];
    budget: string;
    goals: string[];
    briefFile: File | null;
}

const INITIAL_FORM: FormData = {
    brandName: "",
    brandDescription: "",
    logoFile: null,
    industries: [],
    ageRange: "",
    gender: "",
    location: "",
    specificCity: "",
    platforms: [],
    budget: "",
    goals: [],
    briefFile: null,
};

/* ═══════════════  Confetti helper  ═══════════════ */
function createConfetti(): { id: number; left: string; bg: string; duration: string; delay: string }[] {
    const colors = ["#C4622D", "#F5F0E8", "#1C1410", "#D4784A", "#E8DDD4", "#A8501F"];
    return Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        bg: colors[Math.floor(Math.random() * colors.length)],
        duration: `${2 + Math.random() * 2}s`,
        delay: `${Math.random() * 1.5}s`,
    }));
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<"forward" | "back">("forward");
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [animKey, setAnimKey] = useState(0);

    // Brief upload state
    const [briefState, setBriefState] = useState<"idle" | "reading" | "done">("idle");

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Confetti for step 9
    const [confetti] = useState(createConfetti);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const briefInputRef = useRef<HTMLInputElement>(null);

    /* ── Navigation ── */
    const goNext = useCallback(() => {
        setDirection("forward");
        setAnimKey((k) => k + 1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }, []);

    const goBack = useCallback(() => {
        setDirection("back");
        setAnimKey((k) => k + 1);
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    /* ── Form helpers ── */
    const set = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) =>
            setForm((f) => ({ ...f, [key]: value })),
        []
    );

    const toggleArray = useCallback(
        (key: "industries" | "platforms" | "goals", value: string) =>
            setForm((f) => {
                const arr = f[key] as string[];
                return {
                    ...f,
                    [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
                };
            }),
        []
    );

    /* ── Brief upload handler ── */
    const handleBriefFile = useCallback(
        (file: File) => {
            set("briefFile", file);
            setBriefState("reading");
            setTimeout(() => setBriefState("done"), 2200);
        },
        [set]
    );

    /* ── Continue disabled logic ── */
    const canContinue = (() => {
        switch (step) {
            case 2: return form.brandName.trim().length > 0;
            case 3: return form.industries.length > 0;
            case 4: return form.ageRange !== "" && form.gender !== "" && form.location !== "";
            case 5: return form.platforms.length > 0;
            case 6: return form.goals.length > 0;
            default: return true;
        }
    })();

    /* ── Onboarding completion → save to Supabase ── */
    async function handleOnboardingComplete() {
        setSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/api/brand/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.brandName,
                    description: form.brandDescription,
                    logo_url: null,
                    industry: form.industries.join(", "),
                    niche: form.industries.join(", "),
                    target_age: form.ageRange,
                    target_gender: form.gender,
                    target_location: form.location === "specific" ? form.specificCity : form.location,
                    platforms: form.platforms,
                    monthly_budget: form.budget,
                    campaign_goals: form.goals,
                    campaign_brief_url: null,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setSubmitError(data.error);
                return;
            }

            // Success! Redirect to AI Search page
            router.push("/search");
        } catch (error) {
            setSubmitError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Quote ── */
    const quoteText = QUOTE_MAP[String(step)] || QUOTE_MAP["1"];

    /* ── Progress ── */
    const pct = ((step) / TOTAL_STEPS) * 100;

    const animClass = direction === "forward" ? "onb-slide-enter" : "onb-slide-enter-reverse";

    /* ═══════════════  RENDER  ═══════════════ */
    return (
        <div className="onb-container">
            {/* ──────── LEFT PANEL ──────── */}
            <aside className="onb-left">
                <div className="onb-brand">
                    <div className="onb-logo-row">
                        <Mascot size={48} className="onb-mascot-lg" />
                        <span className="onb-brand-name">clinch.ai</span>
                    </div>

                    <div className="onb-quote-wrapper">
                        {Object.entries(QUOTE_MAP)
                            .filter(([, v], i, arr) => arr.findIndex(([, v2]) => v2 === v) === i)
                            .map(([, text]) => (
                                <p
                                    key={text}
                                    className={`onb-quote ${quoteText === text ? "active" : ""}`}
                                >
                                    {text}
                                </p>
                            ))}
                    </div>
                </div>

                <div className="onb-proof">
                    <span className="onb-proof-item">1,400+ brands</span>
                    <span className="onb-proof-item">10K+ deals</span>
                    <span className="onb-proof-item">₹2Cr+ saved</span>
                </div>
            </aside>

            {/* ──────── RIGHT PANEL ──────── */}
            <section className="onb-right">
                {/* Progress */}
                {step < TOTAL_STEPS && (
                    <div className="onb-progress">
                        <p className="onb-step-label">Step {step} of {TOTAL_STEPS - 1}</p>
                        <div className="onb-track">
                            <div className="onb-fill" style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }} />
                        </div>
                    </div>
                )}

                {/* Animated step wrapper */}
                <div className="onb-content" key={animKey}>
                    <div className={animClass}>
                        {/* ──────── AI BUBBLE ──────── */}
                        <BubbleRow>
                            {step === 1 && (
                                <p>
                                    Hey there! 👋 I&apos;m your Clinch AI assistant. I&apos;ll help
                                    you find perfect influencers for your brand. Let&apos;s get
                                    started — this takes about 2 minutes!
                                </p>
                            )}
                            {step === 2 && (
                                <p>
                                    First, tell me about your brand! What&apos;s it called and what do
                                    you sell or do?
                                </p>
                            )}
                            {step === 3 && (
                                <p>
                                    What industry are you in? This helps me find influencers who truly
                                    understand your space.
                                </p>
                            )}
                            {step === 4 && (
                                <p>
                                    Who are you trying to reach? This helps me match you with the right
                                    influencer audiences.
                                </p>
                            )}
                            {step === 5 && (
                                <p>
                                    Which platforms do you want to run influencer campaigns on?
                                </p>
                            )}
                            {step === 6 && (
                                <p>
                                    What are you trying to achieve with influencer marketing? Select all
                                    that apply.
                                </p>
                            )}
                            {step === 7 && (
                                <p>
                                    Got an existing campaign brief? Drop it here and I&apos;ll read it
                                    for you — I can auto-fill your requirements!
                                </p>
                            )}
                            {step === 8 && (
                                <p>
                                    Last step! Connect your Gmail so I can send outreach emails on your
                                    behalf. You&apos;ll always approve before anything is sent.
                                </p>
                            )}
                            {step === 9 && (
                                <p>
                                    You&apos;re all set, {form.brandName || "there"}! 🎉 I&apos;ve
                                    already found 47 influencers matching your brand profile. Ready to
                                    meet them?
                                </p>
                            )}
                        </BubbleRow>

                        {/* ──────── STEP BODY ──────── */}
                        <div className="onb-step-body">
                            {/* ---------- STEP 1 ---------- */}
                            {step === 1 && (
                                <button className="onb-btn-primary" onClick={goNext}>
                                    Let&apos;s Go! →
                                </button>
                            )}

                            {/* ---------- STEP 2 ---------- */}
                            {step === 2 && (
                                <Step2
                                    form={form}
                                    set={set}
                                    logoInputRef={logoInputRef}
                                />
                            )}

                            {/* ---------- STEP 3 ---------- */}
                            {step === 3 && (
                                <div className="onb-niche-grid">
                                    {NICHES.map((n) => (
                                        <button
                                            key={n.name}
                                            className={`onb-niche-card ${form.industries.includes(n.name) ? "selected" : ""}`}
                                            onClick={() => toggleArray("industries", n.name)}
                                        >
                                            <span className="niche-emoji">{n.emoji}</span>
                                            <span className="niche-name">{n.name}</span>
                                            {form.industries.includes(n.name) && (
                                                <span className="niche-check">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ---------- STEP 4 ---------- */}
                            {step === 4 && (
                                <Step4 form={form} set={set} />
                            )}

                            {/* ---------- STEP 5 ---------- */}
                            {step === 5 && (
                                <Step5 form={form} set={set} toggleArray={toggleArray} />
                            )}

                            {/* ---------- STEP 6 ---------- */}
                            {step === 6 && (
                                <div className="onb-goal-grid">
                                    {GOALS.map((g) => (
                                        <button
                                            key={g.name}
                                            className={`onb-goal-card ${form.goals.includes(g.name) ? "selected" : ""}`}
                                            onClick={() => toggleArray("goals", g.name)}
                                        >
                                            <span className="goal-emoji">{g.emoji}</span>
                                            <span className="goal-name">{g.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ---------- STEP 7 ---------- */}
                            {step === 7 && (
                                <Step7
                                    briefState={briefState}
                                    briefInputRef={briefInputRef}
                                    handleBriefFile={handleBriefFile}
                                    goNext={goNext}
                                />
                            )}

                            {/* ---------- STEP 8 ---------- */}
                            {step === 8 && (
                                <Step8 goNext={goNext} />
                            )}

                            {/* ---------- STEP 9 ---------- */}
                            {step === 9 && (
                                <>
                                    <div className="onb-confetti-container">
                                        {confetti.map((c) => (
                                            <div
                                                key={c.id}
                                                className="confetti-dot"
                                                style={{
                                                    left: c.left,
                                                    backgroundColor: c.bg,
                                                    animationDuration: c.duration,
                                                    animationDelay: c.delay,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="onb-success">
                                        <div className="onb-mascot-celebrate">🎉</div>

                                        <div className="onb-stats-row">
                                            <div className="onb-stat-card">
                                                <div className="onb-stat-value">47</div>
                                                <div className="onb-stat-label">Matches Found</div>
                                            </div>
                                            <div className="onb-stat-card">
                                                <div className="onb-stat-value">96%</div>
                                                <div className="onb-stat-label">Top Match</div>
                                            </div>
                                            <div className="onb-stat-card">
                                                <div className="onb-stat-value">₹8k</div>
                                                <div className="onb-stat-label">Avg Cost</div>
                                            </div>
                                        </div>

                                        <button
                                            className="onb-btn-primary btn-large"
                                            onClick={handleOnboardingComplete}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>✨ Setting up your account...</>
                                            ) : (
                                                <>✨ Show Me My Matches →</>
                                            )}
                                        </button>

                                        {submitError && (
                                            <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 8, textAlign: "center" }}>
                                                {submitError}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ──────── NAV BAR ──────── */}
                        {step > 1 && step < 9 && step !== 7 && step !== 8 && (
                            <div className="onb-nav">
                                <button className="onb-btn-back" onClick={goBack}>
                                    ← Back
                                </button>
                                <button
                                    className="onb-btn-continue"
                                    disabled={!canContinue}
                                    onClick={goNext}
                                >
                                    Continue →
                                </button>
                            </div>
                        )}

                        {/* Nav for step 7 */}
                        {step === 7 && (
                            <div className="onb-nav">
                                <button className="onb-btn-back" onClick={goBack}>
                                    ← Back
                                </button>
                                {briefState === "done" && (
                                    <button className="onb-btn-continue" onClick={goNext}>
                                        Continue →
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Nav for step 8 */}
                        {step === 8 && (
                            <div className="onb-nav">
                                <button className="onb-btn-back" onClick={goBack}>
                                    ← Back
                                </button>
                                <div />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ═══════════════  SUB-COMPONENTS  ═══════════════ */

/* ── Bubble Row ── */
function BubbleRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="onb-bubble-row">
            <Mascot size={32} className="onb-mascot-sm" />
            <div className="onb-bubble">{children}</div>
        </div>
    );
}

/* ── Step 2 ── */
function Step2({
    form,
    set,
    logoInputRef,
}: {
    form: FormData;
    set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
    logoInputRef: React.RefObject<HTMLInputElement | null>;
}) {
    const [dragOver, setDragOver] = useState(false);

    return (
        <>
            <div className="onb-field">
                <label className="onb-label">Brand Name</label>
                <input
                    className="onb-input"
                    placeholder="Your brand name"
                    value={form.brandName || ""}
                    onChange={(e) => set("brandName", e.target.value)}
                />
            </div>
            <div className="onb-field">
                <label className="onb-label">What does your brand do?</label>
                <textarea
                    className="onb-textarea"
                    rows={3}
                    placeholder="e.g. We sell sustainable skincare products..."
                    value={form.brandDescription || ""}
                    onChange={(e) => set("brandDescription", e.target.value)}
                />
            </div>
            <div className="onb-field">
                <div
                    className={`onb-upload-zone ${dragOver ? "dragover" : ""} ${form.logoFile ? "has-file" : ""}`}
                    onClick={() => logoInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) set("logoFile", file);
                    }}
                >
                    <span className="upload-icon">{form.logoFile ? "✅" : "📁"}</span>
                    <span className="upload-label">
                        {form.logoFile ? form.logoFile.name : "Upload your logo (optional)"}
                    </span>
                    <span className="upload-hint">PNG, JPG up to 2MB</span>
                </div>
                <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) set("logoFile", file);
                    }}
                />
            </div>
        </>
    );
}

/* ── Step 4 ── */
function Step4({
    form,
    set,
}: {
    form: FormData;
    set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
    return (
        <>
            <div className="onb-select-wrapper">
                <label className="onb-label">Age Range</label>
                <select
                    className="onb-select"
                    value={form.ageRange || ""}
                    onChange={(e) => set("ageRange", e.target.value)}
                >
                    <option value="">Select age range</option>
                    <option value="13-17">13–17</option>
                    <option value="18-24">18–24</option>
                    <option value="25-34">25–34</option>
                    <option value="35-44">35–44</option>
                    <option value="45+">45+</option>
                    <option value="all">All Ages</option>
                </select>
            </div>

            {form.ageRange && (
                <div className="onb-select-wrapper">
                    <label className="onb-label">Gender</label>
                    <select
                        className="onb-select"
                        value={form.gender || ""}
                        onChange={(e) => set("gender", e.target.value)}
                    >
                        <option value="">Select gender focus</option>
                        <option value="all">All Genders</option>
                        <option value="female">Mostly Female</option>
                        <option value="male">Mostly Male</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>
            )}

            {form.gender && (
                <div className="onb-select-wrapper">
                    <label className="onb-label">Location Focus</label>
                    <select
                        className="onb-select"
                        value={form.location || ""}
                        onChange={(e) => set("location", e.target.value)}
                    >
                        <option value="">Select location</option>
                        <option value="pan-india">Pan India</option>
                        <option value="metro">Metro Cities Only</option>
                        <option value="tier1">Tier 1 (Mumbai/Delhi/Bangalore)</option>
                        <option value="tier2">Tier 2 Cities</option>
                        <option value="specific">Specific City...</option>
                    </select>
                </div>
            )}

            {form.location === "specific" && (
                <div className="onb-select-wrapper">
                    <label className="onb-label">Which city?</label>
                    <input
                        className="onb-input"
                        placeholder="Enter city name"
                        value={form.specificCity || ""}
                        onChange={(e) => set("specificCity", e.target.value)}
                    />
                </div>
            )}
        </>
    );
}

/* ── Step 5 ── */
function Step5({
    form,
    set,
    toggleArray,
}: {
    form: FormData;
    set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
    toggleArray: (key: "industries" | "platforms" | "goals", value: string) => void;
}) {
    const platforms = [
        { id: "instagram", emoji: "📸", name: "Instagram", desc: "Nano & Micro influencers" },
        { id: "youtube", emoji: "▶️", name: "YouTube", desc: "Video-first creators" },
        { id: "linkedin", emoji: "💼", name: "LinkedIn", desc: "B2B reach & thought leaders" },
    ];

    return (
        <>
            <div className="onb-platform-row">
                {platforms.map((p) => (
                    <button
                        key={p.id}
                        className={`onb-platform-card ${form.platforms.includes(p.id) ? "selected" : ""}`}
                        onClick={() => toggleArray("platforms", p.id)}
                    >
                        <span className="plat-emoji">{p.emoji}</span>
                        <span className="plat-name">{p.name}</span>
                        <span className="plat-desc">{p.desc}</span>
                        {form.platforms.includes(p.id) && (
                            <span className="plat-check">✓</span>
                        )}
                    </button>
                ))}
            </div>

            <div>
                <p className="onb-budget-label">What&apos;s your monthly budget?</p>
                <div className="onb-budget-pills">
                    {BUDGET_OPTIONS.map((b) => (
                        <button
                            key={b}
                            className={`onb-pill ${form.budget === b ? "selected" : ""}`}
                            onClick={() => set("budget", b)}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ── Step 7 ── */
function Step7({
    briefState,
    briefInputRef,
    handleBriefFile,
    goNext,
}: {
    briefState: "idle" | "reading" | "done";
    briefInputRef: React.RefObject<HTMLInputElement | null>;
    handleBriefFile: (file: File) => void;
    goNext: () => void;
}) {
    const [dragOver, setDragOver] = useState(false);

    return (
        <>
            <div
                className={`onb-brief-zone ${dragOver ? "dragover" : ""} ${briefState !== "idle" ? "has-file" : ""}`}
                onClick={() => briefState === "idle" && briefInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleBriefFile(file);
                }}
            >
                {briefState === "idle" && (
                    <>
                        <span className="brief-icon">📄</span>
                        <span className="brief-label">Drop your campaign brief here</span>
                        <span className="brief-hint">PDF, DOC up to 10MB</span>
                        <button
                            className="onb-brief-browse"
                            onClick={(e) => {
                                e.stopPropagation();
                                briefInputRef.current?.click();
                            }}
                        >
                            Browse Files
                        </button>
                    </>
                )}

                {briefState === "reading" && (
                    <div className="onb-brief-progress">
                        <span className="mascot-reading">🤖</span>
                        <div className="brief-bar-track">
                            <div className="brief-bar-fill" />
                        </div>
                        <span className="brief-reading-text">Reading your brief...</span>
                    </div>
                )}

                {briefState === "done" && (
                    <div className="onb-brief-success">
                        <span className="success-icon">✅</span>
                        <span className="success-text">Brief analyzed!</span>
                        <span className="success-sub">I&apos;ve noted your requirements.</span>
                    </div>
                )}
            </div>

            <input
                ref={briefInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBriefFile(file);
                }}
            />

            <button className="onb-skip-link" onClick={goNext}>
                Skip for now — I&apos;ll set this up later →
            </button>
        </>
    );
}

/* ── Step 8 ── */
function Step8({ goNext }: { goNext: () => void }) {
    return (
        <>
            <div className="onb-gmail-card">
                <div className="onb-gmail-header">
                    <div className="onb-gmail-icon">G</div>
                    <h3>Connect Google Account</h3>
                </div>
                <div className="onb-gmail-body">
                    <p>
                        We only request send &amp; read permissions. Your emails are never
                        shared or stored.
                    </p>
                </div>
                <button className="onb-btn-primary" onClick={goNext}>
                    Connect Gmail →
                </button>
            </div>

            <button className="onb-skip-link" onClick={goNext}>
                I&apos;ll connect this later →
            </button>
        </>
    );
}
