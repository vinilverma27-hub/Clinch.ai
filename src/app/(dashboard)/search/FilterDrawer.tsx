"use client";

import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════ */
export interface FilterValues {
    platforms: string[];
    min_followers: number | null;
    max_followers: number | null;
    max_budget_inr: number | null;
    location: string | null;
    min_engagement_rate: number | null;
    result_count: number;
    gender: string | null;
}

export const DEFAULT_FILTERS: FilterValues = {
    platforms: [],
    min_followers: null,
    max_followers: null,
    max_budget_inr: null,
    location: null,
    min_engagement_rate: null,
    result_count: 10,
    gender: null,
};

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    currentFilters: FilterValues;
}

/* ════════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════════ */
const PLATFORMS = [
    { key: "instagram", label: "Instagram", emoji: "📸" },
    { key: "youtube", label: "YouTube", emoji: "▶️" },
    { key: "linkedin", label: "LinkedIn", emoji: "💼" },
];

const RESULT_COUNTS = [5, 10, 15, 20];

const FOLLOWER_PRESETS = [
    { id: "any", label: "Any", min: null, max: null },
    { id: "nano", label: "Nano", desc: "1K – 10K", min: 1000, max: 10000 },
    { id: "micro", label: "Micro", desc: "10K – 100K", min: 10000, max: 100000 },
    { id: "macro", label: "Macro", desc: "100K – 1M", min: 100000, max: 1000000 },
    { id: "custom", label: "Custom", min: null, max: null },
];

const BUDGET_OPTIONS = [
    { label: "Any", value: null },
    { label: "₹10k", value: 10000 },
    { label: "₹25k", value: 25000 },
    { label: "₹50k", value: 50000 },
    { label: "₹1L", value: 100000 },
    { label: "Custom", value: -1 },
];

const GENDER_OPTIONS = [
    { label: "All", value: null },
    { label: "Female", value: "female" },
    { label: "Male", value: "male" },
    { label: "Other", value: "other" },
];

const CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai",
    "Hyderabad", "Pune", "Kolkata", "Kochi",
    "Ahmedabad", "Jaipur",
];

const ENGAGEMENT_OPTIONS = [
    { label: "Any", value: null },
    { label: "3%+", value: 3 },
    { label: "5%+", value: 5 },
    { label: "7%+", value: 7 },
];

/* ════════════════════════════════════════════════
   Icon Components
   ════════════════════════════════════════════════ */
function IconClose({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
        </svg>
    );
}

/* ════════════════════════════════════════════════
   FilterDrawer Component
   ════════════════════════════════════════════════ */
