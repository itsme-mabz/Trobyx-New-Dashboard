import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, TrendingUp, Users, Zap, FileText, Linkedin, Twitter, Instagram, Globe, LucideIcon } from 'lucide-react';
import useTemplateStore from '../../stores/useTemplateStore';
import Button from '../../components/ui/button/Button';

// Type definitions
interface Template {
    id: string;
    displayName: string;
    platform: string;
    summary?: string;
    description: string;
    difficulty?: string;
    difficultyLevel?: number;
    successRate?: number;
    estimatedTime?: string;
    usageCount?: number;
    isFlow?: boolean;
}

interface PopularTemplate extends Template {
    usageCount: number;
}

interface Filters {
    search: string;
    platform?: string;
    category?: string;
    difficulty?: string;
    sortBy?: string;
}

interface TemplateStore {
    templates: Template[];
    filters: Filters;
    isLoading: boolean;
    fetchTemplates: () => Promise<void>;
    setFilters: (filters: Partial<Filters>) => void;
    getFilteredTemplates: () => Template[];
}

const Trobs = () => {
    const {
        templates,
        filters,
        isLoading,
        fetchTemplates,
        setFilters,
        getFilteredTemplates,
    } = useTemplateStore() as TemplateStore;

    const [popularTemplates, setPopularTemplates] = useState<PopularTemplate[]>([]);

    useEffect(() => {
        fetchTemplates();
        fetchPopularTemplates();
    }, [fetchTemplates]);

    const fetchPopularTemplates = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/meta/popular?limit=6`);
            const data = await response.json();
            if (data.status === 'success') {
                setPopularTemplates(data.data.templates);
            }
        } catch (error) {
            console.error('Failed to fetch popular templates:', error);
        }
    };

    const filteredTemplates = getFilteredTemplates();

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters({ [key]: value });
    };

    const getDifficultyIcon = (difficulty?: string, difficultyLevel?: number): string => {
        if (difficultyLevel) {
            // Use difficulty level (1-5) for more precise indication
            if (difficultyLevel <= 2) return '●';
            if (difficultyLevel <= 3) return '●●';
            if (difficultyLevel <= 4) return '●●●';
            return '●●●●';
        }

        // Fallback to text-based difficulty
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return '●';
            case 'easy': return '●';
            case 'intermediate': return '●●';
            case 'medium': return '●●';
            case 'advanced': return '●●●';
            case 'expert': return '●●●●';
            case 'hard': return '●●●';
            default: return '●';
        }
    };

    // Get platform icon
    const getPlatformIcon = (platform?: string): LucideIcon => {
        switch (platform?.toLowerCase()) {
            case 'linkedin': return Linkedin;
            case 'twitter': return Twitter;
            case 'x': return Twitter;
            case 'instagram': return Instagram;
            default: return Globe;
        }
    };

    // Get available platforms dynamically
    const availablePlatforms = [...new Set(templates.map(t => t.platform))].filter(Boolean);

    return (
        <div className="space-y-6 pt-4 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* Premium Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl flex items-center justify-center border border-brand-500/20">
                            <Zap className="w-6 h-6 text-brand-500 dark:text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation Templates</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {templates.length} pre-built automations ready to use
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400 mr-2">Platform:</span>

                {/* All Platforms Pill */}
                <button
                    onClick={() => handleFilterChange('platform', 'all')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${!filters.platform || filters.platform === 'all'
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Globe size={14} />
                    All Platforms
                </button>

                {/* Dynamic Platform Pills */}
                {availablePlatforms.map(platform => {
                    const IconComponent = getPlatformIcon(platform);
                    const isSelected = filters.platform === platform;
                    return (
                        <button
                            key={platform}
                            onClick={() => handleFilterChange('platform', platform)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isSelected
                                ? platform.toLowerCase() === 'linkedin' ? 'bg-[#0077b5] text-white shadow-lg shadow-[#0077b5]/20' :
                                    platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x' ? 'bg-black dark:bg-white dark:text-black text-white shadow-lg' :
                                        platform.toLowerCase() === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/20' :
                                            'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <IconComponent size={14} />
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </button>
                    );
                })}
            </div>

            {/* Popular Templates - Highlighted Section */}
            {!filters.search && !filters.platform && filters.platform !== 'all' && popularTemplates.length > 0 && (
                <div className="bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 dark:border-brand-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popular Templates</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Most targeted automations this week</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularTemplates.map((template) => (
                            <Link key={template.id} to={`/trobs/${template.id}`} className="group block">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-500/30 group-hover:-translate-y-1">
                                    {/* Template Image/Logo for Popular */}
                                    <div className="relative h-32 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-4">
                                        <img
                                            src={`/trobs/${template.id}.png`}
                                            alt={template.displayName}
                                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `/trobs/${template.id}.svg`;
                                                target.onerror = () => {
                                                    target.style.display = 'none';
                                                    if (target.nextSibling) {
                                                        (target.nextSibling as HTMLElement).style.display = 'flex';
                                                    }
                                                };
                                            }}
                                        />
                                        {/* Fallback Icon */}
                                        <div className="absolute inset-0 bg-brand-500/5 items-center justify-center hidden">
                                            <Zap className="w-10 h-10 text-brand-500 dark:text-brand-400 opacity-20" />
                                        </div>
                                        {/* Platform Badge Overlay */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${template.platform === 'linkedin' ? 'bg-[#0077b5]/80 text-white' :
                                                template.platform === 'twitter' || template.platform === 'x' ? 'bg-black/80 dark:bg-white/80 dark:text-black text-white' :
                                                    'bg-brand-500/80 text-white'
                                                }`}>
                                                {template.platform}
                                            </div>
                                            {/* Flow Badge for Popular Templates */}
                                            {template.isFlow && (
                                                <div className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                    <span className="flex items-center gap-1">
                                                        <Zap size={10} />
                                                        Flow
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-brand-500 transition-colors">{template.displayName}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                <Users size={14} className="text-gray-400" />
                                                <span>{template.usageCount?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{template.summary || template.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}


            {/* Results Summary */}
            <div className="flex items-center justify-between pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                    Showing <span className="text-brand-500">{filteredTemplates.length}</span> of {templates.length} templates
                </p>
            </div>

            {/* Templates List - 2 Per Row */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white border border-tea-black-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-16 h-5 bg-tea-black-200 rounded"></div>
                                <div className="w-12 h-4 bg-tea-black-200 rounded"></div>
                            </div>
                            <div className="w-3/4 h-5 bg-tea-black-200 rounded mb-2"></div>
                            <div className="w-full h-4 bg-tea-black-200 rounded mb-1"></div>
                            <div className="w-2/3 h-4 bg-tea-black-200 rounded mb-4"></div>
                            <div className="w-full h-8 bg-tea-black-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTemplates.map((template) => (
                        <Link key={template.id} to={`/trobs/${template.id}`} className="group block">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-500/30">
                                <div className="flex items-start gap-5">
                                    {/* Template Image/Logo */}
                                    <div className="relative w-20 h-20 bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 dark:border-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 p-3 transition-transform duration-300 group-hover:scale-105">
                                        <img
                                            src={`/trobs/${template.id}.png`}
                                            alt={template.displayName}
                                            className="w-full h-full object-contain"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `/trobs/${template.id}.svg`;
                                                target.onerror = () => {
                                                    target.style.display = 'none';
                                                    if (target.nextSibling) {
                                                        (target.nextSibling as HTMLElement).style.display = 'flex';
                                                    }
                                                };
                                            }}
                                        />
                                        {/* Fallback Icon */}
                                        <div className="absolute inset-0 bg-brand-500/10 rounded-xl items-center justify-center hidden">
                                            <Zap className="w-8 h-8 text-brand-500" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${template.platform === 'linkedin' ? 'bg-[#0077b5]/10 text-[#0077b5]' :
                                                template.platform === 'twitter' || template.platform === 'x' ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' :
                                                    'bg-brand-500/10 text-brand-500'
                                                }`}>
                                                {template.platform}
                                            </div>
                                            {/* Flow Badge */}
                                            {template.isFlow && (
                                                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                    <span className="flex items-center gap-1">
                                                        <Zap size={10} />
                                                        Flow
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <span>{getDifficultyIcon(template.difficulty, template.difficultyLevel)}</span>
                                                <span>{template.difficulty || 'Easy'}</span>
                                            </div>
                                            {template.successRate && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded-lg text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
                                                    <Star size={12} className="fill-current" />
                                                    <span>{template.successRate}%</span>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors truncate">
                                            {template.displayName}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                            {template.summary || template.description}
                                        </p>

                                        <div className="flex items-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                <span>{template.estimatedTime || '5-10 MIN'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-gray-400" />
                                                <span>{template.usageCount?.toLocaleString() || 0} USES</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* No Results */
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No templates found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Try adjusting your filters or search keywords to find the perfect automation.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setFilters({ platform: 'all', category: 'all', search: '', difficulty: 'all', sortBy: 'popular' })}
                        className="rounded-xl px-8"
                    >
                        Clear All Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Trobs;