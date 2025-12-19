import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}

interface CountryCodeSelectorProps {
    value: string;
    onChange: (dialCode: string) => void;
    className?: string;
}

const COUNTRIES: Country[] = [
    { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
    { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
    { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
    { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
    { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
    { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
    { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
    { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
    { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
    { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
    { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
    { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
    { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
    { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
    { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
    { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
    { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
    { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
    { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
    { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
    { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
    { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
    { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
    { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
    { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
    { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
    { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
    { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
    { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
    { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
    { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
    { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
    { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
    { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
    { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
    { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
    { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
    { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
    { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
    { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
];

// Popular countries to show at the top
const POPULAR_COUNTRY_CODES = ["+91", "+1", "+44", "+971", "+65", "+61"];

const CountryCodeSelector = ({
    value,
    onChange,
    className = "",
}: CountryCodeSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedCountry = useMemo(
        () => COUNTRIES.find((c) => c.dialCode === value) || COUNTRIES[0],
        [value]
    );

    const filteredCountries = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = COUNTRIES.filter(
            (country) =>
                country.name.toLowerCase().includes(query) ||
                country.dialCode.includes(query) ||
                country.code.toLowerCase().includes(query)
        );

        // Separate popular and other countries
        const popular = filtered.filter((c) =>
            POPULAR_COUNTRY_CODES.includes(c.dialCode)
        );
        const others = filtered.filter(
            (c) => !POPULAR_COUNTRY_CODES.includes(c.dialCode)
        );

        return { popular, others };
    }, [searchQuery]);

    const handleSelect = (dialCode: string) => {
        onChange(dialCode);
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div className={`relative ${className}`}>
            {/* Selected Country Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-foreground hover:bg-accent transition-colors w-full"
            >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="font-medium">{selectedCountry.dialCode}</span>
                <ChevronDown
                    className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setIsOpen(false);
                            setSearchQuery("");
                        }}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-border bg-card shadow-lg max-h-80 overflow-hidden flex flex-col">
                        {/* Search */}
                        <div className="p-3 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search countries..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Countries List */}
                        <div className="overflow-y-auto">
                            {/* Popular Countries */}
                            {filteredCountries.popular.length > 0 && !searchQuery && (
                                <div>
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                                        Popular
                                    </div>
                                    {filteredCountries.popular.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleSelect(country.dialCode)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors ${country.dialCode === value ? "bg-primary/10" : ""
                                                }`}
                                        >
                                            <span className="text-lg">{country.flag}</span>
                                            <span className="flex-1 text-sm text-foreground">
                                                {country.name}
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {country.dialCode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Other Countries */}
                            {filteredCountries.others.length > 0 && (
                                <div>
                                    {!searchQuery && filteredCountries.popular.length > 0 && (
                                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                                            All Countries
                                        </div>
                                    )}
                                    {filteredCountries.others.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleSelect(country.dialCode)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors ${country.dialCode === value ? "bg-primary/10" : ""
                                                }`}
                                        >
                                            <span className="text-lg">{country.flag}</span>
                                            <span className="flex-1 text-sm text-foreground">
                                                {country.name}
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {country.dialCode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {filteredCountries.popular.length === 0 &&
                                filteredCountries.others.length === 0 && (
                                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                        No countries found
                                    </div>
                                )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CountryCodeSelector;
