export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shapes */}
      <circle cx="200" cy="150" r="120" fill="#EEF2FF" />
      <circle cx="320" cy="80" r="40" fill="#E0E7FF" />
      <circle cx="80" cy="220" r="30" fill="#C7D2FE" />
      
      {/* Laptop */}
      <rect x="120" y="100" width="160" height="100" rx="8" fill="#4F46E5" />
      <rect x="130" y="110" width="140" height="75" rx="4" fill="#818CF8" />
      <rect x="100" y="200" width="200" height="12" rx="6" fill="#6366F1" />
      
      {/* Screen content - task cards */}
      <rect x="140" y="120" width="50" height="8" rx="2" fill="#C7D2FE" />
      <rect x="140" y="132" width="70" height="6" rx="2" fill="#DDD6FE" />
      <rect x="140" y="142" width="40" height="6" rx="2" fill="#DDD6FE" />
      
      <rect x="140" y="155" width="50" height="8" rx="2" fill="#C7D2FE" />
      <rect x="140" y="167" width="60" height="6" rx="2" fill="#DDD6FE" />
      
      {/* Checkmarks */}
      <circle cx="230" cy="130" r="10" fill="#10B981" />
      <path d="M226 130L229 133L235 127" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      <circle cx="230" cy="160" r="10" fill="#10B981" />
      <path d="M226 160L229 163L235 157" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Floating coins */}
      <circle cx="300" cy="120" r="20" fill="#FBBF24" />
      <text x="300" y="126" textAnchor="middle" fill="#92400E" fontSize="16" fontWeight="bold">$</text>
      
      <circle cx="330" cy="160" r="15" fill="#FCD34D" />
      <text x="330" y="165" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="bold">$</text>
      
      <circle cx="70" cy="130" r="18" fill="#FBBF24" />
      <text x="70" y="136" textAnchor="middle" fill="#92400E" fontSize="14" fontWeight="bold">$</text>
      
      {/* Person silhouette */}
      <circle cx="320" cy="220" r="25" fill="#A5B4FC" />
      <ellipse cx="320" cy="270" rx="30" ry="20" fill="#A5B4FC" />
      
      {/* Stars */}
      <path d="M60 80L62 86L68 86L63 90L65 96L60 92L55 96L57 90L52 86L58 86Z" fill="#FBBF24" />
      <path d="M340 50L341 54L345 54L342 56L343 60L340 57L337 60L338 56L335 54L339 54Z" fill="#FBBF24" />
    </svg>
  );
}

export function EmptyTasksIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#F1F5F9" />
      
      {/* Empty clipboard */}
      <rect x="60" y="50" width="80" height="100" rx="8" fill="#E2E8F0" />
      <rect x="80" y="40" width="40" height="15" rx="4" fill="#CBD5E1" />
      <circle cx="100" cy="47" r="4" fill="#94A3B8" />
      
      {/* Lines representing empty content */}
      <rect x="75" y="70" width="50" height="6" rx="2" fill="#CBD5E1" />
      <rect x="75" y="85" width="40" height="6" rx="2" fill="#CBD5E1" />
      <rect x="75" y="100" width="45" height="6" rx="2" fill="#CBD5E1" />
      <rect x="75" y="115" width="35" height="6" rx="2" fill="#CBD5E1" />
      
      {/* Question mark */}
      <circle cx="150" cy="60" r="20" fill="#A5B4FC" />
      <text x="150" y="68" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">?</text>
    </svg>
  );
}

export function SuccessIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#D1FAE5" />
      <circle cx="100" cy="100" r="50" fill="#10B981" />
      <path
        d="M75 100L90 115L125 80"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sparkles */}
      <circle cx="40" cy="60" r="4" fill="#FBBF24" />
      <circle cx="160" cy="50" r="3" fill="#FBBF24" />
      <circle cx="155" cy="150" r="5" fill="#FBBF24" />
      <circle cx="50" cy="140" r="3" fill="#FBBF24" />
    </svg>
  );
}