export default function FilterDrawer({ isOpen, onClose, onApply, currentFilters }: FilterDrawerProps) {
    // Local drawer state (cloned from currentFilters when opened)
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [resultCount, setResultCount] = useState(10);
    const [isCustomCount, setIsCustomCount] = useState(false);
    const [customCountValue, setCustomCountValue] = useState("");
    const [followerPreset, setFollowerPreset] = useState("any");
    const [customMin, setCustomMin] = useState("");
    const [customMax, setCustomMax] = useState("");
    const [budget, setBudget] = useState<number | null>(null);
    const [isCustomBudget, setIsCustomBudget] = useState(false);
    const [customBudgetValue, setCustomBudgetValue] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [engagementRate, setEngagementRate] = useState<number | null>(null);
    const [gender, setGender] = useState<string | null>(null);

    // Sync local state when drawer opens
    useEffect(() => {
        if (isOpen) {
            setPlatforms(currentFilters.platforms);
            setResultCount(currentFilters.result_count);
            if (RESULT_COUNTS.includes(currentFilters.result_count)) {
                setIsCustomCount(false);
            } else {
                setIsCustomCount(true);
                setCustomCountValue(String(currentFilters.result_count));
            }
            
            setBudget(currentFilters.max_budget_inr);
            if (currentFilters.max_budget_inr !== null && !BUDGET_OPTIONS.some(opt => opt.value === currentFilters.max_budget_inr)) {
                setIsCustomBudget(true);
                setCustomBudgetValue(String(currentFilters.max_budget_inr));
                setBudget(-1);
            } else {
                setIsCustomBudget(false);
            }

            setLocation(currentFilters.location);
            setEngagementRate(currentFilters.min_engagement_rate);
            setGender(currentFilters.gender);

            // Determine follower preset
            const { min_followers, max_followers } = currentFilters;
            if (min_followers === null && max_followers === null) {
                setFollowerPreset("any");
            } else {
                const match = FOLLOWER_PRESETS.find(
                    (p) => p.id !== "any" && p.id !== "custom" && p.min === min_followers && p.max === max_followers
                );
                if (match) {
                    setFollowerPreset(match.id);
                } else {
                    setFollowerPreset("custom");
                    setCustomMin(min_followers ? String(min_followers) : "");
                    setCustomMax(max_followers ? String(max_followers) : "");
                }
            }
        }
    }, [isOpen, currentFilters]);

    // Toggle platform selection
    const togglePlatform = (key: string) => {
        setPlatforms((prev) =>
            prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
        );
    };

    // Build filter values and apply
    const handleApply = () => {
        let min_followers: number | null = null;
        let max_followers: number | null = null;

        if (followerPreset === "custom") {
            min_followers = customMin ? Number(customMin) : null;
            max_followers = customMax ? Number(customMax) : null;
        } else {
            const preset = FOLLOWER_PRESETS.find((p) => p.id === followerPreset);
            if (preset && preset.id !== "any") {
                min_followers = preset.min;
                max_followers = preset.max;
            }
        }

        onApply({
            platforms,
            min_followers,
            max_followers,
            max_budget_inr: isCustomBudget ? (Number(customBudgetValue) || null) : (budget === -1 ? null : budget),
            location,
            min_engagement_rate: engagementRate,
            result_count: isCustomCount ? (Number(customCountValue) || 10) : resultCount,
            gender,
        });
    };

    // Clear all filters to defaults
    const handleClearAll = () => {
        setPlatforms([]);
        setResultCount(10);
        setIsCustomCount(false);
        setCustomCountValue("");
        setFollowerPreset("any");
        setCustomMin("");
        setCustomMax("");
        setBudget(null);
        setIsCustomBudget(false);
        setCustomBudgetValue("");
        setLocation(null);
        setEngagementRate(null);
        setGender(null);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fd-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={`fd-drawer ${isOpen ? "open" : ""}`}>
                {/* ─── Header ─── */}
                <div className="fd-header">
                    <h3>Filters</h3>
                    <button className="fd-close-btn" onClick={onClose} aria-label="Close filters">
                        <IconClose className="w-[18px] h-[18px]" />
                    </button>
                </div>

                {/* ─── Scrollable Body ─── */}
                <div className="fd-body">

                    {/* Platform */}
                    <div className="fd-section">
                        <p className="fd-section-label">Platform</p>
                        <div className="fd-platform-row">
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.key}
                                    className={`fd-platform-btn ${platforms.includes(p.key) ? "selected" : ""}`}
                                    onClick={() => togglePlatform(p.key)}
                                >
                                    <span className="fd-platform-emoji">{p.emoji}</span>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="fd-divider" />

                    {/* How Many Results? */}
                    <div className="fd-section">
                        <p className="fd-section-label">How Many Results?</p>
                        <div className="fd-result-row">
                            {RESULT_COUNTS.map((n) => (
                                <button
                                    key={n}
                                    className={`fd-result-pill ${!isCustomCount && resultCount === n ? "selected" : ""}`}
                                    onClick={() => {
                                        setResultCount(n);
                                        setIsCustomCount(false);
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className={`fd-result-pill ${isCustomCount ? "selected" : ""}`}
                                onClick={() => setIsCustomCount(true)}
                            >
                                Custom
                            </button>
                        </div>
                        {isCustomCount && (
                            <div className="fd-custom-range" style={{ marginTop: '12px' }}>
                                <div className="fd-custom-field">
                                    <label className="fd-custom-label">Count</label>
                                    <input
                                        type="number"
                                        className="fd-custom-input"
                                        placeholder="e.g. 25"
                                        value={customCountValue}
                                        onChange={(e) => setCustomCountValue(e.target.value)}
                                        min="1"
                                        max="100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="fd-divider" />

                    {/* Follower Count */}
                    <div className="fd-section">
                        <p className="fd-section-label">Follower Count</p>
                        <div className="fd-radio-group">
                            {FOLLOWER_PRESETS.map((preset) => (
                                <label key={preset.id} className="fd-radio-row">
                                    <span className={`fd-radio-dot ${followerPreset === preset.id ? "checked" : ""}`} />
                                    <input
                                        type="radio"
                                        name="follower-preset"
                                        value={preset.id}
                                        checked={followerPreset === preset.id}
                                        onChange={() => setFollowerPreset(preset.id)}
                                        className="fd-radio-input"
                                    />
                                    <span className="fd-radio-label">{preset.label}</span>
                                    {preset.desc && (
                                        <span className="fd-radio-desc">{preset.desc}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                        {/* Custom min/max inputs */}
                        {followerPreset === "custom" && (
                            <div className="fd-custom-range">
                                <div className="fd-custom-field">
                                    <label className="fd-custom-label">Min</label>
                                    <input
                                        type="number"
                                        className="fd-custom-input"
                                        placeholder="e.g. 5000"
                                        value={customMin || ""}
                                        onChange={(e) => setCustomMin(e.target.value)}
                                    />
                                </div>
                                <div className="fd-custom-field">
                                    <label className="fd-custom-label">Max</label>
                                    <input
                                        type="number"
                                        className="fd-custom-input"
                                        placeholder="e.g. 50000"
                                        value={customMax || ""}
                                        onChange={(e) => setCustomMax(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="fd-divider" />

                    {/* Max Budget */}
                    <div className="fd-section">
                        <p className="fd-section-label">Max Budget (₹)</p>
                        <div className="fd-radio-group">
                            {BUDGET_OPTIONS.map((opt) => (
                                <label key={opt.label} className="fd-radio-row">
                                    <span className={`fd-radio-dot ${budget === opt.value ? "checked" : ""}`} />
                                    <input
                                        type="radio"
                                        name="budget"
                                        checked={budget === opt.value}
                                        onChange={() => {
                                            setBudget(opt.value);
                                            setIsCustomBudget(opt.value === -1);
                                        }}
                                        className="fd-radio-input"
                                    />
                                    <span className="fd-radio-label">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        {isCustomBudget && (
                            <div className="fd-custom-range" style={{ marginTop: '12px' }}>
                                <div className="fd-custom-field">
                                    <label className="fd-custom-label">Budget</label>
                                    <input
                                        type="number"
                                        className="fd-custom-input"
                                        placeholder="e.g. 15000"
                                        value={customBudgetValue}
                                        onChange={(e) => setCustomBudgetValue(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="fd-divider" />

                    {/* Gender */}
                    <div className="fd-section">
                        <p className="fd-section-label">Gender</p>
                        <div className="fd-radio-group fd-radio-inline">
                            {GENDER_OPTIONS.map((opt) => (
                                <label key={opt.label} className="fd-radio-row">
                                    <span className={`fd-radio-dot ${gender === opt.value ? "checked" : ""}`} />
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={gender === opt.value}
                                        onChange={() => setGender(opt.value)}
                                        className="fd-radio-input"
                                    />
                                    <span className="fd-radio-label">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="fd-divider" />

                    {/* Location */}
                    <div className="fd-section">
                        <p className="fd-section-label">Location (Indian City)</p>
                        <select
                            className="fd-select"
                            value={location || ""}
                            onChange={(e) => setLocation(e.target.value || null)}
                        >
                            <option value="">All Locations</option>
                            {CITIES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fd-divider" />

                    {/* Min Engagement Rate */}
                    <div className="fd-section">
                        <p className="fd-section-label">Min. Engagement Rate</p>
                        <div className="fd-radio-group fd-radio-inline">
                            {ENGAGEMENT_OPTIONS.map((opt) => (
                                <label key={opt.label} className="fd-radio-row">
                                    <span className={`fd-radio-dot ${engagementRate === opt.value ? "checked" : ""}`} />
                                    <input
                                        type="radio"
                                        name="engagement"
                                        checked={engagementRate === opt.value}
                                        onChange={() => setEngagementRate(opt.value)}
                                        className="fd-radio-input"
                                    />
                                    <span className="fd-radio-label">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="fd-footer">
                    <button className="fd-clear-btn" onClick={handleClearAll}>
                        Clear All Filters
                    </button>
                    <button className="fd-apply-btn" onClick={handleApply}>
                        Apply Filters →
                    </button>
                </div>
            </div>
        </>
    );
}