export function WorkingIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Desk */}
      <rect x="50" y="140" width="200" height="8" rx="2" fill="#6366F1" />
      <rect x="70" y="148" width="8" height="40" fill="#4F46E5" />
      <rect x="222" y="148" width="8" height="40" fill="#4F46E5" />
      
      {/* Monitor */}
      <rect x="100" y="60" width="100" height="70" rx="4" fill="#1E293B" />
      <rect x="105" y="65" width="90" height="55" rx="2" fill="#818CF8" />
      <rect x="140" y="130" width="20" height="10" fill="#334155" />
      <rect x="130" y="138" width="40" height="4" rx="2" fill="#334155" />
      
      {/* Code on screen */}
      <rect x="115" y="75" width="30" height="4" rx="1" fill="#C7D2FE" />
      <rect x="115" y="83" width="50" height="4" rx="1" fill="#A5B4FC" />
      <rect x="115" y="91" width="40" height="4" rx="1" fill="#C7D2FE" />
      <rect x="115" y="99" width="55" height="4" rx="1" fill="#A5B4FC" />
      <rect x="115" y="107" width="35" height="4" rx="1" fill="#C7D2FE" />
      
      {/* Coffee cup */}
      <ellipse cx="240" cy="130" rx="15" ry="5" fill="#78350F" />
      <rect x="225" y="115" width="30" height="15" rx="2" fill="#92400E" />
      <path d="M255 120C260 120 263 123 263 127C263 131 260 134 255 134" stroke="#92400E" strokeWidth="3" />
      
      {/* Steam */}
      <path d="M235 105C235 100 238 98 238 93" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <path d="M245 107C245 102 248 100 248 95" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      
      {/* Plant */}
      <rect x="60" y="120" width="20" height="20" rx="2" fill="#A78BFA" />
      <ellipse cx="70" cy="110" rx="12" ry="15" fill="#22C55E" />
      <ellipse cx="62" cy="105" rx="8" ry="12" fill="#4ADE80" />
      <ellipse cx="78" cy="108" rx="6" ry="10" fill="#4ADE80" />
    </svg>
  );
}

export function MoneyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#FEF3C7" />
      
      {/* Main coin */}
      <circle cx="100" cy="100" r="50" fill="#F59E0B" />
      <circle cx="100" cy="100" r="40" fill="#FBBF24" />
      <text x="100" y="115" textAnchor="middle" fill="#92400E" fontSize="40" fontWeight="bold">$</text>
      
      {/* Smaller coins */}
      <circle cx="50" cy="60" r="20" fill="#F59E0B" />
      <circle cx="50" cy="60" r="15" fill="#FBBF24" />
      <text x="50" y="66" textAnchor="middle" fill="#92400E" fontSize="16" fontWeight="bold">$</text>
      
      <circle cx="160" cy="140" r="25" fill="#F59E0B" />
      <circle cx="160" cy="140" r="20" fill="#FBBF24" />
      <text x="160" y="147" textAnchor="middle" fill="#92400E" fontSize="20" fontWeight="bold">$</text>
      
      {/* Sparkles */}
      <path d="M30 100L33 108L41 108L35 113L37 121L30 116L23 121L25 113L19 108L27 108Z" fill="#FCD34D" />
      <path d="M170 60L172 66L178 66L173 70L175 76L170 72L165 76L167 70L162 66L168 66Z" fill="#FCD34D" />
    </svg>
  );
}

export function TaskCategoryIcon({ category, className }: { category: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    'Content Writing': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#EEF2FF" />
        <path d="M12 28V14C12 12.9 12.9 12 14 12H22L28 18V28C28 29.1 27.1 30 26 30H14C12.9 30 12 29.1 12 28Z" fill="#6366F1" />
        <path d="M21 12V19H28" fill="#A5B4FC" />
        <rect x="15" y="22" width="10" height="2" rx="1" fill="white" />
        <rect x="15" y="26" width="6" height="2" rx="1" fill="white" />
      </svg>
    ),
    'Design': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#FDF2F8" />
        <circle cx="20" cy="17" r="5" fill="#EC4899" />
        <circle cx="14" cy="25" r="5" fill="#F472B6" />
        <circle cx="26" cy="25" r="5" fill="#F9A8D4" />
      </svg>
    ),
    'Translation': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#ECFDF5" />
        <text x="12" y="24" fill="#10B981" fontSize="14" fontWeight="bold">A</text>
        <text x="24" y="24" fill="#059669" fontSize="14" fontWeight="bold">文</text>
        <path d="M19 15L21 15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 25L21 25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Data Entry': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#FEF3C7" />
        <rect x="10" y="12" width="20" height="16" rx="2" fill="#F59E0B" />
        <rect x="13" y="15" width="4" height="3" rx="1" fill="white" />
        <rect x="18" y="15" width="4" height="3" rx="1" fill="white" />
        <rect x="23" y="15" width="4" height="3" rx="1" fill="white" />
        <rect x="13" y="20" width="4" height="3" rx="1" fill="white" />
        <rect x="18" y="20" width="4" height="3" rx="1" fill="white" />
        <rect x="23" y="20" width="4" height="3" rx="1" fill="white" />
      </svg>
    ),
    'Social Media': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#EDE9FE" />
        <circle cx="20" cy="20" r="10" fill="#8B5CF6" />
        <circle cx="20" cy="17" r="3" fill="white" />
        <path d="M14 26C14 22.686 16.686 20 20 20C23.314 20 26 22.686 26 26" stroke="white" strokeWidth="2" />
      </svg>
    ),
    'Development': (
      <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#F0FDFA" />
        <path d="M16 14L10 20L16 26" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 14L30 20L24 26" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 12L18 28" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[category] || (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#F1F5F9" />
      <rect x="12" y="12" width="16" height="16" rx="2" fill="#64748B" />
      <path d="M16 20H24M20 16V24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
